const fs = require('fs');
const s = fs.readFileSync('app/page.js', 'utf8');
let stack = [];
let i = 0;
let inSingle = false, inDouble = false, inBack = false, esc = false;
for (let ch of s) {
  i++;
  if (esc) { esc = false; continue; }
  if (ch === '\\') { esc = true; continue; }
  if (inSingle) { if (ch === "'") inSingle = false; continue; }
  if (inDouble) { if (ch === '"') inDouble = false; continue; }
  if (inBack) { if (ch === '`') inBack = false; continue; }
  if (ch === "'") { inSingle = true; continue; }
  if (ch === '"') { inDouble = true; continue; }
  if (ch === '`') { inBack = true; continue; }
  if (ch === '(' || ch === '{' || ch === '[') stack.push({ ch, idx: i });
  else if (ch === ')' || ch === '}' || ch === ']') {
    const last = stack.pop();
    if (!last) { console.log('Unmatched closing', ch, 'at', i); process.exit(0); }
    const pairs = { '(': ')', '{': '}', '[': ']' };
    if (pairs[last.ch] !== ch) { console.log('Mismatched', last.ch, 'at', last.idx, 'closed by', ch, 'at', i); process.exit(0); }
  }
}
if (stack.length) { console.log('Unclosed at end:', stack.map(x => x)); process.exit(0); }
console.log('All balanced');
