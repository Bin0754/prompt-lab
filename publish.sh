#!/usr/bin/env bash
# Add a new day to Prompt Lab and push.
# Usage: ./publish.sh <YYYY-MM-DD> <templates.md> <img01> <img02> ... <img10>
#   or:  ./publish.sh <YYYY-MM-DD>   (if data/<date>.json and images/<date>/ already exist)
set -euo pipefail
cd "$(dirname "$0")"
DATE="$1"; shift
[[ "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || { echo "bad date"; exit 1; }
git pull -q --rebase || true
if [ $# -ge 1 ]; then
  MD="$1"; shift
  python3 scripts/md2json.py "$MD" "$DATE"
  mkdir -p "images/$DATE"; i=1
  for f in "$@"; do
    python3 -c "import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert('RGB');w,h=im.size
im=im.resize((1600,round(h*1600/w)),Image.LANCZOS) if w>1600 else im;im.save(sys.argv[2],quality=82,optimize=True,progressive=True)" "$f" "images/$DATE/$(printf %02d $i).jpg"
    i=$((i+1))
  done
fi
[ -f "data/$DATE.json" ] || { echo "missing data/$DATE.json"; exit 1; }
python3 - "$DATE" <<'PY'
import json,sys,os
d=sys.argv[1];p='data/index.json';idx=json.load(open(p))
idx['dates']=sorted(set(idx['dates'])|{d},reverse=True);json.dump(idx,open(p,'w'),ensure_ascii=False,indent=2)
for e in json.load(open(f'data/{d}.json'))['entries']:
    if not os.path.exists(e['image']): print('WARNING missing image',e['image'])
PY
git add -A && git commit -qm "Add $DATE" && git push -q && echo "published $DATE"
