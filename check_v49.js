const fs = require('fs');
const html = fs.readFileSync('index.html','utf8');
const need = [
  "const VERSION='V49'",
  'V49 PATCH: Wish Granter Myth',
  'V49_MYTH_FRAGMENTS',
  'v49FindMyth',
  'v49AskWish',
  'Виконавець бажань V49',
  'Самоперевірка V49',
  'Версія тесту: V49 Wish Granter Myth'
];
let ok = true;
for (const n of need) {
  if (!html.includes(n)) { console.error('MISSING:', n); ok = false; }
}
if (!ok) process.exit(1);
console.log('V49 check passed');
