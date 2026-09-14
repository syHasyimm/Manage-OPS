use base64::{engine::general_purpose::STANDARD, Engine as _};
use rand::{rngs::OsRng, RngCore};
use std::{
    collections::BTreeMap,
    ffi::OsString,
    fs,
    fs::OpenOptions,
    io::{Read, Write},
    net::{TcpListener, TcpStream},
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    sync::Mutex,
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};
use url::Url;

#[cfg(windows)]
use std::os::windows::{io::AsRawHandle, process::CommandExt};
#[cfg(windows)]
use windows_sys::Win32::{
    Foundation::{CloseHandle, HANDLE},
    System::JobObjects::{
        AssignProcessToJobObject, CreateJobObjectW, JobObjectExtendedLimitInformation,
        SetInformationJobObject, JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
        JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
    },
};

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

struct BackendState {
    children: Mutex<Vec<Child>>,
    #[cfg(windows)]
    job: WindowsJob,
}

impl BackendState {
    fn new() -> Result<Self, String> {
        Ok(Self {
            children: Mutex::new(Vec::new()),
            #[cfg(windows)]
            job: WindowsJob::new()?,
        })
    }
}

#[cfg(windows)]
struct WindowsJob(HANDLE);

#[cfg(windows)]
unsafe impl Send for WindowsJob {}
#[cfg(windows)]
unsafe impl Sync for WindowsJob {}

#[cfg(windows)]
impl WindowsJob {
    fn new() -> Result<Self, String> {
        let handle = unsafe { CreateJobObjectW(std::ptr::null(), std::ptr::null()) };
        if handle.is_null() {
            return Err(std::io::Error::last_os_error().to_string());
        }

        let mut information: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = unsafe { std::mem::zeroed() };
        information.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;

        let configured = unsafe {
            SetInformationJobObject(
                handle,
                JobObjectExtendedLimitInformation,
                std::ptr::addr_of!(information).cast(),
                std::mem::size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
            )
        };

        if configured == 0 {
            unsafe { CloseHandle(handle) };
            return Err(std::io::Error::last_os_error().to_string());
        }

        Ok(Self(handle))
    }

    fn assign(&self, child: &Child) -> Result<(), String> {
        let assigned = unsafe { AssignProcessToJobObject(self.0, child.as_raw_handle() as HANDLE) };
        if assigned == 0 {
            return Err(std::io::Error::last_os_error().to_string());
        }

        Ok(())
    }
}

#[cfg(windows)]
impl Drop for WindowsJob {
    fn drop(&mut self) {
        unsafe { CloseHandle(self.0) };
    }
}

struct RuntimePaths {
    php: PathBuf,
    laravel: PathBuf,
    seed: Option<PathBuf>,
    data: PathBuf,
}

#[tauri::command]
fn retry_backend(app: AppHandle) {
    start_backend_async(app);
}

pub fn run() {
    let app = tauri::Builder::default()
        .manage(BackendState::new().expect("gagal membuat pengelola proses backend"))
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![retry_backend])
        .setup(|app| {
            start_backend_async(app.handle().clone());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("gagal membangun aplikasi SPMB Desktop");

    app.run(|app_handle, event| {
        if matches!(
            event,
            tauri::RunEvent::Exit | tauri::RunEvent::ExitRequested { .. }
        ) {
            stop_children(app_handle);
        }
    });
}

fn start_backend_async(app: AppHandle) {
    thread::spawn(move || {
        stop_children(&app);

        match start_backend(&app) {
            Ok(url) => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.navigate(url);
                }
            }
            Err(error) => show_error(&app, &error),
        }
    });
}

fn start_backend(app: &AppHandle) -> Result<Url, String> {
    let paths = resolve_paths(app)?;
    create_data_directories(&paths.data)?;

    let database = paths.data.join("database").join("spmb.sqlite");
    let app_key = prepare_app_key(&paths)?;
    let database_existed = database.exists();
    let needs_seed = prepare_initial_data(&paths, &database)?;
    let port = available_port()?;
    let base_url = format!("http://127.0.0.1:{port}");
    let env = laravel_environment(&paths.data, &database, &app_key, &base_url);

    let version_file = paths.data.join("schema-version");
    let current_version = env!("CARGO_PKG_VERSION");
    let stored_version = fs::read_to_string(&version_file).unwrap_or_default();

    if database_existed && stored_version.trim() != current_version {
        backup_database(&paths.data, &database)?;
    }

    run_artisan(&paths, &env, &["migrate", "--force"])?;

    if needs_seed {
        run_artisan(&paths, &env, &["db:seed", "--force"])?;
    }

    fs::write(&version_file, current_version).map_err(display_error)?;

    let server_address = format!("127.0.0.1:{port}");
    let public_path = paths.laravel.join("public");
    let router_path = paths
        .laravel
        .join("vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php");
    let server = spawn_php_in(
        &paths,
        &env,
        &public_path,
        "php-server.log",
        &[
            "-S".into(),
            server_address,
            "-t".into(),
            ".".into(),
            router_path.to_string_lossy().into_owned(),
        ],
    )?;
    store_child(app, server)?;

    let worker = spawn_php(
        &paths,
        &env,
        "queue-worker.log",
        &[
            "artisan".into(),
            "queue:work".into(),
            "--sleep=3".into(),
            "--tries=3".into(),
            "--timeout=120".into(),
        ],
    )?;
    store_child(app, worker)?;

    wait_until_ready(port, &paths.data)?;

    format!("{base_url}/__desktop/start")
        .parse()
        .map_err(display_error)
}

fn resolve_paths(app: &AppHandle) -> Result<RuntimePaths, String> {
    let data = std::env::var_os("SPMB_DESKTOP_DATA_DIR")
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| app.path().app_local_data_dir().map_err(display_error))?;
    let data = normalize_runtime_path(data);

    if cfg!(debug_assertions) {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .ok_or_else(|| "Direktori proyek tidak ditemukan.".to_string())?
            .to_path_buf();
        let php = std::env::var_os("SPMB_DESKTOP_PHP")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("php"));
        let seed = root.join("desktop").join("dist").join("seed");

        return Ok(RuntimePaths {
            php,
            laravel: root,
            seed: seed.exists().then_some(seed),
            data,
        });
    }

    let resources = normalize_runtime_path(app.path().resource_dir().map_err(display_error)?);
    let php = resources.join("php").join("php.exe");
    let laravel = resources.join("laravel");
    let seed = resources.join("seed");

    if !php.exists() || !laravel.join("artisan").exists() {
        return Err("Paket PHP atau Laravel tidak ditemukan di installer.".into());
    }

    Ok(RuntimePaths {
        php,
        laravel,
        seed: seed.exists().then_some(seed),
        data,
    })
}

fn normalize_runtime_path(path: PathBuf) -> PathBuf {
    #[cfg(windows)]
    {
        let value = path.to_string_lossy();

        if let Some(network_path) = value.strip_prefix(r"\\?\UNC\") {
            return PathBuf::from(format!(r"\\{network_path}"));
        }

        if let Some(local_path) = value.strip_prefix(r"\\?\") {
            return PathBuf::from(local_path);
        }
    }

    path
}

fn create_data_directories(data: &Path) -> Result<(), String> {
    for relative in [
        "database",
        "backups",
        "storage/app/private",
        "storage/app/public",
        "storage/framework/cache/data",
        "storage/framework/sessions",
        "storage/framework/views",
        "storage/logs",
        "framework/cache",
    ] {
        fs::create_dir_all(data.join(relative)).map_err(display_error)?;
    }

    Ok(())
}

fn prepare_initial_data(paths: &RuntimePaths, database: &Path) -> Result<bool, String> {
    if database.exists() {
        return Ok(false);
    }

    if let Some(seed) = &paths.seed {
        let seed_database = seed.join("database.sqlite");
        if seed_database.exists() {
            fs::copy(seed_database, database).map_err(display_error)?;
            let seed_storage = seed.join("storage");
            if seed_storage.exists() {
                copy_directory(&seed_storage, &paths.data.join("storage"))?;
            }

            return Ok(false);
        }
    }

    fs::File::create(database).map_err(display_error)?;
    Ok(true)
}

fn prepare_app_key(paths: &RuntimePaths) -> Result<String, String> {
    let key_path = paths.data.join("app.key");
    if key_path.exists() {
        return fs::read_to_string(key_path)
            .map(|key| key.trim().to_string())
            .map_err(display_error);
    }

    let key = if let Some(seed) = &paths.seed {
        let seed_key = seed.join("app.key");
        if seed_key.exists() {
            fs::read_to_string(seed_key).map_err(display_error)?
        } else {
            generate_app_key()
        }
    } else {
        generate_app_key()
    };

    fs::write(&key_path, key.trim()).map_err(display_error)?;
    Ok(key.trim().to_string())
}

fn generate_app_key() -> String {
    let mut bytes = [0_u8; 32];
    OsRng.fill_bytes(&mut bytes);
    format!("base64:{}", STANDARD.encode(bytes))
}

fn copy_directory(source: &Path, target: &Path) -> Result<(), String> {
    fs::create_dir_all(target).map_err(display_error)?;
    for entry in fs::read_dir(source).map_err(display_error)? {
        let entry = entry.map_err(display_error)?;
        let destination = target.join(entry.file_name());
        if entry.file_type().map_err(display_error)?.is_dir() {
            copy_directory(&entry.path(), &destination)?;
        } else {
            fs::copy(entry.path(), destination).map_err(display_error)?;
        }
    }
    Ok(())
}
fn laravel_environment(
    data: &Path,
    database: &Path,
    app_key: &str,
    url: &str,
) -> BTreeMap<OsString, OsString> {
    let mut env = BTreeMap::new();

    macro_rules! put {
        ($key:expr, $value:expr) => {
            env.insert(OsString::from($key), OsString::from($value));
        };
    }

    put!("APP_NAME", "SPMB Desktop");
    put!("APP_ENV", "production");
    put!("APP_KEY", app_key);
    put!("APP_DEBUG", "false");
    put!("APP_URL", url);
    put!("DESKTOP_MODE", "true");
    put!("SPMB_DESKTOP_DATA_DIR", data);
    put!("DB_CONNECTION", "sqlite");
    put!("DB_DATABASE", database);
    put!("DB_FOREIGN_KEYS", "true");
    put!("DB_BUSY_TIMEOUT", "5000");
    put!("DB_JOURNAL_MODE", "WAL");
    put!("DB_SYNCHRONOUS", "NORMAL");
    put!("DB_TRANSACTION_MODE", "IMMEDIATE");
    put!("SESSION_DRIVER", "database");
    put!("SESSION_SECURE_COOKIE", "false");
    put!("SESSION_SAME_SITE", "strict");
    put!("CACHE_STORE", "database");
    put!("QUEUE_CONNECTION", "database");
    put!("FILESYSTEM_DISK", "local");
    put!("LOG_CHANNEL", "single");
    put!("LOG_LEVEL", "info");
    put!("VIEW_COMPILED_PATH", data.join("storage/framework/views"));
    put!("APP_CONFIG_CACHE", data.join("framework/cache/config.php"));
    put!("APP_EVENTS_CACHE", data.join("framework/cache/events.php"));
    put!(
        "APP_PACKAGES_CACHE",
        data.join("framework/cache/packages.php")
    );
    put!("APP_ROUTES_CACHE", data.join("framework/cache/routes.php"));
    put!(
        "APP_SERVICES_CACHE",
        data.join("framework/cache/services.php")
    );

    env
}

fn run_artisan(
    paths: &RuntimePaths,
    env: &BTreeMap<OsString, OsString>,
    args: &[&str],
) -> Result<(), String> {
    let mut command = php_command(paths, env);
    command.arg("artisan").args(args);
    let output = command.output().map_err(display_error)?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!("Perintah Laravel gagal.\n{stdout}\n{stderr}"));
    }

    Ok(())
}

fn spawn_php(
    paths: &RuntimePaths,
    env: &BTreeMap<OsString, OsString>,
    log_name: &str,
    args: &[String],
) -> Result<Child, String> {
    spawn_php_in(paths, env, &paths.laravel, log_name, args)
}

fn spawn_php_in(
    paths: &RuntimePaths,
    env: &BTreeMap<OsString, OsString>,
    current_dir: &Path,
    log_name: &str,
    args: &[String],
) -> Result<Child, String> {
    let log_path = paths.data.join("storage/logs").join(log_name);
    let stdout = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(display_error)?;
    let stderr = stdout.try_clone().map_err(display_error)?;
    let mut command = php_command(paths, env);
    command
        .current_dir(current_dir)
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::from(stdout))
        .stderr(Stdio::from(stderr))
        .spawn()
        .map_err(display_error)
}

fn php_command(paths: &RuntimePaths, env: &BTreeMap<OsString, OsString>) -> Command {
    let mut command = Command::new(&paths.php);
    command.current_dir(&paths.laravel).envs(env);

    #[cfg(windows)]
    command.creation_flags(CREATE_NO_WINDOW);

    command
}

fn available_port() -> Result<u16, String> {
    let listener = TcpListener::bind(("127.0.0.1", 0)).map_err(display_error)?;
    listener
        .local_addr()
        .map(|address| address.port())
        .map_err(display_error)
}

fn wait_until_ready(port: u16, data: &Path) -> Result<(), String> {
    for _ in 0..120 {
        if backend_is_healthy(port) {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(250));
    }

    Err(format!(
        "Laravel lokal tidak sehat dalam 30 detik. Periksa log: {}",
        data.join("storage/logs/php-server.log").display()
    ))
}

fn backend_is_healthy(port: u16) -> bool {
    let Ok(mut stream) = TcpStream::connect(("127.0.0.1", port)) else {
        return false;
    };

    let timeout = Some(Duration::from_secs(1));
    if stream.set_read_timeout(timeout).is_err() || stream.set_write_timeout(timeout).is_err() {
        return false;
    }

    let request = format!(
        "GET /__desktop/health HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\nConnection: close\r\n\r\n"
    );
    if stream.write_all(request.as_bytes()).is_err() {
        return false;
    }

    let mut response = [0_u8; 128];
    let Ok(bytes_read) = stream.read(&mut response) else {
        return false;
    };
    let status_line = String::from_utf8_lossy(&response[..bytes_read]);

    status_line.starts_with("HTTP/1.1 200") || status_line.starts_with("HTTP/1.0 200")
}

fn backup_database(data: &Path, database: &Path) -> Result<(), String> {
    if !database.exists() {
        return Ok(());
    }

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(display_error)?
        .as_secs();
    let backup_dir = data.join("backups");
    fs::copy(
        database,
        backup_dir.join(format!("spmb-{timestamp}.sqlite")),
    )
    .map_err(display_error)?;

    let mut backups = fs::read_dir(&backup_dir)
        .map_err(display_error)?
        .filter_map(Result::ok)
        .filter(|entry| {
            entry
                .path()
                .extension()
                .is_some_and(|extension| extension.to_string_lossy().eq_ignore_ascii_case("sqlite"))
        })
        .collect::<Vec<_>>();
    backups.sort_by_key(|entry| entry.file_name());

    let remove_count = backups.len().saturating_sub(5);
    for entry in backups.into_iter().take(remove_count) {
        fs::remove_file(entry.path()).map_err(display_error)?;
    }

    Ok(())
}

fn store_child(app: &AppHandle, child: Child) -> Result<(), String> {
    let state = app.state::<BackendState>();

    #[cfg(windows)]
    state.job.assign(&child)?;

    if let Ok(mut children) = state.children.lock() {
        children.push(child);
    }

    Ok(())
}

fn stop_children(app: &AppHandle) {
    if let Ok(mut children) = app.state::<BackendState>().children.lock() {
        for child in children.iter_mut() {
            let _ = child.kill();
            let _ = child.wait();
        }
        children.clear();
    }
}

fn show_error(app: &AppHandle, message: &str) {
    if let Some(window) = app.get_webview_window("main") {
        let serialized = serde_json::to_string(message)
            .unwrap_or_else(|_| "\"Kesalahan tidak diketahui.\"".into());
        let _ = window.eval(&format!("window.showStartupError({serialized});"));
    }
}

fn display_error(error: impl std::fmt::Display) -> String {
    error.to_string()
}
