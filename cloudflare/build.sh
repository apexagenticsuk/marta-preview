#!/usr/bin/env bash
# Builds the Cloudflare Pages deploy copy: site files only + Function + Cloudflare editor. Usage: cloudflare/build.sh <outdir>
# The repo itself (and the GitHub Pages copy) is never changed. No secrets or settings are written here.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:?outdir}"
rm -rf "$OUT"; mkdir -p "$OUT"
tar --exclude=.git --exclude=node_modules --exclude=tests --exclude=docs --exclude=tools --exclude=cloudflare --exclude=package.json --exclude=package-lock.json --exclude='*.md' --exclude=.gitignore --exclude=.nojekyll --exclude=README.md -cf - . | tar -xf - -C "$OUT"
# Each copy points at itself: the repo (GitHub Pages) keeps https://apexagenticsuk.github.io/marta-preview/ ; this Cloudflare copy uses its own address.
find "$OUT" -type f \( -name '*.html' -o -name '*.json' -o -name '*.js' -o -name '*.txt' \) -not -name '_worker.js' -exec sed -i 's#https://apexagenticsuk\.github\.io/marta-preview/#https://marta-preview.pages.dev/#g' {} +
cp cloudflare/shell.js "$OUT/admin/shell.js"
cp cloudflare/admin-index.html "$OUT/admin/index.html"
cp cloudflare/_worker.js "$OUT/_worker.js"
printf '/*\n  X-Robots-Tag: noindex, nofollow\n' > "$OUT/_headers"
echo "built $OUT"
