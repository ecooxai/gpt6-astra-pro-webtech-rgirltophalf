import json,sys,datetime
from pathlib import Path
n,score=int(sys.argv[1]),int(sys.argv[2])
title,note=sys.argv[3:5]
p=Path('public/process/manifest.json');m=json.loads(p.read_text())
image=f'process/iteration-{n:02d}-portrait.png'
r=dict(title=f'{n:02d} · {title}',score=score,image=image,note=note,path=str(Path('public',image).resolve()))
m['reviews']=[r]+[v for v in m.get('reviews',[]) if v['image']!=image]
m.update(revision=datetime.datetime.now(datetime.timezone.utc).isoformat(),score=score,iterations=n,note=f'Review {n}: {score}/100. {note} Scores are manual visual judgments, not measured similarity.')
p.write_text(json.dumps(m,indent=2))
