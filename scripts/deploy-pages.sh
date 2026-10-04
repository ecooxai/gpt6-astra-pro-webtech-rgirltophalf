#!/usr/bin/env bash
set -euo pipefail
PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PAGES_BRANCH="gpt6-astra-pro_webtech_pages"
cd "$PROJECT"
node scripts/geometry-test.mjs > public/process/geometry-validation.json
npm run build
if [ ! -f .pages/.git ]; then
  if git show-ref --verify --quiet "refs/heads/$PAGES_BRANCH"; then
    git worktree add .pages "$PAGES_BRANCH"
  else
    git worktree add -b "$PAGES_BRANCH" .pages
  fi
fi
python3 - "$PROJECT" <<"PY"
import shutil,sys
from pathlib import Path
root=Path(sys.argv[1]).resolve()
target=root/".pages"
build=root/"build"
assert target.parent==root and target.name==".pages"
assert (target/".git").is_file(), "Refusing to clean a non-worktree directory"
assert (build/"index.html").is_file(), "Production build is missing"
for item in target.iterdir():
    if item.name==".git":
        continue
    if item.is_dir() and not item.is_symlink():
        shutil.rmtree(item)
    else:
        item.unlink()
for item in build.iterdir():
    dest=target/item.name
    if item.is_dir():
        shutil.copytree(item,dest)
    else:
        shutil.copy2(item,dest)
(target/".nojekyll").touch()
PY
git -C .pages add -A
if ! git -C .pages diff --cached --quiet; then
  git -C .pages -c user.name="GPT-6 Astra Pro" -c user.email="gpt6-astra-pro@users.noreply.github.com" commit -m "Deploy current reviewed WebGL portrait studio"
fi
git -C .pages push --set-upstream origin "$PAGES_BRANCH"
printf "PUBLISHED_BRANCH=%s\n" "$PAGES_BRANCH"
git -C .pages log -1 --format="PUBLISHED_COMMIT=%H"
