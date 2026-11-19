const { chromium } = require('playwright');
(async () => {
  const [page, out, dsf, pdf] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: +dsf })).newPage();
  await p.goto('http://localhost:' + (process.env.PORT || 8781) + '/' + page); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  console.log(JSON.stringify(await p.evaluate(() => ['.ttl', '.seal', '.legend', '.months', '.info', '.box.closed ul', '.box:nth-child(2) .kd', '.foot'].map(s => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return s + ' ' + Math.round(r.left) + ',' + Math.round(r.top) + '-' + Math.round(r.right) + ',' + Math.round(r.bottom) + ' sh' + e.scrollHeight + '/' + e.clientHeight; }))));
  await (await p.$('#card')).screenshot({ path: out });
  if (pdf) await p.pdf({ path: pdf, width: '210mm', height: '297mm', printBackground: true, pageRanges: '1' });
  await b.close();
})();
