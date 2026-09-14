$ErrorActionPreference = "Stop"
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"

if (Test-Path -LiteralPath $cargoBin) {
    $env:PATH = "$cargoBin;$env:PATH"
}

& (Join-Path $PSScriptRoot "prepare.ps1")

Push-Location $repoRoot
try {
    & npx tauri build
    if ($LASTEXITCODE -ne 0) {
        throw "Tauri build gagal dengan exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}
