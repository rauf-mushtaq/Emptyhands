// Builds www/ (the web content inside the phone apps) from the student app in ../app.
// Run with `npm run build`, then `npx cap sync` copies it into android/ and ios/.
import { build } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const www = new URL('www/', import.meta.url).pathname;

rmSync(www, { recursive: true, force: true });
mkdirSync(www + 'assets/img', { recursive: true });

// The student app only: no coach panel, service worker or setup files.
const skip = ['coach.html', 'js/coach.js', 'js/firebase-sdk.js', 'js/native.js', 'sw.js', 'SETUP.md', 'firestore.rules'];
cpSync(root + 'app', www + 'app', { recursive: true, filter: src => !skip.some(s => src.endsWith('/app/' + s)) });
for (const f of ['logo.png', 'favicon.png']) cpSync(root + 'assets/img/' + f, www + 'assets/img/' + f);

// The apps open www/index.html; the logo's link to ../index.html also lands here.
writeFileSync(www + 'index.html', '<!doctype html><meta charset="utf-8"><script>location.replace("app/index.html" + location.hash)</script>');

// Bundle Firebase and the Capacitor plugins so nothing is downloaded at runtime.
for (const name of ['firebase-sdk', 'native']) {
  await build({
    entryPoints: [new URL(`src/${name}.js`, import.meta.url).pathname],
    outfile: `${www}app/js/${name}.js`,
    bundle: true, format: 'esm', target: ['es2020', 'safari15'], minify: true, legalComments: 'none',
  });
}

const config = readFileSync(root + 'app/js/config.js', 'utf8');
if (/apiKey:\s*''/.test(config)) {
  console.warn('\n⚠  app/js/config.js has no Firebase config, so this build runs in DEMO MODE.\n   Don’t submit it to the stores — see mobile/README.md.\n');
}
console.log('Built', www);
