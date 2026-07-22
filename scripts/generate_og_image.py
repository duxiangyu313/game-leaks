"""Generate OG share cover image (1200x630)"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
img = Image.new("RGBA", (W, H), "#0A0D12")
draw = ImageDraw.Draw(img)

# Background glow
for cx, cy, r, alpha in [
    (900, 150, 400, 30), (250, 500, 300, 20), (600, 300, 500, 15)
]:
    for dr in range(r, 0, -10):
        a = int(alpha * (1 - dr / r))
        draw.ellipse([cx-dr, cy-dr, cx+dr, cy+dr], fill=(245, 166, 35, a))

# Brand name
try:
    font_title = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttf", 72)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/msyh.ttf", 32)
except:
    font_title = ImageFont.load_default()
    font_sub = font_title

draw.text((80, 200), "国游爆料", fill=(237, 241, 247), font=font_title)
draw.text((80, 310), "国产3A游戏资讯平台", fill=(245, 166, 35), font=font_sub)
draw.text((80, 370), "深度解析 · 独家爆料 · 游戏评测 · 玩家社区", fill=(148, 163, 184), font=font_sub)

# Gold accent line
draw.rectangle([80, 410, 280, 414], fill=(245, 166, 35, 200))

# Domain
draw.text((80, 460), "news.guoyouwenduji.cc", fill=(100, 116, 139), font=font_sub)

out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "og-image.png")
img.save(out, "PNG")
print(f"OG image done: {out} ({os.path.getsize(out)} bytes)")
