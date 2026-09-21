import os
import subprocess

user_profile = os.environ.get("USERPROFILE", r"C:\Users\Анастасия")
desktop = os.path.join(user_profile, "Desktop")
shortcut_name = "Армянский язык.lnk"
shortcut_path = os.path.join(desktop, shortcut_name)

# Remove any corrupted lnk
for f in os.listdir(desktop):
    if f.endswith(".lnk") and ("СЏР" in f or "Армянский" in f):
        try:
            os.remove(os.path.join(desktop, f))
            print(f"Removed old shortcut: {f}")
        except Exception:
            pass

app_dir = r"w:\Dev\Armenian app"
tray_script = os.path.join(app_dir, "tray_app.py")
icon_path = os.path.join(app_dir, "icon.ico")
pythonw_path = r"C:\Python314\pythonw.exe"

vbs_script = f'''
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "{shortcut_path}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "{pythonw_path}"
oLink.Arguments = Chr(34) & "{tray_script}" & Chr(34)
oLink.WorkingDirectory = "{app_dir}"
oLink.IconLocation = "{icon_path}, 0"
oLink.Description = "Армянский язык (Armenian App)"
oLink.Save
'''

vbs_path = os.path.join(app_dir, "scripts", "temp_create_shortcut.vbs")
with open(vbs_path, "w", encoding="utf-16") as f:
    f.write(vbs_script)

subprocess.run(["cscript.exe", "//Nologo", vbs_path], check=True)
if os.path.exists(vbs_path):
    os.remove(vbs_path)

print(f"[OK] Shortcut successfully created at: {shortcut_path}")
