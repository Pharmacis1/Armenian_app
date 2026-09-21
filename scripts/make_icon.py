import os
import math
import numpy as np
from PIL import Image, ImageFilter

SOURCE_PATH = r"C:\Users\Анастасия\.gemini\antigravity\brain\d27caa8f-28b9-488e-a83b-5cdeffe56934\.user_uploaded\media_1789824605688.png"
APP_DIR = r"w:\Dev\Armenian app"
PUBLIC_DIR = os.path.join(APP_DIR, "public")

def process_icon():
    print("Loading source image...")
    src = Image.open(SOURCE_PATH).convert("RGBA")
    arr = np.array(src, dtype=np.float32)

    cx, cy = 512.0, 282.0
    r_inner = 171.0
    r_outer = 173.0

    h, w = arr.shape[:2]
    y, x = np.ogrid[:h, :w]
    dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)

    # Alpha mask: 1.0 inside, 0.0 outside, smooth transition
    alpha = np.clip((r_outer - dist) / (r_outer - r_inner), 0.0, 1.0)

    # Edge despill: anywhere near the edge where green is elevated, reduce green to average of red and blue
    edge_zone = (dist >= 169.0) & (dist <= 174.0)
    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]
    
    # If green exceeds blue and red in the edge zone, clamp green
    max_rb = np.maximum(r, b)
    excess_green = np.maximum(0.0, g - max_rb)
    g[edge_zone] -= excess_green[edge_zone] * 0.9

    arr[:, :, 1] = g
    arr[:, :, 3] = alpha * 255.0

    arr = np.clip(arr, 0, 255).astype(np.uint8)
    clean_img = Image.fromarray(arr, "RGBA")

    # Crop precisely around the circular icon with a tiny 4px margin
    radius = int(math.ceil(r_outer)) + 4
    left = int(round(cx - radius))
    top = int(round(cy - radius))
    right = int(round(cx + radius))
    bottom = int(round(cy + radius))

    cropped = clean_img.crop((left, top, right, bottom))
    print(f"Cropped square icon size: {cropped.size}")

    # Resize to master 512x512
    master_512 = cropped.resize((512, 512), Image.Resampling.LANCZOS)

    # Save PNG versions
    icon_png_path = os.path.join(APP_DIR, "icon.png")
    master_512.save(icon_png_path, "PNG")
    print(f"Saved: {icon_png_path}")

    favicon_png_path = os.path.join(PUBLIC_DIR, "favicon.png")
    master_512.resize((64, 64), Image.Resampling.LANCZOS).save(favicon_png_path, "PNG")
    print(f"Saved: {favicon_png_path}")

    apple_icon_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    master_512.resize((180, 180), Image.Resampling.LANCZOS).save(apple_icon_path, "PNG")
    print(f"Saved: {apple_icon_path}")

    icon_192_path = os.path.join(PUBLIC_DIR, "icon-192.png")
    master_512.resize((192, 192), Image.Resampling.LANCZOS).save(icon_192_path, "PNG")
    print(f"Saved: {icon_192_path}")

    icon_512_path = os.path.join(PUBLIC_DIR, "icon-512.png")
    master_512.save(icon_512_path, "PNG")
    print(f"Saved: {icon_512_path}")

    # Save Windows multi-resolution .ico
    icon_ico_path = os.path.join(APP_DIR, "icon.ico")
    master_512.save(
        icon_ico_path,
        format="ICO",
        sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (24, 24), (16, 16)]
    )
    print(f"Saved: {icon_ico_path}")

    favicon_ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    master_512.save(
        favicon_ico_path,
        format="ICO",
        sizes=[(64, 64), (32, 32), (16, 16)]
    )
    print(f"Saved: {favicon_ico_path}")

    print("All icons successfully generated!")

if __name__ == "__main__":
    process_icon()
