import os
import subprocess

vbs = r'''
Set oWS = WScript.CreateObject("WScript.Shell")
Set oLink = oWS.CreateShortcut("C:\Users\Анастасия\Desktop\Армянский язык.lnk")
WScript.Echo "TargetPath: " & oLink.TargetPath
WScript.Echo "Arguments: " & oLink.Arguments
WScript.Echo "WorkingDirectory: " & oLink.WorkingDirectory
WScript.Echo "IconLocation: " & oLink.IconLocation
'''

vbs_path = r"w:\Dev\Armenian app\scripts\verify.vbs"
with open(vbs_path, "w", encoding="utf-16") as f:
    f.write(vbs)

out = subprocess.check_output(["cscript.exe", "//Nologo", vbs_path])
print(out.decode("cp1251", errors="replace"))

if os.path.exists(vbs_path):
    os.remove(vbs_path)
