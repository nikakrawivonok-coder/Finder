const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[
 ['version V50', html.includes("const VERSION='V50'")],
 ['checkpoint V50', fs.existsSync('ANOMALY_GAME_CHECKPOINT_V50.md')],
 ['roadmap V50', fs.existsSync('ROADMAP_AFTER_V50.md')],
 ['zone awaken panel', html.includes('Зона прокидається V50')],
 ['memory button', html.includes('Слухати пам’ять')],
 ['mind button', html.includes('Кликати аномалію')],
 ['goal button', html.includes('Пульс Зони')],
 ['intelligent anomalies', html.includes('Дитина Зони') && html.includes('Той Хто Чекає')],
 ['wish integration kept', html.includes('Виконавець бажань V49')],
 ['legacy integration kept', html.includes('Спадщина сталкерів V48')]
];
let bad=checks.filter(x=>!x[1]);
console.log(checks.map(x=>`${x[1]?'OK':'FAIL'} ${x[0]}`).join('\n'));
if(bad.length)process.exit(1);
