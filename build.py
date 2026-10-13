"""Build index.html from src/: python3 build.py"""
from pathlib import Path
S = Path(__file__).parent / 'src'
parts = {'ASTRO': 'astro.js', 'CONTENT': 'content.js', 'CONTENT2': 'content2.js', 'MOONKIT': 'moons_snd.js',
         'EXTRAS': 'extras.js', 'NARRS': 'narr.js', 'LEARN': 'learn.js', 'MAIN': 'main.js'}
out = (S / 'template.html').read_text(encoding='utf-8')
for key, f in parts.items():
    out = out.replace(f'/*{key}*/', (S / f).read_text(encoding='utf-8'))
html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' + out + '\n</html>\n'
(Path(__file__).parent / 'index.html').write_text(html, encoding='utf-8')
print('built index.html', len(html), 'bytes')
