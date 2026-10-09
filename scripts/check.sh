#!/usr/bin/env bash
# 提交前校验：只检查当前改动涉及的文件，外加两个生成物的新鲜度与 cyber-potato 单元测试。
set -eo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

status=0

changed=$(git status --porcelain --untracked-files=all | sed -E 's/^...//; s/.* -> //')

while IFS= read -r f; do
  [[ -f "$f" ]] || continue
  case "$f" in
    internet-museum/js/*)
      ;;
    *.js)
      node --check "$f" || status=1
      ;;
    *.html)
      node -e '
        const fs = require("fs");
        const vm = require("vm");
        const file = process.argv[1];
        const re = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
        let m;
        let n = 0;
        while ((m = re.exec(fs.readFileSync(file, "utf8")))) {
          n++;
          new vm.Script(m[1], { filename: file + "#" + n });
        }
      ' "$f" || status=1
      ;;
  esac
done <<< "$changed"

node --check internet-museum/js/app.bundle.js || status=1
node internet-museum/build.js --check || status=1
node stellar-fusion/build.js --check || status=1

if printf '%s\n' "$changed" | grep -q '^cyber-potato/'; then
  node cyber-potato/test.js || status=1
fi

if [[ $status -eq 0 ]]; then
  echo "校验通过"
else
  echo "校验失败，请查看上方输出" >&2
fi
exit $status
