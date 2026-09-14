$ErrorActionPreference = "Stop"
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"

if (Test-Path -LiteralPath $cargoBin) {
    $env:PATH = "$cargoBin;$env:PATH"
}

& (Join-Path $PSScriptRoot "prepare-runtime.ps1")

$env:SPMB_DESKTOP_PHP = Join-Path $repoRoot "desktop\runtime\php\php.exe"
$env:SPMB_DESKTOP_DATA_DIR = Join-Path $repoRoot "desktop\dev-data"

Push-Location $repoRoot
try {
    & npx tauri dev
    if ($LASTEXITCODE -ne 0) {
        throw "Tauri dev gagal dengan exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}
