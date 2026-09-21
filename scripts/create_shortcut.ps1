$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "Армянский язык.lnk"
$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)

$pythonwPath = (Get-Command pythonw -ErrorAction SilentlyContinue).Source
if (-not $pythonwPath) {
    $pythonwPath = "C:\Python314\pythonw.exe"
}

$appDir = "w:\Dev\Armenian app"
$trayScript = Join-Path $appDir "tray_app.py"
$iconPath = Join-Path $appDir "icon.ico"

$shortcut.TargetPath = $pythonwPath
$shortcut.Arguments = "`"$trayScript`""
$shortcut.WorkingDirectory = $appDir
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Description = "Армянский язык (Armenian App)"
$shortcut.Save()

Write-Host "✅ Shortcut successfully created at: $shortcutPath"
