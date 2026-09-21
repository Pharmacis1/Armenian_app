import os
import sys
import time
import socket
import subprocess
import webbrowser
import urllib.request
import json
import threading
import shutil

APP_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(APP_DIR, "tray.log")

def log(msg):
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
            f.flush()
    except Exception:
        pass

class LogWriter:
    def write(self, text):
        t = text.strip()
        if t:
            log(t)
    def flush(self):
        pass

if sys.stdout is None:
    sys.stdout = LogWriter()
if sys.stderr is None:
    sys.stderr = LogWriter()

from PIL import Image
import pystray
from pystray import MenuItem as item, Menu

ICON_PATH = os.path.join(APP_DIR, "icon.png")
PORT = 3001
LOCAL_URL = f"http://localhost:{PORT}"
PERMANENT_NGROK_DOMAIN = "gametogenic-unboisterously-kasha.ngrok-free.dev"
PERMANENT_NGROK_URL = f"https://{PERMANENT_NGROK_DOMAIN}"

server_process = None
server_lock = threading.Lock()

ngrok_process = None
ngrok_lock = threading.Lock()

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def find_ngrok_exe():
    candidates = [
        shutil.which("ngrok"),
        os.path.expanduser(r"~\AppData\Local\Microsoft\WindowsApps\ngrok.exe"),
        os.path.expanduser(r"~\AppData\Local\Microsoft\WindowsApps\ngrok.EXE"),
        r"C:\Program Files\WindowsApps\ngrok.ngrok_3.24.0.0_x64__1g87z0zv29zzc\ngrok.exe",
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return None

def get_ngrok_url():
    try:
        req = urllib.request.Request("http://127.0.0.1:4040/api/tunnels", headers={"User-Agent": "ArmenianApp"})
        with urllib.request.urlopen(req, timeout=1.5) as res:
            data = json.loads(res.read().decode('utf-8'))
            for t in data.get("tunnels", []):
                public_url = t.get("public_url")
                if public_url and public_url.startswith("https://"):
                    return public_url
    except Exception:
        pass
    return None

def is_ngrok_active_with_permanent_url():
    u = get_ngrok_url()
    return bool(u and PERMANENT_NGROK_DOMAIN in u)

def kill_process_on_port(port):
    """Kills any process listening on the given port in Windows"""
    try:
        output = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode('utf-8', errors='ignore')
        pids = set()
        for line in output.strip().splitlines():
            parts = line.split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pids.add(parts[-1])
        for pid in pids:
            try:
                subprocess.run(f'taskkill /F /T /PID {pid}', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception:
                pass
    except Exception:
        pass

def start_server():
    global server_process
    with server_lock:
        if is_port_in_use(PORT):
            log(f"Port {PORT} is already in use.")
            return True
        
        log("Starting node server.js...")
        try:
            creation_flags = 0x08000000  # CREATE_NO_WINDOW
            server_process = subprocess.Popen(
                ["node", "server.js"],
                cwd=APP_DIR,
                creationflags=creation_flags,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            for _ in range(12):
                time.sleep(0.5)
                if is_port_in_use(PORT):
                    log("Node server successfully started.")
                    return True
        except Exception as e:
            log(f"Failed to start Node server: {e}")
            return False
    return False

def stop_server():
    global server_process
    with server_lock:
        if server_process:
            try:
                server_process.terminate()
                server_process.wait(timeout=2)
            except Exception:
                try:
                    server_process.kill()
                except Exception:
                    pass
            server_process = None
        
        kill_process_on_port(PORT)
        log("Node server stopped.")

def start_ngrok():
    global ngrok_process
    with ngrok_lock:
        if is_ngrok_active_with_permanent_url():
            log(f"ngrok is already running with permanent URL: {PERMANENT_NGROK_URL}")
            return True

        ngrok_exe = find_ngrok_exe()
        if not ngrok_exe:
            log("ngrok.exe not found on system.")
            return False

        # If ngrok is running with random domain or wrong tunnel, stop it
        current_url = get_ngrok_url()
        if current_url and PERMANENT_NGROK_DOMAIN not in current_url:
            log(f"ngrok was running with old URL ({current_url}), restarting with permanent domain...")
            stop_ngrok()
            time.sleep(1)

        log(f"Starting ngrok with permanent URL {PERMANENT_NGROK_URL}...")
        try:
            creation_flags = 0x08000000  # CREATE_NO_WINDOW
            ngrok_process = subprocess.Popen(
                [ngrok_exe, "http", str(PORT), f"--url={PERMANENT_NGROK_URL}"],
                cwd=APP_DIR,
                creationflags=creation_flags,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            for _ in range(16):
                time.sleep(0.5)
                if is_ngrok_active_with_permanent_url():
                    log(f"ngrok is online: {PERMANENT_NGROK_URL}")
                    return True
        except Exception as e:
            log(f"Failed to start ngrok: {e}")
            return False
    return is_ngrok_active_with_permanent_url()

def stop_ngrok():
    global ngrok_process
    with ngrok_lock:
        if ngrok_process:
            try:
                ngrok_process.terminate()
                ngrok_process.wait(timeout=2)
            except Exception:
                try:
                    ngrok_process.kill()
                except Exception:
                    pass
            ngrok_process = None
        
        try:
            subprocess.run('taskkill /F /IM ngrok.exe', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
        log("ngrok stopped.")

def start_all_servers():
    started_node = start_server()
    started_ngrok = start_ngrok()
    return started_node

def stop_all_servers():
    stop_server()
    stop_ngrok()

def restart_servers(icon=None, item=None):
    stop_all_servers()
    time.sleep(1)
    if start_all_servers():
        if icon:
            icon.notify("Серверы (Node + ngrok) успешно перезапущены!", "Армянский язык")
    else:
        if icon:
            icon.notify("Ошибка при перезапуске серверов", "Армянский язык")

def open_browser(icon=None, item=None):
    webbrowser.open(LOCAL_URL)

def open_mobile_link(icon=None, item=None):
    webbrowser.open(PERMANENT_NGROK_URL)

def copy_mobile_link(icon=None, item=None):
    url = PERMANENT_NGROK_URL
    try:
        creation_flags = 0x08000000  # CREATE_NO_WINDOW
        subprocess.run(
            ["powershell", "-NoProfile", "-Command", f"Set-Clipboard -Value '{url}'"],
            creationflags=creation_flags,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        if icon:
            icon.notify(f"Постоянная ссылка скопирована в буфер:\n{url}", "Армянский язык")
    except Exception as e:
        log(f"Failed to copy link: {e}")

def exit_app(icon=None, item=None):
    stop_all_servers()
    if icon:
        icon.stop()
    os._exit(0)

def create_tray_icon():
    if os.path.exists(ICON_PATH):
        image = Image.open(ICON_PATH)
    else:
        image = Image.new('RGBA', (64, 64), color=(30, 100, 200, 255))

    def mobile_title(item):
        status = "🟢" if is_ngrok_active_with_permanent_url() else "🟡"
        return f"📱 Мобильный {status}: {PERMANENT_NGROK_DOMAIN}"

    menu = Menu(
        item("🌐 Открыть Armenian App (браузер)", open_browser, default=True),
        item(mobile_title, open_mobile_link),
        item("📋 Скопировать мобильную ссылку", copy_mobile_link),
        item("🔄 Перезапустить серверы", restart_servers),
        Menu.SEPARATOR,
        item("❌ Закрыть приложение (Выход)", exit_app)
    )

    icon = pystray.Icon(
        "armenian_app_tray",
        image,
        f"Հայերեն — Армянский язык\n{PERMANENT_NGROK_DOMAIN}",
        menu=menu
    )
    return icon

_lock_socket = None

def main():
    log("=== Tray App starting ===")
    global _lock_socket
    try:
        _lock_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        _lock_socket.bind(('127.0.0.1', 39182))
        _lock_socket.listen(1)
        log("Mutex bound to port 39182")
    except socket.error as e:
        log(f"Already running or mutex error: {e}. Opening browser and exiting.")
        open_browser()
        sys.exit(0)

    try:
        log("Starting servers...")
        start_all_servers()

        threading.Thread(target=lambda: (time.sleep(1.2), open_browser()), daemon=True).start()

        log("Creating tray icon...")
        tray = create_tray_icon()
        log("Running tray icon loop...")
        tray.run()
        log("Tray loop ended.")
    except Exception as e:
        import traceback
        log(f"Exception in tray app: {e}\n{traceback.format_exc()}")

if __name__ == "__main__":
    main()
