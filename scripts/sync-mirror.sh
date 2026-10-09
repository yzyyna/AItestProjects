#!/usr/bin/env bash
# 将源仓库同步至 https-website-cloudflare/ai 镜像目录，并校验两侧文件一致。
# 用法：scripts/sync-mirror.sh [--dry-run]
# 环境变量 MIRROR_DST 可覆盖目标目录（用于临时目录测试）。
set -eo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="${MIRROR_DST:-/Users/fortrust/Documents/Projects/gitee/https-website-cloudflare/ai}"
EXCLUDES=(.git .DS_Store .claude .zcode .trae scripts)

rsync_args=()
for e in "${EXCLUDES[@]}"; do rsync_args+=("--exclude=$e"); done

diff_args=()
for e in "${EXCLUDES[@]}"; do diff_args+=("-x" "$e"); done

if [[ ! -d "$DST" ]]; then
  echo "目标目录不存在：$DST" >&2
  exit 1
fi

if [[ "${1:-}" == "--dry-run" ]]; then
  rsync -av --delete --dry-run "${rsync_args[@]}" "$SRC/" "$DST/"
  echo "dry-run 完成，未写入目标目录"
  exit 0
fi

rsync -av --delete "${rsync_args[@]}" "$SRC/" "$DST/"

if diff -rq "${diff_args[@]}" "$SRC" "$DST"; then
  echo "镜像同步完成：两侧文件 100% 一致"
else
  echo "镜像同步后仍存在差异，请检查上方输出" >&2
  exit 1
fi
