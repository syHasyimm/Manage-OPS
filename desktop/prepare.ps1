param(
    [string] $PhpPath = "",
    [switch] $SkipDataExport
)

$ErrorActionPreference = "Stop"
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$distRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "desktop\dist"))
$laravelTarget = [System.IO.Path]::GetFullPath((Join-Path $distRoot "laravel"))
$seedTarget = [System.IO.Path]::GetFullPath((Join-Path $distRoot "seed"))

if (-not $laravelTarget.StartsWith($distRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Target Laravel berada di luar desktop/dist."
}

& (Join-Path $PSScriptRoot "prepare-runtime.ps1") -PhpPath $PhpPath
$runtimePhp = Join-Path $repoRoot "desktop\runtime\php\php.exe"
$runtimeIni = Join-Path $repoRoot "desktop\runtime\php\php.ini"
$composerCommand = (Get-Command composer -ErrorAction Stop).Source
$composerPhar = Join-Path (Split-Path -Parent $composerCommand) "composer.phar"

if (-not (Test-Path -LiteralPath $composerPhar -PathType Leaf)) {
    throw "composer.phar tidak ditemukan di samping command Composer: $composerCommand"
}

Push-Location $repoRoot
try {
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build Vite gagal."
    }

    if (Test-Path -LiteralPath $distRoot) {
        Remove-Item -LiteralPath $distRoot -Recurse -Force
    }
    New-Item -ItemType Directory -Path $laravelTarget -Force | Out-Null
    New-Item -ItemType Directory -Path $seedTarget -Force | Out-Null

    & robocopy $repoRoot $laravelTarget /E /NFL /NDL /NJH /NJS /NP /XD .git .github node_modules vendor tests desktop src-tauri storage /XF .env .env.* phpunit.xml | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "Gagal menyalin aplikasi Laravel (robocopy exit code $LASTEXITCODE)."
    }

    & $runtimePhp -c $runtimeIni $composerPhar install --working-dir=$laravelTarget --no-dev --prefer-dist --optimize-autoloader --no-interaction
    if ($LASTEXITCODE -ne 0) {
        throw "Composer install produksi gagal."
    }

    if (-not $SkipDataExport) {
        & $runtimePhp -c $runtimeIni artisan desktop:export-database (Join-Path $seedTarget "database.sqlite") --force
        if ($LASTEXITCODE -ne 0) {
            throw "Ekspor database desktop gagal."
        }

        $appKeyLine = Get-Content -LiteralPath (Join-Path $repoRoot ".env") | Where-Object { $_ -match '^APP_KEY=' } | Select-Object -First 1
        if ($appKeyLine) {
            [System.IO.File]::WriteAllText((Join-Path $seedTarget "app.key"), $appKeyLine.Substring(8).Trim())
        }

        $publicStorage = Join-Path $repoRoot "storage\app\public"
        if (Test-Path -LiteralPath $publicStorage) {
            $storageTarget = Join-Path $seedTarget "storage\app\public"
            New-Item -ItemType Directory -Path $storageTarget -Force | Out-Null
            & robocopy $publicStorage $storageTarget /E /NFL /NDL /NJH /NJS /NP | Out-Null
            if ($LASTEXITCODE -ge 8) {
                throw "Gagal menyalin storage publik (robocopy exit code $LASTEXITCODE)."
            }
        }
    }
} finally {
    Pop-Location
}

Write-Host "Paket Laravel dan data awal siap di $distRoot"
