from pathlib import Path
p=Path('app/page.js')
lines=p.read_text(encoding='utf-8').splitlines()
start=540-1
end=552
for i in range(start,end):
    line=lines[i]
    print(f'{i+1}: {line}')
    print(''.join([f'{ord(c)} ' for c in line]))
    print('---')
