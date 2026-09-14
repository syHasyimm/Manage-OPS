param(
    [string] $PhpPath = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$runtimeRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "desktop\runtime\php"))
$allowedRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "desktop\runtime"))

if ([string]::IsNullOrWhiteSpace($PhpPath)) {
    $PhpPath = (Get-Command php.exe -ErrorAction Stop).Source
}

$PhpPath = [System.IO.Path]::GetFullPath($PhpPath)
$phpSource = Split-Path -Parent $PhpPath

if (-not (Test-Path -LiteralPath $PhpPath -PathType Leaf)) {
    throw "PHP tidak ditemukan: $PhpPath"
}

if (-not $runtimeRoot.StartsWith($allowedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Target runtime berada di luar direktori desktop/runtime."
}

if ($phpSource.Equals($runtimeRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-Host "Runtime PHP desktop sudah tersedia."
} else {
    if (Test-Path -LiteralPath $runtimeRoot) {
        Remove-Item -LiteralPath $runtimeRoot -Recurse -Force
    }

    New-Item -ItemType Directory -Path $runtimeRoot -Force | Out-Null
    & robocopy $phpSource $runtimeRoot /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "Gagal menyalin PHP runtime (robocopy exit code $LASTEXITCODE)."
    }
}

Copy-Item -LiteralPath (Join-Path $PSScriptRoot "php.ini") -Destination (Join-Path $runtimeRoot "php.ini") -Force

$windowsSystemDirectory = [Environment]::GetFolderPath([Environment+SpecialFolder]::System)
$visualCppRuntimeFiles = @("msvcp140.dll", "vcruntime140.dll", "vcruntime140_1.dll")

foreach ($runtimeFile in $visualCppRuntimeFiles) {
    $runtimeDestination = Join-Path $runtimeRoot $runtimeFile

    if (Test-Path -LiteralPath $runtimeDestination -PathType Leaf) {
        continue
    }

    $runtimeSource = Join-Path $windowsSystemDirectory $runtimeFile
    if (-not (Test-Path -LiteralPath $runtimeSource -PathType Leaf)) {
        throw "Visual C++ runtime tidak ditemukan: $runtimeSource"
    }

    Copy-Item -LiteralPath $runtimeSource -Destination $runtimeDestination -Force
}

$runtimePhp = Join-Path $runtimeRoot "php.exe"
$modules = & $runtimePhp -c (Join-Path $runtimeRoot "php.ini") -m
$requiredModules = @("curl", "dom", "fileinfo", "gd", "intl", "mbstring", "openssl", "PDO", "pdo_sqlite", "sqlite3", "xml", "zip")
$missing = @($requiredModules | Where-Object { $modules -notcontains $_ })

if ($missing.Count -gt 0) {
    throw "PHP runtime belum lengkap. Extension yang hilang: $($missing -join ', ')"
}

Write-Host "PHP runtime siap: $runtimePhp"
