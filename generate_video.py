import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FPS = 30
TOTAL_FRAMES = FPS * 5

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter('assets/cinematic-boot.mp4', fourcc, FPS, (W, H))

font_main = ImageFont.truetype('Montserrat-Bold.ttf', 45)
font_large = ImageFont.truetype('Montserrat-Bold.ttf', 75)

for i in range(TOTAL_FRAMES):
    time_sec = i / FPS
    base_color = 8
    
    # Slight green flash at 4.0s
    if 4.0 <= time_sec < 4.2:
        base_color = int(8 + (40 * (1.0 - (time_sec - 4.0)/0.2)))

    img = Image.new('RGBA', (W, H), color=(base_color, int(base_color*1.2), base_color, 255))
    draw = ImageDraw.Draw(img)

    # Green Energy Trace Line
    if time_sec > 1.0:
        progress = min(1.0, (time_sec - 1.0) / 0.5)
        line_w = int((W * 0.6) * progress)
        draw.line([(W//2 - line_w//2, H//2), (W//2 + line_w//2, H//2)], fill=(156, 226, 42, 255), width=6)

    # First Text
    if 2.0 <= time_sec < 5.0:
        alpha = min(255, max(0, int(((time_sec - 2.0) / 0.5) * 255)))
        if time_sec >= 3.8:
            alpha = max(0, 255 - int(((time_sec - 3.8) / 0.2) * 255))
        txt_layer = Image.new('RGBA', (W, H), (0,0,0,0))
        ImageDraw.Draw(txt_layer).text((W//2, H//2 - 80), "WE DO NOT DEFAULT TO COMFORT.", font=font_main, fill=(200, 200, 200, alpha), anchor="mm")
        img.paste(txt_layer, (0,0), txt_layer)

    # Second Text
    if time_sec >= 4.0:
        alpha = min(255, max(0, int(((time_sec - 4.0) / 0.1) * 255)))
        txt_layer = Image.new('RGBA', (W, H), (0,0,0,0))
        ImageDraw.Draw(txt_layer).text((W//2, H//2 + 80), "PROTOCOL LOCKED.", font=font_large, fill=(156, 226, 42, alpha), anchor="mm")
        img.paste(txt_layer, (0,0), txt_layer)

    # Convert and write frame
    frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGBA2BGR)
    out.write(frame)

out.release()
print("✅ SUCCESS: Video generated at assets/cinematic-boot.mp4")
