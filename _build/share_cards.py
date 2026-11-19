"""Branded link-preview images (1200x630) for every page: the EmptyHands logo large in the centre, the page title underneath.

build.py calls card(name, title, kicker) for each page. A card is redrawn only when its title or kicker changes
(stamps kept in assets/img/share/cards.json). If Pillow is not installed, card() returns None and the page falls
back to assets/img/share/default.jpg.
"""
import hashlib
import json
import os
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'assets', 'img', 'share')
STAMPS = os.path.join(OUT, 'cards.json')
W, H = 1200, 630
VERSION = '2'

PAPER = (247, 242, 233)
INK = (28, 26, 22)
BRONZE = (122, 104, 74)
SEAL = (168, 52, 42)
MACRON = set('āēīōūĀĒĪŌŪ')

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
except ImportError:          # Pillow missing: pages use the default card
    Image = None


def _fonts():
    serif = os.path.join(HERE, 'share', 'ShipporiMincho-Bold-latin.ttf')
    karla = os.path.join(ROOT, 'assets', 'fonts', 'karla.woff2')

    def sans(size, weight=800):
        f = ImageFont.truetype(karla, size)
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
        return f
    return (lambda size: ImageFont.truetype(serif, size)), sans


def _draw_title_line(d, x, y, text, font):
    """Draw one line, adding the macron over ā ē ī ō ū by hand (the heading font has no precomposed macron vowels)."""
    for ch in text:
        base = unicodedata.normalize('NFKD', ch)[0] if ord(ch) > 127 and ch not in '‘’“”…·' else ch
        d.text((x, y), base, font=font, fill=INK, anchor='ls')
        w = d.textlength(base, font=font)
        if ch in MACRON:
            top = font.getbbox(base, anchor='ls')[1]
            bar_y = y + top - font.size * 0.12
            d.line([(x + w * 0.2, bar_y), (x + w * 0.8, bar_y)], fill=INK, width=max(3, font.size // 14))
        x += w


def _width(d, text, font):
    return sum(d.textlength(unicodedata.normalize('NFKD', c)[0] if ord(c) > 127 and c not in '‘’“”…·' else c, font=font) for c in text)


def _wrap(d, text, font, maxw):
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if _width(d, t, font) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines


def _background():
    grad = Image.radial_gradient('L').resize((W * 2, H * 2)).crop((W // 2, int(H * 0.2), W // 2 + W, int(H * 0.2) + H))
    bg = Image.composite(Image.new('RGB', (W, H), (236, 227, 211)), Image.new('RGB', (W, H), (251, 247, 240)), grad)
    mtn = Image.open(os.path.join(HERE, 'share', 'mountains.png')).convert('L')
    mtn = mtn.resize((W + 80, round(mtn.height * (W + 80) / mtn.width)))
    layer = Image.new('L', (W, H), 255)
    layer.paste(mtn, (-40, H - mtn.height + 40))
    layer = layer.point(lambda v: 255 - int((255 - v) * 0.55))       # soften
    return ImageChops.multiply(bg, Image.merge('RGB', [layer] * 3))


def _render(title, kicker, path):
    serif, sans = _fonts()
    img = _background()
    d = ImageDraw.Draw(img)
    # logo tile, large and centred
    size = 258
    logo = Image.open(os.path.join(ROOT, 'assets', 'img', 'logo-square-1024.png')).convert('RGB').resize((size, size), Image.LANCZOS)
    lx, ly = (W - size) // 2, 46
    shadow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shadow).rounded_rectangle((lx + 4, ly + 14, lx + size - 4, ly + size + 14), 46, fill=110)
    img = Image.composite(Image.new('RGB', (W, H), (120, 96, 60)), img, shadow.filter(ImageFilter.GaussianBlur(18)).point(lambda v: v // 2))
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), 46, fill=255)
    img.paste(logo, (lx, ly), mask)
    d = ImageDraw.Draw(img)
    # kicker
    k = kicker.upper()
    kf = sans(21, 800)
    spacing = 5
    kw = sum(d.textlength(c, font=kf) for c in k) + spacing * (len(k) - 1)
    x = (W - kw) / 2
    for c in k:
        d.text((x, 350), c, font=kf, fill=SEAL, anchor='ls')
        x += d.textlength(c, font=kf) + spacing
    # title: up to two lines, shrinking to fit
    for fs in (60, 56, 52, 48, 44, 40):
        tf = serif(fs)
        lines = _wrap(d, title, tf, 1060)
        if len(lines) <= 2:
            break
    if len(lines) == 2:          # balance the two lines so a single word is not left on its own
        words = title.split()
        best = min(range(1, len(words)), key=lambda i: max(_width(d, ' '.join(words[:i]), tf), _width(d, ' '.join(words[i:]), tf)))
        cand = [' '.join(words[:best]), ' '.join(words[best:])]
        if max(_width(d, c, tf) for c in cand) <= 1060:
            lines = cand
    lines = lines[:2]
    lh = int(fs * 1.16)
    y = 352 + 18 + fs if len(lines) == 2 else 352 + 40 + fs
    for ln in lines:
        _draw_title_line(d, (W - _width(d, ln, tf)) / 2, y, ln, tf)
        y += lh
    # footer
    ff = sans(24, 700)
    foot = 'emptyhands.co.uk'
    d.text(((W - d.textlength(foot, font=ff)) / 2, 598), foot, font=ff, fill=BRONZE, anchor='ls')
    img.convert('RGB').save(path, 'JPEG', quality=86, optimize=True, progressive=True)


def card(name, title, kicker):
    """Return the share image's path relative to the site root, drawing it if needed."""
    if Image is None:
        return None
    os.makedirs(OUT, exist_ok=True)
    try:
        stamps = json.load(open(STAMPS))
    except (OSError, ValueError):
        stamps = {}
    key = hashlib.sha1(('%s|%s|%s' % (VERSION, title, kicker)).encode()).hexdigest()[:12]
    path = os.path.join(OUT, name + '.jpg')
    if stamps.get(name) != key or not os.path.exists(path):
        _render(title, kicker, path)
        stamps[name] = key
        with open(STAMPS, 'w') as f:
            json.dump(stamps, f, indent=1, sort_keys=True)
    return 'assets/img/share/%s.jpg' % name


if __name__ == '__main__':
    print(card('default', 'Karate, Tai Chi, Yoga & Shiatsu in Ilford', 'EmptyHands Karate School · Since 2006'))
