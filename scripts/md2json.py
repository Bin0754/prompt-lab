#!/usr/bin/env python3
"""Convert a prompt_templates markdown file into data/<date>.json.
Usage: python3 scripts/md2json.py <templates.md> <YYYY-MM-DD> [--model Grok] [--ratio 16:9]"""
import re, json, sys, argparse
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('date')
ap.add_argument('--model', default='Grok'); ap.add_argument('--ratio', default=None)
a = ap.parse_args(); src, date = a.src, a.date
md = open(src, encoding='utf-8').read()
parts = re.split(r'^### 模板 (\d+)｜', md, flags=re.M)
entries = []
for i in range(1, len(parts), 2):
    n = int(parts[i]); body = parts[i+1].split('\n---')[0]
    title = body.split('\n', 1)[0].strip()
    star = title.startswith('★'); name = title.lstrip('★ ').strip()
    g = lambda k: (re.search(r'\*\*' + k + r'\*\*：(.+)', body) or [None, ''])[1].strip()
    vars_ = []
    for row in re.findall(r'^\| *(\{[^|]+\}) *\|([^|]*)\|([^|]*)\|', body, flags=re.M):
        vars_.append({'name': row[0].strip(), 'desc': row[1].strip(), 'example': row[2].strip()})
    tpl = re.search(r'```\n(.*?)\n```', body, flags=re.S)
    entries.append({'id': f'{n:02d}', 'name': name, 'photoRef': star, 'tagline': g('一句话卖点'),
        'scenarios': [s.strip() for s in re.split('[、，,]', g('适用场景').rstrip('。')) if s.strip()],
        'variables': vars_, 'template': tpl[1].strip() if tpl else '', 'example': g('示例'),
        'image': f'images/{date}/{n:02d}.jpg', 'model': a.model, 'genDate': date})
    if a.ratio: entries[-1]['ratio'] = a.ratio
json.dump({'date': date, 'source': 'https://youmind.com/zh-CN/gpt-image-2-5-prompts', 'entries': entries},
          open(f'data/{date}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'wrote data/{date}.json with {len(entries)} entries')
