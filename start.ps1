$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$backendDir = Join-Path $repoRoot "backend"
$serverUrl = "http://localhost:3000"

function Get-NodeCommand {
  $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
  if ($nodeCmd) {
    $candidate = $nodeCmd.Source
    $supportsSqlite = (& $candidate -e "require('node:sqlite'); console.log('ok')" 2>$null) -eq "ok"
    if ($supportsSqlite) {
      return $candidate
    }
  }

  $toolsDir = Join-Path $repoRoot ".tools"
  $nodeToolsDir = Join-Path $toolsDir "node"
  $nodeVersion = "v24.14.1"
  $zipName = "node-$nodeVersion-win-x64.zip"
  $downloadUrl = "https://nodejs.org/dist/$nodeVersion/$zipName"
  $zipPath = Join-Path $toolsDir $zipName
  $extractRoot = Join-Path $nodeToolsDir "node-$nodeVersion-win-x64"
  $portableNode = Join-Path $extractRoot "node.exe"

  if (-not (Test-Path $portableNode)) {
    Write-Host "Node.js not found in PATH. Downloading portable Node.js ($nodeVersion)..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
    New-Item -ItemType Directory -Force -Path $nodeToolsDir | Out-Null

    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $nodeToolsDir -Force
    Remove-Item $zipPath -Force
  }

  if (-not (Test-Path $portableNode)) {
    throw "Failed to prepare a portable Node.js runtime."
  }

  return $portableNode
}

$nodeExe = Get-NodeCommand
$npmCmd = Join-Path (Split-Path -Parent $nodeExe) "npm.cmd"

if (-not (Test-Path $npmCmd)) {
  throw "npm.cmd not found next to node executable: $nodeExe"
}

Write-Host "Using Node runtime: $nodeExe" -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $backendDir "node_modules"))) {
  Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
  Push-Location $backendDir
  & $npmCmd install
  Pop-Location
}

Write-Host "Starting backend server on $serverUrl ..." -ForegroundColor Green
$launchCmd = "cd `"$backendDir`"; & `"$nodeExe`" `"server.js`""
Start-Process powershell -ArgumentList "-NoExit", "-Command", $launchCmd

Start-Sleep -Seconds 2
Start-Process $serverUrl

Write-Host "App launched. Keep the server terminal open while using the app." -ForegroundColor Green
