Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "w:\Dev\Armenian app"
cmd = Chr(34) & "C:\Python314\pythonw.exe" & Chr(34) & " " & Chr(34) & "w:\Dev\Armenian app\tray_app.py" & Chr(34)
WshShell.Run cmd, 0, False
