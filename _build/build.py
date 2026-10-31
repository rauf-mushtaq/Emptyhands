"""Static site generator for the EmptyHands website.

Writes every page of the site into the parent folder (emptyhands/).
Content for blog posts lives in content/posts.json (see import_wp.py);
everything else is defined below.

Usage: python3 build.py
"""
import html
import json
import os
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
POSTS = json.load(open(os.path.join(HERE, 'content', 'posts.json')))

# Cleaner, consistent (sentence-case) titles for the imported WordPress articles. URLs (slugs) stay the same.
POST_TITLES = {
    'reflections-learning-from-lockdown': 'Reflections: lessons from lockdown',
    'history-of-karate-do': 'The history of Karate-Dō',
    'sports-injuries': 'Sports injuries and the martial arts',
    'emptyhands-charity-cup': 'The EmptyHands Charity Cup',
    'workshop-with-shihan-chris-rowen': 'Workshop with Shihan Chris Rowen',
    'sotai-master-class-with-rex-lassalle': 'Sōtai master class with Rex Lassalle',
    'warm-up': 'The dojo warm-up',
    'clinic': 'The EmptyHands Shiatsu clinic',
    'bodhidharma-founder-of-martial-arts': 'Bodhidharma, founder of the martial arts',
    'chi': 'Chi: understanding the vital life force',
    'virtual-dojo': 'The virtual dojo',
    'yoga-karate': 'Yoga and Karate',
    'coronavirus-online-karate-training': 'Training Karate online through the pandemic',
    'fight-club': 'Fight Club: back to the roots of Karate',
    'immunity-tips': 'Boosting immunity with acupressure',
    'kobudo': 'Kobudō: traditional Japanese weaponry',
    'coping-with-stress-is-karate-the-answer': 'Coping with stress: is Karate the answer?',
    '5-actionable-tips-to-becoming-a-better-karateka': 'Five ways to become a better karateka',
    'neurobics-for-karate': 'Neurobics for Karate',
    'karate-mindsets': 'Karate mindsets',
    'shotokan-tigers': 'The Shotokan tiger',
    'evidence-based-karate-training': 'Evidence-based Karate training',
    'budo-culture': 'Budō culture',
    'creating-online-dojo-with-microsoft-teams': 'Creating an online dojo with Microsoft Teams',
    'karate_rules': 'Karate rules for personal growth',
}
# Words that keep their capital letter when article headings are put into sentence case.
KEEP_CAPS = {'Karate', 'Karateka', 'Karate-Dō', 'EmptyHands', 'Shihan', 'Chris', 'Rowen', 'Bodhidharma', 'China', 'Shaolin',
             'Japan', 'Japanese', 'Chi', 'Yin', 'Yang', 'To-Te', 'Jitsu', 'Gichin', 'Funakoshi', 'Asian', 'Kidney', 'Lung', 'Intestine',
             'Kobudō', 'Kihon', 'Kata', 'Kumite', 'Mokuso', 'Jodo', 'Shotokan', 'Budō', 'Shiatsu', 'Fight', 'Club', 'I', 'EBT', 'Ks'}


def tidy_heading(text):
    """Sentence case, no trailing colon, no ALL CAPS — so article headings match the rest of the site."""
    import re
    text = re.sub(r'<[^>]+>', '', text).strip().rstrip(':').strip()
    words = text.split(' ')
    out = []
    for i, w in enumerate(words):
        core = w.strip('()“”‘’!?,.:')
        first = i == 0 or (i == 1 and re.fullmatch(r'\d+\.', words[0]))
        if core.isupper() and len(core) > 1 and core not in KEEP_CAPS:
            w = w.replace(core, core.capitalize())
            core = core.capitalize()
        if core not in KEEP_CAPS and '-' in core:   # Real-Life -> Real-life
            parts = core.split('-')
            w = w.replace(core, '-'.join([parts[0]] + [x.lower() for x in parts[1:]]))
            core = w.strip('()“”‘’!?,.:')
        if not first and core not in KEEP_CAPS and core[:1].isupper() and not re.search(r'[　-鿿]', core):
            w = w.replace(core, core[:1].lower() + core[1:], 1)
        out.append(w)
    return ' '.join(out).replace('new year', 'New Year')


def tidy_post(p):
    import re
    p['title'] = POST_TITLES.get(p['slug'], p['title'])
    p['html'] = re.sub(r'<(h[1-6])([^>]*)>(.*?)</\1>', lambda m: '<%s%s>%s</%s>' % (m.group(1), m.group(2), tidy_heading(m.group(3)), m.group(1)), p['html'], flags=re.S)
    return p


POSTS = [tidy_post(p) for p in POSTS]

SITE = 'EmptyHands'
EMAIL = 'info@emptyhands.co.uk'
PHONE = '+44 7931 300470'
PHONE_HREF = 'tel:+447931300470'
WHATSAPP = 'https://wa.me/447931300470'
# Google Ads: paste the tag ID from Google Ads (Goals > Conversions > Google tag), e.g. 'AW-123456789'.
# Leave it empty to keep Google off the site entirely. Conversion labels are optional:
# each one comes from a conversion action's "Install the tag yourself" page (the part after the slash).
GOOGLE_ADS = {
    'id': 'AW-1066885133',
    'labels': {'lead': '0yW_CO7uv64dEI3A3fwD', 'contact': '', 'whatsapp': '', 'call': ''},
}


def csp():
    """Content-Security-Policy for every page; opens up to Google only when Google Ads is switched on."""
    script, img, connect, frame = ["'self'"], ["'self'", 'data:'], ["'self'"], ['https://www.google.com']
    if GOOGLE_ADS['id']:
        g = ['https://*.googletagmanager.com', 'https://www.googleadservices.com', 'https://googleads.g.doubleclick.net', 'https://ad.doubleclick.net', 'https://www.google.com']
        script += g
        img += g + ['https://www.google.co.uk']
        connect += g + ['https://*.google-analytics.com', 'https://www.google.co.uk', 'https://pagead2.googlesyndication.com']
        frame += ['https://www.googletagmanager.com', 'https://td.doubleclick.net', 'https://bid.g.doubleclick.net']
    return ("default-src 'self'; script-src %s; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src %s; media-src 'self'; "
            "frame-src %s; connect-src %s; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; upgrade-insecure-requests"
            % (' '.join(script), ' '.join(img), ' '.join(frame), ' '.join(connect)))


def ads_tags(prefix):
    if not GOOGLE_ADS['id']:
        return ''
    labels = ''.join(' data-%s="%s"' % (k, e(v)) for k, v in GOOGLE_ADS['labels'].items() if v)
    return '<meta name="google-ads" content="%s"%s>\n<script src="%sassets/js/ads.js" defer></script>\n' % (e(GOOGLE_ADS['id']), labels, prefix)


SOCIAL = {
    'facebook': 'https://www.facebook.com/share/1GHWq27qj6/',
    'instagram': 'https://www.instagram.com/ehdojo/?hl=en-gb',
    'youtube': 'https://www.youtube.com/@emptyhandskarateschool863',
}
DOCS = {
    'syllabus': 'assets/docs/EmptyHands-Syllabus-Summary-Sheet-10th-Kyu-to-Shodan-Level.pdf',
    'calendar': 'assets/docs/EmptyHands-Dojo-Calendar-2026.pdf',
    'planner': 'assets/docs/EH-Yearly-Planner.pdf',
}
DOJOS = [
    {
        'name': 'Ilford Dojo', 'k': '道場', 'address': 'Church Hall, St Andrew’s, The Drive, Ilford IG1 3PE',
        'map': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2479.911952490874!2d0.05531907609409833!3d51.569847606140094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a6e571c6255d%3A0x4fbe36703a646aeb!2sEmptyhands%20Karate%20School!5e0!3m2!1sen!2s!4v1707932577567!5m2!1sen!2s',
        'directions': 'https://www.google.com/maps/dir/?api=1&destination=Emptyhands+Karate+School+The+Drive+Ilford+IG1+3PE',
        'classes': ['Karate — Thursdays 7pm–9pm', 'Tai Chi — Thursdays 6pm–7pm', 'Yoga — Thursdays 8pm–9pm'],
    },
    {
        'name': 'Epping Dojo (invite only)', 'k': '本部', 'address': 'Jack Silley Pavilion, Epping (invite only)',
        'map': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2472.6607334141377!2d0.1160950876519874!3d51.70265332387034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d89896bb52877f%3A0x84ade7537c849d8f!2sJack%20Silley%20Pavilion!5e0!3m2!1sen!2s!4v1714126428360!5m2!1sen!2s',
        'directions': 'https://www.google.com/maps/dir/?api=1&destination=Jack+Silley+Pavilion+Epping',
        'classes': ['Advanced Karate — for developed students', 'Shiatsu clinic — by appointment'],
    },
]

e = html.escape


def _asset_version():
    """Short fingerprint of the CSS/JS, added to their links so browsers fetch new versions straight away."""
    import hashlib
    h = hashlib.sha1()
    for f in ('assets/css/style.css', 'assets/js/main.js'):
        h.update(open(os.path.join(OUT, f), 'rb').read())
    return h.hexdigest()[:8]


ASSET_V = _asset_version()


def img(name, alt='', cls='', w=None, h=None, lazy=True, prefix=''):
    attrs = ['src="%sassets/img/%s"' % (prefix, name), 'alt="%s"' % e(alt)]
    if cls:
        attrs.append('class="%s"' % cls)
    if w and h:
        attrs.append('width="%d" height="%d"' % (w, h))
    attrs.append('loading="lazy" decoding="async"' if lazy else 'fetchpriority="high"')
    return '<img %s>' % ' '.join(attrs)


# ------------------------------------------------------------------ icons
ICON = {
    'facebook': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V22h3.4z"/></svg>',
    'instagram': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    'youtube': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15V9l5.8 3-5.8 3z"/></svg>',
    'whatsapp': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3z"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
    'phone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    'pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    'chev': '<svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m1 1 4 4 4-4"/></svg>',
    'play': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>',
    'link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
}

CLASSES = [
    ('karate', '空手', 'Karate-Dō', 'Traditional Shotokan for children & adults'),
    ('yoga', 'ヨガ', 'Yoga', 'Himalayan Hatha drop-in classes'),
    ('tai-chi', '太極', 'Tai Chi Chuan', 'Yang family internal martial art'),
    ('shiatsu', '指圧', 'Shiatsu', 'Japanese finger-pressure therapy'),
    ('coaching', '指導', 'Coaching', 'Person-centred self-development'),
]
DOJO_MENU = [
    ('about', '歴史', 'About us', 'The story since 2006'),
    ('instructors', '先生', 'Instructors & mentors', 'Sensei and senior students'),
    ('yudansha', '有段', 'Yudansha wall', 'Black belts of the dojo'),
    ('testimonials', '声', 'Testimonials', 'Parents, students & masters'),
    ('gallery', '写真', 'Gallery', 'Life in the dojo'),
]


def header(active, prefix, over_hero):
    def menu(items):
        return ''.join(
            '<a href="%s%s.html"><span class="k">%s</span><span><strong>%s</strong><small>%s</small></span></a>'
            % (prefix, slug, k, title, sub) for slug, k, title, sub in items)

    def top(slug, label):
        cur = ' aria-current="page"' if active == slug else ''
        return '<a href="%s%s.html"%s>%s</a>' % (prefix, slug, cur, label)

    cls = 'site-header is-over-hero' if over_hero else 'site-header is-solid'
    return '''<a class="skip" href="#main">Skip to content</a>
<header class="%(cls)s">
  <div class="wrap">
    <a class="brand" href="%(p)sindex.html" aria-label="EmptyHands home">
      <img class="logo-dark" src="%(p)sassets/img/logo.png" alt="EmptyHands KaraTe School" width="600" height="600">
      <img class="logo-light" src="%(p)sassets/img/logo-light.png" alt="" width="600" height="600">
    </a>
    <button class="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>
    <nav class="nav" id="site-nav" aria-label="Main">
      <div class="nav-group"><button aria-expanded="false" aria-haspopup="true">Classes %(chev)s</button><div class="nav-menu">%(classes)s</div></div>
      <div class="nav-group"><button aria-expanded="false" aria-haspopup="true">The Dojo %(chev)s</button><div class="nav-menu">%(dojo)s</div></div>
      %(fees)s
      %(blog)s
      %(contact)s
      %(app)s
      <a class="btn btn--seal" href="%(p)sjoin.html">Book a trial</a>
    </nav>
  </div>
</header>''' % {
        'cls': cls, 'p': prefix, 'chev': ICON['chev'], 'classes': menu(CLASSES), 'dojo': menu(DOJO_MENU),
        'fees': top('fees', 'Fees'), 'blog': '<a href="%sblog/index.html"%s>Journal</a>' % (prefix, ' aria-current="page"' if active == 'blog' else ''),
        'contact': top('contact', 'Contact'), 'app': top('our-app', 'Student app'),
    }


def footer(prefix):
    recent = ''.join('<li><a href="%sblog/%s.html">%s</a></li>' % (prefix, p['slug'], e(p['title'])) for p in POSTS[:4])
    classes = ''.join('<li><a href="%s%s.html">%s</a></li>' % (prefix, s, t) for s, _, t, _ in CLASSES)
    social = ''.join('<a href="%s" target="_blank" rel="noopener" aria-label="%s">%s</a>' % (u, n.title(), ICON[n]) for n, u in SOCIAL.items())
    social += '<a href="%s" target="_blank" rel="noopener" aria-label="WhatsApp">%s</a>' % (WHATSAPP, ICON['whatsapp'])
    return '''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="%(p)sindex.html"><img src="%(p)sassets/img/logo-light.png" alt="EmptyHands KaraTe School" width="600" height="600" loading="lazy"></a>
        <p>A traditional Karate and wellbeing school, teaching Karate, Tai Chi, Yoga and Shiatsu since 2006. Classes run in Ilford and Woodford, with an invite-only dojo in Epping.</p>
        <div class="socials">%(social)s</div>
      </div>
      <div>
        <h4>Classes</h4>
        <ul>%(classes)s<li><a href="%(p)sfees.html">Fees</a></li></ul>
      </div>
      <div>
        <h4>Dojo</h4>
        <ul>
          <li><a href="%(p)sabout.html">About us</a></li>
          <li><a href="%(p)sinstructors.html">Instructors</a></li>
          <li><a href="%(p)syudansha.html">Yudansha wall</a></li>
          <li><a href="%(p)stestimonials.html">Testimonials</a></li>
          <li><a href="%(p)sgallery.html">Gallery</a></li>
          <li><a href="%(p)sour-app.html">Student app</a></li>
          <li><a href="%(p)s%(syllabus)s" target="_blank" rel="noopener">Syllabus (PDF)</a></li>
          <li><a href="%(p)s%(calendar)s" target="_blank" rel="noopener">Dojo calendar 2026 (PDF)</a></li>
        </ul>
      </div>
      <div>
        <h4>Visit &amp; contact</h4>
        <ul>
          <li>Church Hall, St Andrew’s,<br>The Drive, Ilford IG1 3PE</li>
          <li><a href="%(tel)s">%(phone)s</a></li>
          <li><a href="mailto:%(email)s">%(email)s</a></li>
          <li><a href="%(p)scontact.html">All locations →</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span id="year">%(year)d</span> EmptyHands Karate School. All rights reserved.</span>
      <span><button type="button" class="link-btn js-cookie-settings" hidden>Cookie settings</button> Website by <a href="https://bespokevista.co.uk/" target="_blank" rel="noopener">Bespoke Vista</a></span>
    </div>
  </div>
</footer>
<a class="wa-float" href="%(wa)s" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">%(wai)s</a>''' % {
        'p': prefix, 'social': social, 'classes': classes, 'recent': recent, 'syllabus': DOCS['syllabus'],
        'calendar': DOCS['calendar'], 'tel': PHONE_HREF, 'phone': PHONE, 'email': EMAIL, 'year': date.today().year,
        'wa': WHATSAPP, 'wai': ICON['whatsapp'],
    }


def page(path, title, description, body, active='', over_hero=False, extra_head=''):
    depth = path.count('/')
    prefix = '../' * depth
    full_title = '%s · %s' % (title, SITE) if title != SITE else 'EmptyHands · Traditional Karate, Tai Chi, Yoga & Shiatsu in Ilford & Epping (invite only)'
    doc = '''<!doctype html>
<html lang="en-GB" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="%(csp)s">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
<meta name="theme-color" content="#14120f">
<meta property="og:type" content="website">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:image" content="%(p)sassets/img/hero-poster.jpg">
<link rel="icon" href="%(p)sassets/img/home-icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="%(p)sassets/img/home-icon-180.png">
<link rel="manifest" href="%(p)ssite.webmanifest">
<meta name="apple-mobile-web-app-title" content="EmptyHands">
<link rel="preload" href="%(p)sassets/fonts/karla.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="%(p)sassets/css/style.css?v=%(v)s">
%(extra)s</head>
<body>
%(header)s
<main id="main">
%(body)s
</main>
%(footer)s
<script src="%(p)sassets/js/main.js?v=%(v)s" defer></script>
%(ads)s</body>
</html>
''' % {
        'title': e(full_title), 'desc': e(description), 'p': prefix, 'extra': extra_head,
        'csp': csp(), 'ads': ads_tags(prefix), 'v': ASSET_V,
        'header': header(active, prefix, over_hero), 'body': body.replace('{{p}}', prefix), 'footer': footer(prefix),
    }
    dest = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w') as f:
        f.write(doc)


def page_hero(eyebrow, title, lead='', watermark='', media=None, crumbs=None):
    """media: ('video', name, poster) or ('img', name)"""
    m = ''
    if media and media[0] == 'video':
        m = '<video data-bg autoplay muted loop playsinline preload="metadata" poster="{{p}}assets/img/%s"><source src="{{p}}assets/video/%s" type="video/mp4"></video>' % (media[2], media[1])
    elif media:
        m = '<img src="{{p}}assets/img/%s" alt="" fetchpriority="high">' % media[1]
    c = ''
    if crumbs:
        c = '<div class="crumbs"><a href="{{p}}index.html">Home</a> / %s</div>' % crumbs
    return '''<section class="page-hero%s">%s
  <div class="wrap">%s
    <span class="eyebrow">%s</span>
    <h1>%s</h1>
    %s
  </div>
  %s
</section>''' % (' has-media' if media else '', m, c, eyebrow, title,
                 '<p class="lead">%s</p>' % lead if lead else '',
                 '<div class="watermark" aria-hidden="true">%s</div>' % watermark if watermark else '')


def cta_band(title='The first class is the hardest step — you won’t take it alone',
             text='New students pay as they go for the first few weeks. Just bring comfortable clothes.'):
    return '''<section class="cta-band section--tight">
  <div class="wrap">
    <div><h2>%s</h2><p>%s</p></div>
    <div class="btn-row"><a class="btn btn--light" href="{{p}}join.html">Book a trial class</a><a class="btn btn--ghost btn--light" href="%s" target="_blank" rel="noopener">%s WhatsApp us</a></div>
  </div>
</section>''' % (title, text, WHATSAPP, ICON['whatsapp'])


# ------------------------------------------------------------------ shared content
TESTIMONIALS = [
    ('Poonam Momi', 'Parent', 'Empty hands have been absolutely amazing! My 9 and 11 year old have been attending for several months now. They really enjoy their sessions and always come back having learnt so much and so excited for the next session! The sessions are so organised and I leave my daughters there and trust that they are also safe too. We will definitely be watching our daughters grow with empty hands until the end and couldn’t thank them enough!'),
    ('Archana Ambily', 'Student', 'I have been attending this dojo for several years now and it has been excellent all throughout. This dojo is incredibly dedicated to teaching students and has great amounts of respect to karate — it has taught me a lot about karate in many aspects (not just the physical aspects — theory and history of karate too) and I have great respect towards the art because of this. The dojo also teaches you a lot about mindfulness, which is incredibly important and has helped me a lot in my general life as well as my training. I would definitely highly recommend people to join and be a part of this experience.'),
    ('Jaspal Sembhi', 'Parent', 'My children have been attending this dojo for five years now. From day one they were made to feel welcome and Irm, one of the instructors, has an excellent way with young children. I’ve seen both of my kids gain knowledge and develop their techniques. Sensei Azeem is an excellent instructor and my kids enjoy the training they have had in their journey. The monthly workshops are very informative and enjoyable, making it altogether an invaluable experience. In addition to karate I’ve seen the development of self-confidence, discipline and a positive mindset in both of my children. There is a celebration of success at the final lesson of the year which everyone enjoys and it’s a fitting way to round off the year.'),
    ('Shawkoth Khan', 'Parent', 'My kids have been attending the Dojo for a year now, they are being taught by excellent instructors. Besides learning the art of self defence, they are also learning important life skills, values and respect.'),
    ('Rex Lassalle', 'Shiatsu Master', 'I had the good fortune to have been invited to teach my Be Easy Sotai event at this Karate School. It was inspiring to be there as it was clean, it is a very large dojo. Plus they honour and keep all the old protocols from the Budo past. This is an excellent location to learn a martial art plus the Sensei knows what he is doing.'),
    ('An Stepanova', 'Yoga student', '100% Best yoga classes, Teacher are very polite and professional. I have been going to classes for almost a year and I see a huge result. Definitely recommended ❤️🙏'),
    ('Saleha Choudhury', 'Yoga student', 'Irm is a fantastic yoga instructor! Incredibly patient and supportive.'),
    ('Karen Aram', 'Shiatsu Therapist & Relationship Counsellor', 'I’ve known Azeem for nearly 14 years as a colleague and friend. Having trained with Azeem at the British School of Shiatsu-Do, I can vouch for his professionalism and skill. His Shiatsu practice is well informed, skilled, sensitive and intuitive. Azeem takes a holistic view of the client, able to treat them individually and appropriately, understanding the type of treatment required. His treatments for my back pain have been second to none! As well as Shiatsu, Azeem remains totally committed to his Karate Dojo, understanding how one art form informs and supports the other. If you are lucky enough to be able to book a shiatsu treatment with Azeem, you’ll reap the health rewards and meet a lovely person to boot!'),
    ('Chris Rowen', 'Shihan, 7th Dan — Bunbukan', 'I have known Azeem for most of his Karate career and have always been impressed with his passion for Martial Arts. Over the years I have got to know him as a student and a friend. He is a shining example of one who has put time, effort and belief into Karate-Do and has selflessly shared it for the benefit of a wider audience. He recently completed an MA research study in Karate Coaching which has been a ground-breaking and thought-provoking contribution to the literature of Karate-do. Azeem is a true traditional martial artist who has persistently exemplified devout loyalty and respect to the Karate lineage. His innovative and forward-thinking approach has made him a great ambassador of Karate. In the 90s he pioneered one of the first online Karate magazines, where martial artists from all walks of life would come together to share their ideas.'),
]

YUDANSHA = [
    ('Irm Mushtaq', 'Sensei — SanDan', 'May 2016 (Nidan)', 'irm-300x300-1.webp', 'Irm began training in 2006, the year EmptyHands opened its doors, and has been a tireless ambassador for Karate and the philosophy of the dojo ever since. Alongside coaching and mentoring beginners, she helps run EmptyHands day to day. She is a Senior Instructor and the founder and teacher of EmptyHands Yoga.', '3'),
    ('Amarah Adam', 'NiDan', 'December 2018', 'amarah-1.webp', 'A founding member of the dojo, Amarah has been part of EmptyHands from the very beginning, and her 12-year Karate journey has been exemplary. Today she is a key member of the dojo family, instructing and mentoring students, and plans to lead the new EmptyHands Fight Club dojo in Redbridge, with the goal of one day becoming a Sensei. Drawing on her professional and academic background, she has researched the benefits of Karate for mental health. Amarah holds a first-class honours degree in Psychology, plans to study for a Doctorate in Counselling Psychology, and works as a mental health counsellor in hospitals.', '2'),
    ('Hamza Iftikhar', 'NiDan', 'December 2017', 'amarah-adam3.webp', 'Hamza began training privately with Azeem Sensei in 2004 and became a founding member of the dojo in 2006. A devoted and loyal student, he is now one of the main instructors and senior students at EmptyHands, has played an active part in developing the dojo, and continues his professional development in Shiatsu and the internal martial arts. Hamza is a testament to the hard work it takes to become a true traditional karateka.', '2'),
    ('Reet Chadda', 'Senpai — ShoDan', '', 'reet.webp', 'Reet began her Karate-Dō journey in 2016 and is now one of the most senior students in the dojo. She knows exactly what she wants from her training, and Karate has helped her push past her comfort zone, mentally and physically, building real confidence. Above all, it has taught her never to think like a defeatist, whatever the situation — a mindset that has brought her success both in the dojo and in her studies.', '1'),
    ('Leila Mushtaq', 'Senpai — ShoDan', '', 'leila.webp', 'Leila began Karate-Dō at the age of three, and it has been part of her life ever since, shaping her passion for the performing arts. A student at Sylvia Young Theatre School, where she has found her love of drama and dance, she often sees parallels between the stage and the dojo. Her journey has taken her from a weekly fun class to leading sessions, both online and in the dojo.', '1'),
    ('Adwaitha Vinayan', 'Senpai — ShoDan', '', 'adwaitha.webp', 'Adwaitha has trained in Karate-Dō since the age of seven. Karate and the Dojo Kun have helped her grow in confidence and become strong and grounded, discovering that vulnerability need not be a weakness. Finding personal balance and overcoming anxiety has been her greatest achievement. Adwaitha is an outstanding, all-round karateka.', '1'),
    ('Dhillon Baines', 'Senpai — ShoDan', '', 'dhillon.webp', 'Dhillon has practised Karate-Dō since the age of four and is deeply committed to EmptyHands. He trains every week without fail, always accompanied by his dad, Bobby, who takes a keen interest in his progress. Karate, and the Dojo Kun in particular, has helped Dhillon develop strong interpersonal skills. He is an outstanding karateka with excellent technique.', '1'),
    ('Rayyan Javaid', 'ShoDan', 'December 2018', 'rayyan-dan-profile-pic-230x300-1.webp', 'Rayyan joined EmptyHands in 2011, and his attendance and loyalty have been exemplary. He regularly excels in kumite and has been singled out by visiting instructors for his technique and form. After joining the black belt programme in 2017, he worked tirelessly towards Yudansha, often mentoring his peers along the way.', '1'),
    ('Dhaniyal Hameed', 'ShoDan', 'December 2017', 'dhaniyal-yudansha-2-768x1042-1.webp', 'Dhaniyal began training in 2008 and has been a dedicated, loyal student with an excellent attendance record, taking part in many dojo workshops and events. He joined the black belt programme in 2015 and worked tirelessly towards Yudansha. His determination and pursuit of excellence earned the admiration of his peers.', '1'),
    ('Ismael Adam', 'ShoDan', 'June 2015', 'ismael.webp', 'Ismael began training at EmptyHands in 2006. His attendance and loyalty have been exemplary, and visiting instructors have noted his technique and form. Having found his own style within the syllabus, he is a shining example of a karateka who pursues his goals with persistence.', '1'),
    ('Dasina Kerai', 'ShoDan', 'June 2015', 'dasina.webp', 'Dasina joined EmptyHands in 2008 after training in other martial arts. She quickly settled into the dojo and proved an excellent student with exceptional ability. In 2010 she joined the Instructor Apprenticeship Programme and, through hard work, became an Assistant Instructor. Dasina brings much-needed rigour to an art that is changing with the times.', '1'),
    ('Ishaaq Adam', 'ShoDan', 'December 2013', 'ishaaq.webp', 'Ishaaq began training in the early days of EmptyHands, and his attendance and loyalty have been exemplary. Having developed strong technique and found his niche, he has the potential to become a champion in both traditional and sport Karate.', '1'),
    ('Abdullah Shakeel', 'ShoDan', 'December 2013', 'abdul.webp', 'Over five to six years of hard work, Abdullah became one of the most technically gifted students in the dojo. His training and gradings have always been excellent, visiting instructors have often noticed him, and he has the true heart of a karateka.', '1'),
    ('Shihan Sumoondur', 'ShoDan', 'December 2013', 'shihan.webp', 'Through five to six years of dedicated training, Shihan became one of the most technically gifted students in the dojo, with excellent gradings that visiting instructors often remarked on. Brave, spirited and tenacious, he is a role model for younger students.', '1'),
    ('Mahwish Iftikhar', 'ShoDan', 'December 2011', 'a.webp', 'Mahwish was one of the founding members of the dojo in 2006.', '1'),
]

DOJO_KUN = [
    ('人格完成に努むること', 'Seek perfection of character'),
    ('誠の道を守ること', 'Be faithful'),
    ('努力の精神を養うこと', 'Endeavour to excel'),
    ('礼儀を重んずること', 'Respect others'),
    ('血気の勇を戒むること', 'Refrain from violent behaviour'),
]

TIMETABLE = [
    ('Thursday', 'karate', 'Karate-Dō', 'All grades, children & adults', '7:00pm – 9:00pm', 'Ilford', 'Weekly'),
    ('Thursday', 'taichi', 'Tai Chi Chuan', 'Yang family style', '6:00pm – 7:00pm', 'Ilford', 'Book ahead'),
    ('Thursday', 'yoga', 'Yoga', 'Himalayan Hatha — drop-in', '8:00pm – 9:00pm', 'Ilford', 'Drop-in'),
    ('Any day', 'shiatsu', 'Shiatsu & Coaching', 'One-to-one sessions & workshops', 'By appointment', '', 'Free 15-min consult'),
]


def timetable(rows=TIMETABLE):
    out = ['<div class="timetable" role="table" aria-label="Weekly timetable"><div class="tt-row head" role="row"><span role="columnheader">Day</span><span role="columnheader">Class</span><span role="columnheader">Time</span><span role="columnheader">Dojo</span><span role="columnheader"></span></div>']
    for day, key, name, sub, time, where, tag in rows:
        out.append('<div class="tt-row" role="row"><span class="tt-day" role="cell">%s</span><span class="tt-class" role="cell"><span class="dot %s"></span><span>%s<small>%s</small></span></span><span role="cell">%s</span><span role="cell">%s</span><span role="cell"><span class="tag">%s</span></span></div>'
                   % (day, key, name, sub, time, where, tag))
    out.append('</div>')
    return ''.join(out)


def quote_html(name, role, text, stars=True):
    return '<figure class="quote">%s<blockquote>%s</blockquote><figcaption><strong>%s</strong><span>%s</span></figcaption></figure>' % (
        '<div class="stars" aria-label="5 stars">★★★★★</div>' if stars else '', e(text), e(name), e(role))


def post_card(p, prefix='{{p}}', feature=False):
    cover = p['cover']
    thumb = '<img src="%sassets/img/%s" alt="" loading="lazy" width="%d" height="%d">' % (prefix, cover['file'], cover['w'], cover['h']) if cover else ''
    d = date.fromisoformat(p['date']).strftime('%-d %b %Y')
    return '''<a class="post-card%s reveal" href="%sblog/%s.html" data-cat="%s">
  <div class="thumb">%s</div>
  <div><div class="meta"><span class="cat">%s</span><span>%s</span><span>%d min read</span></div>
  <h3>%s</h3><p>%s</p></div>
</a>''' % (' post-card--feature' if feature else '', prefix, p['slug'], e(p['category']), thumb, e(p['category']), d, p['minutes'], e(p['title']), e(p['excerpt']))


def locations():
    out = []
    for d in DOJOS:
        out.append('''<article class="location reveal">
  <div class="map-consent"><button class="map-load" type="button" data-src="%s" data-title="Map of %s">Show map</button><p>Loads Google Maps, which may set cookies.</p></div>
  <div class="body"><h3>%s <span class="k kanji">%s</span></h3><p class="muted">%s</p><ul>%s</ul>
  <a class="link-arrow" href="%s" target="_blank" rel="noopener noreferrer">Get directions</a></div>
</article>''' % (d['map'], d['name'], d['name'], d['k'], d['address'], ''.join('<li>%s</li>' % c for c in d['classes']), d['directions']))
    return '<div class="locations">%s</div>' % ''.join(out)


def words(items):
    return '<div class="words">%s</div>' % ''.join(
        '<div class="word reveal"><strong>%s</strong><span class="ph">%s</span><p>%s</p></div>' % (w, ph, d) for w, ph, d in items)


def downloads(prefix='{{p}}'):
    items = [
        (DOCS['syllabus'], 'Karate syllabus', '10th Kyu to Shodan summary'),
        (DOCS['calendar'], 'Dojo calendar 2026', 'Classes, gradings & workshops'),
        (DOCS['planner'], 'Yearly planner', 'Plan your training year'),
    ]
    return '<div class="downloads">%s</div>' % ''.join(
        '<a class="download" href="%s%s" target="_blank" rel="noopener"><span class="ic">PDF</span><span><strong>%s</strong><span>%s</span></span></a>' % (prefix, href, t, s)
        for href, t, s in items)


# ------------------------------------------------------------------ pages
def build_home():
    faces = ''.join(img(y[3], y[0]) for y in YUDANSHA)
    disc = [
        ('karate', '空手', 'Karate-Dō', 'Classical Shotokan with Goju Ryu influences — kihon, kata, bunkai and kumite for children and adults.', 'img', 'eh-students-q.webp'),
        ('yoga', 'ヨガ', 'Yoga', 'Himalayan Hatha Yoga, blended with Karate, Tai Chi and Shiatsu to ease everyday stress.', 'video', 'yoga'),
        ('tai-chi', '太極拳', 'Tai Chi', 'Traditional Yang family Tai Chi Chuan in the lineage of Master Ding.', 'img', 'taichi-school.webp'),
        ('shiatsu', '指圧', 'Shiatsu', 'Japanese finger-pressure therapy for wellbeing, self-care and rehabilitation.', 'video', 'shiatsu'),
        ('coaching', '指導', 'Coaching', 'Person-centred coaching for self-development, rehabilitation and wellbeing.', 'img', 'coaching.webp'),
    ]
    cards = []
    for i, (slug, k, t, d, kind, media) in enumerate(disc):
        if kind == 'video':
            m = '<video data-bg autoplay muted loop playsinline preload="none" poster="assets/img/%s-poster.jpg"><source src="assets/video/%s.mp4" type="video/mp4"></video>' % (media, media)
        else:
            m = img(media, '')
        cards.append('<a class="discipline reveal reveal-d%d" href="%s.html">%s<span class="k">%s</span><h3>%s</h3><p>%s</p><span class="link-arrow">Discover</span></a>' % (i % 3, slug, m, k, t, d))
    quotes = ''.join(quote_html(*t) for t in TESTIMONIALS)
    posts = ''.join(post_card(p) for p in POSTS[:3])
    kun = ''.join('<li><span class="jp">%s</span><span class="en">%s</span></li>' % (jp, en) for jp, en in DOJO_KUN)

    body = '''
<section class="hero has-film">
  <video data-bg data-film autoplay muted loop playsinline preload="auto" poster="assets/img/dojo-film-poster.jpg"><source src="assets/video/dojo-film.mp4" type="video/mp4"></video>
  <button class="hero-sound" type="button" aria-label="Turn sound on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path class="wave" d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/><path class="cross" d="m16 9 6 6m0-6-6 6"/></svg><span>Tap for sound</span></button>
  <div class="wrap">
    <span class="eyebrow">Traditional Karate School · Est. 2006</span>
    <h1>The way of the empty hand</h1>
    <p class="lead">Classical Shotokan Karate, Tai Chi Chuan, Yoga and Shiatsu in Ilford and Epping (invite only). Patient teaching, rooted in tradition and open to every age and ability.</p>
    <div class="btn-row"><a class="btn btn--seal" href="join.html">Book a trial class</a><a class="btn btn--ghost btn--light" href="#classes">Explore classes</a></div>
    <div class="hero-stats">
      <div><strong>2006</strong><span>Founded</span></div>
      <div><strong>15</strong><span>Black belts awarded</span></div>
      <div><strong>5</strong><span>Disciplines</span></div>
    </div>
  </div>
  <button class="video-toggle" aria-label="Pause video"></button>
</section>

<section class="section">
  <div class="wrap split">
    <div class="reveal">
      <span class="eyebrow">The dojo</span>
      <h2>A traditional school with a modern, person-centred heart</h2>
      <p class="lead">EmptyHands is a traditional Karate school. Training follows the classical Shotokan system, with influences from Goju Ryu, Shiatsu (acupressure) and the internal martial art of Tai Chi Chuan.</p>
      <p>Founded in 2006 on the ideals of Gichin Funakoshi Hanshi, the father of modern Karate, the dojo follows a syllabus inspired by the late Hirokazu Kanazawa Sōke. Just as much weight is given to the values of Karate, studied through the Dojo Kun.</p>
      <div class="btn-row" style="margin-top:28px"><a class="btn" href="about.html">The EmptyHands story</a><a class="btn btn--ghost" href="karate.html">Karate classes</a></div>
    </div>
    <div class="figure-stack reveal reveal-d1">
      %(img_main)s
      %(img_inset)s
      <div class="seal" aria-hidden="true">空手<br>道</div>
    </div>
  </div>
</section>

<section class="section section--alt" id="classes">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow">Classes &amp; therapies</span><h2>Five paths, one practice</h2></div>
      <p class="lead">From the first bow on the dojo floor to one-to-one healing, each discipline strengthens the others.</p>
    </div>
    <div class="disciplines">%(cards)s</div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow">The fundamentals</span><h2>Four pillars of Karate-Dō</h2></div>
      <p class="lead">Person-centred teaching, built on the fundamentals every karateka returns to — from white belt to Sensei.</p>
    </div>
    <div class="pillars">
      <div class="pillar reveal"><div class="k">基本</div><h3>Kihon</h3><span class="romaji">Basics</span><p>Stances, blocks, strikes and kicks repeated until they become second nature.</p></div>
      <div class="pillar reveal reveal-d1"><div class="k">型</div><h3>Kata</h3><span class="romaji">Form</span><p>Choreographed sequences that carry the techniques and spirit of the masters.</p></div>
      <div class="pillar reveal reveal-d2"><div class="k">分解</div><h3>Bunkai</h3><span class="romaji">Application</span><p>Unlocking what each movement of a kata really means — and how to use it.</p></div>
      <div class="pillar reveal reveal-d3"><div class="k">組手</div><h3>Kumite</h3><span class="romaji">Sparring</span><p>Safe, controlled partner work that develops timing, distance and composure.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap dojo-kun">
    <div class="dojo-kun-title reveal" aria-hidden="true">道場<span>訓</span></div>
    <div>
      <div class="reveal"><span class="eyebrow">Dojo Kun · the five precepts</span>
      <h2>Karate begins and ends with respect</h2>
      <p class="lead">Recited at the close of every class, the Dojo Kun are the values students carry beyond the dojo — into school, work and family life.</p></div>
      <ol class="kun-list reveal">%(kun)s</ol>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow">Weekly timetable</span><h2>Train with us this week</h2></div>
      <p class="lead">A full calendar is published at the end of each year, so everyone can plan ahead. <a class="link-arrow" href="%(calendar)s" target="_blank" rel="noopener">2026 calendar</a></p>
    </div>
    <div class="reveal">%(timetable)s</div>
  </div>
</section>

<section class="section">
  <div class="wrap founder">
    <div class="founder-photo reveal">
      %(azeem)s
      <div class="caption"><div><strong>Azeem Mushtaq</strong><span>Founder &amp; Chief Instructor · GoDan</span></div><span class="k kanji">先生</span></div>
    </div>
    <div class="reveal reveal-d1">
      <span class="eyebrow">Meet the Sensei</span>
      <h2>Three decades on the path of the martial, healing and coaching arts</h2>
      <ul class="quals"><li>GoDan · 5th Dan</li><li>MA Coaching</li><li>BA (Hons)</li><li>Dip Shiatsu-Do</li></ul>
      <p>Azeem founded EmptyHands in March 2006 to create a Dojo grounded in the principles of Bushidō — discipline, respect and purpose — while embracing thoughtful, modern interpretation.</p>
      <p>Guided by masters including Hirokazu Kanazawa Sōke, Chris Rowen Shihan, Yoshinobu Ohta Sensei and Nobuaki Kanazawa Kanchō, he also studied Tai Chi Chuan with Master John Ding and graduated from the British School of Shiatsu-Do. His Oxford Brookes MA developed the first Karate Coaching Model.</p>
      <a class="link-arrow" href="instructors.html">Meet the instructors</a>
    </div>
  </div>
</section>


<section class="section section--dark" style="padding-top:0">
  <div class="wrap quotes">
    <div class="section-head reveal">
      <div><span class="eyebrow">Kind words</span><h2>From parents, students and masters</h2></div>
      <div class="quote-nav"><button data-dir="-1" aria-label="Previous testimonial">←</button><button data-dir="1" aria-label="Next testimonial">→</button></div>
    </div>
    <div class="quote-track reveal" tabindex="0" aria-label="Testimonials">%(quotes)s</div>
    <p style="margin-top:20px"><a class="link-arrow" href="testimonials.html">Read all testimonials</a></p>
  </div>
</section>

<section class="section section--alt">
  <div class="wrap center narrow reveal">
    <span class="eyebrow">有段者 · Yudansha</span>
    <h2>Fifteen black belts and counting</h2>
    <p class="lead">Every name on the Yudansha wall started exactly where you will: a nervous white belt on their very first night.</p>
    <div class="faces" style="margin:36px 0">%(faces)s</div>
    <a class="btn" href="yudansha.html">Visit the Yudansha wall</a>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow">Journal</span><h2>Notes from the dojo</h2></div>
      <a class="link-arrow" href="blog/index.html">All articles</a>
    </div>
    <div class="posts">%(posts)s</div>
  </div>
</section>

%(cta)s
''' % {
        'img_main': img('azeem-mushtaq-sensei.webp', 'Sensei Azeem leading a training session in the dojo hall', 'main'),
        'img_inset': '',
        'cards': ''.join(cards), 'kun': kun, 'timetable': timetable(), 'calendar': DOCS['calendar'],
        'azeem': img('amushtaqsensei.webp', 'Azeem Mushtaq Sensei', '', 724, 1048), 'play': ICON['play'],
        'quotes': quotes, 'faces': faces, 'posts': posts, 'locations': locations(), 'cta': cta_band(),
    }
    page('index.html', SITE, 'EmptyHands is a traditional Shotokan Karate school in Ilford and Epping (invite only), founded in 2006 — also teaching Tai Chi Chuan, Yoga, Shiatsu and Coaching.', body, over_hero=True)


def discipline_page(slug, kanji, name, eyebrow, lead, media, intro_html, facts, word_items, gallery_imgs, related_cats, extra=''):
    related = [p for p in POSTS if p['category'] in related_cats][:3]
    facts_html = '<ul class="facts">%s</ul>' % ''.join('<li><span>%s</span><span>%s</span></li>' % f for f in facts)
    gal = ''.join('<div class="reveal">%s</div>' % img(g, a, 'img-round') for g, a in gallery_imgs)
    body = page_hero(eyebrow, name, lead, kanji, media, crumbs='<a href="{{p}}index.html#classes">Classes</a>') + '''
<section class="section">
  <div class="wrap split split--wide-left">
    <div class="reveal prose-lite">%s
      <div class="btn-row" style="margin-top:30px"><a class="btn btn--seal" href="{{p}}join.html">Register</a><a class="btn btn--ghost" href="{{p}}fees.html#%s">See fees</a></div>
    </div>
    <div class="reveal reveal-d1">%s</div>
  </div>
</section>
%s
<section class="section section--alt">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">In a word</span><h2>What %s brings</h2></div></div>
    %s
  </div>
</section>
%s
%s
%s''' % (intro_html, slug, facts_html, extra, name, words(word_items),
         ('<section class="section"><div class="wrap grid-%d">%s</div></section>' % (min(3, len(gallery_imgs)), gal)) if gallery_imgs else '',
         ('<section class="section%s"><div class="wrap"><div class="section-head reveal"><div><span class="eyebrow">From the journal</span><h2>Further reading</h2></div><a class="link-arrow" href="{{p}}blog/index.html">All articles</a></div><div class="posts">%s</div></div></section>'
          % (' section--alt' if not gallery_imgs else '', ''.join(post_card(p) for p in related))) if related else '',
         cta_band())
    return body


def build_disciplines():
    karate_extra = '''
<section class="section section--dark">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">The fundamentals</span><h2>How every class is built</h2></div>
    <p class="lead">Every lesson works through the four fundamentals of Karate-Dō and closes with the Dojo Kun.</p></div>
    <div class="pillars">
      <div class="pillar reveal"><div class="k">基本</div><h3>Kihon</h3><span class="romaji">Basics</span><p>Stances, blocks, strikes and kicks — the alphabet of Karate.</p></div>
      <div class="pillar reveal reveal-d1"><div class="k">型</div><h3>Kata</h3><span class="romaji">Form</span><p>Shotokan kata from Heian Shodan upwards, as set out in the EmptyHands syllabus.</p></div>
      <div class="pillar reveal reveal-d2"><div class="k">分解</div><h3>Bunkai</h3><span class="romaji">Application</span><p>Practical application of kata, including self-defence scenarios.</p></div>
      <div class="pillar reveal reveal-d3"><div class="k">組手</div><h3>Kumite</h3><span class="romaji">Sparring</span><p>From pre-arranged gohon kumite to controlled free sparring.</p></div>
    </div>
    <div class="mt-l reveal">%s</div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">Grading path</span><h2>From white belt to Shodan</h2></div>
    <p class="lead">Students progress through the kyu ranks across four programmes, each with its own monthly and grading fees.</p></div>
    <div class="price-list">
      <div class="price reveal"><span class="label">Beginner</span><span class="amount">White → Orange</span><span class="muted">Grading £25</span><div class="belts"><i style="background:#fff;border:1px solid #ccc"></i><i style="background:#c9302c"></i><i style="background:#e8892b"></i></div></div>
      <div class="price reveal reveal-d1"><span class="label">Intermediate</span><span class="amount">Yellow → Green</span><span class="muted">Grading £30</span><div class="belts"><i style="background:#e6c229"></i><i style="background:#3d7a3d"></i></div></div>
      <div class="price reveal reveal-d2"><span class="label">Advanced</span><span class="amount">Purple → Brown</span><span class="muted">Grading £35</span><div class="belts"><i style="background:#6b3fa0"></i><i style="background:#6b4423"></i></div></div>
      <div class="price featured reveal reveal-d3"><span class="label">Advanced II &amp; Yudansha</span><span class="amount">Black belt</span><span class="muted">Grading £45 / on application</span><div class="belts"><i style="background:#000;box-shadow:0 0 0 1px #555"></i></div></div>
    </div>
  </div>
</section>''' % downloads()
    body = discipline_page(
        'karate', '空手道', 'Karate-Dō', 'Traditional Shotokan Karate · Ilford &amp; Epping (invite only)',
        'Classical Shotokan with influences from Goju Ryu, Shiatsu and the internal martial arts — for children and adults of every level.',
        ('img', 'azeem-mushtaq-sensei.webp'),
        '''<span class="eyebrow">Information</span>
<h2>Karate as it was meant to be taught</h2>
<p class="lead">Classical Shotokan Karate with influences from Goju Ryu, Shiatsu (acupressure) and Tai Chi Chuan — taught the traditional way, to children and adults alike.</p>
<p>EmptyHands was founded in 2006 on the ideals of Gichin Funakoshi Hanshi, the father of modern Karate. The syllabus is inspired by the work of the late Hirokazu Kanazawa Sōke, with a few adaptations.</p>
<p>Teaching is person-centred and built on the four fundamentals of Karate-Dō: Kihon (basics), Kata (form), Bunkai (application) and Kumite (sparring). Just as important are the values of Karate, explored through the Dojo Kun.</p>
<p>Classes run every Thursday from 7pm to 9pm in Ilford, with advanced training for experienced students at the Epping dojo (invite only). A full calendar is published at the end of each year, so everyone can plan ahead.</p>''',
        [('When', 'Thursdays, 7pm – 9pm'), ('Where', 'Church Hall, St Andrew’s, The Drive, Ilford IG1 3PE'), ('Advanced', 'Extra classes at the Epping dojo (invite only)'),
         ('Style', 'Shotokan, with Goju Ryu influences'), ('Ages', 'Children (from 4) and adults'), ('Try it', '£10 pay-as-you-go for new starters')],
        [('fist', 'f.ist', 'hand and fingers clenched, a gesture'), ('learn', 'le.arn', 'to gain or acquire knowledge or skill'),
         ('develop', 'de.vel.op', 'to grow or transform into a new state'), ('empower', 'em.pow.er', 'to give ability, freedom — to enable'),
         ('inspire', 'in.spire', 'to fill with an animating, quickening, or exalting influence')],
        [('homekarate.webp', 'Kicks, kata and line work at the dojo'), ('leila2-edited.webp', 'Leila in a deep stance'), ('eh-students-q.webp', 'Students in red and orange belts practising together')],
        {'Karate', 'History'}, karate_extra)
    page('karate.html', 'Karate classes in Ilford & Epping (invite only)', 'Traditional Shotokan Karate classes for children and adults in Ilford (Thursdays 7–9pm) and Epping (invite only). Founded 2006 on the ideals of Gichin Funakoshi.', body, 'karate', over_hero=True)

    body = discipline_page(
        'yoga', 'ヨガ', 'Yoga', 'Himalayan Hatha Yoga · Ilford',
        'A practice to ease the stresses of everyday life — drop in on Thursday evenings.',
        ('video', 'yoga.mp4', 'yoga-poster.jpg'),
        '''<span class="eyebrow">Information</span>
<h2>Breath, posture and stillness</h2>
<p class="lead">EmptyHands Yoga is rooted in Himalayan Hatha Yoga, as developed by Yogi Ashokananda.</p>
<p>Classes also draw on Karate, Tai Chi and Shiatsu, creating a practice that eases the stresses of everyday life. Sessions are led by Irm Mushtaq Sensei, founder and teacher of EmptyHands Yoga.</p>
<p>Drop-in classes run every Thursday from 8pm to 9pm, and private sessions are available on request — get in touch to find out more or to book.</p>''',
        [('When', 'Thursdays, 8pm – 9pm'), ('Where', 'Ilford Dojo'), ('Format', 'Drop-in, plus dedicated sessions on request'), ('Teacher', 'Irm Mushtaq (Sensei)'), ('Fees', '£10 per class or £30 per month')],
        [('supportive', 'sup.por.tive', 'to encourage or provide emotional help'), ('strength', 'str.ength', 'capacity to withstand great force'),
         ('cleansing', 'cleans.ing', 'to clean or remove harmful substances from oneself'), ('revitalising', 're.vital.ising', 'to give new life, energy or success to something')],
        [('yoga-studio.webp', 'A yoga practitioner stretching on a mat'), ('irmensoform-225x300-1.webp', 'Irm Sensei')],
        {'Wellbeing'})
    page('yoga.html', 'Yoga classes in Ilford', 'Himalayan Hatha Yoga drop-in classes in Ilford every Thursday 8–9pm, blending Karate, Tai Chi and Shiatsu teachings.', body, 'yoga', over_hero=True)

    body = discipline_page(
        'tai-chi', '太極拳', 'Tai Chi Chuan', 'Internal martial arts · Ilford',
        'Traditional Yang family Tai Chi Chuan — for relaxation, mindfulness, balance and physical fitness.',
        ('video', 'taichi.mp4', 'taichi-poster.jpg'),
        '''<span class="eyebrow">Information</span>
<h2>Softness that overcomes hardness</h2>
<p class="lead">Traditional Yang family Tai Chi Chuan, taught according to the principles of the Master Ding Academy.</p>
<p>Tai Chi Chuan is an internal martial art that builds flexibility, balance and mindfulness, making it suitable for all ages and fitness levels. Azeem Sensei began studying the internal arts with Master John Ding at the International Academy of Tai Chi Chuan in 1999.</p>
<p>Classes run weekly in Ilford on Thursdays, 6pm to 7pm. Places must be booked in advance, so every participant receives personal attention.</p>''',
        [('Ilford', 'Thursdays, 6pm – 7pm'), ('Style', 'Traditional Yang family'), ('Lineage', 'Master Ding Academy'), ('Booking', 'Advance booking required'), ('Fees', '£10 per class or £30 per month')],
        [('grand', 'gr.and', 'magnificent and imposing'), ('ultimate', 'ulti.mate', 'the best or most extreme'), ('energise', 'ener.gise', 'achieving vitality and enthusiasm')],
        [('taichi-school.webp', 'Students practising Tai Chi in a sports hall'), ('wuchi.webp', 'Wu Chi — ink brush circle')],
        {'Wellbeing'})
    page('tai-chi.html', 'Tai Chi Chuan in Ilford', 'Traditional Yang family Tai Chi Chuan classes in Ilford (Thursdays), in the lineage of Master Ding Academy.', body, 'tai-chi', over_hero=True)

    body = discipline_page(
        'shiatsu', '指圧', 'Shiatsu', 'Japanese healing therapy · Epping clinic (invite only)',
        'Finger-pressure therapy grounded in Traditional Oriental Medicine — no needles, no herbs.',
        ('video', 'shiatsu.mp4', 'shiatsu-poster.jpg'),
        '''<span class="eyebrow">Information</span>
<h2>Healing through touch</h2>
<p class="lead">Shiatsu is a powerful Japanese healing therapy. The name literally means “finger pressure” — a form of acupressure.</p>
<p>Rooted in Traditional Oriental Medicine, it works without needles or herbs. The clinic specialises in mental wellbeing, self-care and rehabilitation, through workshops and one-to-one sessions.</p>
<p>Azeem Mushtaq Sensei founded the EmptyHands clinic in 2003 after graduating from the British School of Shiatsu-Dō, and it is registered with the Shiatsu Society. Treatments offer advice, support and rehabilitation for sports injuries, back problems and trauma. Azeem’s development was supported by the late Shiatsu Master Rex Lassalle.</p>''',
        [('Clinic', 'Epping (invite only) — by appointment'), ('Consultation', 'Free 15-minute consultation'), ('Treatment', '£100 per treatment'), ('Specialisms', 'Mental wellbeing, self-care, rehabilitation, sports injuries'), ('Registered', 'The Shiatsu Society')],
        [('therapy', 'thera.py', 'treatment intended to relieve or heal a disorder'), ('acupressure', 'acu.pressure', 'a therapy in which manual pressure is used to stimulate specific points on the body'),
         ('rehabilitation', 're.hab.ilitation', 'supporting the restoration of good health through interventions'), ('revitalising', 're.vital.ising', 'to give new life, energy or success to something')],
        [('rex-lassalle.webp', 'Rex Lassalle, Shiatsu Master'), ('image-1024x499-1.webp', 'Shiatsu self-care techniques illustrated'), ('kidney27.webp', 'Acupressure point chart')],
        {'Wellbeing'})
    page('shiatsu.html', 'Shiatsu therapy in Ilford & Epping (invite only)', 'Shiatsu (Japanese acupressure) for wellbeing, self-care and rehabilitation. Free 15-minute consultation. Registered with the Shiatsu Society.', body, 'shiatsu', over_hero=True)

    body = discipline_page(
        'coaching', '指導', 'Coaching', 'Person-centred coaching · in person or on Teams',
        'Guidance, support and structure to help you overcome obstacles and reach personal and professional goals.',
        ('video', 'coaching.mp4', 'coaching-poster.jpg'),
        '''<span class="eyebrow">Information</span>
<h2>Find the path through the obstacle</h2>
<p class="lead">Coaching is a professional partnership that helps you reach personal and professional goals through guidance, support and structure.</p>
<p>Working one-to-one or with groups, a coach helps find a way past whatever stands in the way. The approach is person-centred, specialising in self-development, rehabilitation and wellbeing — including dedicated Coaching for Mental Health sessions.</p>
<p>Azeem Sensei holds an MA in Coaching from Oxford Brookes (2013), where he developed the first Karate Coaching Model. Start with a free 15-minute consultation, in person or on a Teams call.</p>''',
        [('Consultation', 'Free 15 minutes, in person or on Teams'), ('Sessions', '£25 per hour'), ('Approach', 'Person-centred'), ('Focus', 'Self-development, rehabilitation, wellbeing'), ('Coach', 'Azeem Mushtaq, MA Coaching')],
        [('create', 'cre.ate', 'bring something into existence'), ('extraordinary', 'extra.ordinary', 'unusual or remarkable act'), ('moments', 'mo.ments', 'brief period of time'), ('grow', 'gr.ow', 'to become better or advanced')],
        [('coaching.webp', 'A butterfly silhouetted against the setting sun'), ('coaching-1.webp', 'A butterfly resting on grass at sunset')],
        {'Wellbeing', 'Dojo life'})
    page('coaching.html', 'Coaching in Ilford & Epping (invite only)', 'Person-centred coaching for self-development, rehabilitation and wellbeing. Free 15-minute consultation in person or via Teams; £25 per hour.', body, 'coaching', over_hero=True)


def build_about():
    body = page_hero('About EmptyHands', 'A safe space to learn and grow since 2006',
                     'Martial arts, healing and bodywork, taught by people who believe in their power to transform lives.', '歴史',
                     ('img', 'eh-students-q.webp'), 'About') + '''
<section class="section">
  <div class="wrap split">
    <div class="reveal">
      <span class="eyebrow">The story</span>
      <h2>Founded by Azeem Mushtaq Sensei in 2006</h2>
      <p class="lead">EmptyHands Karate School welcomes everyone. The mission is simple: a safe space where people can learn and grow through martial arts, healing and bodywork.</p>
      <p>Hundreds of students have trained at the dojo since it opened, reaching personal and martial arts goals along the way — and fifteen have earned their black belt.</p>
      <p>Martial arts are about far more than physical skill. They build confidence, discipline and a sense of belonging, and many students describe the experience as life-changing, pointing to the self-esteem and resilience they have gained.</p>
    </div>
    <div class="reveal reveal-d1">
      <ol class="timeline">
        <li><strong>Early years</strong><span>Inspired by a family tradition of wrestling, Azeem discovers martial arts as a child and takes up kickboxing as a teenager at the Gold Steel Gym in Walthamstow.</span></li>
        <li><strong>1994</strong><span>Azeem begins his formal Karate path as a founding member of an East London dojo.</span></li>
        <li><strong>1999</strong><span>Launches ZenKarate, one of the first online Karate magazines.</span></li>
        <li><strong>1999</strong><span>Begins studying Tai Chi Chuan with Master John Ding.</span></li>
        <li><strong>2003</strong><span>Graduates from the British School of Shiatsu-Dô and founds the EmptyHands clinic.</span></li>
        <li><strong>2006</strong><span>EmptyHands Dojo opens its doors in Ilford.</span></li>
        <li><strong>2011</strong><span>First Yudansha (black belt) awarded.</span></li>
        <li><strong>2013</strong><span>MA in Coaching (Oxford Brookes) — the first Karate Coaching Model.</span></li>
        <li><strong>2020</strong><span>The Virtual Dojo keeps students training together through lockdown.</span></li>
        <li><strong>Today</strong><span>Karate, Tai Chi, Yoga, Shiatsu &amp; Coaching across Ilford and Epping (invite only).</span></li>
      </ol>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">What’s on offer</span><h2>More than self-defence</h2></div></div>
    <div class="grid-3">
      <div class="panel reveal"><h3>Tailored coaching sessions</h3><p>Workshops and seminars built around each student’s needs: Karate for self-defence, discipline and personal growth; the popular Self-Defence Scenarios workshops; and Coaching for Mental Health sessions exploring the psychological side of martial arts.</p></div>
      <div class="panel reveal reveal-d1"><h3>Holistic wellbeing</h3><p>Shiatsu (acupressure) self-care sessions use ancient healing techniques to relieve stress and aid relaxation, while Tai Chi Chuan builds flexibility, balance and mindfulness at any age or fitness level.</p></div>
      <div class="panel reveal reveal-d2"><h3>Rehabilitation &amp; self-development</h3><p>Whether recovering from injury or looking for personal growth, every programme is tailored to the individual. Get in touch in confidence — there’s always someone here to listen and guide.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="figure-stack reveal">
      %(img1)s
      %(img2)s
    </div>
    <div class="reveal reveal-d1">
      <span class="eyebrow">Community</span>
      <h2>The friendships matter as much as the techniques</h2>
      <p>Community sits at the heart of EmptyHands. Students regularly take part in local events, demonstrations and charity initiatives — including the annual Charity Cup — making friends and giving back.</p>
      <p>Research shows that martial arts training can improve both physical and mental health — see this <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4658763/" target="_blank" rel="noopener">study on martial arts and mental well-being</a>.</p>
      <p>Complete beginner or experienced practitioner, everyone finds a welcoming place to learn and grow. The community is wonderfully diverse, and every individual’s journey is celebrated.</p>
      <div class="btn-row" style="margin-top:26px"><a class="btn" href="contact.html">Get in touch</a><a class="btn btn--ghost" href="testimonials.html">Read testimonials</a></div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">Values</span><h2>In a word</h2></div></div>
    %(words)s
  </div>
</section>
%(cta)s''' % {
        'img1': img('image-1.webp', 'Students gathered in the dojo hall', 'main'),
        'img2': img('image-1-1.webp', 'Students at a workshop seated on mats', 'inset'),
        'words': words([('learn', 'le.arn', 'to gain or acquire knowledge or skill'), ('inspire', 'in.spire', 'to fill with an animating, quickening, or exalting influence'),
                        ('grow', 'gr.ow', 'to become better or advanced'), ('empower', 'em.pow.er', 'to give ability, freedom — to enable or permit'),
                        ('develop', 'de.vel.op', 'to grow or transform into a new state')]),
        'cta': cta_band(),
    }
    page('about.html', 'About us', 'Founded in 2006 by Azeem Mushtaq Sensei, EmptyHands provides a safe, inclusive space to learn Martial Arts, Healing and Bodywork in Ilford and Epping (invite only).', body, 'about', over_hero=True)


def build_instructors():
    instructors = [
        ('Azeem Mushtaq', 'Sensei — GoDan', 'amushtaqsensei.webp', ['GoDan', 'MA', 'BA (Hons)', 'Dip Shiatsu-Do (FWSS)'], '''
<p class="lead">Azeem founded EmptyHands in March 2006 to create a Dojo grounded in the principles of Bushidō — discipline, respect and purpose — while embracing thoughtful, modern interpretation. This vision grew naturally from his lifelong journey through the martial, healing and coaching arts.</p>
<p>Inspired by a family tradition of wrestling, Azeem’s passion began in childhood and expanded in his teens through kickboxing at the Gold Steel Gym in Walthamstow. His formal Karate path started in 1994 as a founding member of an East London Dojo. He trained widely across local Dojos and travelled to learn from multiple Sensei, deepening his Shotokan practice and exploring Tai Chi Chuan and Shiatsu. He also launched the first online Karate magazine (ZenKarate), sharing knowledge with a growing community. Years of dedication led him to earn the title Sensei, guided by masters including Hirokazu Kanazawa Sōke, Chris Rowen Shihan, Yoshinobu Ohta Sensei and Nobuaki Kanazawa Kanchō.</p>
<p>In 1999 Azeem began studying internal arts with Master John Ding at the International Academy of Tai Chi Chuan, training until 2005 and returning in 2014. He graduated from the British School of Shiatsu-Do in 2003 and continues client work and research in Epping (invite only). His Shiatsu development was supported by the late Rex Lassalle (Shiatsu Master), whose guidance helped shape Azeem’s integrated approach.</p>
<p>Azeem holds an M.A. in Coaching (Oxford Brookes, 2013), where he developed the first Karate Coaching Model, and he actively promotes coaching in Martial Arts through talks and publications. He also serves as a board member of the Shiatsu Society, helping raise awareness of Shiatsu and wellbeing.</p>
<p>Alongside teaching, Azeem has 30+ years’ experience in Business Architecture and IT Transformation as a Senior Business Consultant (Bespoke Vista Ltd), working with major organisations and maintaining current safeguarding checks.</p>
<p>EmptyHands brings this journey together — Karate-Do, Tai Chi Chuan, Shiatsu, Yoga and Coaching — to inspire disciplined practice, personal insight and real-world transformation.</p>'''),
        ('Irm Mushtaq', 'Sensei — SanDan', 'irmensoform-225x300-1.webp', ['SanDan', 'MA', 'BA (Hons)', 'Yoga Teacher'], '''
<p class="lead">Irm began training in 2006, the year EmptyHands opened its doors, and has been a tireless ambassador for Karate and the philosophy of the dojo ever since.</p>
<p>Alongside coaching and mentoring beginners, Irm plays a central role in running EmptyHands. She is a Senior Instructor and the founder and teacher of EmptyHands Yoga.</p>
<p>With a background in investment banking and aviation, Irm has more recently worked with a performance coaching company, advising on wellbeing-focused user journeys.</p>'''),
    ]
    profiles = ''.join('''<article class="profile reveal" id="%s">
  %s
  <div><span class="rank">%s</span><h2>%s</h2><ul class="quals">%s</ul>%s</div>
</article>''' % (n.split()[0].lower(), img(im, n), rank, n, ''.join('<li>%s</li>' % q for q in quals), bio) for n, rank, im, quals, bio in instructors)

    mentors = [
        ('Leila Mushtaq', 'Senpai — ShoDan', 'leila2-edited.webp', 'Leila began Karate-Dō at the age of three, and it has been part of her life ever since, shaping her passion for the performing arts. A student at Sylvia Young Theatre School, where she has found her love of drama and dance, she often sees parallels between the stage and the dojo. Her journey has taken her from a weekly fun class to leading sessions, both online and in the dojo. Training has helped her grow into a confident individual — an asset to the dojo who will one day make a fine instructor.'),
        ('Dhillon Baines', 'Senpai — ShoDan', 'dhillon.webp', 'Dhillon has practised Karate-Dō since the age of four and is deeply committed to EmptyHands. He trains every week without fail, always accompanied by his dad, Bobby, who takes a keen interest in his progress. Training with others online and in the dojo — and living by the Dojo Kun — has helped Dhillon develop strong interpersonal skills. He is an outstanding karateka with excellent technique.'),
    ]
    mentor_cards = ''.join(person_card(n, r, '', im, a) for n, r, im, a in mentors)

    body = page_hero('The people behind the dojo', 'Instructors &amp; mentors',
                     'The Sensei and senpai who will guide you from your very first bow.', '先生', None, 'Instructors') + '''
<section class="section"><div class="wrap">%s</div></section>
<section class="section section--alt" id="mentors">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">先輩 · Senpai</span><h2>Mentors</h2></div>
    <p class="lead">Senior students who lead warm-ups, support beginners and are training to become tomorrow’s instructors.</p></div>
    <div class="people">%s</div>
  </div>
</section>
%s
%s''' % (profiles, mentor_cards, MODAL, cta_band())
    page('instructors.html', 'Instructors & mentors', 'Meet Azeem Mushtaq Sensei (GoDan, MA), Irm Mushtaq Sensei (SanDan) and the senior students who teach and mentor at EmptyHands.', body, 'instructors')


MODAL = '''<dialog class="modal" id="person-modal" aria-label="Profile">
  <div class="modal-inner"><img src="" alt=""><div class="body"><span class="rank" style="font:700 .74rem/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--seal)"></span><h2 style="margin-top:.5em"></h2><p class="date muted"></p><p class="about"></p></div></div>
  <button class="modal-close" aria-label="Close">×</button>
</dialog>'''


def person_card(name, rank, when, image, about, dan=None):
    data = json.dumps({'name': name, 'rank': rank, 'date': when, 'img': '{{p}}assets/img/' + image, 'about': about})
    belt = '<span class="belt" data-dan="%s"></span>' % ({'1': '初段', '2': '弐段', '3': '参段', '5': '五段'}.get(dan, '')) if dan else ''
    return '''<button class="person reveal" data-person="%s" aria-haspopup="dialog">%s%s<div class="body"><span class="rank">%s</span><h3>%s</h3>%s</div></button>''' % (
        e(data), belt, img(image, name), e(rank), e(name), '<span class="date">%s</span>' % e(when) if when else '<span class="date">Read profile →</span>')


def build_yudansha():
    cards = ''.join(person_card(n, r, d, im, a, dan) for n, r, d, im, a, dan in YUDANSHA)
    body = page_hero('有段者 · Yudansha', 'The black belt wall',
                     'Every student who has earned a black belt at EmptyHands — each one a story of years of patience, effort and loyalty.', '有段者', None, 'Yudansha wall') + '''
<section class="section">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">Shodan and above</span><h2>Fifteen black belts since 2006</h2></div>
    <p class="lead">Select a name to read their story.</p></div>
    <div class="people">%s</div>
  </div>
</section>
<section class="section section--dark">
  <div class="wrap split">
    <div class="reveal">
      <span class="eyebrow">The black belt programme</span>
      <h2>Your name could be next</h2>
      <p class="lead">Advanced students join the black belt programme, training more often — and privately with the Sensei — on the path to Shodan.</p>
      <p>Gradings follow the published syllabus from 10th Kyu to Shodan. Download it here, or get in touch to talk about the next step in your journey.</p>
    </div>
    <div class="reveal reveal-d1">%s</div>
  </div>
</section>
%s
%s''' % (cards, downloads(), MODAL, cta_band())
    page('yudansha.html', 'Yudansha wall', 'The EmptyHands Yudansha wall: the students who have achieved the rank of black belt since the dojo opened in 2006.', body, 'yudansha')


def build_testimonials():
    quotes = ''.join(quote_html(*t) for t in TESTIMONIALS)
    body = page_hero('Testimonials', 'In their own words',
                     'Parents, students, fellow therapists and the masters who trained Azeem Sensei.', '声', None, 'Testimonials') + '''
<section class="section"><div class="wrap"><div class="quote-grid">%s</div></div></section>
<section class="section section--alt"><div class="wrap center narrow reveal">
  <span class="eyebrow">Share your experience</span>
  <h2>Trained at EmptyHands? Share your experience</h2>
  <p class="lead">A Google review or a quick message makes a real difference — every word helps another family find the dojo.</p>
  <div class="btn-row" style="justify-content:center;margin-top:24px"><a class="btn" href="https://www.google.com/search?q=Emptyhands+Karate+School+Ilford" target="_blank" rel="noopener">Review us on Google</a><a class="btn btn--ghost" href="contact.html">Contact us</a></div>
</div></section>
%s''' % (quotes, cta_band())
    page('testimonials.html', 'Testimonials', 'What parents, students and martial arts masters say about EmptyHands Karate School and Azeem Mushtaq Sensei.', body, 'testimonials')


def build_fees():
    def price(label, amount, per='', note='', featured=False):
        return '<div class="price%s"><span class="label">%s</span><span class="amount">%s%s</span>%s</div>' % (
            ' featured' if featured else '', label, amount, ' <small>%s</small>' % per if per else '', '<span class="muted">%s</span>' % note if note else '')

    panels = [
        ('karate', '空手', 'Karate', [
            price('Annual membership', '£40', '/ year', 'Covers Dojo licence and insurance — a regulatory requirement'),
            price('New starters', '£10', '/ lesson', 'Pay-as-you-go for your first few weeks', True),
            price('Beginner', '£30', '/ month', 'White to Orange belt'),
            price('Intermediate', '£35', '/ month', 'Yellow to Green belt'),
            price('Advanced', '£40', '/ month', 'Purple to Brown belt'),
            price('Advanced (extended)', '£50', '/ month', 'Purple to Brown belt, 6:30pm – 9pm'),
            price('Advanced II', 'On application', '', 'Black belt programme — trains more regularly and privately with the Sensei'),
            price('Black belt (Yudansha)', 'On application', '', 'Trains more regularly and privately with the Sensei'),
        ], 'A <strong>10% discount</strong> applies to families with three or more students, and to students on the Black Belt or Apprenticeship programme. Missed classes cannot be carried forward.'),
        ('yoga', 'ヨガ', 'Yoga', [price('Drop-in', '£10', '/ class'), price('Monthly', '£30', '/ month', '', True)], 'Classes cannot be carried forward.'),
        ('tai-chi', '太極', 'Tai Chi', [price('Drop-in', '£10', '/ class'), price('Monthly', '£30', '/ month', '', True)], 'Classes cannot be carried forward. Advance booking required.'),
        ('shiatsu', '指圧', 'Shiatsu', [price('Consultation', 'Free', '', '15 minutes', True), price('Treatment', '£100', '/ treatment')], 'Book your free consultation by phone, WhatsApp or email.'),
        ('coaching', '指導', 'Coaching', [price('Consultation', 'Free', '', '15 minutes, in person or on Teams', True), price('Coaching', '£25', '/ hour')], 'Book your free consultation by phone, WhatsApp or email.'),
        ('grading', '昇級', 'Grading', [price('Beginner', '£25'), price('Intermediate', '£30'), price('Advanced', '£35'), price('Advanced II', '£45'), price('Black belt', 'On application', '', '', True)], 'Gradings are held throughout the year — see the dojo calendar for dates.'),
    ]
    tabs = ''.join('<button role="tab" id="%s-tab" aria-controls="%s" aria-selected="%s" tabindex="%d"><span class="k">%s</span>%s</button>'
                   % (s, s, 'true' if i == 0 else 'false', 0 if i == 0 else -1, k, n) for i, (s, k, n, _, _) in enumerate(panels))
    bodies = ''.join('<div class="fee-panel" role="tabpanel" id="%s" aria-labelledby="%s-tab"%s><div class="price-list">%s</div><p class="note">%s</p></div>'
                     % (s, s, '' if i == 0 else ' hidden', ''.join(items), note) for i, (s, _, _, items, note) in enumerate(panels))
    body = page_hero('Fees', 'Simple, annualised fees',
                     'Fees are calculated from the total number of lessons taught across the year, so the monthly cost stays the same.', '月謝', None, 'Fees') + '''
<section class="section">
  <div class="wrap">
    <div class="fee-tabs reveal" role="tablist" aria-label="Fees by discipline">%s</div>
    <div class="reveal">%s</div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap split">
    <div class="reveal"><span class="eyebrow">Getting started</span><h2>Not sure where to begin?</h2>
    <p class="lead">Try a few Karate classes on pay-as-you-go before committing, and get help choosing the right programme.</p>
    <div class="btn-row" style="margin-top:24px"><a class="btn btn--seal" href="join.html">Book a trial</a><a class="btn btn--ghost" href="%s">%s Ask on WhatsApp</a></div></div>
    <div class="reveal reveal-d1">%s</div>
  </div>
</section>''' % (tabs, bodies, WHATSAPP, ICON['whatsapp'], downloads())
    page('fees.html', 'Fees', 'EmptyHands fees for Karate, Yoga, Tai Chi, Shiatsu, Coaching and gradings. New Karate starters pay £10 per lesson for their first few weeks.', body, 'fees')


STUDENT_APP = 'https://rauf-mushtaq.github.io/emptyhands.student/'


def build_app():
    features = [
        ('暦', 'Your dojo calendar', 'Training dates, days off, gradings and black-belt classes, with a countdown to your next class.'),
        ('便', 'Messages from Sensei', 'Notices, the group chat, your training journal and private messages to Sensei.'),
        ('宿', 'Homework', 'See what Sensei has set and tick it off when it’s done.'),
        ('£', 'Pay your fees', 'Pay per lesson or per month by card or PayPal, and see what you’ve paid.'),
    ]
    feats = ''.join('<div class="app-feature reveal"><span class="k" aria-hidden="true">%s</span><h3>%s</h3><p>%s</p></div>' % f for f in features)
    body = page_hero('Student app', 'EmptyHands in your pocket',
                     'The EmptyHands Student app puts your calendar, Sensei’s notices, homework and fees on your phone — free for every student.', '生徒', None, 'Our app') + '''
<section class="section">
  <div class="wrap split app-get">
    <div class="reveal">
      <span class="eyebrow">Get the app</span>
      <h2>One tap to add it to your home screen</h2>
      <p class="lead">Tap the button on your phone or tablet. On Android it installs straight away; on iPhone and iPad, a quick guide shows the two taps needed.</p>
      <div class="btn-row" style="margin-top:24px"><a class="btn btn--seal btn--lg" href="%(app)s?install=1">Get the app</a></div>
      <p class="muted" style="margin-top:14px">New students create an account in the app, then Sensei accepts the request.</p>
    </div>
    <div class="app-icon reveal reveal-d1"><img src="{{p}}assets/img/home-icon-512.png" alt="The EmptyHands Student app icon" width="512" height="512" loading="lazy"><span>EmptyHands Student</span></div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">What’s inside</span><h2>Everything for your training</h2></div></div>
    <div class="app-features">%(feats)s</div>
  </div>
</section>
''' % {'app': STUDENT_APP, 'feats': feats}
    page('our-app.html', 'Student app', 'The EmptyHands Student app: dojo calendar, notices from Sensei, homework and fees on your phone. Add it to your home screen in one tap.', body, 'our-app')


def build_contact():
    body = page_hero('Contact', 'Come and say hello',
                     'Questions about classes, therapies or a child’s first lesson? Get in touch any time.', '連絡', None, 'Contact') + '''
<section class="section">
  <div class="wrap">
    <div class="contact-cards">
      <a class="contact-card reveal" href="%(tel)s"><span class="ic">%(iphone)s</span><span><strong>Call</strong><span>%(phone)s</span></span></a>
      <a class="contact-card reveal reveal-d1" href="%(wa)s" target="_blank" rel="noopener"><span class="ic">%(iwa)s</span><span><strong>WhatsApp</strong><span>Message us any time</span></span></a>
      <a class="contact-card reveal reveal-d2" href="mailto:%(email)s"><span class="ic">%(imail)s</span><span><strong>Email</strong><span>%(email)s</span></span></a>
    </div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">Locations</span><h2>Where to train</h2></div></div>
    %(locations)s
  </div>
</section>
<section class="section">
  <div class="wrap split split--wide-left" style="align-items:start">
    <div class="panel reveal">
      <span class="eyebrow">Send a message</span>
      <h2>How can we help?</h2>
      <form class="form" data-mailto="%(email)s" data-subject="Website enquiry">
        <div class="field"><label for="c-name">Name</label><input id="c-name" name="Name" autocomplete="name" required></div>
        <div class="field"><label for="c-email">Email</label><input id="c-email" name="Email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="Phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="c-topic">About</label><select id="c-topic" name="Topic"><option>Karate</option><option>Yoga</option><option>Tai Chi</option><option>Shiatsu</option><option>Coaching</option><option>Something else</option></select></div>
        <div class="field full"><label for="c-msg">Message</label><textarea id="c-msg" name="Message" required></textarea></div>
        <div class="full btn-row"><button class="btn btn--seal" type="submit" value="email">Send by email</button><button class="btn btn--ghost" type="submit" value="whatsapp">%(iwa)s Send via WhatsApp</button></div>
        <p class="form-note full">Your message opens in your email app or WhatsApp, ready to send — nothing is stored on this website.</p>
        <div class="form-status" role="status">Thanks — your message is ready to send in your email app or WhatsApp.</div>
      </form>
    </div>
    <aside class="aside-card reveal reveal-d1">
      <h3>Follow the dojo</h3>
      <p style="color:rgba(246,242,234,.75)">Training clips, gradings and dojo news.</p>
      <div class="socials">%(social)s</div>
      <h3 style="margin-top:34px">Useful downloads</h3>
      <ul style="padding-left:1.1em;color:rgba(246,242,234,.8)">
        <li><a href="%(syl)s" target="_blank" rel="noopener">Karate syllabus (PDF)</a></li>
        <li><a href="%(cal)s" target="_blank" rel="noopener">Dojo calendar 2026 (PDF)</a></li>
      </ul>
    </aside>
  </div>
</section>''' % {
        'tel': PHONE_HREF, 'phone': PHONE, 'wa': WHATSAPP, 'email': EMAIL, 'iphone': ICON['phone'], 'iwa': ICON['whatsapp'], 'imail': ICON['mail'],
        'locations': locations(), 'syl': DOCS['syllabus'], 'cal': DOCS['calendar'],
        'social': ''.join('<a href="%s" target="_blank" rel="noopener" aria-label="%s">%s</a>' % (u, n.title(), ICON[n]) for n, u in SOCIAL.items()),
    }
    page('contact.html', 'Contact', 'Contact EmptyHands Karate School: +44 7931 300470, info@emptyhands.co.uk. Dojos at St Andrew’s Church Hall, Ilford IG1 3PE and Jack Silley Pavilion, Epping (invite only).', body, 'contact')


def build_join():
    checks = ''.join('<label><input type="checkbox" name="Interested in" value="%s"%s><span>%s</span></label>' % (t, ' checked' if s == 'karate' else '', t) for s, _, t, _ in CLASSES)
    body = page_hero('Join', 'Book your trial class',
                     'Share a few details about yourself or your child, and you’ll hear back soon to arrange a first session.', '入門', None, 'Join') + '''
<section class="section">
  <div class="wrap split split--wide-left" style="align-items:start">
    <div class="panel reveal">
      <form class="form" data-mailto="%(email)s" data-subject="Class registration">
        <div class="field full"><fieldset><legend>I’m interested in</legend><div class="choices">%(checks)s</div></fieldset></div>
        <div class="field"><label for="j-name">Student’s full name</label><input id="j-name" name="Student name" required></div>
        <div class="field"><label for="j-age">Student’s age</label><input id="j-age" name="Age" type="number" min="3" max="99" inputmode="numeric" required></div>
        <div class="field"><label for="j-parent">Parent / guardian (if under 18)</label><input id="j-parent" name="Parent or guardian" autocomplete="name"></div>
        <div class="field"><label for="j-dojo">Preferred dojo</label><select id="j-dojo" name="Preferred dojo"><option>Ilford</option><option>Epping (invite only)</option><option>Either</option><option>Online / Teams</option></select></div>
        <div class="field"><label for="j-email">Email</label><input id="j-email" name="Email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="j-phone">Phone</label><input id="j-phone" name="Phone" type="tel" autocomplete="tel" required></div>
        <div class="field full"><label for="j-exp">Previous martial arts or yoga experience</label><input id="j-exp" name="Experience" placeholder="e.g. none, or 2 years of judo"></div>
        <div class="field full"><label for="j-med">Medical conditions or injuries we should know about</label><textarea id="j-med" name="Medical notes" style="min-height:90px"></textarea></div>
        <div class="field full"><label class="check"><input type="checkbox" name="Accepted terms" value="Yes" required> I understand that an annual membership of £40 covers Dojo licence and insurance, and that classes cannot be carried forward.</label></div>
        <div class="full btn-row"><button class="btn btn--seal" type="submit" value="email">Send registration</button><button class="btn btn--ghost" type="submit" value="whatsapp">%(iwa)s Send via WhatsApp</button></div>
        <p class="form-note full">Your registration opens in your email app or WhatsApp, ready to send — nothing is stored on this website.</p>
        <div class="form-status" role="status">Thanks — your registration is ready to send. We’ll reply to confirm your first class.</div>
      </form>
    </div>
    <aside class="aside-card reveal reveal-d1">
      <h3>What happens next</h3>
      <ol>
        <li>We’ll call or message you to answer any questions and confirm a date.</li>
        <li>Come to your first class in comfortable clothes — no gi needed yet.</li>
        <li>New Karate students pay <strong>£10 per lesson</strong> for their first few weeks.</li>
        <li>When you’re ready, join as a member and start your journey to black belt.</li>
      </ol>
      <p style="margin-top:24px;color:rgba(246,242,234,.75)">Prefer to talk? Call <a href="%(tel)s">%(phone)s</a> or <a href="%(wa)s" target="_blank" rel="noopener">WhatsApp us</a>.</p>
      <p style="color:rgba(246,242,234,.75)"><a href="fees.html">See all fees →</a></p>
    </aside>
  </div>
</section>''' % {'email': EMAIL, 'checks': checks, 'iwa': ICON['whatsapp'], 'tel': PHONE_HREF, 'phone': PHONE, 'wa': WHATSAPP}
    page('join.html', 'Join — book a trial class', 'Register for a trial Karate, Yoga, Tai Chi, Shiatsu or Coaching session at EmptyHands in Ilford or Epping (invite only).', body, 'join')


GALLERY = [
    ('homekarate.webp', 'Students training at EmptyHands'), ('azeem-mushtaq-sensei.webp', 'Sensei Azeem leading the class'),
    ('eh-students-q.webp', 'Students practising in pairs'), ('shotokan-tigers.webp', 'EmptyHands students outdoors'),
    ('leila2-edited.webp', 'Leila in a low stance'), ('image-1.webp', 'Students in the dojo hall'),
    ('reet.webp', 'Reet performing a high kick'), ('taichi-school.webp', 'Tai Chi practice'),
    ('image-1-1.webp', 'A workshop on the mats'),
    ('adwaitha.webp', 'Adwaitha in a fighting stance'),
    ('dhillon.webp', 'Dhillon in a stance'), ('leila.webp', 'Leila training'),
    ('amushtaqsensei.webp', 'Azeem Sensei teaching a seminar'), ('azeem-mushtaq.webp', 'Azeem Sensei'),
    ('rex-lassalle.webp', 'Rex Lassalle, Shiatsu Master'), ('yoga-studio.webp', 'Yoga practice'),
    ('karate-syllabus.webp', 'Dojo Kun calligraphy'), ('jo-kabudo.webp', 'Kobudō with the jo'),
    ('wuchi.webp', 'Wu Chi'), ('budoart.webp', 'Budō ink art'),
    ('ehteams.webp', 'The EmptyHands virtual dojo on Teams'), ('shotokan-tiger.webp', 'The Shotokan tiger'),
    ('bodhidharma.webp', 'Bodhidharma'), ('zazen.webp', 'Zazen'),
    ('coaching.webp', 'Butterfly at sunset'), ('coaching-1.webp', 'Butterfly in the grass'),
]


def build_gallery():
    items = ''.join('<button aria-label="Open photo: %s">%s</button>' % (e(a), img(f, a)) for f, a in GALLERY)
    body = page_hero('写真 · Gallery', 'Life in the dojo',
                     'Training nights, gradings, workshops and the art that inspires us.', '写真', None, 'Gallery') + '''
<section class="section">
  <div class="wrap">
    <div class="gallery">%s</div>
  </div>
</section>
<section class="section section--dark">
  <div class="wrap">
    <div class="section-head reveal"><div><span class="eyebrow">Film</span><h2>The EmptyHands dojo film</h2></div>
    <a class="link-arrow" href="%s" target="_blank" rel="noopener">More on YouTube</a></div>
    <div class="film reveal">
      <video preload="metadata" playsinline poster="assets/img/dojo-film-poster.jpg"><source src="assets/video/dojo-film.mp4" type="video/mp4"></video>
      <button class="film-play" aria-label="Play the EmptyHands dojo film"><span>%s</span></button>
      <div class="film-meta">EmptyHands Karate School<strong>Trailers 1 &amp; 2 mixed · with music · 2 min 25</strong></div>
    </div>
  </div>
</section>
<div class="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
  <img src="" alt=""><button class="lb-close" aria-label="Close">×</button><button class="lb-prev" aria-label="Previous photo">←</button><button class="lb-next" aria-label="Next photo">→</button><div class="lb-count"></div>
</div>
%s''' % (items, SOCIAL['youtube'], ICON['play'], cta_band())
    page('gallery.html', 'Gallery', 'Photos and film from EmptyHands Karate School — training, gradings, workshops and the art that inspires us.', body, 'gallery')


def build_blog():
    cats = ['All'] + sorted({p['category'] for p in POSTS})
    filters = ''.join('<button data-cat="%s" aria-pressed="%s">%s</button>' % (c, 'true' if c == 'All' else 'false', c) for c in cats)
    cards = post_card(POSTS[0], feature=True) + ''.join(post_card(p) for p in POSTS[1:])
    body = page_hero('Journal', 'Notes from the dojo',
                     'Essays on Karate, Budō, healing and wellbeing — and news from the EmptyHands community.', '日誌', None, 'Journal') + '''
<section class="section">
  <div class="wrap">
    <div class="filters reveal">%s<input type="search" placeholder="Search articles…" aria-label="Search articles"></div>
    <div class="posts">%s</div>
    <p class="no-results lead center" hidden>No articles match that search.</p>
  </div>
</section>
%s''' % (filters, cards, cta_band())
    page('blog/index.html', 'Journal', 'Articles from EmptyHands on Karate, Budō culture, Tai Chi, Shiatsu, Yoga, wellbeing and life in the dojo.', body, 'blog')

    for i, p in enumerate(POSTS):
        d = date.fromisoformat(p['date']).strftime('%-d %B %Y')
        cover = ''
        if p['cover']:
            c = p['cover']
            contain = ' contain' if c['file'].startswith(('yinyang', 'shotokan-tiger.', '5-element', 'kidney', 'image-1024', 'image.webp', 'karate-syllabus', 'budoart')) else ''
            cover = '<div class="article-cover%s">%s</div>' % (contain, '<img src="../assets/img/%s" alt="" width="%d" height="%d" fetchpriority="high">' % (c['file'], c['w'], c['h']))
        related = [q for q in POSTS if q['category'] == p['category'] and q['slug'] != p['slug']][:3]
        nxt = POSTS[(i + 1) % len(POSTS)]
        share_url = 'https://emptyhands.co.uk/blog/%s.html' % p['slug']
        body = '''
<article>
  <header class="article-hero">
    <div class="wrap narrow">
      <div class="crumbs"><a href="../index.html">Home</a> / <a href="index.html">Journal</a></div>
      <div class="article-meta"><span class="cat">%(cat)s</span><span>%(date)s</span><span>%(min)d min read</span></div>
      <h1 style="margin-top:.4em">%(title)s</h1>
      <p class="muted" style="margin:0">By Azeem Mushtaq Sensei &amp; the EmptyHands team</p>
    </div>
  </header>
  %(cover)s
  <div class="section" style="padding-top:clamp(40px,6vw,70px)">
    <div class="wrap">
      <div class="prose">%(html)s</div>
      <div class="prose"><div class="article-foot">
        <div class="share"><span class="muted" style="margin-right:6px">Share</span>
          <a href="https://www.facebook.com/sharer/sharer.php?u=%(url)s" target="_blank" rel="noopener" aria-label="Share on Facebook">%(fb)s</a>
          <a href="https://wa.me/?text=%(title_q)s%%20%(url)s" target="_blank" rel="noopener" aria-label="Share on WhatsApp">%(wa)s</a>
          <button data-copy aria-label="Copy link">%(link)s</button>
        </div>
        <a class="link-arrow" href="%(next_slug)s.html">Next: %(next_title)s</a>
      </div></div>
    </div>
  </div>
</article>
%(related)s
%(cta)s''' % {
            'cat': e(p['category']), 'date': d, 'min': p['minutes'], 'title': e(p['title']), 'cover': cover, 'html': p['html'],
            'url': share_url, 'title_q': e(p['title']).replace(' ', '%20'), 'fb': ICON['facebook'], 'wa': ICON['whatsapp'], 'link': ICON['link'],
            'next_slug': nxt['slug'], 'next_title': e(nxt['title']),
            'related': ('<section class="section section--alt"><div class="wrap"><div class="section-head reveal"><div><span class="eyebrow">Keep reading</span><h2>More on %s</h2></div><a class="link-arrow" href="index.html">All articles</a></div><div class="posts">%s</div></div></section>'
                        % (e(p['category'].lower()), ''.join(post_card(q) for q in related))) if related else '',
            'cta': cta_band(),
        }
        page('blog/%s.html' % p['slug'], p['title'], p['excerpt'], body, 'blog')


def build_404():
    body = '''<section class="page-hero" style="min-height:80vh;display:flex;align-items:center"><div class="wrap center">
<div class="kanji" style="font-size:clamp(6rem,20vw,12rem);line-height:1;color:var(--seal)">空</div>
<span class="eyebrow">Page not found</span><h1 style="margin:0 auto .4em">This page is truly empty</h1>
<p class="lead">The page you were looking for has moved or no longer exists.</p>
<div class="btn-row" style="justify-content:center"><a class="btn" href="{{p}}index.html">Back to the dojo</a><a class="btn btn--ghost" href="{{p}}blog/index.html">Read the journal</a></div>
</div></section>'''
    page('404.html', 'Page not found', 'This page could not be found.', body)


def build_sitemap():
    base = 'https://emptyhands.co.uk/'
    pages = ['index.html', 'karate.html', 'yoga.html', 'tai-chi.html', 'shiatsu.html', 'coaching.html', 'about.html', 'instructors.html',
             'yudansha.html', 'testimonials.html', 'gallery.html', 'fees.html', 'contact.html', 'join.html', 'our-app.html', 'blog/index.html']
    pages += ['blog/%s.html' % p['slug'] for p in POSTS]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s</urlset>\n' % ''.join(
        '  <url><loc>%s%s</loc></url>\n' % (base, p) for p in pages)
    open(os.path.join(OUT, 'sitemap.xml'), 'w').write(xml)
    open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n' % base)


def write_headers():
    p = os.path.join(HERE, '_headers')
    lines = open(p).read().split('\n')
    lines = ["  Content-Security-Policy: %s; frame-ancestors 'none'" % csp() if l.startswith('  Content-Security-Policy:') else l for l in lines]
    open(p, 'w').write('\n'.join(lines))


if __name__ == '__main__':
    build_home()
    build_disciplines()
    build_about()
    build_instructors()
    build_yudansha()
    build_testimonials()
    build_fees()
    build_contact()
    build_app()
    build_join()
    build_gallery()
    build_blog()
    build_404()
    build_sitemap()
    write_headers()
    print('built %d posts + pages into %s' % (len(POSTS), OUT))
