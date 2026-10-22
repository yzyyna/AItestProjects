#!/usr/bin/env bash
# 提交前校验：只检查当前改动涉及的文件，外加两个生成物的新鲜度与 cyber-potato 单元测试。
# 自检：bash -n scripts/check.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SELF="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
cd "$ROOT"

# 对自身做语法自检（轻量常驻；全量 bash -n 门会拖慢提交，故只自检自身）
bash -n "$SELF" || { echo "check.sh 自身语法错误" >&2; exit 1; }

status=0
touched_cyber=0
touched_loop=0

check_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0
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
}

# 用 -z 解析改动清单：文件名含空格/引号也能正确处理。
# porcelain -z 重命名条目为 "R  new\0old\0" 双记录，跳过后者（旧路径记录）。
skip_old=0
while IFS= read -r -d '' entry; do
  if (( skip_old )); then
    skip_old=0
    continue
  fi
  xy="${entry:0:2}"
  f="${entry:3}"
  if [[ "$xy" == "R"* ]]; then
    skip_old=1
  fi
  # 去掉重命名箭头残留引号（如 "old" -> "new" 风格回退），保留原始文件名
  f="${f%\"}"
  f="${f#\"}"
  check_file "$f"
  case "$f" in
    cyber-potato/*) touched_cyber=1 ;;
    loop-heist/*) touched_loop=1 ;;
  esac
done < <(git status --porcelain --untracked-files=all -z)

node --check internet-museum/js/app.bundle.js || status=1
node internet-museum/build.js --check || status=1
node stellar-fusion/build.js --check || status=1

if (( touched_cyber )); then
  node cyber-potato/test.js || status=1
fi

if (( touched_loop )); then
  node loop-heist/test.js || status=1
fi

if [[ $status -eq 0 ]]; then
  echo "校验通过"
else
  echo "校验失败，请查看上方输出" >&2
fi
exit $status
