param(
    [int] $ApiPort = 8000,
    [int] $FrontendPort = 5173,
    [switch] $SkipInstall,
    [switch] $ResetDatabase
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Frontend = Join-Path $Root 'frontend'
$PhpPath = 'D:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe'
$ComposerPhar = 'D:\laragon\bin\composer\composer.phar'
$MysqlPath = 'D:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe'

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

    $escapedTitle = $Title.Replace('"', '\"')
    $escapedDir = $WorkingDirectory.Replace("'", "''")
    $fullCommand = "title `"$escapedTitle`"; Set-Location '$escapedDir'; $Command"

    Start-Process powershell.exe -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy', 'Bypass',
        '-Command', $fullCommand
    )
}

function Test-DatabaseExists {
    if (!(Test-Path $MysqlPath)) {
        return $false
    }

    $query = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'books_api';"
    $result = & $MysqlPath -u root -N -B -e $query 2>$null

    return $result -eq 'books_api'
}

function Initialize-Database {
    if (!(Test-Path $MysqlPath)) {
        throw "MySQL client was not found at $MysqlPath. Update `$MysqlPath in this script."
    }

    Write-Host 'Loading Chapter 10 MySQL schema...'
    Get-Content -Raw (Join-Path $Root 'sql\schema.sql') | & $MysqlPath -u root
}

if (!(Test-Path $PhpPath)) {
    throw "PHP was not found at $PhpPath. Update `$PhpPath in this script."
}

if (!(Test-Path (Join-Path $Root '.env'))) {
    Copy-Item (Join-Path $Root '.env.example') (Join-Path $Root '.env')
    Write-Host 'Created .env from .env.example.'
}

if ($ResetDatabase -or !(Test-DatabaseExists)) {
    Initialize-Database
}

if (!$SkipInstall) {
    if (!(Test-Path (Join-Path $Root 'vendor'))) {
        if (!(Test-Path $ComposerPhar)) {
            throw "Composer was not found at $ComposerPhar. Update `$ComposerPhar in this script."
        }

        Write-Host 'Installing Chapter 10 PHP dependencies...'
        & $PhpPath $ComposerPhar install --working-dir="$Root"
    }

    if (!(Test-Path (Join-Path $Frontend 'node_modules'))) {
        Write-Host 'Installing Chapter 10 frontend dependencies...'
        Push-Location $Frontend
        npm install
        Pop-Location
    }
}

if (Test-PortInUse $ApiPort) {
    Write-Warning "Port $ApiPort is already in use. Stop the other API server before starting Chapter 10."
} else {
    Start-Terminal `
        -Title 'Chapter 10 API' `
        -WorkingDirectory $Root `
        -Command "& '$PhpPath' -S localhost:$ApiPort -t public"
}

if (Test-PortInUse $FrontendPort) {
    Write-Warning "Port $FrontendPort is already in use. Vite may choose another port if you start it manually."
} else {
    Start-Terminal `
        -Title 'Chapter 10 Frontend' `
        -WorkingDirectory $Frontend `
        -Command "npm run dev -- --host localhost --port $FrontendPort"
}

$url = "http://localhost:$FrontendPort/"
Start-Process $url

Write-Host "Chapter 10 API:      http://localhost:$ApiPort/"
Write-Host "Chapter 10 frontend: $url"
Write-Host 'Close the opened PowerShell windows to stop the servers.'
