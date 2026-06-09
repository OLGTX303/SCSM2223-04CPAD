param(
    [int] $ApiPort = 8000,
    [int] $FrontendPort = 5173,
    [switch] $SkipInstall
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Frontend = Join-Path $Root 'frontend'
$PhpPath = 'D:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe'
$ComposerPhar = 'D:\laragon\bin\composer\composer.phar'

function Test-PortInUse {
    param([int] $Port)

    return [bool] (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Start-Terminal {
    param(
        [string] $Title,
        [string] $WorkingDirectory,
        [string] $Command
    )

    $escapedTitle = $Title.Replace("'", "''")
    $escapedDir = $WorkingDirectory.Replace("'", "''")
    $fullCommand = "`$Host.UI.RawUI.WindowTitle = '$escapedTitle'; Set-Location -LiteralPath '$escapedDir'; $Command"

    Start-Process powershell.exe -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy', 'Bypass',
        '-Command', $fullCommand
    )
}

function Test-ComposerVendorReady {
    $requiredFiles = @(
        'vendor\autoload.php',
        'vendor\nikic\fast-route\src\functions.php',
        'vendor\slim\slim\Slim\App.php',
        'vendor\slim\psr7\src\Response.php'
    )

    foreach ($file in $requiredFiles) {
        if (!(Test-Path (Join-Path $Root $file))) {
            return $false
        }
    }

    return $true
}

if (!(Test-Path $PhpPath)) {
    throw "PHP was not found at $PhpPath. Update `$PhpPath in this script."
}

if (!$SkipInstall) {
    if (!(Test-ComposerVendorReady)) {
        if (!(Test-Path $ComposerPhar)) {
            throw "Composer was not found at $ComposerPhar. Update `$ComposerPhar in this script."
        }

        Write-Host 'Installing Chapter 9 PHP dependencies...'
        & $PhpPath $ComposerPhar install --working-dir="$Root"
    }

    if (!(Test-Path (Join-Path $Frontend 'node_modules'))) {
        Write-Host 'Installing Chapter 9 frontend dependencies...'
        Push-Location $Frontend
        npm install
        Pop-Location
    }
}

if (Test-PortInUse $ApiPort) {
    Write-Warning "Port $ApiPort is already in use. Stop the other API server before starting Chapter 9."
} else {
    Start-Terminal `
        -Title 'Chapter 9 API' `
        -WorkingDirectory $Root `
        -Command "& '$PhpPath' -S localhost:$ApiPort -t public"
}

if (Test-PortInUse $FrontendPort) {
    Write-Warning "Port $FrontendPort is already in use. Vite may choose another port if you start it manually."
} else {
    Start-Terminal `
        -Title 'Chapter 9 Frontend' `
        -WorkingDirectory $Frontend `
        -Command "npm run dev -- --host localhost --port $FrontendPort"
}

$url = "http://localhost:$FrontendPort/"
Start-Process $url

Write-Host "Chapter 9 API:      http://localhost:$ApiPort/"
Write-Host "Chapter 9 frontend: $url"
Write-Host 'Close the opened PowerShell windows to stop the servers.'
