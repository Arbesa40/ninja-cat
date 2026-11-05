#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."
rm -f ninja-cat.zip
zip -rq ninja-cat.zip index.html style.css src assets -x '*.DS_Store'
echo "Built ninja-cat.zip ($(du -h ninja-cat.zip | cut -f1))"
