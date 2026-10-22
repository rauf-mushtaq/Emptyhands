#!/usr/bin/env bash
# Copies only the public website into dist/ for Cloudflare Pages, leaving out the
# build scripts, content sources, README and anything else that isn't the site.
# Cloudflare Pages settings: build command "bash _build/publish.sh", output directory "dist".
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir dist
for f in * .well-known; do
  case "$f" in
    _build|dist|README.md|CNAME) continue ;;
  esac
  cp -R "$f" dist/
done
cp _build/_headers dist/_headers
echo "Published $(find dist -type f | wc -l) files to dist/"
