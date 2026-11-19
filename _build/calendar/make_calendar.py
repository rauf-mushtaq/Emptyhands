"""EmptyHands dojo calendar (A4 portrait) in the site branding.

To make next year's calendar, add its dates to YEARS below (copy the last year and follow the same rules:
Thursday classes, open for the first two weeks of Ramadan then closed until Eid, closed if either Eid falls
on a Thursday, bank holidays, Easter, the late-August break and the Christmas break), then:

    cd _build/calendar
    python3 make_calendar.py 2028
    python3 -m http.server 8781 &          # fonts load over http, not file://
    node render.js calendar-2028.html preview.png 1.5 ../../assets/docs/EmptyHands-Dojo-Calendar-2028.pdf

Then add the PDF to DOCS in build.py, and the dates to js/calendar-data.js in emptyhands.student.
"""
import calendar
import datetime as dt
import sys

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def days(year, items):
    out = set()
    for it in items:
        if '..' in it:
            a, b = it.split('..')
            d, e = dt.date(year, *map(int, a.split('-'))), dt.date(year, *map(int, b.split('-')))
            while d <= e:
                out.add(d)
                d += dt.timedelta(1)
        else:
            out.add(dt.date(year, *map(int, it.split('-'))))
    return out


YEARS = {
    2027: dict(
        closed=['01-01', '01-02', '01-03', '02-25', '03-04', '03-25', '03-26', '03-29', '05-03', '05-31',
                '08-19', '08-26', '08-30', '12-16', '12-23', '12-25', '12-26', '12-27', '12-28', '12-30'],
        breaks=['01-01..01-03', '02-22..03-10', '03-25..03-29', '08-16..08-30', '12-13..12-31'],
        grading=['04-29', '08-05', '11-27'],
        blackbelt=['02-07', '04-25', '07-04', '08-01', '09-05', '10-03', '11-14'],
        first='Thu 7 Jan',
        closures=[('1 - 3 Jan', 'New Year'),
                  ('22 Feb - 10 Mar', 'Ramadan (last 2 weeks) to Eid'),
                  ('25 - 29 Mar', 'Easter'),
                  ('Mon 3 May', 'Early May bank holiday'),
                  ('Mon 31 May', 'Spring bank holiday'),
                  ('16 - 30 Aug', 'Summer break'),
                  ('From 13 Dec', 'Christmas &amp; New Year')],
        gradings='Thu 29 Apr · Thu 5 Aug · Sat 27 Nov',
        bb='7 Feb · 25 Apr · 4 Jul · 1 Aug · 5 Sep · 3 Oct · 14 Nov',
        note='Ramadan and Eid follow the moon sighting. If either Eid falls on a Thursday, the dojo is closed that night. Updates go in the EmptyHands Portal.',
    ),
    2026: dict(
        closed=['01-01', '03-12', '03-19', '04-02', '04-03', '04-06', '05-04', '05-07', '05-25', '05-28',
                '08-20', '08-27', '08-31', '12-17', '12-24', '12-25', '12-28', '12-31'],
        breaks=['03-09..03-20', '04-02..04-06', '08-17..08-31', '12-14..12-31'],
        grading=['04-30', '08-06', '11-28'],
        blackbelt=['02-08', '04-26', '07-05', '08-02', '09-06', '10-04', '11-15'],
        first='Thu 8 Jan',
        closures=[('Thu 1 Jan', 'New Year’s Day'),
                  ('9 - 20 Mar', 'Ramadan (last 2 weeks) to Eid'),
                  ('2 - 6 Apr', 'Easter'),
                  ('Mon 4 May', 'Early May bank holiday'),
                  ('Thu 7 May', 'Local elections'),
                  ('Mon 25 May', 'Spring bank holiday'),
                  ('Thu 28 May', 'Eid al-Adha'),
                  ('17 - 31 Aug', 'Summer break'),
                  ('From 14 Dec', 'Christmas &amp; New Year')],
        gradings='Thu 30 Apr · Thu 6 Aug · Sat 28 Nov',
        bb='8 Feb · 26 Apr · 5 Jul · 2 Aug · 6 Sep · 4 Oct · 15 Nov',
        note='Classes return on Thursday 7 January 2027.',
    ),
}


def month_html(year, m, st):
    cal = calendar.Calendar(0).monthdayscalendar(year, m)
    while len(cal) < 6:
        cal.append([0] * 7)
    rows = []
    classes = 0
    for week in cal:
        cells = []
        for i, d in enumerate(week):
            if not d:
                cells.append('<i></i>')
                continue
            date = dt.date(year, m, d)
            k = ''
            if date in st['closed']:
                k = 'cl'
            elif date in st['grading']:
                k = 'gr'
            elif date in st['blackbelt']:
                k = 'bb'
            elif date.weekday() == 3:
                k = 'tr'
                classes += 1
            band = ''
            if date in st['breaks']:
                prev, nxt = date - dt.timedelta(1), date + dt.timedelta(1)
                band = ' br'
                if prev not in st['breaks'] or i == 0:
                    band += ' bs'
                if nxt not in st['breaks'] or i == 6 or nxt.month != m:
                    band += ' be'
            cells.append('<b class="%s%s"><s>%d</s></b>' % (k, band, d))
        rows.append(''.join(cells))
    head = ''.join('<u%s>%s</u>' % (' class="thu"' if i == 3 else '', c) for i, c in enumerate('MTWTFSS'))
    return ('<section class="mo"><header><h3>%s</h3><span>%s</span></header><div class="wk">%s</div><div class="g">%s</div></section>'
            % (MONTHS[m - 1], '%d class%s' % (classes, '' if classes == 1 else 'es') if classes else 'No classes', head, ''.join(rows)))


ICON_GLOBE = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>'
ICON_PHONE = '<svg viewBox="0 0 24 24"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>'
ICON_MAIL = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>'

CSS = '''
@page{size:210mm 297mm;margin:0}
@font-face{font-family:"SM";src:url(fonts/shippori-mincho-700.woff2);font-weight:700}
@font-face{font-family:"SM";src:url(fonts/shippori-mincho-500.woff2);font-weight:500}
@font-face{font-family:"Karla";src:url(fonts/karla.woff2);font-weight:200 800}
@font-face{font-family:"KJ";src:url(kj2.woff2);font-weight:700}
:root{--paper:#f6f2ea;--ink:#1c1a16;--ink2:#4b463d;--bronze:#7a684a;--gold:#a48c62;--gold2:#c2a878;--seal:#a8342a;--night:#16130f;--brk:#f0dcd3}
*{box-sizing:border-box}
html,body{margin:0;background:var(--paper);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.c{position:relative;width:794px;height:1123px;overflow:hidden;font-family:Karla;color:var(--ink);
  background:radial-gradient(ellipse 700px 520px at 30% 8%,#fbf8f2 0,#f6f1e8 55%,#efe7d9 100%)}
.mtn{position:absolute;right:-40px;top:20px;width:560px;height:200px;background:url(mtn-cal.jpg) 0 0/100% 100% no-repeat;mix-blend-mode:multiply;opacity:.42;
  -webkit-mask:linear-gradient(to left,#000 55%,transparent 100%),linear-gradient(to bottom,transparent 0,#000 30%,#000 60%,transparent 100%);-webkit-mask-composite:source-in}
.logo{position:absolute;left:20px;top:6px;width:132px;height:132px;background:url(logo-cal.jpg) 0 0/100% 100%;mix-blend-mode:multiply;
  -webkit-mask:radial-gradient(circle at 50% 50%,#000 60%,transparent 71%)}
.ttl{position:absolute;left:156px;top:28px}
.ttl b{display:block;font:800 10.5px/1 Karla;letter-spacing:.28em;text-transform:uppercase;color:var(--seal)}
.ttl h1{font:700 46px/1 SM;margin:8px 0 0;letter-spacing:-.01em;white-space:nowrap}.ttl h1 em{font-style:normal;color:var(--bronze);margin-left:10px}
.ttl p{margin:8px 0 0;font:500 13.5px/1.3 Karla;color:var(--ink2)}
.seal{position:absolute;right:40px;top:22px;width:44px;height:96px;background:var(--seal);border-radius:6px;transform:rotate(-3deg);color:#fbf6ee;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:700 24px/1 KJ;box-shadow:inset 0 0 0 3px var(--seal),inset 0 0 0 4.5px rgba(251,246,238,.8)}
.rule{position:absolute;left:36px;right:36px;top:138px;border-top:2.5px solid var(--gold)}
.legend{position:absolute;left:36px;right:36px;top:149px;display:flex;justify-content:space-between;align-items:center}
.legend span{display:flex;align-items:center;gap:6px;font:700 10.5px/1 Karla;color:var(--ink)}
.legend span small{font-weight:500;color:var(--ink2);font-size:10px}
.legend i{width:15px;height:15px;border-radius:50%;display:block}
.legend .k-br{width:26px;border-radius:999px;background:var(--brk)}
.months{position:absolute;left:36px;right:36px;top:174px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px 12px}
.mo{background:rgba(255,255,255,.62);border:1px solid rgba(122,104,74,.22);border-radius:12px;padding:7px 9px 5px}
.mo header{display:flex;align-items:baseline;justify-content:space-between;margin:0 3px 2px}
.mo h3{margin:0;font:700 16px/1 SM}
.mo header span{font:700 9px/1 Karla;letter-spacing:.12em;text-transform:uppercase;color:var(--bronze)}
.wk,.g{display:grid;grid-template-columns:repeat(7,1fr)}
.wk u{text-decoration:none;text-align:center;font:800 9px/1 Karla;letter-spacing:.06em;color:var(--gold);padding:2px 0 3px}
.wk u.thu{color:var(--bronze)}
.g i,.g b{height:18px;display:flex;align-items:center;justify-content:center;position:relative;font-weight:inherit}
.g b s{text-decoration:none;position:relative;z-index:1;width:17.5px;height:17.5px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font:600 10px/1 Karla;font-variant-numeric:tabular-nums;color:var(--ink2)}
.g b:nth-child(7n+4):not(.tr):not(.gr):not(.cl):not(.bb) s{color:var(--ink)}
.g b.br:before{content:"";position:absolute;left:0;right:0;top:1px;bottom:1px;background:var(--brk)}
.g b.bs:before{left:3px;border-radius:999px 0 0 999px}
.g b.be:before{right:3px;border-radius:0 999px 999px 0}
.g b.bs.be:before{border-radius:999px}
.g b.br s{color:var(--seal)}
.tr s,.k-tr{background:var(--gold2)}
.g b.tr s{color:var(--ink);font-weight:800}
.gr s,.k-gr{background:var(--bronze)}
.g b.gr s{color:#fbf6ee;font-weight:800;box-shadow:0 0 0 1.5px #fff,0 0 0 3px var(--bronze)}
.bb s,.k-bb{background:var(--night)}
.g b.bb s{color:var(--gold2);font-weight:800}
.cl s,.k-cl{background:var(--seal)}
.g b.cl s{color:#fbf6ee;font-weight:800}
.k-gr{box-shadow:0 0 0 1.5px #fff,0 0 0 3px var(--bronze)}
.info{position:absolute;left:36px;right:36px;top:830px;display:grid;grid-template-columns:240px 200px 1fr;gap:10px}
.box{border:1.5px solid var(--gold);border-radius:12px;padding:10px 10px 9px;background:rgba(255,255,255,.62);height:212px}
.box h4{margin:0;font:700 15px/1.05 SM}
.box .where{margin:3px 0 6px;font:500 10px/1.3 Karla;color:var(--ink2)}
.box .eb{display:block;font:800 9px/1 Karla;letter-spacing:.22em;text-transform:uppercase;color:var(--seal);margin-bottom:4px}
.tt{display:grid;grid-template-columns:50px 1fr;row-gap:4px;font:500 11px/1.25 Karla}
.tt.ep{grid-template-columns:47px 1fr}.tt dt{font-weight:800;color:var(--bronze);font-variant-numeric:tabular-nums}
.tt dd{margin:0;color:var(--ink)}
.kd{margin-top:7px;padding-top:6px;border-top:1px solid rgba(122,104,74,.25);font:500 10.5px/1.35 Karla;color:var(--ink)}
.kd b{font-weight:800;color:var(--bronze);display:block;font-size:9px;letter-spacing:.16em;text-transform:uppercase;margin-top:3px}
.closed ul{list-style:none;margin:5px 0 0;padding:0;display:grid;row-gap:2px}
.closed li{display:grid;grid-template-columns:80px 1fr;gap:6px;font:500 10.5px/1.25 Karla}
.closed li b{font-weight:800;color:var(--seal);white-space:nowrap}
.moon{margin:7px 0 0;padding-top:6px;border-top:1px solid rgba(122,104,74,.25);font:500 9.5px/1.35 Karla;color:var(--ink2)}
.note{position:absolute;left:36px;right:36px;top:1043px;font:500 9.5px/1.3 Karla;color:var(--ink2);text-align:center}
.foot{position:absolute;left:0;right:0;bottom:0;height:62px;background:var(--night);display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:#f3ede2}
.foot .ct{display:flex;align-items:center;gap:16px}
.foot .ct div{display:flex;align-items:center;gap:6px;font:600 12px/1 Karla;white-space:nowrap}
.foot .ct div b{font-weight:800}
.foot svg{width:17px;height:17px;stroke:var(--gold2);fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.qr{display:flex;align-items:center;gap:6px;background:#fff;border-radius:7px;padding:3px 7px 3px 3px}
.qr img{width:50px;height:50px;display:block}
.qr span{font:800 8px/1.25 Karla;letter-spacing:.05em;color:var(--ink);text-transform:uppercase;width:70px}
.qrs{display:flex;gap:10px}
'''


def build(year):
    y = YEARS[year]
    st = {k: days(year, y[k]) for k in ('closed', 'breaks', 'grading', 'blackbelt')}
    months = ''.join(month_html(year, m, st) for m in range(1, 13))
    nb = lambda t: ' · '.join(x.replace(' ', '&nbsp;') for x in t.split(' · '))
    closures = ''.join('<li><b>%s</b><span>%s</span></li>' % c for c in y['closures'])
    html = f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>EmptyHands dojo calendar {year}</title><style>{CSS}</style></head><body><div class="c" id="card">
<div class="mtn"></div>
<div class="logo" role="img" aria-label="EmptyHands School logo"></div>
<div class="ttl"><b>EmptyHands Karate School · Since 2006</b><h1>Dojo calendar<em>{year}</em></h1><p>Classes, gradings, black-belt days and closures</p></div>
<div class="seal"><span>道</span><span>場</span><span>暦</span></div>
<div class="rule"></div>
<div class="legend">
  <span><i class="k-tr"></i>Ilford class <small>(Thursday)</small></span>
  <span><i class="k-gr"></i>Grading</span>
  <span><i class="k-bb"></i>Black belt <small>(Epping, invite only)</small></span>
  <span><i class="k-cl"></i>Dojo closed</span>
  <span><i class="k-br"></i>Holiday break</span>
</div>
<div class="months">{months}</div>
<div class="info">
  <div class="box"><span class="eb">Every Thursday</span><h4>Ilford dojo</h4><div class="where">St Andrew’s Church Hall, The Drive, IG1 3PE</div>
    <dl class="tt"><dt>6 - 7pm</dt><dd>Tai Chi Chuan</dd><dt>7 - 8pm</dt><dd>Beginner/intermediate Karate</dd><dt>8 - 9pm</dt><dd>Advanced Karate</dd><dt>8 - 9pm</dt><dd>Yoga</dd></dl>
    <div class="kd"><b>First class of the year</b>{y['first']}<b>By appointment</b>Shiatsu &amp; coaching</div></div>
  <div class="box"><span class="eb">Invite only</span><h4>Epping dojo</h4><div class="where">Jack Silley Pavilion, Epping CM16 6SS</div>
    <dl class="tt ep"><dt>Tuesday</dt><dd>Black belt, 6:30 - 8:30pm</dd><dt>Sunday</dt><dd>Workshops, 12:30 - 4pm</dd></dl>
    <div class="kd"><b>Gradings</b>{nb(y['gradings'])}<b>Black belt Sundays</b>{nb(y['bb'])}</div></div>
  <div class="box closed"><span class="eb">No classes</span><h4>Dojo closed</h4><ul>{closures}</ul><p class="moon">{y['note']}</p></div>
</div>
<div class="foot">
  <div class="qr"><img src="qr-site.svg" alt=""><span>Website, times &amp; booking</span></div>
  <div class="ct"><div>{ICON_GLOBE}<b>emptyhands.co.uk</b></div><div>{ICON_PHONE}07931 300470</div><div>{ICON_MAIL}info@emptyhands.co.uk</div></div>
  <div class="qr"><img src="qr-app.svg" alt=""><span>Live calendar in the EmptyHands Portal</span></div>
</div>
</div></body></html>'''
    open('calendar-%d.html' % year, 'w').write(html)
    tr = sum(1 for m in range(1, 13) for w in calendar.Calendar(0).monthdatescalendar(year, m) for d in w
             if d.month == m and d.weekday() == 3 and d not in st['closed'] and d not in st['grading'])
    print(year, 'training Thursdays:', tr)


if __name__ == '__main__':
    for yr in map(int, sys.argv[1:] or ['2027']):
        build(yr)
