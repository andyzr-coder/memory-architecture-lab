"""Inspect PDF text geometry and make page contact sheets from Poppler renders."""
from pathlib import Path
import json, subprocess, os, hashlib
import pdfplumber
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
pdf = root / 'dist/downloads/memory-architecture-handbook.pdf'
out = root / 'output/pdf-qa' / hashlib.sha256(pdf.read_bytes()).hexdigest()[:10]
out.mkdir(parents=True, exist_ok=True)
runtime = Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies'
poppler = runtime / 'native/poppler/Library/bin/pdftoppm.exe' if os.name == 'nt' else Path('pdftoppm')
records = []
with pdfplumber.open(pdf) as document:
    for i, page in enumerate(document.pages):
        text = page.extract_text() or ''
        chars = page.chars
        # Footer is intentionally outside the body. Flag geometry outside page edges.
        outside = [c for c in chars if c['x0'] < -1 or c['x1'] > page.width + 1 or c['top'] < -1 or c['bottom'] > page.height + 1]
        records.append({'page':i+1,'chars':len(text),'outside':len(outside),'first':text[:130]})
    report = {'pages':len(document.pages),'total_characters':sum(r['chars'] for r in records),'outside_page':sum(r['outside'] for r in records),'sparse_pages':[r for r in records if r['chars']<160],'page_starts':records}
assert report['outside_page']==0, 'Text outside page bounds'
(out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
subprocess.run([str(poppler),'-scale-to','720','-png',str(pdf),str(out/'page')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
pages=sorted(out.glob('page-*.png'), key=lambda p:int(p.stem.split('-')[-1]))
for offset in range(0,len(pages),12):
    selected=pages[offset:offset+12]
    sheet=Image.new('RGB',(4*265,3*395),'#d8dfe6');draw=ImageDraw.Draw(sheet)
    for n,file in enumerate(selected):
        img=Image.open(file).convert('RGB');img.thumbnail((245,355))
        x=(n%4)*265+10;y=(n//4)*395+25
        sheet.paste(img,(x+(245-img.width)//2,y));draw.text((x,y-18),f'Page {offset+n+1}',fill='#172d40')
    sheet.save(out/f'contact-{offset//12+1:02d}.jpg',quality=88)
print(json.dumps({k:v for k,v in report.items() if k!='page_starts'},ensure_ascii=False,indent=2))
