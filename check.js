
'use strict';
const VERSION='V37', STORE='anomalyArtifactGameV35', SIZE=8, FLAGS={"undo": true, "danger": true, "route": true, "events": true, "perks": true, "achievements": true, "soundtest": true};
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const key=(x,y)=>x+','+y, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let rand=Math.random, audioCtx=null, state=null, setup={diff:'stalker',loc:'forest',contract:'any',gear:['detector','bolts'],compact:false,perk:'none'};
const PREF_STORE='anomalyArtifactGamePrefsV33';
let audioState={enabled:false,last:'—',volume:1,mobileBoost:true,status:'idle'};
function loadPrefs(){try{return JSON.parse(localStorage.getItem(PREF_STORE)||'{}')}catch(e){return {}}}
function savePrefs(){try{localStorage.setItem(PREF_STORE,JSON.stringify({perk:setup.perk,compact:setup.compact,audio:audioState}))}catch(e){}}
let actionHelpOpen=false;
{let prefs=loadPrefs(); if(prefs.perk)setup.perk=prefs.perk; if(typeof prefs.compact==='boolean')setup.compact=prefs.compact; if(prefs.audio)audioState={...audioState,...prefs.audio};}
const difficulties={rookie:{label:'Новачок',hp:5,bolts:13,charge:13,anom:7,radMax:7},stalker:{label:'Сталкер',hp:4,bolts:10,charge:11,anom:10,radMax:5},veteran:{label:'Ветеран',hp:3,bolts:8,charge:9,anom:12,radMax:4},fatalist:{label:'Фаталіст',hp:2,bolts:6,charge:8,anom:14,radMax:4}};
const locations={ravine:{label:'Покинутий яр',note:'більше Воронок',bias:'vortex'},forest:{label:'Рудий ліс',note:'радіація росте швидше',bias:'acid'},blockpost:{label:'Старий блокпост',note:'частіше трапляються схрони',bias:'burn'},tunnel:{label:'Підземний тунель',note:'сигнал слабший',bias:'silent'},swamp:{label:'Затоплена низина',note:'більше Киселю',bias:'acid'},scrapyard:{label:'Кладовище техніки',note:'машини, метал і нові гравітаційні збої',bias:'gravity'},psyfield:{label:'Пси-пляма',note:'текст КПК іноді бреше; поруч діє пси-поле',bias:'psi'},oldlab:{label:'Стара наукова станція',note:'укриття, записи, ртутний туман і небезпечні лабораторні відгуки',bias:'mercury'}};
const contracts={any:{label:'Просто винести',desc:'головне вижити'},fast:{label:'Менш ніж 25 ходів',desc:'швидкий вихід'},clean:{label:'Мінімум радіації',desc:'рад ≤ 1'},map:{label:'Виявити 5 аномалій',desc:'розвідка'},thrifty:{label:'Зекономити болти',desc:'залишити ≥3'}};
const gear={detector:{label:'Детектор',desc:'+довіра сигналу'},bolts:{label:'Додаткові болти',desc:'+3 болти'},med:{label:'Аптечка',desc:'+1 HP у рейді'},antirad:{label:'Антирад',desc:'-2 радіації'},rope:{label:'Мотузка',desc:'один раз рятує від Воронки'},container:{label:'Екранований контейнер',desc:'+1 стабілізація'}};
const perks={none:{label:'Без перка',desc:'чистий рейд'},warm:{label:'Теплий резонанс',desc:'перший опік слабший'},glass:{label:'Скляний фокус',desc:'+1 заряд КПК'},bolt:{label:'Пісня болта',desc:'перший болт не витрачається'}};
const mutations={calm:{label:'Зона тиха',desc:'менше подій'},static:{label:'Електрична буря',desc:'Електра агресивніша'},dust:{label:'Радіоактивний пил',desc:'фон зростає'},blind:{label:'Сліпа пляма',desc:'скан іноді слабшає'},decoy:{label:'Хибне світіння',desc:'на полі є приманки'}};
const sets=['Серце Зони','Очі Зони','Пісні Болта'];
const obstacleInfo={tree:{icon:'♣',name:'Сухе дерево',desc:'коріння стирчить із землі, пройти не можна'},wall:{icon:'▦',name:'Бетонна плита',desc:'старий уламок перекрив шлях'},car:{icon:'▰',name:'Іржавий автомобіль',desc:'фонить, але всередині може бути лут'}};
const lootInfo={stash:{icon:'▤',name:'Старий схрон',desc:'може містити чисту воду, антирад, болти або батарею'},pack:{icon:'▥',name:'Покинутий рюкзак',desc:'дрібний лут, але іноді пастка'}};
const menuRumors=['На Рудому лісі бачили світло без джерела. Не йди прямо на нього.','Стара Нива біля аномалії може фонити, але в бардачку іноді лежать болти.','Якщо КПК дуже впевнено каже “безпечний шлях” — кинь болт ще раз.','Артефакт найчастіше звучить тихо перед тим, як зірватися в писк.','Не всі спалахи Зони залишають слід на карті. Деякі просто попереджають.','Хто повернувся з повними кишенями, той або бреше, або ще не вийшов із Зони.','Старі рюкзаки не завжди порожні. Але чужий рюкзак у Зоні — це теж питання.','Якщо бачиш короткий спалах і КПК мовчить — не шукай логіки, шукай укриття.','Чиста вода в схроні цінніша за зайвий болт, коли лічильник починає співати.', 'Біля старого автобуса іноді відповідають тим, хто не кликав.', 'Поранений шукач може лишити більше, ніж подяку.', 'Якщо в траві рветься земля — не геройствуй, пес не питає імені.', 'Чорний дощ не завжди шкодить одразу. Інколи він лишає борг у крові.', 'Якщо сліди обриваються — не дивись уперед, дивись під ноги.', 'Торговець по рації може знати твоє ім’я раніше за тебе.', 'Старі КПК не вмирають одразу. Вони ще довго пам’ятають останній маршрут.', 'На Кладовищі техніки машини стоять так щільно, ніби їх хтось перегнав туди після смерті.', 'Деякі артефакти не чекають. Вони повзуть від шуму, ніби мають власну волю.', 'Якщо КПК раптом говорить занадто впевнено — можливо, поруч пси-поле.', 'Пси-пляма не завжди б’є по тілу. Іноді вона просто міняє місцями правду й підказку.'];
const artifacts=[{name:'Тепле Серце',rare:'корисний',set:'Серце Зони',power:'пом’якшує Жарку',desc:'Бурштинова грудка тремтить, ніби всередині є маленький мотор.'},{name:'Скляне Око',rare:'рідкісний',set:'Очі Зони',power:'відкриває приховані сигнали',desc:'У прозорому камені щось повільно кліпає назад.'},{name:'Пісня Болта',rare:'дивний',set:'Пісні Болта',power:'чує безпечні клітини',desc:'Металева крапля дзвенить навіть у повній тиші.'},{name:'Медовий Камінь',rare:'цінний',set:'Серце Зони',power:'лікує, але тягне радіацію',desc:'Липке золоте світло повзе по пальцях крізь рукавицю.'},{name:'Компас Мари',rare:'аномальний',set:'Очі Зони',power:'показує шлях, коли бреше КПК',desc:'Стрілка завжди повертається туди, де страшно.',migrates:true},{name:'Легка Гільза',rare:'звичайний',set:'Пісні Болта',power:'економить спорядження',desc:'Порожня гільза важить менше, ніж мала б.'},{name:'Чорна Іскра',rare:'небезпечний',set:'Серце Зони',power:'посилює нагороду і тиск',desc:'Усередині темряви іноді спалахує маленька ніч.',migrates:true},{name:'Білий Болт',rare:'рідкісний',set:'Пісні Болта',power:'іноді сам знаходить безпечний шлях',desc:'Кістяно-білий уламок металу тихо котиться проти нахилу землі.',migrates:true},{name:'Вовчий Компас',rare:'аномальний',set:'Очі Зони',power:'тягнеться до краю поля',desc:'Усередині маленької стрілки ніби біжить сірий звір.',migrates:true},{name:'Пилова Лілія',rare:'цінний',set:'Серце Зони',power:'пом’якшує радіаційний пил',desc:'Крихка квітка з попелу розкривається тільки в рукавиці.'},{name:'Сміх Електри',rare:'дивний',set:'Очі Зони',power:'живить КПК, але дратує Електру',desc:'Синя намистина клацає, ніби хтось сміється у дротах.'},{name:'Котяче Око',rare:'уникальний',set:'Очі Зони',power:'бачить короткі спалахи Зони',desc:'Зелена зіниця стискається щоразу, коли поруч бреше простір.',migrates:true},{name:'Ртутна Сльоза',rare:'небезпечний',set:'Серце Зони',power:'знижує тиск викиду, але піднімає фон',desc:'Срібна крапля не падає вниз — вона шукає найтеплішу долоню.',migrates:true},{name:'Ключ Викиду',rare:'уникальний',set:'Очі Зони',power:'попереджає про викид раніше за КПК',desc:'Плаский уламок із чорним краєм. Перед грозою він стає холодним.'},{name:'Тиха Монета',rare:'дивний',set:'Пісні Болта',power:'іноді глушить пси-шум',desc:'Монета без герба, яка дзвенить тільки тоді, коли поруч хтось мовчить.'}];
const anomInfo={burn:{icon:'♨',name:'Жарка'},electro:{icon:'ϟ',name:'Електра'},vortex:{icon:'◎',name:'Воронка'},acid:{icon:'≈',name:'Кисіль'},silent:{icon:'·',name:'Тиха'},wander:{icon:'◇',name:'Блукаюча'},mirror:{icon:'◫',name:'Дзеркало'},gravity:{icon:'⌾',name:'Гравітаційний шов'},glassfog:{icon:'░',name:'Скляний туман'},pulse:{icon:'✹',name:'Пульсар'},psi:{icon:'☊',name:'Пси-поле'},mercury:{icon:'☿',name:'Ртутний туман'},meat:{icon:'✖',name:'М’ясорубка'},cold:{icon:'❄',name:'Холодний шов'}};
const psiFalseLines=['КПК: безпечно. Не перевіряй болтом.','КПК: артефакт ліворуч. Ні. Праворуч. Ні.','КПК: радіація 0. Повторюю: 0.','Чужий голос у динаміку: “ти вже виходив звідси”','КПК на мить показав хибний вихід там, де його немає','Пси-шум підмінив рядок журналу: “крок зроблено вчора”','Детектор шепоче: “залиш контейнер і йди”'];

const weatherLines=['сірий світанок завис над травою','низький туман лізе між кущами','у повітрі пахне мокрим металом','десь далеко гавкнув собака і різко замовк','вітер не дме, але листя ворушиться','радіо шипить чужим голосом'];
const locSenses={ravine:['глина під ногами просідає, наче яр дихає','знизу тягне холодом і мокрим камінням','болт падає глухо, ніби в порожню бочку'],forest:['руді дерева стоять занадто рівно','пил світиться на рукаві дрібними іскрами','у кронах щось тріщить без вітру'],blockpost:['іржавий шлагбаум скрипить сам по собі','на бетоні лишились старі гільзи','за будкою миготить тінь, але тепла там немає'],tunnel:['стеля капає у такт детектору','кожен крок повертається луною пізніше, ніж треба','темрява попереду здається густішою за стіни'],swamp:['вода тиха, але кола розходяться без причини','очерет шепоче короткими уривками','чобіт чіпляє щось м’яке під водою'],scrapyard:['кузови машин стоять рядами, ніби хтось їх поховав','метал тихо дзвенить без вітру','КПК ловить відбиття сигналу від кожного іржавого капота'],psyfield:['повітря шепоче словами, яких ти не казав','КПК на секунду показує чужий пульс замість твого','трава нахиляється до тебе, ніби слухає думки'],oldlab:['з-за дверей лабораторії тягне спиртом і іржею','скло під ногами хрустить так, ніби хтось відповідає','старий динамік шипить, хоча дроти давно обірвані']};
const radioBursts=['...прийом... не йди прямо...','Сидорович би за таке не доплатив','хтось був тут до тебе — сліди ще теплі','КПК ловить чужий маяк, але координати мертві','пам’ятай: Зона карає жадібних','короткий тріск, наче хтось клацнув запальничкою'];
const artifactVisions={
 'Тепле Серце':'у бурштині б’ється маленький вогник, і на мить стає тепліше, ніж має бути',
 'Скляне Око':'всередині каменя відкривається зіниця і дивиться просто крізь тебе',
 'Пісня Болта':'метал тихо дзвенить, ніби пам’ятає всі кинуті болти',
 'Медовий Камінь':'золоте світло липне до рукавиць і тягнеться тонкими нитками',
 'Компас Мари':'стрілка шалено крутиться, а тоді завмирає в бік, куди не хочеться йти',
 'Легка Гільза':'вона ледь торкається долоні, ніби важить менше за власну тінь',
 'Чорна Іскра':'темрява всередині каменя спалахує і на секунду гасить усе довкола',
 'Білий Болт':'уламок прокочується по долоні й на мить показує стежку між травами',
 'Вовчий Компас':'стрілка здригається, ніби чує далеке виття за межами карти',
 'Пилова Лілія':'попіл складається в пелюстки й пахне дощем над бетоном',
 'Сміх Електри':'синій блиск підстрибує в повітрі і клацає в такт КПК',
 'Котяче Око':'зелена зіниця відкривається й дивиться в той бік, де простір щойно збрехав'
};
const zoneMoods={
 calm:{label:'тиха',desc:'менше тиску, КПК говорить рівніше. Добре для першого рейду.',effect:'Перші хвилини Зона ніби просто спостерігає.'},
 generous:{label:'щедра',desc:'більше шансів на схрони та рюкзаки, але не всі подарунки безпечні.',effect:'У траві частіше блимають старі знахідки.'},
 hungry:{label:'голодна',desc:'події трапляються частіше, а евакуація відчувається гостріше.',effect:'Тиша здається надто уважною.'},
 blind:{label:'глуха',desc:'сигнал менш надійний, скан важливіший.',effect:'Детектор іноді говорить із запізненням.'},
 bright:{label:'ясна',desc:'напрям сигналу читається краще, але аномалії все одно не показують себе чесно.',effect:'КПК ловить пульс артефакту майже без шуму.'}
};
function todayMood(){let keys=Object.keys(zoneMoods);let d=new Date();return keys[(d.getFullYear()+d.getMonth()*7+d.getDate())%keys.length]}
function renderMenuMood(){let el=$('#moodText');if(!el)return;let k=todayMood(),m=zoneMoods[k];el.textContent='Зона сьогодні: '+m.label+'. '+m.desc;}


function seeded(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>((s=s*16807%2147483647)-1)/2147483646}function choose(a){return a[Math.floor(rand()*a.length)]}function dist(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}function loadStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return {}}}function saveStore(o){localStorage.setItem(STORE,JSON.stringify(o))}function toast(t){let el=document.createElement('div');el.className='toast';el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),1900)}function bind(el,fn){if(!el)return;let fired=0,ev=('PointerEvent' in window)?'pointerup':'click';el.addEventListener(ev,e=>{e.preventDefault();let now=Date.now();if(now-fired<180)return;fired=now;fn(e)},{passive:false});if(ev!=='click')el.addEventListener('click',e=>e.preventDefault(),{passive:false})}
function ensureAudio(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended')audioCtx.resume(); audioState.status=audioCtx.state; return audioCtx}catch(e){audioState.status='unavailable'; return null}}
function sound(type='tap'){
  haptic(['bad','vortex','gravity','pulse','mutant','psi'].includes(type)?'bad':(['artifact','item','loot','stash'].includes(type)?'item':(['warn','mirror','glassfog','artifactMove'].includes(type)?'warn':'tap')));
  try{
    let ctx=ensureAudio(); if(!ctx)return;
    audioState.enabled=true; audioState.last=type+' · '+new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); savePrefs();
    let master=clamp(audioState.volume??1,0,1), boost=audioState.mobileBoost?2.45:1;
    let now=ctx.currentTime;
    let comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-18; comp.knee.value=18; comp.ratio.value=8; comp.attack.value=.003; comp.release.value=.20;
    comp.connect(ctx.destination);
    const tone=(freq,dur=0.16,delay=0,gain=.12,wave='sine',slide=1)=>{let t=now+delay;let o=ctx.createOscillator(),g=ctx.createGain();o.type=wave;o.frequency.setValueAtTime(freq,t);if(slide!==1)o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*slide),t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.min(.62,gain*master*boost),t+.018);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(comp);o.start(t);o.stop(t+dur+.04)};
    const noise=(dur=0.18,delay=0,gain=.08,filter=900,typeF='bandpass')=>{let t=now+delay,buf=ctx.createBuffer(1,Math.max(1,Math.floor(ctx.sampleRate*dur)),ctx.sampleRate),data=buf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);let src=ctx.createBufferSource();src.buffer=buf;let f=ctx.createBiquadFilter();f.type=typeF;f.frequency.value=filter;f.Q.value=1.8;let g=ctx.createGain();g.gain.setValueAtTime(Math.min(.42,gain*master*boost),t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);src.connect(f);f.connect(g);g.connect(comp);src.start(t);src.stop(t+dur+.03)};
    const patterns={
      ready:()=>{tone(430,.14,0,.11);tone(720,.18,.08,.13,'triangle');noise(.10,.02,.035,1600)},
      tab:()=>{tone(620,.08,0,.08,'triangle');tone(920,.07,.08,.055,'sine')},
      shot:()=>{noise(.08,0,.12,2200,'highpass');tone(360,.11,.02,.09,'square',.86);tone(760,.06,.08,.045,'triangle')},
      hit:()=>{tone(390,.12,0,.13,'triangle');tone(780,.16,.07,.11,'sine')},
      miss:()=>{tone(260,.16,0,.08,'sawtooth',.72);noise(.12,.03,.04,700)},
      bad:()=>{tone(180,.28,0,.17,'sawtooth',.72);noise(.22,.03,.09,520)},
      warn:()=>{tone(330,.12,0,.11,'triangle');tone(640,.10,.12,.09,'triangle');noise(.16,.02,.045,1300)},
      scan:()=>{tone(520,.10,0,.08);tone(700,.10,.11,.08);tone(920,.14,.22,.06,'triangle');noise(.20,0,.025,2500)},
      loot:()=>{tone(560,.08,0,.08,'triangle');tone(840,.10,.09,.09,'triangle');noise(.08,.03,.04,1700)},
      stash:()=>{tone(240,.08,0,.08,'square');noise(.12,.04,.06,900);tone(720,.10,.16,.08,'triangle')},
      artifact:()=>{tone(660,.16,0,.11);tone(990,.22,.10,.14,'triangle');tone(1320,.28,.25,.12,'sine');noise(.18,.10,.025,3200)},
      artifactMove:()=>{tone(780,.18,0,.09,'triangle',.55);noise(.24,.04,.07,1500);tone(420,.16,.24,.08,'sawtooth')},
      burn:()=>{noise(.30,0,.13,1100,'bandpass');tone(220,.18,.04,.07,'sawtooth',1.35)},
      electro:()=>{noise(.08,0,.17,5000,'highpass');tone(1250,.06,.03,.13,'square');tone(520,.18,.10,.09,'sawtooth',.78);noise(.18,.12,.06,2800)},
      vortex:()=>{tone(120,.48,0,.18,'sawtooth',.55);noise(.35,.04,.08,360);tone(70,.18,.34,.16,'sine')},
      acid:()=>{noise(.28,0,.10,650,'lowpass');tone(310,.12,.07,.07,'triangle',.82);noise(.18,.20,.08,1200)},
      silent:()=>{tone(1800,.05,0,.035,'sine');tone(90,.34,.08,.13,'sine');noise(.10,.26,.025,400)},
      wander:()=>{tone(510,.12,0,.08,'triangle',1.4);tone(260,.16,.14,.07,'sine',.7);noise(.10,.12,.035,1000)},
      mirror:()=>{tone(900,.10,0,.08,'triangle',.72);tone(900,.10,.12,.08,'triangle',1.28);noise(.12,.06,.045,2400)},
      gravity:()=>{tone(90,.42,0,.2,'sawtooth',.6);noise(.30,.06,.09,260,'lowpass');tone(60,.15,.34,.16,'sine')},
      glassfog:()=>{tone(1600,.12,0,.07,'sine');tone(2100,.10,.12,.055,'triangle');noise(.36,.03,.05,3600,'highpass')},
      pulse:()=>{tone(180,.10,0,.14,'sine');tone(180,.10,.18,.16,'sine');tone(760,.16,.30,.10,'triangle');noise(.16,.28,.06,1800)},
      psi:()=>{tone(440,.20,0,.09,'sine',1.08);tone(436,.22,0,.075,'sine',.92);noise(.34,.04,.055,1200);tone(132,.35,.18,.12,'sawtooth',1.2)},
      mutant:()=>{tone(150,.14,0,.14,'sawtooth',.62);noise(.22,.03,.10,500);tone(95,.18,.20,.16,'square',.8)},
      wounded:()=>{noise(.22,0,.055,1800);tone(620,.18,.06,.07,'triangle',.65);tone(310,.20,.24,.05,'sine')},
      radio:()=>{noise(.32,0,.08,2200);tone(740,.08,.06,.045,'square');tone(510,.10,.18,.04,'square')},
      rain:()=>{noise(.45,0,.09,1800,'bandpass');tone(300,.18,.12,.04,'sine');noise(.28,.25,.06,4200,'highpass')},
      radiation:()=>{tone(700,.05,0,.07,'square');tone(700,.05,.13,.07,'square');tone(700,.05,.26,.07,'square');noise(.18,.1,.035,1600)},
      good:()=>{tone(520,.10,0,.10);tone(880,.14,.09,.10,'triangle')}
    };
    (patterns[type]||patterns.good)();
  }catch(e){audioState.status='error'}
}
function psiDistance(){if(!state||!state.anoms)return Infinity;let best=Infinity;for(let [k,t] of state.anoms.entries()){if(t!=='psi')continue;let [x,y]=k.split(',').map(Number);best=Math.min(best,Math.abs(x-state.pos.x)+Math.abs(y-state.pos.y));}return best}
function inPsiField(){return psiDistance()<=2}
function maybePsiDistort(original){if(!state||state.finished||state.tutorial)return original;let d=psiDistance();if(d>2)return original;if(rand()<(d===0?.55:d===1?.34:.20)){sound('psi');pulseScreen('warn');let fake=choose(psiFalseLines);state.log.unshift({t:'ПСІ-ШУМ: '+fake,time:new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'})});state.log=state.log.slice(0,80);let la=$('#lastActionText');if(la)la.textContent=fake;return original+'  ·  КПК попереджає: поруч пси-поле, частина повідомлень може брехати.';}return original}
function psiPulse(){if(!state||state.finished||state.tutorial)return;let d=psiDistance();if(d<=2&&rand()<(d===0?.42:d===1?.25:.14)){let k=key(Math.floor(rand()*SIZE),Math.floor(rand()*SIZE));if(rand()<.55)state.suspect.add(k);else state.safe.add(k);log('Пси-поле скривило інтерфейс КПК: на мапі з’явилась непевна позначка, якій не варто довіряти без болта.');sound('psi');pulseScreen('warn')}}
function eventSound(ev){let t=(ev&&ev.t)||'';if(t.includes('мутан'))return 'mutant';if(t.includes('Поран'))return 'wounded';if(t.includes('повідомлення')||t.includes('рації')||t.includes('Радіо'))return 'radio';if(t.includes('схрон')||t.includes('Схрон'))return 'stash';if(t.includes('дощ'))return 'rain';if(t.includes('Поклик')||t.includes('артеф'))return 'artifactMove';if(t.includes('загиб')||t.includes('Слід'))return 'psi';return 'warn'}

function inferTone(t){if(/\+|знайдено|Є!|безпеч|винесено|врят|підсвітив|стабілізація|контейнер/i.test(t))return 'good';if(/радіація|HP|аномал|пастка|критич|провал|викид|поран|кров|пси|шум|небезп/i.test(t))return 'bad';return 'warn'}
function inferConsequence(t){
  if(t.includes('Болт'))return 'Болт не рухає тебе по полю: він перевіряє сектор і зменшує ціну помилки.';
  if(t.includes('Скан'))return 'Скан не гарантує правду, але звужує хаос і допомагає планувати маршрут.';
  if(t.includes('радіа'))return 'Радіація — головний лічильник небезпеки. Якщо вона дійде до межі, рейд зірветься.';
  if(t.includes('Артефакт')||t.includes('артефакт'))return 'Артефакт — кульмінація рейду. Після нього Зона стає агресивнішою, а евакуація важливіша за жадібність.';
  if(t.includes('Викид')||t.includes('викид'))return 'Викид — не пастка на клітинці, а загроза всьому полю. Шукай укриття або вихід.';
  if(t.includes('аномал')||t.includes('викривл'))return 'Аномалія позначена пам’яттю КПК. Не ступай туди без крайньої потреби.';
  if(t.includes('схрон')||t.includes('рюкзак')||t.includes('автомоб'))return 'Лут у Зоні майже ніколи не буває безкоштовним: ресурс сьогодні може стати боргом завтра.';
  return 'КПК зафіксував наслідок. У Зоні навіть дрібний крок може мати продовження.';
}
function inferNext(t){
  if(state&&state.hasArtifact)return 'Далі: не блукай. Йди до ▣ або на край поля й евакуюйся.';
  if(state&&state.emission&&state.emission.count>0)return 'Далі: викид близько. Стань біля укриття або натисни “Сховатися”.';
  if(t.includes('радіа')&&state&&setup.gear.includes('antirad')&&!state.usedGear.antirad)return 'Далі: якщо фон уже небезпечний, використай “Антирад -2☢”.';
  if(t.includes('Болт')&&t.includes('безпеч'))return 'Далі: можна рухатися в перевірений сектор або сканувати перед ризиком.';
  if(t.includes('аномал')||t.includes('небезпеч'))return 'Далі: обійди сектор. Якщо маршрут тісний — скануй або шукай інший край.';
  if(state&&state.charge>0&&level&&level()<=2)return 'Далі: сигнал слабкий — скан допоможе не блукати.';
  return 'Далі: звірся з напрямком сигналу і не поспішай у неперевірену клітинку.';
}
function renderActionFeedback(){
  let p=$('#lastActionPanel'); if(!p||!state)return;
  let d=state.actionDetail||{main:state.lastAction||'КПК очікує дію.',why:'Тут після кожної дії буде пояснення наслідку.',next:'Зроби перший обережний крок або кинь болт.',tone:'warn'};
  let time=(state.log&&state.log[0]&&state.log[0].time)?state.log[0].time:'—';
  let decisions=(state.decisions&&state.decisions.length)?'<div class="decisionMini">Останнє рішення: '+esc(state.decisions[state.decisions.length-1])+'</div>':'';
  p.className='lastActionPanel actionImpact '+esc(d.tone||'warn');
  p.innerHTML='<div class="impactHeader"><span class="impactLabel">КПК · остання подія</span><span class="impactTime">'+esc(time)+'</span></div><div class="impactTitle">'+esc(d.main)+'</div><div class="impactWhy">'+esc(d.why)+'</div><div class="impactNext">'+esc(d.next)+'</div>'+decisions;
}
function recordDecision(text){if(!state)return;state.decisions=state.decisions||[];state.decisions.push(text);state.decisions=state.decisions.slice(-12)}
function nearbyShelter(){if(!state)return false;let cells=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>key(state.pos.x+dx,state.pos.y+dy));return cells.some(k=>(state.obstacles&&['car','wall'].includes(state.obstacles.get(k)))||(state.loot&&state.loot.has(k))||k==='0,0'||state.loc==='tunnel'||state.loc==='oldlab')}
function startEmission(){if(!state||state.tutorial||state.emission||state.finished)return;state.emission={count:4+Math.floor(rand()*3),power:1+Math.floor(rand()*2)};log('Небо заглухло. КПК попереджає: насувається викид. Є кілька ходів, щоб знайти укриття.');sound('radiation');pulseScreen('warn')}
function maybeEmission(){if(!state||state.finished||state.tutorial)return;if(!state.emission&&state.moves>8&&rand()<.035){startEmission();return}if(state.emission){state.emission.count--;if(state.emission.count>0){log('Викид наближається. До удару: '+state.emission.count+' ход. Укриття: '+(nearbyShelter()?'поруч':'не видно')+'.');return}let sheltered=state.sheltered||nearbyShelter();if(sheltered){state.rad+=state.emission.power;log('Викид пройшов над укриттям. Тебе трусило, але ти вижив. +'+state.emission.power+' радіація.');recordDecision('пережив викид в укритті');}else{state.hp--;state.rad+=2+state.emission.power;state.wounds=state.wounds||[];state.wounds.push('контузія після викиду');log('Викид накрив просто в полі. -1 HP, +'+(2+state.emission.power)+' радіація, контузія.');recordDecision('потрапив під викид без укриття');pulseScreen('bad')}state.sheltered=false;state.emission=null;}}
function takeShelter(){if(!state||!state.emission)return toast('Викиду зараз немає');saveUndoSnapshot();state.sheltered=true;state.moves++;log(nearbyShelter()?'Ти притиснувся до укриття й вимкнув зайвий шум КПК.':'Укриття слабке, але ти хоча б ліг нижче трави.');afterTurn();render()}
function addWound(name){state.wounds=state.wounds||[];if(!state.wounds.includes(name))state.wounds.push(name);}
function applyArtifactQuirk(){if(!state||!state.hasArtifact)return;let n=state.artifact.name;if(n==='Ртутна Сльоза'&&rand()<.28){state.rad++;log('Ртутна Сльоза постукала по контейнеру. +1 радіація, але тиск викиду слабшає.'); if(state.emission)state.emission.count++;}
 if(n==='Вовчий Компас'&&rand()<.22){addSafeHint('Вовчий Компас смикнувся до краю поля й підсвітив обережний напрям.');}
 if(n==='Тиха Монета'&&inPsiField&&inPsiField()&&rand()<.33){log('Тиха Монета заглушила частину пси-шуму. КПК на мить став чеснішим.');}
}

function haptic(kind='tap'){try{if(navigator.vibrate){let p={tap:14,good:[12,40,18],bad:[30,35,40],warn:[18,28,18],item:[12,28,12,28,20]}[kind]||10;navigator.vibrate(p)}}catch(e){}}function pulseScreen(kind='good'){let app=$('#app');if(!app)return;let cls=kind==='bad'?'flashBad':kind==='warn'?'flashWarn':'flashGood';app.classList.remove('flashGood','flashBad','flashWarn');void app.offsetWidth;app.classList.add(cls);setTimeout(()=>app.classList.remove(cls),520)}function log(t){if(!state)return;t=maybePsiDistort(t);state.lastAction=t;state.actionDetail={main:t,why:inferConsequence(t),next:inferNext(t),tone:inferTone(t)};state.log.unshift({t,time:new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'})});state.log=state.log.slice(0,80);renderActionFeedback();renderLog()}
function serializeStateForUndo(){return {pos:{...state.pos},artPos:{...state.artPos},hp:state.hp,rad:state.rad,bolts:state.bolts,charge:state.charge,moves:state.moves,visited:[...state.visited],safe:[...state.safe],suspect:[...state.suspect],danger:[...state.danger],marked:[...state.marked],trail:[...state.trail],log:state.log.map(x=>({...x})),stabilize:state.stabilize,hasArtifact:state.hasArtifact,escapeStart:state.escapeStart,foundAnoms:state.foundAnoms,usedGear:{...state.usedGear},firstBoltFree:state.firstBoltFree,lastChance:state.lastChance,decoys:state.decoys.map(p=>({...p})),anoms:[...state.anoms.entries()],obstacles:[...state.obstacles.entries()],loot:[...state.loot.entries()],searched:[...state.searched],flashKey:state.flashKey,boltMode:state.boltMode,eventLock:state.eventLock,encounterCooldown:state.encounterCooldown,encounters:state.encounters,storyHook:state.storyHook?{...state.storyHook}:null,style:{...state.style},lastAction:state.lastAction||'',migrationHint:state.migrationHint||null,emission:state.emission?{...state.emission}:null,sheltered:!!state.sheltered,wounds:[...(state.wounds||[])],decisions:[...(state.decisions||[])],stress:state.stress||0,actionDetail:state.actionDetail?{...state.actionDetail}:null}}
function saveUndoSnapshot(){if(!state||state.finished)return;state.prev=serializeStateForUndo()}
function restoreUndoSnapshot(snap){state.pos={...snap.pos};if(snap.artPos)state.artPos={...snap.artPos};state.hp=snap.hp;state.rad=snap.rad;state.bolts=snap.bolts;state.charge=snap.charge;state.moves=snap.moves;state.visited=new Set(snap.visited);state.safe=new Set(snap.safe);state.suspect=new Set(snap.suspect);state.danger=new Set(snap.danger);state.marked=new Set(snap.marked);state.trail=[...snap.trail];state.log=snap.log.map(x=>({...x}));state.stabilize=snap.stabilize;state.hasArtifact=snap.hasArtifact;state.escapeStart=snap.escapeStart;state.foundAnoms=snap.foundAnoms;state.usedGear={...snap.usedGear};state.firstBoltFree=snap.firstBoltFree;state.lastChance=snap.lastChance;state.decoys=snap.decoys.map(p=>({...p}));if(snap.anoms)state.anoms=new Map(snap.anoms);if(snap.obstacles)state.obstacles=new Map(snap.obstacles);if(snap.loot)state.loot=new Map(snap.loot);state.searched=new Set(snap.searched||[]);state.flashKey=snap.flashKey||null;state.boltMode=!!snap.boltMode;state.eventLock=!!snap.eventLock;state.style={...snap.style};state.lastAction=snap.lastAction||'';state.migrationHint=snap.migrationHint||null;state.emission=snap.emission?{...snap.emission}:null;state.sheltered=!!snap.sheltered;state.wounds=[...(snap.wounds||[])];state.decisions=[...(snap.decisions||[])];state.stress=snap.stress||0;state.actionDetail=snap.actionDetail?{...snap.actionDetail}:null}
function initChoices(){function fill(id,obj,prop){let box=$(id);box.innerHTML='';Object.entries(obj).forEach(([k,v])=>{let d=document.createElement('div');d.className='choice '+(setup[prop]===k?'active':'');d.innerHTML='<div class="choice-title">'+esc(v.label)+'</div><div class="choice-desc">'+esc(v.desc||v.note||'')+'</div>';bind(d,()=>{setup[prop]=k;initChoices()});box.appendChild(d)})}fill('#difficultyChoices',difficulties,'diff');fill('#locationChoices',locations,'loc');fill('#contractChoices',contracts,'contract');let gb=$('#gearChoices');gb.innerHTML='';Object.entries(gear).forEach(([k,v])=>{let active=setup.gear.includes(k);let d=document.createElement('div');d.className='choice '+(active?'active':'');d.innerHTML='<div class="choice-title">'+esc(v.label)+'</div><div class="choice-desc">'+esc(v.desc)+'</div>';bind(d,()=>{if(active)setup.gear=setup.gear.filter(x=>x!==k);else if(setup.gear.length<2)setup.gear.push(k);else toast('Можна взяти тільки 2 речі');initChoices()});gb.appendChild(d)})}
function hideAll(){$$('#setupPanel,#gamePanel,#logPanel,#contactsPanelV37,#resultPanel,#archivePanel,#rulesPanel').forEach(e=>e.classList.add('hidden'))}
function newState(opts={}){rand=opts.seed?seeded(opts.seed):Math.random;let cfg={...difficulties[setup.diff]};if(setup.gear.includes('bolts'))cfg.bolts+=3;if(FLAGS.perks&&setup.perk==='glass')cfg.charge+=1;let mut=opts.mutation||choose(Object.keys(mutations));state={cfg,loc:setup.loc,contract:setup.contract,mutation:mut,mood:opts.mood||todayMood(),daily:!!opts.daily,tutorialStage:0,lastSignalLevel:null,pos:{x:0,y:0},prev:null,exit:{x:0,y:0},artifact:choose(artifacts),artPos:null,decoys:[],obstacles:new Map(),loot:new Map(),searched:new Set(),flashKey:null,anoms:new Map(),visited:new Set([key(0,0)]),safe:new Set([key(0,0)]),suspect:new Set(),danger:new Set(),marked:new Set(),trail:[key(0,0)],log:[],hp:cfg.hp,rad:0,bolts:cfg.bolts,charge:cfg.charge,moves:0,foundAnoms:0,hasArtifact:false,stabilize:0,finished:false,boltMode:false,style:{risk:0,bolt:0,scan:0,damage:0},usedGear:{},eventLock:false,encounterCooldown:0,encounters:0,storyHook:null,lastAction:'КПК очікує перший крок.',migrationHint:null,emission:null,sheltered:false,wounds:[],decisions:[],stress:0,actionDetail:null,tutorial:!!opts.tutorial,escapeStart:null,firstBoltFree:FLAGS.perks&&setup.perk==='bolt',lastChance:false,swipes:0,weather:choose(weatherLines),radio:choose(radioBursts),sense:choose(locSenses[setup.loc]||weatherLines)};placeField();applyLocationFlavor();if(opts.tutorial)prepareTutorialField();applyMoodStart();$('#app').classList.toggle('oneHand',!!setup.compact);hideAll();$('#gamePanel').classList.remove('hidden');$('#logPanel').classList.remove('hidden');log((opts.daily?'Рейд дня. ':'')+(opts.tutorial?'Навчальний рейд. ':'')+'КПК прокинувся. Локація: '+locations[state.loc].label+'. Мутація: '+mutations[state.mutation].label+'.');log('Атмосфера: '+state.weather+'. '+state.sense+'.');log('Настрій Зони: '+zoneMoods[state.mood].label+'. '+zoneMoods[state.mood].effect);log('Радіо: '+state.radio);log('Закон Зони: поспіх, жадібність і сліпа довіра КПК тут караються швидше, ніж помилки на мапі.');applyStoryHook(consumeNextHook());$('#app').classList.add('zonePulse');if(opts.tutorial)log('Навчання 2.0: КПК проведе тебе за руку. 1) натисни Болт, 2) перевір сусідню клітину, 3) зроби крок, 4) використай Скан, 5) стабілізуй артефакт і вийди з поля.');render();sound('ready');savePrefs()}

function rememberRumor(text){
  try{
    let st=loadStore();
    st.dynamicRumors=st.dynamicRumors||[];
    st.dynamicRumors.unshift({time:new Date().toLocaleString('uk-UA'),text});
    st.dynamicRumors=st.dynamicRumors.slice(0,24);
    saveStore(st);
  }catch(e){}
}
function setNextHook(type,text){
  try{
    let st=loadStore();
    st.nextHook={type,text,time:new Date().toLocaleString('uk-UA')};
    st.dynamicRumors=st.dynamicRumors||[];
    st.dynamicRumors.unshift({time:new Date().toLocaleString('uk-UA'),text});
    st.dynamicRumors=st.dynamicRumors.slice(0,24);
    saveStore(st);
  }catch(e){}
}
function consumeNextHook(){
  try{let st=loadStore(),h=st.nextHook||null;if(h){delete st.nextHook;saveStore(st)}return h}catch(e){return null}
}
function freeCells(){
  let arr=[]; if(!state)return arr;
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    let k=key(x,y);
    if(k===key(0,0))continue;
    if(state.anoms&&state.anoms.has(k))continue;
    if(state.obstacles&&state.obstacles.has(k))continue;
    if(state.loot&&state.loot.has(k))continue;
    if(state.artPos&&k===key(state.artPos.x,state.artPos.y))continue;
    arr.push({x,y,k});
  }
  return arr;
}
function chooseFreeCell(){let a=freeCells();return a.length?choose(a):null}
function chooseAdjacentFreeCell(){
  let arr=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:state.pos.x+dx,y:state.pos.y+dy})).filter(c=>c.x>=0&&c.y>=0&&c.x<SIZE&&c.y<SIZE).map(c=>({...c,k:key(c.x,c.y)})).filter(c=>!state.anoms.has(c.k)&&!state.obstacles.has(c.k));
  return arr.length?choose(arr):chooseFreeCell();
}
function addMarkedLoot(type='stash',text='КПК додав позначку схрону на мапу.'){
  let c=chooseFreeCell(); if(!c)return;
  state.loot.set(c.k,type); state.marked.add(c.k); state.suspect.add(c.k); log(text);
}
function addSafeHint(text='КПК підсвітив одну клітину як відносно безпечну.'){
  let c=chooseFreeCell(); if(!c)return;
  state.safe.add(c.k); state.marked.add(c.k); log(text);
}
function addDangerHint(text='КПК позначив сектор, де простір поводиться неправильно.'){
  let c=chooseFreeCell(); if(!c)return;
  state.danger.add(c.k); state.suspect.add(c.k); log(text);
}
function applyStoryHook(h){
  if(!h)return;
  state.storyHook=h;
  log('Наслідок минулого рейду: '+h.text);
  if(h.type==='stash')addMarkedLoot('stash','На мапі блимає позначений схрон із минулої чутки.');
  else if(h.type==='medic'){state.hp=clamp(state.hp+1,0,state.cfg.hp);log('Врятований шукач залишив бинт на старті. +1 HP.');}
  else if(h.type==='beacon')addSafeHint('Чужий маяк на секунду підсвітив безпечніший сектор.');
  else if(h.type==='traderAntirad'){setup.gear=[...new Set([...setup.gear,'antirad'])];log('Торговець передав антирад на старт. Антирад доступний у спорядженні.');}
  else if(h.type==='traderBattery'){state.charge++;log('Торговець передав напівживу батарею. +1 заряд КПК.');}
  else if(h.type==='deadPath')addSafeHint('Старий КПК показав одну клітину, куди краще ступати тихо.');
  else if(h.type==='trailPack')addMarkedLoot('pack','Слід іншого шукача лишив на мапі позначку покинутого рюкзака.');
}

function placeField(){let cells=[];for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(!(x===0&&y===0))cells.push({x,y});state.artPos=choose(cells.filter(c=>dist(c,state.exit)>6));let pool=cells.filter(c=>key(c.x,c.y)!==key(state.artPos.x,state.artPos.y));let obstacleCount=state.tutorial?3:6;for(let i=0;i<obstacleCount;i++){let idx=Math.floor(rand()*pool.length),c=pool.splice(idx,1)[0];if(!c)break;let t=i===0?'car':choose(['tree','wall','tree','car']);state.obstacles.set(key(c.x,c.y),t)}let lootCount=state.tutorial?2:3;for(let i=0;i<lootCount;i++){let idx=Math.floor(rand()*pool.length),c=pool.splice(idx,1)[0];if(!c)break;state.loot.set(key(c.x,c.y),i===0?'stash':choose(['stash','pack','pack']))}let types=['burn','electro','vortex','acid','silent','wander','mirror','gravity','glassfog','pulse','psi','mercury','meat','cold'];for(let i=0;i<state.cfg.anom;i++){let c=pool.splice(Math.floor(rand()*pool.length),1)[0];if(!c)break;let t=(rand()<.28?locations[state.loc].bias:choose(types));state.anoms.set(key(c.x,c.y),t)}if(state.mutation==='decoy'||rand()<.45){for(let i=0;i<2;i++){let c=pool.splice(Math.floor(rand()*pool.length),1)[0];if(c)state.decoys.push(c)}}}
function prepareTutorialField(){
  // Режисований перший рейд: безпечний коридор, близький артефакт і зрозумілі підказки.
  state.artPos={x:3,y:2};
  state.decoys=[];
  const clear=['0,0','1,0','1,1','2,1','3,1','3,2','2,2','1,2','0,1','0,2'];
  clear.forEach(k=>{state.anoms.delete(k);state.obstacles.delete(k);state.loot.delete(k);state.safe.add(k)});
  state.suspect.add('2,0');
  state.anoms.set('2,0','electro');
  state.loot.set('1,2','stash');
  state.bolts=Math.max(state.bolts,14);
  state.charge=Math.max(state.charge,12);
}
function applyMoodStart(){
  if(!state||state.tutorial)return;
  if(state.mood==='generous'){addMarkedLoot('stash','Настрій Зони щедрий: КПК позначив слабкий схрон.')}
  if(state.mood==='bright'){addSafeHint('Ясна Зона: КПК підсвітив одну безпечну клітину.')}
  if(state.mood==='hungry'){state.encounterCooldown=2;log('Голодна Зона швидше прислухається до твоїх кроків.')}
  if(state.mood==='blind'){state.charge=Math.max(1,state.charge-1);log('Глуха Зона глушить приймач. Заряд КПК -1, скануй обережніше.')}
}
function addObstacleAtFree(type){let c=chooseFreeCell();if(c){state.obstacles.set(c.k,type);return c}return null}
function applyLocationFlavor(){
  if(!state||state.tutorial)return;
  if(state.loc==='forest'){addObstacleAtFree('tree');addObstacleAtFree('tree');log('Рудий ліс густіший: сухі дерева ріжуть маршрут і ховають рух у траві.')}
  else if(state.loc==='blockpost'){addObstacleAtFree('car');addMarkedLoot('stash','Старий блокпост: КПК зачепив слабкий сигнал схрону біля металу.');log('Старий блокпост фонує металом: більше машин, більше спокуси обшукати.')}
  else if(state.loc==='swamp'){let c=chooseFreeCell();if(c)state.decoys.push({x:c.x,y:c.y});log('Затоплена низина бреше відбиттями: один хибний відгук уже гуляє по полю.')}
  else if(state.loc==='ravine'){addDangerHint('Покинутий яр дав короткий спалах унизу схилу. КПК позначив підозру.');log('Покинутий яр нервовий: спалахи тут трапляються ближче, ніж здається.')}
  else if(state.loc==='tunnel'){state.charge=Math.max(1,state.charge-1);addSafeHint('Підземний тунель глушить сигнал, але КПК знайшов тиху клітину.');log('Підземний тунель глушить приймач. -1 заряд КПК, зате є одна тиха підказка.')}
  else if(state.loc==='scrapyard'){addObstacleAtFree('car');addObstacleAtFree('car');addMarkedLoot('stash','Кладовище техніки: під одним капотом блимає старий схрон.');log('Кладовище техніки відбиває сигнал металом: більше машин, більше гравітаційних збоїв і шансів на лут.')}
  else if(state.loc==='oldlab'){addObstacleAtFree('wall');addObstacleAtFree('wall');addMarkedLoot('stash','Стара наукова станція: у шафі блимає лабораторний схрон.');addDangerHint('Лабораторний датчик зловив ртутний туман у сусідньому секторі.');log('Стара наукова станція дає укриття від викиду, але КПК тут частіше чує мертві записи.')}
}

function level(){let d=dist(state.pos,state.artPos);return d<=0?5:d===1?4:d<=3?3:d<=5?2:1}function direction(){let dx=state.artPos.x-state.pos.x,dy=state.artPos.y-state.pos.y;let trust=60+level()*7+(setup.gear.includes('detector')?10:0)-(state.mutation==='blind'?12:0);if(state.mood==='bright')trust+=8;if(state.mood==='blind')trust-=10;let near=[...state.anoms.keys()].some(k=>{let [x,y]=k.split(',').map(Number);return Math.abs(x-state.pos.x)+Math.abs(y-state.pos.y)<=1});if(near||state.mutation==='static')trust-=14;if(rand()>(trust/100)){dx+=Math.floor(rand()*3)-1;dy+=Math.floor(rand()*3)-1}let ns=dy<0?'північ':dy>0?'південь':'';let ew=dx<0?'захід':dx>0?'схід':'';let sx=dx<0?'←':dx>0?'→':'', sy=dy<0?'↑':dy>0?'↓':'';let arrow=(sy&&sx)?(dy<0&&dx>0?'↗':dy<0&&dx<0?'↖':dy>0&&dx>0?'↘':'↙'):(sy||sx||'●');return {txt:(ns&&ew)?ns+'-'+ew:(ns||ew||'тут'),arrow,trust:clamp(Math.round(trust),25,98)}}function previewDanger(){if(!FLAGS.danger)return 'Передчуття: тихо.';let around=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>key(state.pos.x+dx,state.pos.y+dy));let n=around.filter(k=>state.anoms.has(k)).length;return n===0?'Передчуття: тихо.':n===1?'Передчуття: повітря іноді тремтить.':'Передчуття: поруч кілька викривлень.'}

function tutorialCoachTip(){
  if(state.hasArtifact)return 'Навчання: чудово, артефакт у контейнері. Іди до ▣ або на будь-який край поля й натисни “Вийти з поля”.';
  if(state.stabilize>0)return 'Навчання: натискай “Стаб.”, доки не буде 3/3. Це фіксує артефакт у контейнері.';
  if(key(state.pos.x,state.pos.y)===key(state.artPos.x,state.artPos.y))return 'Навчання: ти на артефакті. Натисни “Стаб.”. Це головна дія після знахідки.';
  if(state.moves===0&&state.style.bolt===0&&!state.boltMode)return 'Навчання: спершу натисни “Болт”. Це не хід, а безпечна перевірка сусідньої клітини.';
  if(state.boltMode)return 'Навчання: тепер торкнися жовтої сусідньої клітини. Болт покаже, чи небезпечно туди йти.';
  if(state.moves===0&&state.style.bolt>0)return 'Навчання: добре. Тепер зроби перший крок стрілкою або тапом по сусідній безпечній клітині.';
  if(state.moves>0&&state.style.scan===0)return 'Навчання: тепер натисни “Скан -1⚡”. КПК підкаже, де повітря тремтить, а де можна йти.';
  let d=direction();return 'Навчання: рухайся за сигналом '+d.arrow+' '+d.txt+'. Якщо клітина сумнівна — кидай болт.';
}
function coachTip(){if(!state)return 'КПК очікує запуску рейду.';if(state.finished)return 'Рейд завершено. Перевір звіт КПК.';if(state.tutorial)return tutorialCoachTip();if(state.stabilize>0&&!state.hasArtifact)return 'Кульмінація: артефакт знайдено. Стабілізуй 3/3, не поспішай, слідкуй за радіацією.';if(state.hasArtifact)return 'Евакуація: вихід — це ▣ у старті або будь-який край поля. На краю з’явиться кнопка “Вийти з поля”. Тиск Зони росте.';if(state.rad>0&&setup.gear.includes('antirad')&&!state.usedGear.antirad)return 'Радіація росте. Натисни “Спорядж.” або “Антирад -2” у підказках, щоб знизити фон.';let lvl=level();if(state.bolts>0&&[...state.danger].some(k=>{let [x,y]=k.split(',').map(Number);return Math.abs(x-state.pos.x)+Math.abs(y-state.pos.y)===1}))return 'КПК: поруч підозріла клітина. Болт дешевший за кров.';if(lvl>=4)return 'Сигнал майже в руках. Перевір сусідні клітини болтом або сканом.';if(state.charge>0&&lvl<=2)return 'Сигнал слабкий. Скан допоможе не блукати навмання.';return 'КПК: рухайся за сигналом, але не довіряй Зоні повністю.'}
function renderCoach(){let p=$('#coachPanel');if(p)p.textContent=coachTip()}
function renderAtmosphere(){let p=$('#atmoPanel');if(!p||!state)return;let pressure=state.hasArtifact?'Тиск: '+pressureLevel()+'/5':'Тиск: спить';let clicks='';let n=clamp(state.rad+level(),1,9);for(let i=0;i<n;i++)clicks+='тр';let loc=locations[state.loc].label;let sense=state.sense||choose(locSenses[state.loc]||weatherLines);let radio=state.hasArtifact?'...контейнер фонить... швидше до виходу...':(state.moves%4===0?choose(radioBursts):(state.radio||'...шшш...'));p.innerHTML='<div class="atmoGrid"><div class="radioLine"><b>[КПК '+esc(VERSION)+']</b> '+esc(loc)+' · '+esc(state.weather||'тихо')+'<br><span>'+esc(radio)+'</span></div><div class="geiger">'+esc(clicks)+' · '+esc(pressure)+'</div><div class="locSense">'+esc(sense)+' · '+esc(mutations[state.mutation].label)+' · '+esc(state.hasArtifact?'артефакт у контейнері, повітря важчає':'детектор слухає поле')+'</div></div>'}
function pressureLevel(){if(!state||!state.hasArtifact)return 0;let start=state.escapeStart||state.moves;return clamp(Math.floor((state.moves-start)/2)+1,1,5)}
function showArtifactReveal(kind){let title=kind==='secured'?'Є! Артефакт у контейнері':'Артефакт знайдено';let vision=artifactVisions[state.artifact.name]||state.artifact.desc;let body=kind==='secured'?'Мить чистої радості: контейнер клацає, КПК видає світлий переможний тон, а темрява на секунду відступає. Є! Ти справді взяв його. Тепер винеси здобич до ▣ або на край поля — і цей рейд стане історією біля вогню.':'Сигнал зірвався у рівний писк. '+vision+'. Предмет поруч, але він нестабільний. Потрібна стабілізація 3/3.';let old=$('#artifactReveal');if(old)old.remove();let el=document.createElement('div');el.className='revealOverlay';el.id='artifactReveal';el.innerHTML='<div class="revealCard '+(kind==='secured'?'joy':'')+'"><div class="revealGlyph">✦</div><h2>'+esc(title)+'</h2><div class="artifactName">'+esc(state.artifact.name)+'</div><div class="revealMeter"><div></div></div><p>'+esc(body)+'</p><div class="small">'+esc(state.artifact.rare+' · '+state.artifact.set+' · '+state.artifact.desc)+'</div><button class="primary" id="closeRevealBtn">Продовжити рейд</button></div>';document.body.appendChild(el);bind($('#closeRevealBtn'),()=>el.remove());pulseScreen(kind==='secured'?'good':'warn');sound(kind==='secured'?'artifact':'item')}
function render(){renderCoach();renderAtmosphere();renderHud();renderSignal();renderBoard();renderSpecial();renderGear();renderLog();renderDockMode();renderActionGuide();renderActionFeedback()}
function renderDockMode(){let el=$('#dockMode'),btn=$('#boltBtn');if(!el||!state)return;if(state.boltMode){el.innerHTML='<span class="modeLine">Режим: БОЛТ · обери жовту клітину</span>';if(btn)btn.textContent='Болт: обери ◌';}else{el.textContent='Режим: рух · стрілки або тап по сусідній клітині';if(btn)btn.textContent='Болт ◌';}
  let scan=$('#scanBtn'),deep=$('#deepBtn'),anti=$('#antiDockBtn'),stab=$('#stabilizeBtn'),gear=$('#gearBtn');
  if(scan)scan.textContent='Скан -1⚡';
  if(deep)deep.textContent='Глиб. -2⚡';
  if(anti)anti.textContent=(setup.gear.includes('antirad')&&!state.usedGear.antirad)?'Антирад -2☢':'Антирад —';
  if(stab){if(state.hasArtifact)stab.textContent='Артефакт ✓';else if(state.artPos&&key(state.pos.x,state.pos.y)===key(state.artPos.x,state.artPos.y))stab.textContent='Стаб. '+state.stabilize+'/3';else stab.textContent='Стабілізувати';}
  if(gear)gear.textContent='Спорядж.';
}
function renderActionGuide(){let g=$('#actionGuide'),box=$('#actionExplain'),help=$('#helpActionsBtn');if(!g||!state)return;let msg='';
  if(state.boltMode)msg='<b>Болт активний:</b> торкнися жовтої сусідньої клітини. Це не крок, а перевірка без ризику наступити туди.';
  else if(state.stabilize>0&&!state.hasArtifact)msg='<b>Стабілізація:</b> натискай “Стаб.” на клітинці артефакту, доки не буде 3/3. Потім тікай до ▣ або на край поля.';
  else if(state.hasArtifact)msg='<b>Евакуація:</b> рухайся до ▣ або на будь-який край. На краю з’явиться “Вийти з поля”.';
  else if(state.rad>0&&setup.gear.includes('antirad')&&!state.usedGear.antirad)msg='<b>Радіація:</b> “Антирад -2☢” знижує фон на 2. Це одноразова дія, якщо антирад є у спорядженні.';
  else msg='<b>Дії:</b> рух — стрілки · Болт — безпечна перевірка · Скан — напрям і ризик · Антирад — коли ☢ росте · решта в “Спорядж.”.';
  g.innerHTML=msg;
  if(help){help.textContent=actionHelpOpen?'Сховати пояснення кнопок ▲':'Що роблять кнопки?';help.classList.toggle('activeHelp',!!actionHelpOpen);}
  if(box){box.classList.toggle('hidden',!actionHelpOpen);if(actionHelpOpen)box.innerHTML='<div class="mini"><b>Болт ◌</b>Витрачає 1 болт і перевіряє сусідню клітину. Якщо там аномалія — позначить небезпеку.</div><div class="mini"><b>Скан -1⚡</b>Витрачає 1 заряд КПК. Показує підозрілі або безпечні клітини поруч, але не гарантує 100% правду.</div><div class="mini"><b>Глиб. -2⚡</b>Дорожчий скан ширшої зони. Краще використовувати, коли сигнал слабкий або страшно йти навмання.</div><div class="mini"><b>Антирад -2☢</b>Знижує радіацію на 2. Працює тільки якщо антирад взято/отримано і ще не використано.</div><div class="mini"><b>Стабілізувати</b>Працює тільки на клітинці артефакту. Треба 3 натискання, потім починається евакуація.</div><div class="mini"><b>Спорядж.</b>Відкриває аптечку, контейнер, антирад. Це твоя кишеня, а не крок по полю.</div>';}
}function renderHud(){$('#hud').innerHTML=`<div class="stat"><b>${state.hp}</b><span>HP</span></div><div class="stat"><b>${state.rad}/${state.cfg.radMax}</b><span>радіація</span></div><div class="stat"><b>${state.bolts}</b><span>болти</span></div><div class="stat"><b>${state.charge}</b><span>заряд КПК</span></div>`}function signalTrend(lvl){let prev=state.lastSignalLevel;if(prev===null||prev===undefined){state.lastSignalLevel=lvl;return 'перший відгук'}let t=lvl>prev?'сильнішає':lvl<prev?'слабшає':'тримається';state.lastSignalLevel=lvl;return t}
function renderSignal(){let lvl=level(),d=direction(),trend=signalTrend(lvl);$('#bars').innerHTML=[1,2,3,4,5].map(i=>`<div class="bar ${i<=lvl?'on':''}"></div>`).join('');$('#core').className='core lvl'+lvl;$('#signalTitle').textContent='Сигнал: '+['мертвий','слабкий','нестабільний','теплий','пульсує','контакт'][lvl];$('#signalText').textContent=state.hasArtifact?'Артефакт у контейнері. Зона тисне на вихід.':'КПК ловить пульс: '+trend+'. Не точна мапа, а напрямок.';$('#directionText').innerHTML='Напрямок: <span class="signalArrow">'+esc(d.arrow)+'</span> '+esc(d.txt);$('#trustText').textContent='Довіра сигналу: '+d.trust+'%';$('#dangerText').textContent=previewDanger()}
function exitHintSet(){let s=new Set();if(!state||!state.hasArtifact)return s;let x=state.pos.x,y=state.pos.y,guard=0;while((x!==0||y!==0)&&guard++<14){let opts=[];if(x>0)opts.push([x-1,y]);if(y>0)opts.push([x,y-1]);if(x<SIZE-1)opts.push([x+1,y]);if(y<SIZE-1)opts.push([x,y+1]);opts=opts.filter(([a,b])=>!state.anoms.has(key(a,b))||state.safe.has(key(a,b))).sort((p,q)=>dist({x:p[0],y:p[1]},state.exit)-dist({x:q[0],y:q[1]},state.exit));if(!opts.length)break;[x,y]=opts[0];s.add(key(x,y));if(s.size>8)break;}return s}
function renderBoard(){let b=$('#board'),exitHints=exitHintSet();b.innerHTML='';for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){let k=key(x,y),c=document.createElement('div');c.className='cell';if(x===state.pos.x&&y===state.pos.y)c.classList.add('player');if(x===0&&y===0)c.classList.add('exit');if(state.visited.has(k))c.classList.add('visited');if(state.safe.has(k))c.classList.add('safe');if(state.suspect.has(k))c.classList.add('suspect');if(state.danger.has(k))c.classList.add('danger');if(state.marked.has(k))c.classList.add('marked');if(state.boltMode&&Math.abs(x-state.pos.x)+Math.abs(y-state.pos.y)===1)c.classList.add('boltTarget');if(state.tutorial&&!state.boltMode&&!state.hasArtifact&&!state.stabilize){let d=direction(); if((d.arrow==='→'&&x===state.pos.x+1&&y===state.pos.y)||(d.arrow==='↓'&&x===state.pos.x&&y===state.pos.y+1)||(d.arrow==='↘'&&((x===state.pos.x+1&&y===state.pos.y)||(x===state.pos.x&&y===state.pos.y+1))))c.classList.add('scriptStep');}if(FLAGS.route&&state.trail.includes(k))c.classList.add('trail');if(exitHints.has(k))c.classList.add('pathhint');if(state.emission&&(state.obstacles&&['car','wall'].includes(state.obstacles.get(k))||state.loot&&state.loot.has(k)||k==='0,0'))c.classList.add('shelter');if(state.flashKey===k)c.classList.add('flash');if(state.migrationHint===k)c.classList.add('migrationHint');if(state.obstacles&&state.obstacles.has(k)){let ot=state.obstacles.get(k);c.classList.add('obstacle',ot);if(state.searched&&state.searched.has(k))c.classList.add('searched')}if(state.loot&&state.loot.has(k)){let lt=state.loot.get(k);c.classList.add('loot',lt);if(state.searched&&state.searched.has(k))c.classList.add('searched')}if(state.anoms.has(k)&&state.marked.has(k))c.classList.add('anom');if(state.hasArtifact&&x===state.artPos.x&&y===state.artPos.y)c.classList.add('art');if(state.decoys.some(p=>p.x===x&&p.y===y)&&state.marked.has(k))c.classList.add('decoy');c.textContent=(x===state.pos.x&&y===state.pos.y)?'●':(x===0&&y===0?'▣':(state.obstacles&&state.obstacles.has(k)?obstacleInfo[state.obstacles.get(k)].icon:(state.loot&&state.loot.has(k)?lootInfo[state.loot.get(k)].icon:(state.anoms.has(k)&&state.marked.has(k)?anomInfo[state.anoms.get(k)].icon:(state.decoys.some(p=>p.x===x&&p.y===y)&&state.marked.has(k)?'✧':'')))));bind(c,()=>cellTap(x,y));b.appendChild(c)}}
function useAntirad(){if(!state)return;if(!setup.gear.includes('antirad'))return toast('Антираду немає у спорядженні');if(state.usedGear.antirad)return toast('Антирад уже використано');saveUndoSnapshot();state.usedGear.antirad=true;state.rad=Math.max(0,state.rad-2);log('Антирад збив фон. -2 радіації. Дихати стало легше.');render();sound('item')}
function renderSpecial(){let html='';if(state.emission)html+='<div class="emissionBox"><b>Викид:</b> до удару '+state.emission.count+' ход. Укриття '+(nearbyShelter()?'поруч':'не видно')+'. <button id="shelterBtn" class="warn">Сховатися</button></div>';if(state.wounds&&state.wounds.length)html+='<div>'+state.wounds.map(w=>'<span class="woundTag">'+esc(w)+'</span>').join('')+'</div>';if(state.stabilize>0&&!state.hasArtifact)html+=`<b>Стабілізація:</b> ${state.stabilize}/3<br><div class="exitGuide">Після 3/3 артефакт буде в контейнері. Далі евакуація: повернися до ▣ або стань на будь-який край поля.</div>`;if(state.hasArtifact){let p=pressureLevel();html+='<b>Евакуація:</b> не блукай. Вихід — ▣ або будь-який край поля. Тиск Зони: '+p+'/5<div class="pressure"><div class="pressureTrack"><div class="pressureFill" style="width:'+(p*20)+'%"></div></div></div><div class="miniMapHint">До стартового виходу ▣: '+dist(state.pos,state.exit)+' крок(и). Якщо стоїш на краю поля — можна завершити рейд кнопкою.</div>';if(onBorder())html+='<button id="exitFieldBtn" class="primary safeAction">Вийти з поля</button> ';}if(state.rad>0&&setup.gear.includes('antirad')&&!state.usedGear.antirad)html+='<div class="exitGuide"><b>Радіація:</b> фон можна знизити антирадом. Це спорядження одноразове.</div><button id="quickAntiBtn" class="warn">Антирад -2</button> ';if(FLAGS.undo)html+='<button id="undoBtn" class="ghost">Назад на крок</button> ';if(FLAGS.route)html+='<button id="beaconBtn" class="ghost">Аварійний маяк</button> ';if(FLAGS.events)html+='<button id="eventBtn" class="ghost">Викликати подію</button> ';if(FLAGS.soundtest)html+='<button id="soundTestBtn" class="ghost">Тест звуку</button>';html += '<div class="legendLine"><span>● ти</span><span>▣ стартовий вихід</span><span>край поля = евакуація після артефакту</span><span>? підозра</span><span>! небезпека</span><span>✦ артефакт</span><span>жовтий контур — ціль для болта</span><span>♣/▦ — непрохідно</span><span>▰ машина: лут + фон</span><span>▤/▥ схрон/рюкзак: випадковий лут</span><span>◫/⌾/░/✹/☊ — нові аномалії, якщо виявлені</span><span>☊ Пси-поле: може брехати текстом КПК поруч</span></div>';$('#specialPanel').innerHTML=html||'<span class="small">КПК чекає на дію.</span>';bind($('#undoBtn'),undo);bind($('#beaconBtn'),beacon);bind($('#eventBtn'),()=>zoneEvent(true));bind($('#exitFieldBtn'),exitField);bind($('#quickAntiBtn'),useAntirad);bind($('#soundTestBtn'),()=>['ready','scan','artifact','electro','vortex','psi','mutant','rain'].forEach((s,i)=>setTimeout(()=>sound(s),i*280)));bind($('#shelterBtn'),takeShelter)}
function renderGear(){let items=[];if(setup.gear.includes('med'))items.push(`<button id="useMed">Аптечка</button>`);if(setup.gear.includes('antirad'))items.push(`<button id="useAnti">Антирад</button>`);if(setup.gear.includes('container'))items.push(`<button id="useCont">Контейнер +1</button>`);$('#gearPanel').innerHTML=items.length?items.join(''):'<span class="small">Активного спорядження немає.</span>';bind($('#useMed'),()=>{if(state.usedGear.med)return toast('Вже використано');saveUndoSnapshot();state.usedGear.med=true;state.hp=clamp(state.hp+1,0,state.cfg.hp);log('Аптечка стягнула краї рани. +1 HP.');render();sound('item')});bind($('#useAnti'),useAntirad);bind($('#useCont'),()=>{if(state.usedGear.container)return toast('Вже використано');saveUndoSnapshot();state.usedGear.container=true;if(state.stabilize>0&&!state.hasArtifact){state.stabilize=Math.min(3,state.stabilize+1);log('Контейнер взяв частину нестабільності на себе.')}else toast('Контейнер знадобиться біля артефакту');render();sound('item')})}function renderLog(){let el=$('#log');if(!el)return;el.innerHTML=(state?.log||[]).map(l=>`<div class="logItem"><b>${esc(l.time)}</b> — ${esc(l.t)}</div>`).join('');el.scrollTop=0}
function searchLoot(k){let type=state.loot.get(k);if(!type||state.searched.has(k))return;state.searched.add(k);let roll=rand(),name=lootInfo[type].name;if(type==='stash'){if(roll<.28){state.rad=Math.max(0,state.rad-2);log(name+': знайдено антирад. Фон просів на -2.');sound('item');pulseScreen('good')}else if(roll<.54){state.bolts+=2;log(name+': у промасленій ганчірці лежали 2 болти.');sound('loot')}else if(roll<.76){state.charge+=2;log(name+': стара батарея ще жива. +2 заряд КПК.');sound('loot')}else{state.hp=clamp(state.hp+1,0,state.cfg.hp);log(name+': бинт і чиста вода. +1 HP.');sound('item')}}else{if(roll<.34){state.bolts++;log(name+': знайдено один кривий, але робочий болт.');sound('loot')}else if(roll<.58){state.charge++;log(name+': у кишені була напівжива батарейка. +1 заряд.');sound('loot')}else if(roll<.78){state.rad++;log(name+': чужа пастка клацнула пилом. +1 радіація.');sound('warn');pulseScreen('warn')}else{log(name+': порожньо. Тільки старий запах диму.');sound('miss')}}}
function cellTap(x,y){if(!state||state.finished)return;let near=Math.abs(x-state.pos.x)+Math.abs(y-state.pos.y)===1;if(state.boltMode){if(!near)return toast('Болт летить лише в сусідню клітину');throwBolt(x,y);return}if(near)move(x-state.pos.x,y-state.pos.y);else toast('Рух тільки в сусідню клітину')}function searchCar(k){if(state.searched.has(k))return toast('Машину вже обшукали');saveUndoSnapshot();state.searched.add(k);state.moves++;state.rad++;let roll=rand();if(roll<.42){let gain=1+Math.floor(rand()*2);state.bolts+=gain;log('Іржавий автомобіль фонить. +1 радіація, але в бардачку знайшлось '+gain+' болт(и).');sound('loot')}else if(roll<.64){state.charge++;log('Під сидінням стара батарея для КПК. +1 заряд, +1 радіація.');sound('loot')}else{log('Машина пуста. Лише пил, іржа і фон. +1 радіація.');sound('miss')}afterTurn();render()}function move(dx,dy){if(!state||state.finished||state.eventLock)return;let nx=state.pos.x+dx,ny=state.pos.y+dy;if(nx<0||ny<0||nx>=SIZE||ny>=SIZE){return state.hasArtifact?toast('Не йди за межу навмання: стань на край поля й натисни “Вийти з поля”.'):toast('За межу поля ще не можна — спершу знайди й стабілізуй артефакт')}let nk=key(nx,ny);if(state.obstacles&&state.obstacles.has(nk)){let ot=state.obstacles.get(nk);if(ot==='car')return searchCar(nk);log(obstacleInfo[ot].name+': шлях перекрито. Обійди або кинь болт в інший сектор.');toast('Непрохідно: '+obstacleInfo[ot].name);sound('miss');return}saveUndoSnapshot();state.pos={x:nx,y:ny};state.moves++;state.visited.add(key(nx,ny));state.safe.add(key(nx,ny));state.trail.push(key(nx,ny));state.trail=state.trail.slice(-22);if(state.loot&&state.loot.has(nk)&&!state.searched.has(nk))searchLoot(nk);resolveCell();afterTurn();render()}
function resolveCell(){let k=key(state.pos.x,state.pos.y);if(state.anoms.has(k)){hitAnomaly(k,state.anoms.get(k))}else if(state.decoys.some(p=>key(p.x,p.y)===k)&&!state.hasArtifact){state.decoys=state.decoys.filter(p=>key(p.x,p.y)!==k);state.rad++;log('Хибне світіння. У контейнер ледь не потрапила приманка Зони. +1 радіація.');sound('miss')}else if(k===key(state.artPos.x,state.artPos.y)&&!state.hasArtifact){if(state.stabilize===0){state.stabilize=1;log('Артефакт знайдено. Детектор співає: це той самий сигнал. Потрібна стабілізація 3/3.');showArtifactReveal('found')}}}
function hitAnomaly(k,t){state.marked.add(k);state.foundAnoms++;let name=anomInfo[t].name;state.style.damage++;sound(t);if(state.tutorial&&!state.usedGear.tutorialGuard){state.usedGear.tutorialGuard=true;state.marked.add(k);state.hp=Math.max(1,state.hp);state.pos={x:0,y:0};log('Навчальний запобіжник КПК: ти зачепив аномалію, але модуль повернув тебе до старту без смерті. Тепер використовуй болт перед сумнівним кроком.');pulseScreen('warn');return;}if(t==='burn'){let dmg=(FLAGS.perks&&setup.perk==='warm'&&!state.usedGear.warm)?0:1;state.usedGear.warm=true;state.hp-=dmg;log(name+' лизнула костюм. '+(dmg?'-1 HP.':'Перк пом’якшив опік.'))}else if(t==='electro'){state.hp--;state.charge=Math.max(0,state.charge-1);log(name+' клацнула по КПК. -1 HP, -1 заряд.')}else if(t==='vortex'){if(setup.gear.includes('rope')&&!state.usedGear.rope){state.usedGear.rope=true;log('Мотузка різко натягнулась і вирвала тебе з Воронки.')}else{state.hp--;state.pos={x:0,y:0};log(name+' скрутила простір. Тебе відкинуло до виходу. -1 HP.')}}else if(t==='acid'){state.rad++;log(name+' лишив липкий слід. +1 радіація.')}else if(t==='silent'){state.hp--;state.rad++;log('Тиха аномалія спрацювала без звуку. -1 HP, +1 радіація.')}else if(t==='mirror'){state.charge=Math.max(0,state.charge-1);state.suspect.add(key(Math.floor(rand()*SIZE),Math.floor(rand()*SIZE)));log('Дзеркало зламало відбиття КПК. -1 заряд, на мапі з’явилась сумнівна підказка.')}else if(t==='gravity'){state.hp--;state.bolts=Math.max(0,state.bolts-1);log('Гравітаційний шов притиснув до землі. -1 HP, один болт розчавило в кишені.')}else if(t==='glassfog'){state.rad++;state.lastSignalLevel=null;log('Скляний туман порізав сигнал на уламки. +1 радіація, напрямок детектора збився.')}else if(t==='pulse'){state.hp--;markDangerAround();log('Пульсар ударив короткою хвилею. -1 HP, сусідні викривлення стали помітнішими.')}else if(t==='psi'){state.charge=Math.max(0,state.charge-1);state.rad++;let fk=key(Math.floor(rand()*SIZE),Math.floor(rand()*SIZE));state.suspect.add(fk);log('Пси-поле торкнулося думок. -1 заряд КПК, +1 радіація, інтерфейс може показувати хибні повідомлення поруч.')}else{state.rad++;log('Блукаюча аномалія пройшла крізь маршрут. +1 радіація.')}}

function migrateArtifact(){
  if(!state||state.finished||state.tutorial||state.hasArtifact||!state.artifact||!state.artifact.migrates)return;
  if(state.moves<5||state.moves%4!==0||rand()>.24)return;
  let dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  let opts=dirs.map(([dx,dy])=>({x:state.artPos.x+dx,y:state.artPos.y+dy})).filter(c=>c.x>=0&&c.y>=0&&c.x<SIZE&&c.y<SIZE).filter(c=>{let k=key(c.x,c.y);return k!==key(0,0)&&k!==key(state.pos.x,state.pos.y)&&!state.anoms.has(k)&&!(state.obstacles&&state.obstacles.has(k))&&!(state.loot&&state.loot.has(k));});
  if(!opts.length)return;
  let old=key(state.artPos.x,state.artPos.y),n=choose(opts);state.artPos={x:n.x,y:n.y};state.migrationHint=old;state.lastSignalLevel=null;
  log('КПК пискнув: '+state.artifact.name+' змінив відгук. Здається, артефакт мігрував крізь місцевість. Старий сигнал тепер ненадійний.');
  sound('artifactMove');pulseScreen('warn');setTimeout(()=>{if(state&&!state.finished&&state.migrationHint===old){state.migrationHint=null;renderBoard()}},1100);
}

function afterTurn(){migrateArtifact();applyArtifactQuirk();psiPulse();maybeEmission();if(state.hasArtifact&&state.moves%4===0){state.rad++;log('Контейнер гуде. Тиск Зони піднімає фон. +1 радіація.')}if(state.hasArtifact&&state.moves%4===0){markDangerAround();log('КПК пищить коротко: поле позаду вже не таке саме.')}if(state.mutation==='dust'&&state.moves%7===0){state.rad++;log('Радіоактивний пил осів на рукави. +1 радіація.')}if(state.moves>0&&state.moves%4===0){state.radio=choose(radioBursts);log('Радіо крізь шум: '+state.radio)}if(state.moves>2&&rand()<.045){let fx=Math.floor(rand()*SIZE),fy=Math.floor(rand()*SIZE);state.flashKey=key(fx,fy);log('Десь збоку спалахнув аномальний удар — яскраво, коротко, без координат на карті. КПК не встиг поставити мітку.');pulseScreen('warn');sound('pulse');setTimeout(()=>{if(state&&!state.finished&&state.flashKey===key(fx,fy)){state.flashKey=null;renderBoard()}},950)}if(state.encounterCooldown>0)state.encounterCooldown--;if(FLAGS.events&&!state.tutorial&&state.moves>2&&state.encounters<2&&state.encounterCooldown<=0&&rand()<.125)zoneEncounter(false);if(FLAGS.events&&state.moves>0&&state.moves%5===0)zoneEvent(false);if(FLAGS.danger)markDangerAround();if(state.hp<=0&&!state.lastChance){state.lastChance=true;state.hp=1;state.rad++;log('Останній шанс КПК: аварійний стимулятор витягнув тебе з темряви. HP 1, +1 радіація.');pulseScreen('warn')}if(state.hp<=0)finish(false,'КПК втратив біосигнал.');else if(state.rad>=state.cfg.radMax)finish(false,'Радіаційний фон пробив межу.');else if(state.hasArtifact&&state.pos.x===0&&state.pos.y===0)finish(true,'Стартовий вихід ▣. Контейнер стукає в такт серцю.')}function markDangerAround(){[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{let x=state.pos.x+dx,y=state.pos.y+dy,k=key(x,y);if(x>=0&&y>=0&&x<SIZE&&y<SIZE&&state.anoms.has(k)&&rand()<.45)state.danger.add(k)})}
function throwBolt(x,y){saveUndoSnapshot();state.boltMode=false;state.style.bolt++;let k=key(x,y);if(state.firstBoltFree){state.firstBoltFree=false;log('Пісня Болта повернула перший болт у долоню.')}else state.bolts--;sound('shot');if(state.obstacles&&state.obstacles.has(k)){let ot=state.obstacles.get(k);log('Болт стукнув об перешкоду: '+obstacleInfo[ot].name+'. Клітина непрохідна.');state.marked.add(k);pulseScreen('warn')}else if(state.anoms.has(k)){state.marked.add(k);state.foundAnoms++;state.danger.delete(k);log('Болт зник у викривленні: '+anomInfo[state.anoms.get(k)].name+' виявлено.');sound(state.anoms.get(k));pulseScreen('warn')}else if(state.decoys.some(p=>key(p.x,p.y)===k)){state.marked.add(k);log('Болт дзенькнув об хибне світіння. Це не артефакт.');pulseScreen('warn')}else{state.safe.add(k);log('Болт упав сухо. Клітина здається безпечною.');pulseScreen('good')}if(state.bolts<0)state.bolts=0;afterTurn();render()}function boltMode(){if(state.bolts<=0)return toast('Болтів немає');state.boltMode=!state.boltMode;if(state.boltMode){toast('Болт-режим: торкнися жовтої сусідньої клітини. Це безпечніше за крок.')}else toast('Болт-режим вимкнено');render()}function scan(deep){if(state.charge<=0)return toast('Заряд КПК вичерпано');saveUndoSnapshot();state.charge-=deep?2:1;state.style.scan++;let radius=deep?2:1,found=0;for(let y=state.pos.y-radius;y<=state.pos.y+radius;y++)for(let x=state.pos.x-radius;x<=state.pos.x+radius;x++){if(x<0||y<0||x>=SIZE||y>=SIZE)continue;let k=key(x,y);if(state.anoms.has(k)&&rand()<(deep?.75:.45)){state.suspect.add(k);found++}else if(!state.anoms.has(k)&&rand()<.24)state.safe.add(k)}log((deep?'Глибокий скан':'Скан')+': '+(found?'є викривлення поруч.':'чисто, але КПК не клянеться.'));pulseScreen(found?'warn':'good');sound('scan');afterTurn();render()}
function risk(){saveUndoSnapshot();state.style.risk++;let r=rand();if(r<.36){state.moves++;log('Ризик спрацював: ти проскочив швидше.');pulseScreen('good')}else if(r<.68){state.rad++;log('Ризик залишив металевий присмак. +1 радіація.');pulseScreen('warn')}else{state.hp--;log('Ризик вкусив. -1 HP.');pulseScreen('bad')}afterTurn();render()}function stabilize(){if(state.hasArtifact)return toast('Артефакт уже в контейнері');if(key(state.pos.x,state.pos.y)!==key(state.artPos.x,state.artPos.y))return toast('Стабілізувати можна тільки біля артефакту');saveUndoSnapshot();state.stabilize++;state.moves++;sound('item');if(rand()<.16&&!setup.gear.includes('container')){state.rad++;log('Стабілізація дала відкат. +1 радіація.')}else log('Стабілізація '+state.stabilize+'/3. Сигнал піддається.');pulseScreen('good');if(state.stabilize>=3){state.hasArtifact=true;state.escapeStart=state.moves;state.marked.add(key(state.artPos.x,state.artPos.y));log('Є! Артефакт у контейнері. На секунду шум зникає, КПК видає чистий світлий сигнал: ти це зробив. Тепер винеси його до ▣ або на край поля.');showArtifactReveal('secured');recordDecision('виніс артефакт: '+state.artifact.name)}afterTurn();render()}
function undo(){if(!FLAGS.undo||!state.prev)return toast('Немає кроку назад');let snap=state.prev;restoreUndoSnapshot(snap);state.prev=null;log('КПК чесно відкотив попередню дію: позицію, карту, ресурси й наслідки.');render()}function beacon(){if(!FLAGS.route)return;let cur=key(state.pos.x,state.pos.y);let candidates=[...state.trail,...state.safe].filter((v,i,a)=>a.indexOf(v)===i).filter(k=>k!==cur).map(k=>k.split(',').map(Number)).filter(([x,y])=>state.safe.has(key(x,y))&&!state.anoms.has(key(x,y)));if(!candidates.length)return toast('Маяк не має безпечної точки для повернення');let best=candidates.sort((a,b)=>(Math.abs(a[0]-state.pos.x)+Math.abs(a[1]-state.pos.y))-(Math.abs(b[0]-state.pos.x)+Math.abs(b[1]-state.pos.y)))[0];saveUndoSnapshot();state.pos={x:best[0],y:best[1]};state.moves++;state.visited.add(key(best[0],best[1]));state.trail.push(key(best[0],best[1]));state.trail=state.trail.slice(-18);log('Аварійний маяк вивів до найближчої іншої безпечної позначки.');afterTurn();render()}

function eventChoiceOverlay(ev){state.eventLock=true;let ov=document.createElement('div');ov.className='eventOverlay';let buttons=ev.choices.map((c,i)=>`<button class="${i===0?'primary':''}" data-choice="${i}">${esc(c.label)}</button>`).join('');ov.innerHTML=`<div class="eventCard"><b>${esc(ev.t)}</b><div class="small">${esc(ev.d)}</div><div class="grid2" style="margin-top:10px">${buttons}</div></div>`;document.body.appendChild(ov);ov.querySelectorAll('[data-choice]').forEach(btn=>bind(btn,()=>{let c=ev.choices[Number(btn.dataset.choice)];try{c.fn&&c.fn()}catch(e){log('КПК захлинувся шумом події, але рейд триває.')}state.eventLock=false;state.encounterCooldown=4+Math.floor(rand()*3);state.encounters=(state.encounters||0)+1;ov.remove();render()}));sound(eventSound(ev))}
function zoneEncounter(manual){
  if(!FLAGS.events||state.eventLock||state.finished)return;
  if(!manual&&state.tutorial)return;
  const evt=[
    {t:'Сутичка з мутантом',d:'У траві щось рве землю кігтями. З туману вискакує низька швидка тінь.',choices:[
      {label:'Кинути болт убік',fn:()=>{if(state.bolts>0){state.bolts--;log('Болт дзенькнув об плиту. Мутант метнувся за звуком. -1 болт.');rememberRumor('У Рудому лісі знову чули сліпих псів. Болти відволікають їх краще за крик.')}else{state.hp--;log('Болтів немає. Тінь зачепила ногу. -1 HP.')}}},
      {label:'Завмерти',fn:()=>{if(rand()<.58){log('Ти завмер. Тінь пройшла за два кроки й не помітила тебе.')}else{state.rad++;log('Ти завмер надто довго. Повітря фонить. +1 радіація.')}}},
      {label:'Відступити',fn:()=>{state.moves++;log('Ти відступив на крок, але зберіг шкіру. +1 хід.')}},
      {label:'Прийняти сутичку',fn:()=>{if(rand()<.52){state.hp--;state.style.damage++;log('Мутант встиг вкусити. -1 HP.')}else{state.bolts++;log('Ти відбився й знайшов у траві чужий болт. +1 болт.');rememberRumor('Кажуть, один шукач відігнав мутанта голими руками й не збрехав.')}}}
    ]},
    {t:'Поранений шукач',d:'Біля плити лежить сталкер із тріснутою маскою. Він просить антирад або допомогу.',choices:[
      {label:'Дати антирад',fn:()=>{if(setup.gear.includes('antirad')&&!state.usedGear.antirad){state.usedGear.antirad=true;state.rad=Math.max(0,state.rad-1);log('Ти віддав антирад. Шукач прошепотів координати схрону. -1 радіація.');setNextHook('stash','Той, кого ти витягнув, лишив для тебе позначку схрону.')}else{log('Антираду немає. Шукач тільки кивнув на старий напрямок.');rememberRumor('У Зоні все одно пам’ятають тих, хто зупинився.')}}},
      {label:'Допомогти піднятися',fn:()=>{state.moves++;state.hp=clamp(state.hp+1,0,state.cfg.hp);log('Ти витратив час і допоміг йому відповзти. +1 HP, +1 хід.');setNextHook('medic','Врятований шукач передав через бармена: “На старті буде бинт”.')}},
      {label:'Обшукати мовчки',fn:()=>{state.bolts++;state.rad++;log('Ти знайшов болт, але КПК записав важку тишу. +1 болт, +1 радіація.');rememberRumor('Зона запам’ятовує руки, які беруть швидше, ніж допомагають.')}},
      {label:'Залишити',fn:()=>{log('Ти пішов далі. Радіо ще довго ловило слабке дихання.');rememberRumor('Біля старої плити хтось просив допомоги. Не всі повернули голову.')}}
    ]},
    {t:'Раптове повідомлення КПК',d:'Чужий канал рветься крізь шум: “Координати... якщо чуєш... не йди сам”.',choices:[
      {label:'Прийняти координати',fn:()=>{setNextHook('signal','Чужий сигнал лишив координати маяка на наступний рейд.');log('КПК зберіг координати. Наступний рейд може початися з міткою.')}},
      {label:'Заглушити канал',fn:()=>{log('Ти заглушив канал. Безпечніше, але тепер тиша здається навмисною.')}},
      {label:'Відповісти',fn:()=>{if(rand()<.5){state.charge++;log('У відповідь прийшов короткий пакет живлення. +1 заряд КПК.')}else{state.rad++;log('Ефір відповів твоїм голосом. +1 радіація.');rememberRumor('Хтось учора кликав тебе по імені, хоча ти не відповідав.')}}},
      {label:'Записати сигнал',fn:()=>{rememberRumor('У архіві лежить чужий сигнал. Він іноді повторюється без мережі.');log('Сигнал записано в архів чуток.')}}
    ]},
    {t:'Чужий схрон',d:'Під корінням сухого дерева блимає схрон. Поруч натягнута тонка дротина.',choices:[
      {label:'Обережно розібрати',fn:()=>{if(rand()<.68){state.bolts+=2;log('Ти розібрав схрон без шуму. +2 болти.')}else{state.hp--;log('Дротина смикнула стару пастку. -1 HP.')}}},
      {label:'Різко витягнути',fn:()=>{if(rand()<.45){state.charge++;log('У схроні була батарея. +1 заряд КПК.')}else{state.rad++;log('Схрон був гарячий. +1 радіація.')}}},
      {label:'Позначити й піти',fn:()=>{setNextHook('stash','Позначений схрон може з’явитися в наступному рейді.');log('КПК зберіг мітку схрону на потім.')}},
      {label:'Кинути болт',fn:()=>{if(state.bolts>0){state.bolts--;addDangerHint('Болт зачепив дротину. Пастку позначено. -1 болт.')}else log('Болтів немає. Схрон лишився неперевіреним.')}}
    ]},
    {t:'Запрошення в наступну пригоду',d:'Під час шуму КПК ловить фразу: “Якщо винесеш артефакт — приходь до старого автобуса”.',choices:[
      {label:'Зберегти координати',fn:()=>{setNextHook('bus','Біля старого автобуса сьогодні хтось палив вогонь.');log('Координати збережено. Наступний рейд може мати особливу мітку.')}},
      {label:'Стерти',fn:()=>{log('Запрошення стерто. Але шум на секунду повторив твоє ім’я.')}},
      {label:'Відповісти',fn:()=>{if(rand()<.55){state.bolts++;log('У відповідь прийшла коротка карта. +1 болт і зачіпка в чутках.');rememberRumor('Біля старого автобуса комусь відповіли. Тепер він чекає.')}else{state.rad++;log('Відповідь привернула щось у полі. +1 радіація.')}}},
      {label:'Передати Майстру',fn:()=>{rememberRumor('Сюжетна зачіпка для Майстра: старий автобус, чужий вогонь, обіцянка після артефакту.');log('КПК оформив сюжетну зачіпку для Польового Модуля.')}}
    ]},
    {t:'Аномальний дощ',d:'Над полем проходить чорний дощ. Краплі не лишають слідів, але лічильник починає співати частіше.',choices:[
      {label:'Перечекати',fn:()=>{state.moves+=2;if(rand()<.72){log('Ти перечекав під уламком бетону. +2 ходи, фон не піднявся.')}else{state.rad++;log('Дощ минув, але металевий присмак лишився. +2 ходи, +1 радіація.')}}},
      {label:'Йти далі',fn:()=>{if(rand()<.66){state.rad++;log('Ти пішов крізь чорний дощ. +1 радіація.')}else{state.rad+=2;log('Краплі чіплялися до спорядження. +2 радіація.');pulseScreen('warn')}}},
      {label:'Сканувати дощ',fn:()=>{if(state.charge>0){state.charge--;if(rand()<.62)addSafeHint('Скан дощу відкрив короткий безпечний напрям. -1 заряд КПК.');else log('Скан захлинувся шумом. -1 заряд КПК.')}else log('Заряду немає. КПК тільки шипить під чорним дощем.')}},
      {label:'Сховати контейнер',fn:()=>{if(state.hasArtifact){state.rad=Math.max(0,state.rad-1);log('Ти притис контейнер під плащем. Артефакт затих. -1 радіація.')}else log('Ти сховав спорядження й перечекав найгірші краплі.')}}
    ]},
    {t:'Поклик артефакту',d:'Детектор веде одразу в два боки. Наче артефакт кличе тебе двома голосами.',choices:[
      {label:'Іти за сильнішим сигналом',fn:()=>{if(rand()<.55){let c={x:clamp(state.pos.x+Math.sign(state.artPos.x-state.pos.x),0,SIZE-1),y:clamp(state.pos.y+Math.sign(state.artPos.y-state.pos.y),0,SIZE-1)};state.safe.add(key(c.x,c.y));state.marked.add(key(c.x,c.y));log('Сильніший сигнал дав напрям. КПК позначив клітину ближче до артефакту.')}else{let c=chooseFreeCell();if(c){state.decoys.push({x:c.x,y:c.y});state.marked.add(c.k)}state.rad++;log('Сигнал виявився хибним сяйвом. +1 радіація.');rememberRumor('Не довіряй першому голосу артефакту.')}}},
      {label:'Ігнорувати поклик',fn:()=>{log('Ти вимкнув зайві частоти. Повільніше, зате без чужого шепоту.')}},
      {label:'Сканувати двічі',fn:()=>{if(state.charge>0){state.charge--;state.suspect.add(key(state.artPos.x,state.artPos.y));log('Подвійний скан відсіяв хибний голос. -1 заряд.')}else log('КПК не має заряду для подвійного скану.')}},
      {label:'Кинути болт у напрямку',fn:()=>{if(state.bolts>0){state.bolts--;let c=chooseAdjacentFreeCell();if(c){state.safe.add(c.k);state.marked.add(c.k)}log('Болт перевірив напрямок поклику. -1 болт.')}else log('Болтів немає. Поклик лишився без перевірки.')}}
    ]},
    {t:'Слід іншого шукача',d:'На землі видно свіжі сліди. Хтось проходив тут недавно, а потім слід обірвався.',choices:[
      {label:'Піти слідом',fn:()=>{if(rand()<.52){addMarkedLoot('pack','Слід привів до покинутого рюкзака.');rememberRumor('Не всі сліди ведуть до живих, але деякі ведуть до рюкзаків.')}else{state.hp--;addDangerHint('Кінець сліду виявився поганим місцем. -1 HP.')}}},
      {label:'Позначити місце',fn:()=>{setNextHook('trailPack','Слід іншого шукача лишився в пам’яті КПК.');log('Координати занесено в архів.')}},
      {label:'Обійти',fn:()=>{log('Ти обійшов сліди. Зона не отримала приводу посміхнутися.')}},
      {label:'Кинути болт у кінець сліду',fn:()=>{if(state.bolts>0){state.bolts--;if(rand()<.6)addDangerHint('Болт провалився в тихе викривлення. -1 болт.');else log('Болт упав нормально. -1 болт.')}else log('Болтів немає. Слід лишається питанням.')}}
    ]},
    {t:'Торговець по рації',d:'КПК ловить старий канал: “Є антирад. Є батареї. Хто живий — відповідайте”.',choices:[
      {label:'Замовити антирад',fn:()=>{setNextHook('traderAntirad','Торговець по рації пообіцяв антирад на старті наступного рейду.');log('Замовлення прийнято. У наступному рейді може з’явитися антирад.')}},
      {label:'Замовити батарею',fn:()=>{setNextHook('traderBattery','Торговець по рації лишив батарею для твого КПК.');log('Батарею пообіцяно на наступний рейд.')}},
      {label:'Не відповідати',fn:()=>{log('Ти не відповів. Канал ще трохи шипів, наче чекав саме твій голос.')}},
      {label:'Назвати інший позивний',fn:()=>{if(rand()<.5){state.charge++;log('Фальшивий позивний спрацював. +1 заряд.')}else{state.rad++;log('Ефір повторив позивний твоїм голосом. +1 радіація.');rememberRumor('Учора по каналу питали чужий позивний, але відповідали твоїм голосом.')}}}
    ]},
    {t:'Місце загибелі',d:'КПК зловив уривок останнього запису: “Не повторюй мій шлях”.',choices:[
      {label:'Вшанувати',fn:()=>{addSafeHint('Старий КПК показав тихіший крок вперед.');rememberRumor('У Зоні навіть мертві іноді показують безпечнішу дорогу.')}},
      {label:'Обшукати',fn:()=>{let r=rand();if(r<.34){state.bolts+=2;log('У старому підсумку лишилися два болти. +2 болти.')}else if(r<.58){state.charge++;log('У КПК загиблого ще була батарея. +1 заряд.')}else if(r<.78){state.rad++;log('Пил на спорядженні був гарячий. +1 радіація.')}else{state.hp--;log('Стара пастка клацнула під пальцями. -1 HP.')}}},
      {label:'Стерти запис',fn:()=>{log('Ти стер останній запис. Шум став тихішим.')}},
      {label:'Занести в архів',fn:()=>{setNextHook('deadPath','Останній маршрут загиблого збережено.');rememberRumor('Не кожен маркер — попередження. Деякі — прохання.')}}
    ]}
  ];
  eventChoiceOverlay(choose(evt));
}
function zoneEvent(manual){if(!FLAGS.events||state.eventLock||state.finished)return;if(!manual&&state.tutorial)return;if(!manual&&rand()<.55)return zoneEncounter(false);let events=[{t:'Покинутий схрон',d:'Під мокрою плитою щось дзвенить. Пахне старою оливою і мокрою тканиною.',choices:[{label:'Взяти болти',fn:()=>{state.bolts+=2;log('У схроні знайшлись два болти і клаптик карти.')}},{label:'Не чіпати',fn:()=>{log('Ти залишив схрон. Іноді обережність — теж здобич.')}}]},{t:'Радіоперешкода',d:'КПК ловить чужий маяк. Голос обривається на слові “назад”.',choices:[{label:'Витратити заряд',fn:()=>{state.charge=Math.max(0,state.charge-1);state.safe.add(key(state.pos.x,state.pos.y));log('Калібрування стабілізувало карту.')}},{label:'Ігнорувати',fn:()=>{log('Ти не відповів ефіру. Шум іде далі без тебе.')}}]},{t:'Шепіт у траві',d:'Зона пропонує короткий шлях. Трава лягає в один бік, хоча вітру немає.',choices:[{label:'Ризикнути',fn:()=>{state.rad++;state.moves=Math.max(0,state.moves-2);log('Короткий шлях скоротив час, але лишив фон.')}},{label:'Стояти тихо',fn:()=>{log('Ти перечекав шепіт. Він пішов шукати когось нетерплячого.')}}]},{t:'Далекий постріл',d:'Десь за полем один раз сухо клацнуло. Потім — тиша.',choices:[{label:'Пригнутися',fn:()=>{state.danger.add(key(clamp(state.pos.x+1,0,SIZE-1),state.pos.y));log('Ти пригнувся. КПК позначив підозрілий сектор поруч.')}},{label:'Не зупинятись',fn:()=>{log('Ти не зупинився. Постріл був не для тебе. Мабуть.')}}]},{t:'Пакет із болтами',d:'На гілці висить старий мішечок. Хтось залишив його як попередження або подарунок.',choices:[{label:'Зняти обережно',fn:()=>{state.bolts++;state.rad++;log('У мішечку був болт, але тканина фонила. +1 болт, +1 радіація.')}},{label:'Пройти повз',fn:()=>{log('Ти не взяв мішечок. Він ще довго гойдався без вітру.')}}]}];eventChoiceOverlay(choose(events))}
function decisionReport(){if(!state||!state.decisions||!state.decisions.length)return '';return '<div class="debrief"><b>Журнал рішень</b><ul>'+state.decisions.slice(-6).map(d=>'<li>'+esc(d)+'</li>').join('')+'</ul></div>'}
function raidDebrief(){
  if(!state)return '';
  let tips=[];
  if(!state.win&&state.rad>=state.cfg.radMax)tips.push('☢ Основна причина провалу — критична радіація. Антирад краще використовувати при ☢ 3–4, а машини ▰ обшукувати тільки коли є запас.');
  if(!state.win&&state.hp<=0)tips.push('❤ Біосигнал зірвався. Перед темними клітинами кидай болт або роби скан, не йди в невідоме навмання.');
  if(state.style.bolt<3)tips.push('◌ Болтів використано мало. У Зоні болт — це дешевша ціна за помилку, ніж HP або радіація.');
  if(state.style.scan<2&&state.charge>0)tips.push('⚡ КПК майже не сканував поле. Скан не гарантує правду, але зменшує блукання.');
  if(state.moves>34)tips.push('⏱ Рейд затягнувся. Довгий шлях піднімає ризик подій, фону й тиску після артефакту.');
  if(state.win)tips.push('✓ Головне зроблено: артефакт винесено. Наступна ціль — менше радіації, менше ходів і чистіший вихід.');
  if(!tips.length)tips.push('КПК не бачить грубих помилок. Це був рівний рейд — тепер можна ризикувати тонше.');
  return '<div class="debrief"><b>Розбір КПК</b><ul>'+tips.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div>';
}
function finish(win,reason){if(state.finished)return;state.finished=true;state.win=win;log(reason);updateStore(win,reason);showResult(win,reason)}function contractBonus(){if(!state.win)return false;if(state.contract==='fast')return state.moves<25;if(state.contract==='clean')return state.rad<=1;if(state.contract==='map')return state.foundAnoms>=5;if(state.contract==='thrifty')return state.bolts>=3;return true}function styleName(){if(state.win&&state.rad<=1&&state.hp===state.cfg.hp)return'Чистий вихід';if(state.win&&state.moves<24)return'Мисливець за сигналом';if(state.style.risk>=3)return'Сміливець';if(state.style.bolt>=7)return'Болтомет';if(state.style.scan<=2&&state.win)return'Сліпий щасливчик';if(state.hp<=1&&state.win)return'Дитя Зони';if(state.style.damage===0&&state.win)return'Тихий провідник';return state.win?'Обережний сталкер':'Зона сильніша'}function lastWords(){return choose(['Сигнал був чистим. Занадто чистим.','Останній болт не впав. Він завис.','Контейнер знайшли порожнім. На кришці були сліди зсередини.','КПК зберіг тільки шум.'])}
function updateStore(win,reason){let st=loadStore();st.records=st.records||{};st.records.total=(st.records.total||0)+1;if(win){st.records.wins=(st.records.wins||0)+1;st.records.winStreak=(st.records.winStreak||0)+1;st.records.bestStreak=Math.max(st.records.bestStreak||0,st.records.winStreak);if(!st.records.bestMoves||state.moves<st.records.bestMoves)st.records.bestMoves=state.moves;st.collection=st.collection||{};let a=st.collection[state.artifact.name]||{count:0,bestMoves:null,desc:state.artifact.desc,set:state.artifact.set,rare:state.artifact.rare,research:0,power:state.artifact.power};a.count++;a.research=Math.min(3,(a.research||0)+1+(contractBonus()?1:0));a.bestMoves=a.bestMoves?Math.min(a.bestMoves,state.moves):state.moves;st.collection[state.artifact.name]=a}else{st.records.winStreak=0;st.losses=st.losses||[];st.losses.unshift({time:new Date().toLocaleString('uk-UA'),loc:locations[state.loc].label,reason,last:lastWords()});st.losses=st.losses.slice(0,12)}let nick=styleName();st.records.nicknames=st.records.nicknames||{};st.records.nicknames[nick]=(st.records.nicknames[nick]||0)+1;if(FLAGS.achievements){st.ach=st.ach||{};if(win&&!st.ach.firstWin)st.ach.firstWin='Перший винесений артефакт';if(state.rad===0&&win)st.ach.clean='Чистий вихід';if(state.moves<20&&win)st.ach.fast='Блискавичний рейд'}st.runs=st.runs||[];st.runs.unshift({time:new Date().toLocaleString('uk-UA'),win,loc:locations[state.loc].label,artifact:state.artifact.name,moves:state.moves,rad:state.rad,hp:state.hp,bolts:state.bolts,mutation:mutations[state.mutation].label,style:nick,reason});st.runs=st.runs.slice(0,30);saveStore(st);state.nick=nick}
function exportCard(){return `[ПОЛЬОВИЙ МОДУЛЬ · АНОМАЛЬНИЙ РЕЙД]\n\nСталкер: Лис\nЛокація: ${locations[state.loc].label}\nМутація Зони: ${mutations[state.mutation].label}\nАртефакт: ${state.artifact.name}\nСтан: ${state.win?'вижив':'не виніс артефакт'}\nХодів: ${state.moves}\nHP: ${state.hp}/${state.cfg.hp}\nРадіація: +${state.rad}\nБолти: ${state.bolts}\nВиявлено аномалій: ${state.foundAnoms}\nСтиль: ${state.nick||styleName()}\nКонтракт: ${contracts[state.contract].label}${contractBonus()?' · виконано':''}\nОцінка КПК: ${scoreRaid()} · ${ratingText(scoreRaid())}\nОстанній шанс: ${state.lastChance?'спрацював':'не знадобився'}\n\nЗапис КПК:\n“${state.win?'Зона не віддала артефакт. Вона просто дозволила його винести.':lastWords()}”`}
function scoreRaid(){let base=state.win?1000:260;let score=base+Math.max(0,45-state.moves)*14+state.bolts*18+state.foundAnoms*22-state.rad*70-(state.cfg.hp-state.hp)*55+(contractBonus()?180:0)+(state.lastChance?-120:0);return Math.max(0,Math.round(score))}function ratingText(score){if(score>=1250)return'Легендарний рейд';if(score>=950)return'Майстер Зони';if(score>=700)return'Сильний вихід';if(score>=420)return'Живий і з досвідом';return'Запис на межі'}function showResult(win,reason){$('#gamePanel').classList.add('hidden');$('#logPanel').classList.add('hidden');$('#resultPanel').classList.remove('hidden');let rep=exportCard(),score=scoreRaid(),rate=ratingText(score);$('#resultPanel').innerHTML='<div class="row"><b>'+(win?'Рейд завершено':'Рейд провалено')+'</b><span class="chip">'+esc(state.nick||styleName())+'</span></div><div class="small">'+esc(reason)+'</div><div class="artifactCard"><div class="artifactName">'+esc(state.artifact.name)+'</div><div class="small">'+esc(state.artifact.rare+' · '+state.artifact.set)+' · дослідження +'+(contractBonus()?2:1)+'</div><p class="small">'+esc(state.artifact.desc)+'</p></div><div class="scoreCard"><div class="scoreBig">'+score+'</div><b>'+esc(rate)+'</b><br><span class="small">оцінка рейду КПК</span></div><div class="codexCard"><b>Підсумок</b><br><span class="small">Ходи: '+state.moves+' · Радіація: '+state.rad+' · Болти: '+state.bolts+' · Мутація: '+esc(mutations[state.mutation].label)+' · Контракт: '+(contractBonus()?'виконано':'не виконано')+' · Останній шанс: '+(state.lastChance?'так':'ні')+'</span></div>'+raidDebrief()+'<textarea class="copyBox" id="copyText">'+esc(rep)+'</textarea><div class="grid2" style="margin-top:8px"><button class="primary" id="againBtn">Ще один швидкий рейд</button><button id="copyBtn">Скопіювати картку</button><button id="labAfterBtn">Лабораторія</button><button id="archiveAfterBtn">Архів</button><button id="toMenuBtn">Меню</button></div>';bind($('#againBtn'),()=>startQuick());bind($('#copyBtn'),()=>{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText($('#copyText').value);else $('#copyText').select();toast('Картку готово до копіювання')});bind($('#labAfterBtn'),showLab);bind($('#archiveAfterBtn'),showArchive);bind($('#toMenuBtn'),()=>location.reload())}
function showArchive(){let st=loadStore();hideAll();$('#archivePanel').classList.remove('hidden');let col=Object.entries(st.collection||{}),losses=st.losses||[],nicks=Object.entries(st.records?.nicknames||{}).sort((a,b)=>b[1]-a[1]);let setsHtml=sets.map(set=>{let have=col.filter(([_,v])=>v.set===set).length,total=artifacts.filter(a=>a.set===set).length;return `<div class="archiveItem"><b>${esc(set)}</b><br>${have}/${total} артефактів${have===total?' · комплект зібрано':''}</div>`}).join('');let ach=Object.values(st.ach||{}).map(a=>`<div class="archiveItem"><b>Досягнення:</b> ${esc(a)}</div>`).join('');$('#archivePanel').innerHTML='<div class="row"><b>Архів КПК</b><button id="closeArchiveBtn">Назад</button></div><div class="grid2" style="margin-top:8px"><div class="stat"><b>'+(st.records?.total||0)+'</b><span>рейдів</span></div><div class="stat"><b>'+(st.records?.wins||0)+'</b><span>перемог</span></div><div class="stat"><b>'+(st.records?.bestMoves||'—')+'</b><span>рекорд ходів</span></div><div class="stat"><b>'+(st.records?.bestStreak||0)+'</b><span>серія</span></div></div><div class="tabs"><button id="clearArchiveBtn" class="bad">Очистити архів</button></div>'+ach+'<b>Комплекти</b><div class="archiveList">'+setsHtml+'</div><br><b>Колекція</b><div class="archiveList">'+(col.length?col.map(([k,v])=>`<div class="archiveItem"><b>${esc(k)}</b><br>${esc(v.rare+' · '+v.set)} · досліджено ${v.research||0}/3<br>Знайдено: ${v.count} · найкраще: ${v.bestMoves} ходів<br>${esc(v.desc)}</div>`).join(''):'<div class="small">Колекція порожня.</div>')+'</div><br><b>Прізвиська</b><div class="archiveList">'+(nicks.length?nicks.map(([k,v])=>`<div class="archiveItem"><b>${esc(k)}</b> × ${v}</div>`).join(''):'<div class="small">Ще немає.</div>')+'</div><br><b>Чутки й наслідки</b><div class="archiveList">'+((st.dynamicRumors||[]).length?(st.dynamicRumors||[]).map(r=>`<div class="archiveItem"><b>${esc(r.time||'чутка')}</b><br>${esc(r.text)}</div>`).join(''):'<div class="small">Зона ще не повертала твої рішення чутками.</div>')+'</div><br><b>Архів втрат</b><div class="archiveList">'+(losses.length?losses.map(l=>`<div class="archiveItem"><b>${esc(l.loc)}</b><br>${esc(l.reason)}<br><i>${esc(l.last)}</i></div>`).join(''):'<div class="small">Зона ще не забирала записи.</div>')+'</div>';bind($('#closeArchiveBtn'),()=>location.reload());bind($('#clearArchiveBtn'),()=>{localStorage.removeItem(STORE);showArchive()})}
function showLab(){let st=loadStore();hideAll();$('#archivePanel').classList.remove('hidden');let col=Object.entries(st.collection||{});let perkHtml='';if(FLAGS.perks){perkHtml='<div class="small"><b>Польовий перк наступного рейду</b></div><div class="grid2">'+Object.entries(perks).map(([k,v])=>`<div class="choice ${setup.perk===k?'active':''}" data-perk="${k}"><div class="choice-title">${esc(v.label)}</div><div class="choice-desc">${esc(v.desc)}</div></div>`).join('')+'</div>'}$('#archivePanel').innerHTML='<div class="row"><b>Лабораторія КПК</b><button id="closeLabBtn">Назад</button></div><div class="small">Кожен винесений артефакт відкриває частину його природи. Виконаний контракт дає додатковий прогрес.</div>'+perkHtml+'<div class="archiveList" style="margin-top:10px">'+(col.length?col.map(([k,v])=>{let lvl=v.research||0,known=lvl>=3;return `<div class="archiveItem"><b>${esc(k)}</b> · ${lvl}/3<br>${esc(v.desc)}<br><span class="small">${known?'Властивість розкрита: '+esc(v.power||'невідомо'):'Властивість ще нестабільна. Потрібні нові рейди.'}</span></div>`}).join(''):'<div class="small">Лабораторія порожня. Спершу винеси артефакт.</div>')+'</div>';bind($('#closeLabBtn'),()=>{savePrefs();location.reload()});$$('[data-perk]').forEach(el=>bind(el,()=>{setup.perk=el.dataset.perk;savePrefs();toast('Перк збережено для наступного рейду');showLab()}))}
function startQuick(){rand=Math.random;setup={...setup,diff:'stalker',loc:choose(Object.keys(locations)),contract:'any',gear:['detector','bolts']};newState()}function startTutorial(){rand=Math.random;setup={...setup,diff:'rookie',loc:'ravine',contract:'any',gear:['detector','bolts','antirad','med'],compact:false};newState({tutorial:true,mutation:'calm'})}function startDaily(){let d=new Date(),seed=Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);rand=seeded(seed);setup.diff=choose(Object.keys(difficulties));setup.loc=choose(Object.keys(locations));setup.contract=choose(Object.keys(contracts));setup.gear=['detector','bolts'];let mut=choose(Object.keys(mutations));newState({seed,daily:true,mutation:mut})}function activateAudio(){ensureAudio();sound('ready');toast('Звук КПК активовано · mobile boost увімкнено');$('#modeBadge').textContent='КПК audio: '+(audioState.status||'running')}function showSelfCheck(){$('#selfCheckPanel').classList.remove('hidden');let box=$('#soundTests');if(box)box.innerHTML='<div class="small">Audio: '+esc(audioState.status)+' · last: '+esc(audioState.last)+' · mobile boost: '+(audioState.mobileBoost?'on':'off')+' · storage: '+(typeof localStorage==='undefined'?'ні':'так')+' · path hints: on · swipes: off · border exit: on · obstacles: on · loot: on · flashes: on · encounters: 10 story events · rumor consequences: on · next-run hooks: on · action clarity: on · tutorial 2.0: on · signal arrows: on · debrief: on · zone mood: on · sonic signatures V30: on · artifact carry V32: on · hidden decision types: on · non-predictive step senses: on · psi field false messages: on</div>'+['ready','scan','shot','artifact','artifactMove','electro','vortex','acid','glassfog','mirror','gravity','pulse','psi','mutant','wounded','rain','radio','loot'].map(s=>`<button data-sound="${s}">${s}</button>`).join('');$$('[data-sound]').forEach(b=>bind(b,()=>sound(b.dataset.sound)));sound('tab')}
function renderMenuRumor(){let el=$('#rumorText');if(!el)return;let st=loadStore();let dynamic=(st.dynamicRumors||[]).map(r=>r.text);let pending=st.nextHook?[('Зачіпка на наступний рейд: '+st.nextHook.text)]:[];el.textContent=choose([...pending,...dynamic,...menuRumors])}
function setupSwipe(){/* V22: свайпи вимкнено, щоб випадковий рух не вів у аномалію на телефоні. */}
function onBorder(){return state&&(state.pos.x===0||state.pos.y===0||state.pos.x===SIZE-1||state.pos.y===SIZE-1)}
function exitField(){if(!state||state.finished)return;if(!state.hasArtifact)return toast('Вийти можна після стабілізації артефакту');if(!onBorder())return toast('Для виходу стань на край поля або повернися до ▣');saveUndoSnapshot();state.moves++;finish(true,'Вихід за межу поля. Зона лишилась за спиною.')}
function setupUI(){initChoices();bind($('#quickBtn'),startQuick);bind($('#dailyBtn'),startDaily);bind($('#tutorialBtn'),startTutorial);bind($('#expeditionBtn'),()=>$('#expeditionOptions').classList.toggle('hidden'));bind($('#startBtn'),()=>{rand=Math.random;newState()});bind($('#compactBtn'),()=>{setup.compact=!setup.compact;savePrefs();$('#compactBtn').textContent='Компакт: '+(setup.compact?'увімк.':'вимк.')});bind($('#archiveBtn'),showArchive);bind($('#labBtn'),showLab);bind($('#audioBtn'),activateAudio);bind($('#selfCheckBtn'),showSelfCheck);bind($('#rumorBtn'),()=>{renderMenuRumor();sound('tab')});renderMenuRumor();renderMenuMood();bind($('#closeSelfCheckBtn'),()=>$('#selfCheckPanel').classList.add('hidden'));bind($('#rulesBtn'),()=>$('#rulesPanel').classList.remove('hidden'));bind($('#closeRulesBtn'),()=>$('#rulesPanel').classList.add('hidden'));bind($('#upBtn'),()=>move(0,-1));bind($('#downBtn'),()=>move(0,1));bind($('#leftBtn'),()=>move(-1,0));bind($('#rightBtn'),()=>move(1,0));bind($('#boltBtn'),boltMode);bind($('#scanBtn'),()=>scan(false));bind($('#antiDockBtn'),useAntirad);bind($('#deepBtn'),()=>scan(true));bind($('#riskBtn'),risk);bind($('#stabilizeBtn'),stabilize);bind($('#gearBtn'),()=>{$('#gearPanel').classList.toggle('hidden');toast('Спорядження: аптечка/антирад/контейнер. Це не крок по полю.');});bind($('#helpActionsBtn'),()=>{actionHelpOpen=!actionHelpOpen;renderActionGuide();toast(actionHelpOpen?'Пояснення кнопок відкрито під кнопкою.':'Пояснення кнопок сховано.');let d=$('#controlDock');if(d){d.classList.remove('clarityPulse');void d.offsetWidth;d.classList.add('clarityPulse')}sound('tab')});setupSwipe()}

/* ===================== V31 — LIVING ZONE CAMPAIGN PATCH =====================
   Великий шар гри: пам’ять Зони, 3-вихідні експедиції, характер артефактів,
   мутанти як події вибору, мапа страху й повний експорт для Польового Модуля.
============================================================================= */
locations.gravebus={label:'Мертвий автобус',note:'чутки, чужі КПК, схованки й небезпечні маршрути між іржавими корпусами',bias:'echo'};
locations.redorchard={label:'Червоний сад',note:'аномальна рослинність, сліди мутантів і нестабільні артефакти',bias:'thorn'};
anomInfo.echo={icon:'◉',name:'Відлуння'};
anomInfo.thorn={icon:'♧',name:'Колючий сад'};
anomInfo.lullaby={icon:'♬',name:'Колискова'};
artifacts.push(
  {name:'Сірий Ліхтар',rare:'уникальний',set:'Очі Зони',power:'іноді показує безпечну клітину після небезпеки, але гасне від жадібності',desc:'Маленький тьмяний вогник у склі. Світить не вперед, а назад — туди, де ти ледь не помер.',migrates:true,temper:'cautious'},
  {name:'Материнський Болт',rare:'дивний',set:'Пісні Болта',power:'може повернути витрачений болт, якщо гравець діє обережно',desc:'Важкий білий болт із дитячою подряпиною на різьбі. Він ніби не хоче губитися.',temper:'careful'},
  {name:'Порожня Ікона',rare:'небезпечний',set:'Серце Зони',power:'відганяє мутанта, але додає тривожні чутки після рейду',desc:'Пластина без зображення. На неї важко дивитися: здається, там мало б бути чиєсь обличчя.',migrates:true,temper:'dark'},
  {name:'Сльоза Провідника',rare:'цінний',set:'Очі Зони',power:'посилює евакуаційні підказки, якщо гравець допомагав іншим',desc:'Прозора крапля, всередині якої час від часу блимає крихітний вихід ▣.',temper:'merciful'}
);
const campaignRumors=[
  'Кажуть, Зона не злиться. Вона просто веде облік.',
  'Якщо тричі обшукати чуже — четвертий схрон обшукає тебе.',
  'Старі сталкери радять: якщо КПК став надто ввічливим — кинь болт.',
  'Мертвий автобус сьогодні блимає фарами, хоча акумулятора там немає.',
  'У Червоному саду артефакти не лежать. Вони чекають, коли ти моргнеш.',
  'Той, хто рятує інших, іноді знаходить мітки там, де їх не ставив.'
];
const fearToneInfo={
  quiet:{label:'тиха',msg:'Повітря тут рівне. Занадто рівне. КПК радить не поспішати.'},
  hiss:{label:'шипить',msg:'Під ногами сухо шипить трава. Це не небезпека, але натяк.'},
  dead:{label:'мертва',msg:'Крок прозвучав глухо, ніби земля під тобою порожня.'},
  warm:{label:'тепла',msg:'Рукавиці на секунду стали теплішими. Артефакт або аномалія поруч.'},
  metallic:{label:'металева',msg:'У роті з’явився смак старого заліза. Це місце щось пам’ятає.'}
};
function getZoneMind(){let st=loadStore();st.zoneMind=st.zoneMind||{greed:0,careful:0,mercy:0,cruel:0,scanner:0,edge:0,noise:0,expeditions:0};return st.zoneMind}
function saveZoneMind(mind){let st=loadStore();st.zoneMind=mind;saveStore(st)}
function rememberDecisionLong(text){let st=loadStore();st.longDecisions=st.longDecisions||[];st.longDecisions.unshift({time:new Date().toLocaleString('uk-UA'),text});st.longDecisions=st.longDecisions.slice(0,24);saveStore(st)}
function addCampaignRumor(text){rememberRumor(text);rememberDecisionLong('Чутка: '+text)}
function chooseMarkedSafeNear(){let dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];for(let [dx,dy] of dirs.sort(()=>rand()-.5)){let x=clamp(state.pos.x+dx,0,SIZE-1),y=clamp(state.pos.y+dy,0,SIZE-1),k=key(x,y);if(!state.anoms.has(k)&&!(state.obstacles&&state.obstacles.has(k))){state.safe.add(k);state.marked.add(k);return k}}return null}
function campaignIntroText(){let m=getZoneMind(),bits=[];if(m.greed>=3)bits.push('КПК тихо попереджає: у схронах стало більше пасток. Зона пам’ятає жадібні руки.');if(m.careful>=4)bits.push('Зона помітила твою обережність. Сигнали стали хитрішими, але іноді чеснішими.');if(m.mercy>=2)bits.push('У радіошумі мигнула дружня мітка. Хтось у Зоні пам’ятає твою допомогу.');if(m.cruel>=2)bits.push('Чутки біля багаття стали коротшими, коли називають твій позивний.');if(m.scanner>=4)bits.push('КПК занадто часто світив у темряву. Тепер темрява іноді світить у відповідь.');return bits}
function assignFearMap(){if(!state)return;state.fearTone=new Map();let tones=Object.keys(fearToneInfo);for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){let k=key(x,y);if(k==='0,0')continue;if(rand()<.46)state.fearTone.set(k,choose(tones));}}
function applyLivingZoneMemory(){if(!state||state.tutorial)return;assignFearMap();let m=getZoneMind();for(let line of campaignIntroText())log(line);if(m.mercy>=2&&rand()<.75){let k=chooseMarkedSafeNear();if(k)log('Пам’ять врятованих людей дала тиху мітку поруч. КПК позначив одну клітину як імовірно безпечну.')}if(m.greed>=3&&state.loot&&state.loot.size&&rand()<.8){state.lootTrap=true;log('У схронах сьогодні багато пилу й дроту. Обшук може бути небезпечнішим, ніж здається.')}if(m.careful>=4&&state.artifact&&rand()<.7){state.artifact.migrates=true;state.migrationPressure=2;log('Артефакт ніби відчув твою обережність і став неспокійнішим. Сигнал може зміститися.')}if(m.scanner>=4&&rand()<.7){state.psiStatic=true;log('КПК попереджає: після частих сканувань інтерфейс ловить зворотний шум. Частина підказок може бути нервовою.')}if(state.loc==='gravebus'){addCampaignRumor('Біля Мертвого автобуса хтось лишив новий слід на запітнілому склі.')}if(state.loc==='redorchard'){addCampaignRumor('У Червоному саду трава червоніє не від крові. Кажуть, вона просто слухає.')}}
function maybeToneMessage(){if(!state||!state.fearTone||state.finished)return;let k=key(state.pos.x,state.pos.y),tone=state.fearTone.get(k);if(tone&&rand()<.42){let info=fearToneInfo[tone];log('Відчуття клітини: '+info.label+'. '+info.msg)}}
function campaignArtifactQuirk(){if(!state||state.finished)return;let n=state.artifact&&state.artifact.name;if(!n)return;if(n==='Сірий Ліхтар'&&rand()<.08){let k=chooseMarkedSafeNear();if(k)log('Сірий Ліхтар моргнув і на мить показав безпечний відблиск.')}if(n==='Материнський Болт'&&state.style.bolt>0&&rand()<.06){state.bolts++;log('Материнський Болт тихо повернув одну металеву кісточку в підсумок. +1 болт.')}if(n==='Порожня Ікона'&&rand()<.05){state.encounterCooldown=Math.max(state.encounterCooldown,4);log('Порожня Ікона зробила траву тихішою. Мутанти сьогодні не хочуть дивитися в цей бік.')}if(n==='Сльоза Провідника'&&state.hasArtifact&&rand()<.09){state.pathHint=exitHintSet?exitHintSet():null;log('Сльоза Провідника потягнула погляд до виходу. Край поля здається ближчим.')}}
const _origNewStateV31=newState;
newState=function(opts={}){_origNewStateV31(opts);applyLivingZoneMemory();if(loadStore().campaignActive){state.campaign=loadStore().campaignActive;log('Експедиція '+state.campaign.stage+'/3: '+state.campaign.name+'. Рейд має значення для наступного виходу.')}render();};
const _origAfterTurnV31=afterTurn;
afterTurn=function(){_origAfterTurnV31();if(state&&!state.finished){campaignArtifactQuirk();if(state.psiStatic&&rand()<.06)log('КПК на мить показав чужу карту. Не довіряй кожному символу без болта.');}};
const _origMoveV31=move;
move=function(dx,dy){let ox=state&&state.pos?state.pos.x:null,oy=state&&state.pos?state.pos.y:null;_origMoveV31(dx,dy);if(state&&state.pos&&(state.pos.x!==ox||state.pos.y!==oy))maybeToneMessage();};
const _origSearchLootV31=typeof searchLoot==='function'?searchLoot:null;
if(_origSearchLootV31){searchLoot=function(k){let beforeRad=state.rad,beforeHp=state.hp;_origSearchLootV31(k);if(state&&state.lootTrap&&rand()<.22){state.rad++;log('Пастка в схроні спрацювала пізно: тонкий дріт зірвав пил із металу. +1 радіація.');recordDecision('жадібний обшук спровокував пастку');}if(state&&state.rad>beforeRad)recordDecision('обшукав ризиковий лут і підняв фон');if(state&&state.hp<beforeHp)recordDecision('постраждав під час обшуку');};}
const _origZoneEncounterV31=zoneEncounter;
zoneEncounter=function(manual){if(!state||state.eventLock||state.finished)return;if(!manual&&state.tutorial)return;if(!manual&&rand()<.45)return _origZoneEncounterV31(manual);let evts=[
 {t:'Сліпий пес у траві',d:'Трава попереду лягла колом. Щось низьке й голодне дихає за два кроки від тебе.',choices:[
  {label:'Кинути болт убік',fn:()=>{if(state.bolts>0){state.bolts--;state.encounterCooldown=5;log('Болт відскочив у кущі. Пес кинувся за звуком. -1 болт, шлях вільний.');recordDecision('відволік мутанта болтом')}else{state.hp--;log('Болтів немає. Пес рвонув по запаху. -1 HP.')}}},
  {label:'Завмерти',fn:()=>{if(rand()<.58){log('Ти завмер. Мутант принюхався й пішов не туди.')}else{state.rad++;log('Ти завмер занадто довго. Фон повільно заліз під комір. +1 радіація.')}}},
  {label:'Відступити',fn:()=>{state.moves++;log('Ти відступив на крок думкою, а не ногами: хід втрачено, зате без крові.')}},
  {label:'Прийняти сутичку',fn:()=>{if(rand()<.45){state.hp--;addWound('укус мутанта');log('Коротка сутичка в траві. -1 HP, рана: укус мутанта.')}else{state.bolts++;log('Мутант відступив, лишивши в пилюці чужий болт. +1 болт.')}recordDecision('зустрів мутанта в полі')}}]},
 {t:'Сірий провідник',d:'У тумані на секунду видно фігуру. Вона не кличе, тільки показує рукою вбік.',choices:[
  {label:'Піти за жестом',fn:()=>{if(rand()<.62){let k=chooseMarkedSafeNear();log('Жест вивів до тихішої клітини. КПК позначив безпечний відблиск.')}else{state.rad++;log('Фігура розсипалась пилом. +1 радіація.')}}},
  {label:'Не довіряти',fn:()=>{log('Ти не пішов за фігурою. У Зоні не кожен провідник живий.')}},
  {label:'Занести в архів',fn:()=>{rememberDecisionLong('Бачив сірого провідника у '+locations[state.loc].label);addCampaignRumor('Кажуть, сірий провідник показується тільки тим, хто вже раз повернувся.');log('Запис збережено. Чутка може повернутися пізніше.')}}]},
 {t:'Мертва рація',d:'Рація без батарей раптом говорить твоїм голосом: “Не бери те, що світиться двічі”.',choices:[
  {label:'Послухати',fn:()=>{state.suspect.add(key(state.artPos.x,state.artPos.y));log('КПК позначив справжній сигнал як підозрілий: не все, що кличе, безпечне.')}},
  {label:'Розбити рацію',fn:()=>{state.hp--;log('Пластик тріснув, але динамік вкусив струмом. -1 HP.');recordDecision('розбив мертву рацію')}},
  {label:'Взяти з собою',fn:()=>{setNextHook('deadRadio','Мертва рація лежить у рюкзаку й іноді говорить перед рейдом.');log('Рація піде з тобою у наступну історію.')}}]}
 ];eventChoiceOverlay(choose(evts));};
const _origZoneEventV31=zoneEvent;
zoneEvent=function(manual){if(!state||state.eventLock||state.finished)return;if(!manual&&state.tutorial)return;if(!manual&&rand()<.45)return _origZoneEventV31(manual);let evts=[
 {t:'Пам’ять Зони',d:'КПК показує фрагмент минулого рейду. Схоже, поле пам’ятає не маршрут, а рішення.',choices:[
  {label:'Прийняти спогад',fn:()=>{let k=chooseMarkedSafeNear();log('Спогад став міткою. Одна клітина поруч здається безпечнішою.');recordDecision('прийняв пам’ять Зони')}},
  {label:'Вимкнути КПК',fn:()=>{state.charge=Math.max(0,state.charge-1);log('Ти вимкнув екран на кілька секунд. -1 заряд, зате шум стих.')}},
  {label:'Записати для Майстра',fn:()=>{state.storyHook='Пам’ять Зони показала фрагмент минулого рейду — можна використати як сюжетну зачіпку.';log('Зачіпку додано в майбутній експорт Польового Модуля.')}}]},
 {t:'Старий знак сталкерів',d:'На бетоні видряпано три риски й коло. Це може бути попередженням, або жартом мертвих.',choices:[
  {label:'Довіритися знаку',fn:()=>{if(rand()<.55){addSafeHint('Старий знак справді показав обхід.');}else{state.rad++;log('Знак був старий, а поле — нове. +1 радіація.')}}},
  {label:'Перевірити болтом',fn:()=>{if(state.bolts>0){state.bolts--;addDangerHint('Болт перевірив старий знак. -1 болт.')}else log('Болтів немає для перевірки знаку.')}},
  {label:'Домалювати свій знак',fn:()=>{addCampaignRumor('Хтось бачив новий знак на бетоні й сперечався, чи це попередження, чи виклик.');recordDecision('лишив власний знак у Зоні');log('Тепер у Зоні є твоя мітка.')}}]}
 ];eventChoiceOverlay(choose(evts));};
const _origApplyArtifactQuirkV31=applyArtifactQuirk;
applyArtifactQuirk=function(){_origApplyArtifactQuirkV31();campaignArtifactQuirk();};
const _origUpdateStoreV31=updateStore;
updateStore=function(win,reason){_origUpdateStoreV31(win,reason);let st=loadStore();let m=st.zoneMind||{greed:0,careful:0,mercy:0,cruel:0,scanner:0,edge:0,noise:0,expeditions:0};let searched=state.searched?state.searched.size:0;if(searched>=3)m.greed++;if(state.style.bolt>=6)m.careful++;if((state.decisions||[]).join(' ').match(/врят|допом|дав антирад|вшанував/i))m.mercy++;if((state.decisions||[]).join(' ').match(/стер|обшукав мовчки|залишив/i))m.cruel++;if(state.style.scan>=5)m.scanner++;if(reason&&reason.includes('межу поля'))m.edge++;if(state.wounds&&state.wounds.length)m.noise++;if(st.campaignActive){st.campaignActive.stage++;if(st.campaignActive.stage>3){m.expeditions++;st.finishedExpeditions=st.finishedExpeditions||[];st.finishedExpeditions.unshift({time:new Date().toLocaleString('uk-UA'),name:st.campaignActive.name,result:win?'завершена':'зірвана',artifact:state.artifact.name});st.finishedExpeditions=st.finishedExpeditions.slice(0,8);st.campaignActive=null;addCampaignRumor('Три виходи завершились. Біля багаття вже сперечаються, чи це була експедиція, чи попередження.');}else{st.campaignActive.last=win?'попередній вихід успішний':'попередній вихід зірваний';}}
st.zoneMind=m;st.longDecisions=st.longDecisions||[];(state.decisions||[]).slice(-5).forEach(d=>st.longDecisions.unshift({time:new Date().toLocaleString('uk-UA'),text:d}));st.longDecisions=st.longDecisions.slice(0,24);saveStore(st);};
function startCampaignV31(){let st=loadStore();st.campaignActive={name:choose(['Три ночі біля Мертвого автобуса','Слід Ртутної Сльози','Маршрут без карти','Контракт тихого провідника']),stage:1,last:null};saveStore(st);rand=Math.random;setup={...setup,diff:'stalker',loc:choose(['gravebus','oldlab','redorchard','scrapyard']),contract:choose(Object.keys(contracts)),gear:['detector','bolts','antirad']};newState();log('Кампанія почалась: три виходи, один ланцюг наслідків. Після рейду наступний вихід пам’ятатиме цей.');render();}
const _origExportCardV31=exportCard;
exportCard=function(){let m=getZoneMind();let dec=(state.decisions||[]).slice(-6).map(x=>'• '+x).join('\n')||'• без помітних рішень';let wounds=(state.wounds||[]).join(', ')||'немає';let hook=state.storyHook||((loadStore().nextHook&&loadStore().nextHook.text)||'немає');return `[ПОЛЬОВИЙ МОДУЛЬ · АНОМАЛЬНИЙ РЕЙД V32]\n\nСталкер: Лис\nЛокація: ${locations[state.loc].label}\nМутація Зони: ${mutations[state.mutation].label}\nНастрій Зони: ${zoneMoods[state.mood].label}\nАртефакт: ${state.artifact.name}\nСтан: ${state.win?'артефакт винесено':'рейд зірвано'}\nХодів: ${state.moves}\nHP: ${state.hp}/${state.cfg.hp}\nРадіація: +${state.rad}\nБолти: ${state.bolts}\nВиявлено аномалій: ${state.foundAnoms}\nРани/наслідки: ${wounds}\nСтиль: ${state.nick||styleName()}\nКонтракт: ${contracts[state.contract].label}${contractBonus()?' · виконано':''}\nОцінка КПК: ${scoreRaid()} · ${ratingText(scoreRaid())}\n\nЖурнал рішень:\n${dec}\n\nПам’ять Зони:\nжадібність ${m.greed||0} · обережність ${m.careful||0} · милосердя ${m.mercy||0} · пси-шум ${m.scanner||0}\n\nСюжетна зачіпка для Майстра:\n${hook}\n\nРекомендація для Майстра:\n${state.win?'додати артефакт в інвентар, підняти радіацію на '+state.rad+', використати журнал рішень як наслідки сцени.':'дати сцену повернення/порятунку, залишити радіацію '+state.rad+' і одну чутку про цей провал.'}\n\nЗапис КПК:\n“${state.win?'Це був не просто вихід. Зона запам’ятала, як саме ти вижив.':lastWords()}”`};
const _origShowArchiveV31=showArchive;
showArchive=function(){_origShowArchiveV31();let st=loadStore();let panel=$('#archivePanel');if(panel){let m=st.zoneMind||{};let html='<br><b>Пам’ять Зони V31</b><div class="archiveList"><div class="archiveItem">Жадібність: '+(m.greed||0)+' · Обережність: '+(m.careful||0)+' · Милосердя: '+(m.mercy||0)+' · Темні рішення: '+(m.cruel||0)+' · Залежність від скану: '+(m.scanner||0)+'</div></div><br><b>Журнал довгих рішень</b><div class="archiveList">'+((st.longDecisions||[]).length?(st.longDecisions||[]).map(r=>'<div class="archiveItem"><b>'+esc(r.time||'запис')+'</b><br>'+esc(r.text)+'</div>').join(''):'<div class="small">Зона ще не накопичила достатньо пам’яті.</div>')+'</div>';panel.insertAdjacentHTML('beforeend',html);}};
const _origRenderMenuRumorV31=renderMenuRumor;
renderMenuRumor=function(){let el=$('#rumorText');if(!el)return;let st=loadStore();let dynamic=(st.dynamicRumors||[]).map(r=>r.text);let pending=st.nextHook?[('Зачіпка на наступний рейд: '+st.nextHook.text)]:[];let memory=[];let m=st.zoneMind||{};if(m.greed>=3)memory.push('Схронники кажуть: не всі ящики відкриваються назовні.');if(m.mercy>=2)memory.push('Хтось залишив для тебе сухий бинт і не підписався.');if(m.careful>=4)memory.push('Про тебе кажуть: той, хто спершу слухає болт, а потім ноги.');if(st.campaignActive)memory.push('Експедиція триває: '+st.campaignActive.name+', вихід '+st.campaignActive.stage+'/3.');el.textContent=choose([...pending,...memory,...dynamic,...campaignRumors,...menuRumors]);};
const _origSetupUIV31=setupUI;
setupUI=function(){_origSetupUIV31();let grid=document.querySelector('#setupPanel .grid2');if(grid&&!document.getElementById('campaignBtnV31')){let btn=document.createElement('button');btn.id='campaignBtnV31';btn.className='primary';btn.textContent='Кампанія 3 виходи';grid.appendChild(btn);bind(btn,startCampaignV31);}let hero=document.querySelector('.heroCall .small');if(hero)hero.textContent='V33 — Profiles & Balance Checkpoint: Зона пам’ятає стиль гри, рейди складаються в історію, артефакти мають характер, а експорт готовий для Польового Модуля.';renderMenuRumor();};



/* V33 — Profiles & Balance Checkpoint
   Design rules from table test:
   - Long-decision categories are hidden until the player actually creates that type of record.
   - Long consequences are not explained directly to the player; they surface only sometimes as rumors or future hooks.
   - Step messages are sensory, not predictions.
   - Some carried artifacts can be taken into the next raid and affect the stalker. */
const ARTIFACT_EFFECTS_V32={
 'Тепле Серце':{kind:'softBurn',known:'перший сильний жар слабшає',start:(s)=>{s.carriedFlags.softBurn=true}},
 'Скляне Око':{kind:'charge',known:'+1 заряд КПК на старті',start:(s)=>{s.charge+=1}},
 'Пісня Болта':{kind:'firstBolt',known:'перший болт може не витратитися',start:(s)=>{s.firstBoltFree=true}},
 'Медовий Камінь':{kind:'sweetRisk',known:'+1 HP на старті, але +1 фон',start:(s)=>{s.hp=clamp(s.hp+1,0,s.cfg.hp+1);s.rad+=1}},
 'Компас Мари':{kind:'mara',known:'іноді нервує під час евакуації',start:(s)=>{s.carriedFlags.mara=true}},
 'Легка Гільза':{kind:'bolts',known:'+1 болт на старті',start:(s)=>{s.bolts+=1}},
 'Чорна Іскра':{kind:'blackSpark',known:'більша напруга, іноді кращий сигнал',start:(s)=>{s.rad+=1;s.carriedFlags.blackSpark=true}},
 'Білий Болт':{kind:'whiteBolt',known:'іноді повертає болт після обережної перевірки',start:(s)=>{s.carriedFlags.whiteBolt=true}},
 'Вовчий Компас':{kind:'wolfCompass',known:'сильніше відчуває край поля після знахідки',start:(s)=>{s.carriedFlags.wolfCompass=true}},
 'Пилова Лілія':{kind:'dustLily',known:'один раз пом’якшує радіаційний пил',start:(s)=>{s.carriedFlags.dustLily=true}},
 'Сміх Електри':{kind:'sparkLaugh',known:'+1 заряд, але Електра звучить голосніше',start:(s)=>{s.charge+=1;s.carriedFlags.sparkLaugh=true}},
 'Котяче Око':{kind:'catEye',known:'іноді помічає короткий спалах Зони',start:(s)=>{s.carriedFlags.catEye=true}},
 'Ртутна Сльоза':{kind:'mercuryTear',known:'пом’якшує викид, але лишає холодний фон',start:(s)=>{s.carriedFlags.mercuryTear=true;s.rad+=1}},
 'Ключ Викиду':{kind:'emissionKey',known:'іноді раніше реагує на викид',start:(s)=>{s.carriedFlags.emissionKey=true}},
 'Тиха Монета':{kind:'quietCoin',known:'іноді глушить пси-шум',start:(s)=>{s.carriedFlags.quietCoin=true}},
 'Сірий Ліхтар':{kind:'grayLamp',known:'іноді дає м’який відблиск у темній місцевості',start:(s)=>{s.carriedFlags.grayLamp=true}},
 'Материнський Болт':{kind:'motherBolt',known:'болти поводяться трохи слухняніше',start:(s)=>{s.carriedFlags.motherBolt=true}},
 'Порожня Ікона':{kind:'emptyIcon',known:'робить деякі зустрічі тихішими, але холоднішими',start:(s)=>{s.carriedFlags.emptyIcon=true}},
 'Сльоза Провідника':{kind:'guideTear',known:'після артефакту іноді тягне до виходу',start:(s)=>{s.carriedFlags.guideTear=true}}
};
function getArtifactByNameV32(name){return artifacts.find(a=>a.name===name)||null}
function getCarriedArtifactNameV32(){let st=loadStore();return st.carriedArtifact||null}
function setCarriedArtifactV32(name){let st=loadStore();if(name)st.carriedArtifact=name;else delete st.carriedArtifact;saveStore(st)}
function carriedArtifactCardV32(){let name=getCarriedArtifactNameV32();if(!name)return '<div class="carriedBox"><b>Артефакт із собою:</b> немає<br><span class="small">У Лабораторії можна взяти один винесений артефакт у наступний рейд.</span></div>';let a=getArtifactByNameV32(name)||{};return '<div class="carriedBox"><b>Артефакт із собою:</b> '+esc(name)+'<br><span class="small">'+esc((a.rare||'артефакт')+' · '+(a.set||'Зона'))+'. Його вплив відчувається під час рейду, але не завжди передбачуваний.</span></div>'}
function applyCarriedArtifactV32(){if(!state)return;state.carriedArtifact=getCarriedArtifactNameV32();state.carriedFlags={};if(!state.carriedArtifact)return;let fx=ARTIFACT_EFFECTS_V32[state.carriedArtifact];if(fx&&fx.start)fx.start(state);log('У підсумку лежить '+state.carriedArtifact+'. КПК не обіцяє безпеки, але артефакт уже впливає на вихід.');}
function carriedArtifactPulseV32(){if(!state||state.finished||!state.carriedArtifact)return;let n=state.carriedArtifact, f=state.carriedFlags||{};
 if(f.whiteBolt&&state.style.bolt>0&&rand()<.055){state.bolts++;log('Білий Болт сухо клацнув у підсумку. Один болт ніби повернувся. +1 болт.');}
 if(f.dustLily&&state.rad>1&&!state.usedDustLily&&rand()<.045){state.usedDustLily=true;state.rad=Math.max(0,state.rad-1);log('Пилова Лілія потемніла і взяла частину фону на себе. -1 радіація.');}
 if(f.quietCoin&&state.psiStatic&&rand()<.055){state.psiStatic=false;log('Тиха Монета стала холодною. Пси-шум на якийсь час стих.');}
 if(f.catEye&&rand()<.045){state.flashKey=key(Math.floor(rand()*SIZE),Math.floor(rand()*SIZE));log('Котяче Око звузилось. Десь у полі коротко блиснув чужий відблиск.');setTimeout(()=>{if(state&&!state.finished){state.flashKey=null;renderBoard()}},900);}
 if((f.wolfCompass||f.guideTear)&&state.hasArtifact&&rand()<.055){log(n+' тихо потягнув ремінь підсумка вбік. Вихід не став ближчим, але рука сама стиснула карту.');}
 if(f.blackSpark&&rand()<.035){state.charge++;log('Чорна Іскра тріснула всередині контейнера. КПК ожив на один подих. +1 заряд.');}
 if(f.emptyIcon&&state.encounterCooldown<3&&rand()<.04){state.encounterCooldown=3;log('Порожня Ікона зробила навколишню траву беззвучною. Зустрічі на мить відступили.');}
}
function categorizeDecisionV32(text){let t=(text||'').toLowerCase();if(/врят|допом|антирад|милосер/.test(t))return 'Вчинки';if(/артефакт|схрон|кпк|знак|рація|болт|лут/.test(t))return 'Знахідки';if(/рана|укус|контузі|постраж|hp|викид/.test(t))return 'Травми';if(/борг|позначк|наступ|гачок|hook|провідник/.test(t))return 'Борги';if(/стер|обшукав мовчки|залишив|жадіб|темн|пастк/.test(t))return 'Темні сліди';if(/майстр|польов|сюжет|експорт|зачіпк/.test(t))return 'Зачіпки для Майстра';return 'Сліди рейду'}
function rememberDecisionTypedV32(text,cat){let st=loadStore();st.longDecisionTypes=st.longDecisionTypes||{};let c=cat||categorizeDecisionV32(text);st.longDecisionTypes[c]=st.longDecisionTypes[c]||[];st.longDecisionTypes[c].unshift({time:new Date().toLocaleString('uk-UA'),text});st.longDecisionTypes[c]=st.longDecisionTypes[c].slice(0,12);saveStore(st)}
const _origRecordDecisionV32=recordDecision;
recordDecision=function(text){if(!state)return;_origRecordDecisionV32(text);rememberDecisionTypedV32(text);/* не пишемо прямі майбутні наслідки в рейдовий інтерфейс */};
const _origRememberDecisionLongV32=typeof rememberDecisionLong==='function'?rememberDecisionLong:null;
if(_origRememberDecisionLongV32){rememberDecisionLong=function(text){_origRememberDecisionLongV32(text);rememberDecisionTypedV32(text);};}
function locStepLineV32(){let loc=state&&locations[state.loc]?state.loc:'ravine';let bank={
 ravine:['Глина пружно просіла під підошвою.','Зі схилу скотився камінець і зник у тумані.','Яр відповів кроку коротким глухим звуком.'],
 forest:['Руда трава торкнулась халяви й одразу завмерла.','Між деревами сухо тріснула гілка.','Пил на рукаві ледь помітно засвітився.'],
 blockpost:['Бетон під ногою віддав старим холодом.','Десь біля будки хитнувся іржавий шлагбаум.','Гільза під підошвою тихо хруснула.'],
 tunnel:['Луна повернула крок із запізненням.','Зі стелі впала крапля й розбилась без бризок.','Темрява попереду стала густішою на один подих.'],
 swamp:['Вода обійшла чобіт кругами, хоча ти стояв рівно.','Очерет шепнув і змовк.','Під ногою м’яко здригнулася мулка земля.'],
 scrapyard:['Метал під кузовами тихо дзвенить після твого кроку.','Іржа пахне мокрою батареєю.','У старому капоті щось клацнуло й стихло.'],
 psyfield:['На мить здалося, що крок зробив не ти.','КПК моргнув чужим рядком і повернувся до карти.','Тиша стала занадто близькою до вуха.'],
 oldlab:['Скло під підошвою хруснуло, наче хтось відповів із кімнати.','Старий датчик пискнув один раз і замовк.','У повітрі пахне спиртом, пилом і мокрим бетоном.'],
 gravebus:['Скло автобуса блиснуло там, де немає сонця.','Сидіння всередині скрипнули без пасажирів.','Під колесом сухо луснула стара трава.'],
 redorchard:['Червоне листя впало не вниз, а вбік.','Сад прошелестів так, ніби хтось рахував твої кроки.','Під корінням коротко ворухнулося тепло.']
 };return choose(bank[loc]||bank.ravine)}
function neutralToneLineV32(){let arr=['КПК записав крок без висновків.','Контур карти лишився стабільним.','Детектор не дав певної відповіді.','Рюкзак тихо сів на плече після руху.','Повітря попереду не стало зрозумілішим.'];return choose(arr)}
const _origMaybeToneMessageV32=maybeToneMessage;
maybeToneMessage=function(){if(!state||state.finished)return;if(rand()<.78){log('Крок: '+locStepLineV32()+' '+neutralToneLineV32());}else if(_origMaybeToneMessageV32){/* рідкісні відчуття лишаються атмосферними, але без прямого прогнозу */let k=key(state.pos.x,state.pos.y),tone=state.fearTone&&state.fearTone.get(k);let lines={quiet:'Тиша тут лежить рівним шаром.',hiss:'Трава під ногою сухо прошипіла.',dead:'Земля відповіла глухо, майже без відлуння.',warm:'Рукавиця на секунду стала теплішою.',metallic:'У роті з’явився присмак старого заліза.'};if(tone&&lines[tone])log('Крок: '+lines[tone]+' КПК не робить висновків.');}}
const _origInferNextV32=inferNext;
inferNext=function(t){if(/^Крок:/.test(t))return 'Далі: рішення за тобою. КПК не вгадує майбутнє — болт і скан лише зменшують невідомість.';return _origInferNextV32(t)};
const _origRenderActionFeedbackV32=renderActionFeedback;
renderActionFeedback=function(){let p=$('#lastActionPanel'); if(!p||!state)return;let d=state.actionDetail||{main:state.lastAction||'КПК очікує дію.',why:'КПК фіксує наслідок тільки поточної дії.',next:'Обери наступну дію без поспіху.'};p.className='lastActionPanel actionImpact '+esc(d.tone||'warn');p.innerHTML='<div class="impactTitle">'+esc(d.main)+'</div><div class="impactWhy">'+esc(d.why)+'</div><div class="impactNext">'+esc(d.next)+'</div>';};
const _origNewStateV32b=newState;
newState=function(opts={}){_origNewStateV32b(opts);applyCarriedArtifactV32();render();};
const _origAfterTurnV32b=afterTurn;
afterTurn=function(){_origAfterTurnV32b();if(state&&!state.finished)carriedArtifactPulseV32();};
const _origHitAnomalyV32=typeof hitAnomaly==='function'?hitAnomaly:null;
if(_origHitAnomalyV32){hitAnomaly=function(k,type){let beforeHp=state.hp,beforeRad=state.rad;if(state.carriedFlags&&state.carriedFlags.softBurn&&type==='burn'&&!state.usedSoftBurn){state.usedSoftBurn=true;state.hp=Math.min(state.cfg.hp,state.hp+1);log('Тепле Серце стисло жар у кулаці. Опік пройшов м’якше, ніж мав би.');} _origHitAnomalyV32(k,type); if(state.carriedFlags&&state.carriedFlags.mercuryTear&&state.emission&&state.rad>beforeRad&&rand()<.35){state.rad=Math.max(0,state.rad-1);log('Ртутна Сльоза взяла частину післяудару на себе. -1 радіація.');}};}
const _origUpdateStoreV32b=updateStore;
updateStore=function(win,reason){_origUpdateStoreV32b(win,reason);let st=loadStore();if(win&&state&&state.artifact){st.lastWonArtifact=state.artifact.name;if(!st.carriedArtifact){st.carriedArtifact=state.artifact.name;rememberRumor('Після виходу хтось сказав біля вогню: “Перший артефакт краще не продавати одразу. Він ще щось покаже.”');}}saveStore(st);};
function renderLongDecisionTypesV32(st){let types=st.longDecisionTypes||{};let order=['Вчинки','Знахідки','Травми','Борги','Темні сліди','Зачіпки для Майстра','Сліди рейду'];let parts=[];for(let cat of order){let list=types[cat]||[];if(!list.length)continue;parts.push('<div class="memoryCat"><b>'+esc(cat)+'</b><div class="archiveList">'+list.slice(0,8).map(r=>'<div class="archiveItem"><b>'+esc(r.time||'запис')+'</b><br>'+esc(r.text)+'</div>').join('')+'</div></div>')}return parts.join('')||'<div class="small">Типи записів відкриються тільки тоді, коли Зона накопичить відповідні вчинки.</div>'}
const _origShowArchiveV32b=showArchive;
showArchive=function(){_origShowArchiveV32b();let st=loadStore();let panel=$('#archivePanel');if(panel){panel.insertAdjacentHTML('beforeend','<br><b>Типи довгих рішень V32</b>'+renderLongDecisionTypesV32(st));}};
const _origShowLabV32b=showLab;
showLab=function(){let st=loadStore();hideAll();$('#archivePanel').classList.remove('hidden');let col=Object.entries(st.collection||{});let perkHtml='';if(FLAGS.perks){perkHtml='<div class="small"><b>Польовий перк наступного рейду</b></div><div class="grid2">'+Object.entries(perks).map(([k,v])=>`<div class="choice ${setup.perk===k?'active':''}" data-perk="${k}"><div class="choice-title">${esc(v.label)}</div><div class="choice-desc">${esc(v.desc)}</div></div>`).join('')+'</div>'}let carryName=st.carriedArtifact||'';let colHtml=col.length?col.map(([k,v])=>{let lvl=v.research||0,known=lvl>=3,fx=ARTIFACT_EFFECTS_V32[k];let carry=carryName===k;return `<div class="archiveItem"><b>${esc(k)}</b> · ${lvl}/3 ${carry?'· у підсумку':''}<br>${esc(v.desc)}<br><span class="small">${known?'Властивість розкрита: '+esc(v.power||fx?.known||'невідомо'):'Властивість ще нестабільна. Артефакт можна взяти, але його поведінка не повністю відома.'}</span><br><button class="artifactCarryBtn ${carry?'bad':'primary'}" data-carry="${esc(k)}">${carry?'Зняти з підсумка':'Взяти в наступний рейд'}</button></div>`}).join(''):'<div class="small">Лабораторія порожня. Спершу винеси артефакт.</div>';$('#archivePanel').innerHTML='<div class="row"><b>Лабораторія КПК</b><button id="closeLabBtn">Назад</button></div><div class="small">Тут можна взяти один винесений артефакт у наступний рейд. Його ефект не завжди повністю передбачуваний, особливо без дослідження.</div>'+carriedArtifactCardV32()+perkHtml+'<div class="archiveList" style="margin-top:10px">'+colHtml+'</div>';bind($('#closeLabBtn'),()=>{savePrefs();location.reload()});$$('[data-perk]').forEach(el=>bind(el,()=>{setup.perk=el.dataset.perk;savePrefs();toast('Перк збережено для наступного рейду');showLab()}));$$('[data-carry]').forEach(el=>bind(el,()=>{let name=el.dataset.carry;if(getCarriedArtifactNameV32()===name){setCarriedArtifactV32(null);toast('Артефакт знято з підсумка')}else{setCarriedArtifactV32(name);toast('Артефакт піде з тобою в наступний рейд')}showLab()}));};
const _origRenderMenuRumorV32b=renderMenuRumor;
renderMenuRumor=function(){_origRenderMenuRumorV32b();let st=loadStore();let el=$('#rumorText');if(el&&st.carriedArtifact&&rand()<.35){el.textContent='Біля вогню кажуть: “'+st.carriedArtifact+' не просто лежить у підсумку. Він слухає, куди ти ступаєш.”';}};
const _origSetupUIV32b=setupUI;
setupUI=function(){_origSetupUIV32b();let hero=document.querySelector('.heroCall .small');if(hero)hero.textContent='V32 — артефакти можна брати в наступний рейд, довгі рішення відкривають типи лише після накопичення, а кроки дають відчуття місцевості без передбачення майбутнього.';let setupPanel=$('#setupPanel');if(setupPanel&&!document.getElementById('carryMenuBoxV32')){let box=document.createElement('div');box.id='carryMenuBoxV32';box.innerHTML=carriedArtifactCardV32();setupPanel.appendChild(box);}};
const _origExportCardV32b=exportCard;
exportCard=function(){let base=_origExportCardV32b();let carried=state&&state.carriedArtifact?state.carriedArtifact:'немає';return base+'\n\nАртефакт із собою: '+carried+'\nПримітка КПК: довгі наслідки не розкриті повністю; частина повернеться тільки чутками або наступними рейдами.'};


// === V33 PROFILES, PROGRESS SAVE & BALANCE CHECKPOINT ===
const PROFILE_MASTER_STORE_V33='anomalyArtifactGameProfilesV33';
const PROFILE_DEFAULT_ID_V33='default';
function nowUaV33(){return new Date().toLocaleString('uk-UA')}
function slugV33(s){return String(s||'').toLowerCase().trim().replace(/[^a-zа-яіїєґ0-9]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,32)||('profile-'+Date.now())}
function loadProfilesV33(){try{let p=JSON.parse(localStorage.getItem(PROFILE_MASTER_STORE_V33)||'null');if(p&&p.profiles&&p.active)return p}catch(e){}let p={active:PROFILE_DEFAULT_ID_V33,profiles:{[PROFILE_DEFAULT_ID_V33]:{id:PROFILE_DEFAULT_ID_V33,name:'Сталкер',created:nowUaV33()}}};localStorage.setItem(PROFILE_MASTER_STORE_V33,JSON.stringify(p));return p}
function saveProfilesV33(p){try{localStorage.setItem(PROFILE_MASTER_STORE_V33,JSON.stringify(p))}catch(e){}}
function activeProfileIdV33(){let p=loadProfilesV33();return p.active||PROFILE_DEFAULT_ID_V33}
function profileStoreKeyV33(id){return STORE+'::profile::'+(id||activeProfileIdV33())}
function activeProfileNameV33(){let p=loadProfilesV33();return (p.profiles[p.active]&&p.profiles[p.active].name)||'Сталкер'}
function loadStore(){try{let id=activeProfileIdV33();let raw=localStorage.getItem(profileStoreKeyV33(id));let obj=raw?JSON.parse(raw):{};if(!raw&&id===PROFILE_DEFAULT_ID_V33){try{let old=JSON.parse(localStorage.getItem('anomalyArtifactGameV32')||'{}');if(old&&Object.keys(old).length){obj={...old,migratedFrom:'V32',migratedAt:nowUaV33()};localStorage.setItem(profileStoreKeyV33(id),JSON.stringify(obj));}}catch(e){}}return obj||{}}catch(e){return {}}}
function saveStore(o){try{localStorage.setItem(profileStoreKeyV33(),JSON.stringify(o||{}))}catch(e){}}
function createProfileV33(){let name=prompt('Позивний нового профілю:', 'Новий сталкер');if(!name)return;let p=loadProfilesV33(), id=slugV33(name);let base=id, i=2;while(p.profiles[id])id=base+'-'+(i++);p.profiles[id]={id,name:name.trim().slice(0,36),created:nowUaV33()};p.active=id;saveProfilesV33(p);toast('Профіль створено: '+p.profiles[id].name);renderProfilePanelV33();renderMenuRumor();}
function switchProfileV33(id){let p=loadProfilesV33();if(!p.profiles[id])return;p.active=id;saveProfilesV33(p);toast('Активний профіль: '+p.profiles[id].name);renderProfilePanelV33();renderMenuRumor();renderMenuMood();}
function deleteProfileV33(){let p=loadProfilesV33(), id=p.active;if(id===PROFILE_DEFAULT_ID_V33)return toast('Базовий профіль не видаляється');let name=p.profiles[id]?.name||id;if(!confirm('Видалити профіль "'+name+'" і його прогрес у цій грі?'))return;delete p.profiles[id];try{localStorage.removeItem(profileStoreKeyV33(id))}catch(e){}p.active=PROFILE_DEFAULT_ID_V33;saveProfilesV33(p);toast('Профіль видалено');renderProfilePanelV33();}
function renameProfileV33(){let p=loadProfilesV33(), id=p.active;let name=prompt('Новий позивний профілю:', p.profiles[id]?.name||'Сталкер');if(!name)return;p.profiles[id].name=name.trim().slice(0,36)||'Сталкер';saveProfilesV33(p);renderProfilePanelV33();}
function profileStatsV33(){let st=loadStore(), r=st.records||{};return 'рейдів '+(r.total||0)+' · перемог '+(r.wins||0)+' · артефактів '+Object.keys(st.collection||{}).length}
function hasActiveRunV33(){let st=loadStore();return !!(st.activeRun&&st.activeRun.version)}
function renderProfilePanelV33(){let setupPanel=$('#setupPanel');if(!setupPanel)return;let box=$('#profilePanelV33');if(!box){box=document.createElement('div');box.id='profilePanelV33';box.className='profilePanel';let hero=setupPanel.querySelector('.heroCall');(hero&&hero.parentNode?hero.parentNode:setupPanel).insertBefore(box, hero?hero.nextSibling:setupPanel.firstChild);}let p=loadProfilesV33(), ids=Object.keys(p.profiles);let chips=ids.map(id=>'<button class="profileChip '+(id===p.active?'active':'')+'" data-prof="'+esc(id)+'">'+esc(p.profiles[id].name)+'</button>').join('');box.innerHTML='<div class="row wrap"><div><b>Профіль сталкера: '+esc(activeProfileNameV33())+'</b><div class="small">'+esc(profileStatsV33())+'</div>'+(hasActiveRunV33()?'<span class="saveBadge">є збережений незавершений рейд</span>':'')+'</div></div><div class="profileList">'+chips+'</div><div class="profileActions"><button id="newProfileBtnV33">Новий профіль</button><button id="renameProfileBtnV33">Перейменувати</button><button id="deleteProfileBtnV33" class="bad">Видалити</button>'+(hasActiveRunV33()?'<button id="resumeRunBtnV33" class="primary">Продовжити рейд</button>':'<button id="resumeRunBtnV33" class="ghost">Немає рейду</button>')+'</div>';
  box.querySelectorAll('[data-prof]').forEach(el=>bind(el,()=>switchProfileV33(el.dataset.prof)));
  bind($('#newProfileBtnV33'),createProfileV33); bind($('#renameProfileBtnV33'),renameProfileV33); bind($('#deleteProfileBtnV33'),deleteProfileV33); bind($('#resumeRunBtnV33'),()=>resumeRunV33());
}
function serializeRunV33(){if(!state||state.finished)return null;let snap=serializeStateForUndo();return {...snap,version:VERSION,savedAt:nowUaV33(),setup:{diff:setup.diff,loc:setup.loc,contract:setup.contract,gear:[...setup.gear],compact:setup.compact,perk:setup.perk},cfg:{...state.cfg},loc:state.loc,contract:state.contract,mutation:state.mutation,mood:state.mood,daily:!!state.daily,tutorial:!!state.tutorial,tutorialStage:state.tutorialStage||0,lastSignalLevel:state.lastSignalLevel,exit:{...state.exit},artifact:{...state.artifact},weather:state.weather,radio:state.radio,sense:state.sense,carriedArtifact:state.carriedArtifact||null,carriedFlags:{...(state.carriedFlags||{})},usedDustLily:!!state.usedDustLily,usedSoftBurn:!!state.usedSoftBurn,psiStatic:!!state.psiStatic};}
function autoSaveRunV33(){try{if(!state||state.finished)return;let st=loadStore();st.activeRun=serializeRunV33();saveStore(st)}catch(e){}}
function clearActiveRunV33(){try{let st=loadStore();if(st.activeRun){delete st.activeRun;saveStore(st)}}catch(e){}}
function resumeRunV33(){let st=loadStore(), run=st.activeRun;if(!run)return toast('Немає незавершеного рейду');try{setup={...setup,...(run.setup||{})};rand=Math.random;state={cfg:run.cfg||{...difficulties[setup.diff]},loc:run.loc||setup.loc,contract:run.contract||setup.contract,mutation:run.mutation||'calm',mood:run.mood||todayMood(),daily:!!run.daily,tutorial:!!run.tutorial,tutorialStage:run.tutorialStage||0,lastSignalLevel:run.lastSignalLevel??null,pos:{x:0,y:0},prev:null,exit:run.exit||{x:0,y:0},artifact:run.artifact||choose(artifacts),artPos:null,decoys:[],obstacles:new Map(),loot:new Map(),searched:new Set(),flashKey:null,anoms:new Map(),visited:new Set(),safe:new Set(),suspect:new Set(),danger:new Set(),marked:new Set(),trail:[],log:[],hp:1,rad:0,bolts:0,charge:0,moves:0,foundAnoms:0,hasArtifact:false,stabilize:0,finished:false,boltMode:false,style:{risk:0,bolt:0,scan:0,damage:0},usedGear:{},eventLock:false,encounterCooldown:run.encounterCooldown||0,encounters:run.encounters||0,storyHook:run.storyHook||null,lastAction:run.lastAction||'КПК відновив рейд.',migrationHint:null,emission:null,sheltered:false,wounds:[],decisions:[],stress:0,actionDetail:null,escapeStart:null,firstBoltFree:false,lastChance:false,weather:run.weather||choose(weatherLines),radio:run.radio||choose(radioBursts),sense:run.sense||choose(locSenses[setup.loc]||weatherLines),carriedArtifact:run.carriedArtifact||null,carriedFlags:run.carriedFlags||{},usedDustLily:!!run.usedDustLily,usedSoftBurn:!!run.usedSoftBurn,psiStatic:!!run.psiStatic};restoreUndoSnapshot(run);state.cfg=run.cfg||state.cfg;state.loc=run.loc||state.loc;state.contract=run.contract||state.contract;state.mutation=run.mutation||state.mutation;state.mood=run.mood||state.mood;state.daily=!!run.daily;state.tutorial=!!run.tutorial;state.tutorialStage=run.tutorialStage||0;state.lastSignalLevel=run.lastSignalLevel??null;state.exit=run.exit||state.exit;state.artifact=run.artifact||state.artifact;state.weather=run.weather||state.weather;state.radio=run.radio||state.radio;state.sense=run.sense||state.sense;state.finished=false;hideAll();$('#gamePanel').classList.remove('hidden');$('#logPanel').classList.remove('hidden');log('КПК відновив збережений рейд профілю '+activeProfileNameV33()+'.');render();sound('ready')}catch(e){console.error(e);toast('Не вдалося відновити рейд')}}
function balanceNoteV33(){let st=loadStore();st.balanceCheckpoint={version:VERSION,time:nowUaV33(),changes:['Новачок м’якший: менше аномалій, більше болтів/заряду, вища межа радіації','Сталкер отримав трохи більше ресурсу, але лишився небезпечним','Події стали рідшими: максимум 2 за рейд замість 3','Міграція артефактів стала рідкішою і пізнішою','Після підбору артефакту радіація росте повільніше','Стабілізація без контейнера рідше дає відкат']};saveStore(st)}
const _origSetupUIV33=setupUI;
setupUI=function(){_origSetupUIV33();let hero=document.querySelector('.heroCall .small');if(hero)hero.textContent='V34 — Journal UX Cut: фінальна версія перед перевіркою, профілі, автосейв, експорт сейву, м’який баланс і ясний зворотний зв’язок після дій.';renderProfilePanelV33();balanceNoteV33();};
const _origRenderV33=render;
render=function(){_origRenderV33();autoSaveRunV33();};
const _origFinishV33=finish;
finish=function(win,reason){_origFinishV33(win,reason);clearActiveRunV33();};
const _origShowArchiveV33=showArchive;
showArchive=function(){_origShowArchiveV33();let st=loadStore();let panel=$('#archivePanel');if(panel){panel.insertAdjacentHTML('beforeend','<br><b>Профіль і збереження V35</b><div class="archiveList"><div class="archiveItem"><b>Активний профіль:</b> '+esc(activeProfileNameV33())+'<br>'+esc(profileStatsV33())+'<br><span class="small">Прогрес, колекція, чутки, довгі рішення й незавершений рейд зберігаються окремо для цього профілю.</span></div><div class="archiveItem"><b>Баланс-патч:</b><br>'+esc((st.balanceCheckpoint?.changes||[]).join(' · '))+'</div></div>');}}
const _origExportCardV33=exportCard;
exportCard=function(){let base=_origExportCardV33();return base+'\nПрофіль: '+activeProfileNameV33()+'\nБаланс: V34 final playtest calibration.';};


// === V34 FINAL PLAYTEST CUT PATCH ===
// Мета: не роздувати гру, а підготувати її до живого тесту на телефоні.
const V34_PATCH_NOTE = 'V34 — Journal UX Cut: фінальна підготовка до перевірки, м’якший баланс, сейв-профілі, експорт/імпорт прогресу, ясніша остання дія.';

// Точковий баланс перед тестом: менше фрустрації без перетворення Зони на прогулянку.
try{
  difficulties.rookie = {...difficulties.rookie, hp:6, bolts:15, charge:14, anom:6, radMax:8};
  difficulties.stalker = {...difficulties.stalker, hp:5, bolts:12, charge:12, anom:9, radMax:6};
  difficulties.veteran = {...difficulties.veteran, bolts:9, charge:10, radMax:5};
}catch(e){}

// Менше “передбачень”, більше чесного зворотного зв’язку після дії.
inferNext = function(t){
  if(state&&state.hasArtifact)return 'Доступно: рухайся до ▣ або стань на край поля й натисни “Вийти з поля”.';
  if(state&&state.emission&&state.emission.count>0)return 'Доступно: шукати укриття, сховатися, рухатися або ризикнути продовженням маршруту.';
  if(t.includes('радіа')&&state&&setup.gear.includes('antirad')&&!state.usedGear.antirad)return 'Доступно: продовжити маршрут або використати “Антирад -2☢”, якщо фон уже заважає.';
  if(t.includes('Болт'))return 'Доступно: крок у перевірений сектор, скан або інший болт. Болт не рухає тебе по полю.';
  if(t.includes('Скан'))return 'Доступно: обрати напрям за сигналом, кинути болт або зробити обережний крок.';
  if(t.includes('аномал')||t.includes('викривл')||t.includes('небезпеч'))return 'Доступно: обійти, сканувати або шукати інший маршрут. Це не точне пророцтво, а реакція КПК.';
  return 'Доступно: рух, болт, скан або спорядження. КПК показує наслідок, але не знає майбутнього напевно.';
};

const STEP_SENSES_V34={
  ravine:['Підошва з’їхала по сухій глині. Десь нижче осипався камінь.','У повітрі пил і холодний запах яру. КПК ловить короткий відгук між схилами.'],
  forest:['Трава торкнулась берця і завмерла. Дерева стоять занадто рівно.','Під ногою хруснула тонка гілка. У лісі звук не пішов далеко.'],
  blockpost:['Підошва зачепила гільзу. Метал коротко клацнув об бетон.','Старий бетон віддає холодом. КПК на мить почув чужий канал.'],
  tunnel:['Крок повернувся луною. Тунель ніби повторив його із запізненням.','Під ногами мокрий бетон. Світло КПК ковзає по стіні й губиться.'],
  swamp:['Вода хлюпнула під тканиною. Болота тут не люблять різких рухів.','Мокра трава липне до взуття. Фон повзе повільно, але вперто.'],
  scrapyard:['Метал під ногами тихо дзенькнув. Десь у кузові щось відповіло.','Пахне іржею й старим бензином. КПК ловить відбитий сигнал.'],
  psyfield:['На секунду стало тихо навіть у голові. Потім шум повернувся.','КПК показав зайвий символ і тут же стер його. Пси-пляма не любить прямі запитання.'],
  oldlab:['Старий датчик під плиткою клацнув і замовк.','Пахне пилом, озоном і закритими дверима. Станція ще щось рахує.'],
  gravebus:['Під колесом старого автобуса посипалась земля. Скло в рамі тихо тремтить.','У салоні автобуса ніби хтось пересів, хоча там порожньо.'],
  redorchard:['Червоне листя лежить так щільно, ніби його поклали рукою.','Гілки над головою скрипнули без вітру. Сад слухає.']
};
function stepSenseV34(){let arr=STEP_SENSES_V34[state?.loc]||['Крок коротко відгукнувся в полі. Зона не пояснює, чи це добре.'];return choose(arr)}

const _origMoveV34 = move;
move = function(dx,dy){
  if(!state)return _origMoveV34(dx,dy);
  let before = key(state.pos.x,state.pos.y), beforeMoves=state.moves;
  _origMoveV34(dx,dy);
  if(state&&!state.finished&&key(state.pos.x,state.pos.y)!==before&&state.moves>beforeMoves){
    state.lastStepSense = stepSenseV34();
    renderActionFeedback();
  }
};

const _origRenderActionFeedbackV34 = renderActionFeedback;
renderActionFeedback = function(){
  _origRenderActionFeedbackV34();
  let p=$('#lastActionPanel');
  if(p&&state&&state.lastStepSense){
    let old=p.querySelector('.stepSense'); if(old)old.remove();
    p.insertAdjacentHTML('beforeend','<div class="stepSense"><b>Відчуття місцевості:</b> '+esc(state.lastStepSense)+'</div>');
  }
};

// М’якша частота “випадковості” у перші ходи, щоб гравець не отримував хаос до розуміння інтерфейсу.
const _origAfterTurnV34 = afterTurn;
afterTurn = function(){
  if(state && state.moves < 4){
    let oldRand=rand;
    rand=function(){return Math.max(oldRand(),0.88)};
    try{_origAfterTurnV34();}finally{rand=oldRand;}
  }else _origAfterTurnV34();
};

// Експорт / імпорт сейву профілів у межах localStorage. Корисно перед реальним тестом і зміною браузера.
function exportSaveV34(){
  let data={version:VERSION, exportedAt:new Date().toISOString(), master:null, profiles:{}};
  try{
    data.master=JSON.parse(localStorage.getItem(PROFILE_MASTER_STORE_V33)||'{}');
    let ids=Object.keys(data.master.profiles||{});
    ids.forEach(id=>{data.profiles[id]=JSON.parse(localStorage.getItem(profileStoreKeyV33(id))||'{}')});
  }catch(e){data.error=String(e)}
  let txt=JSON.stringify(data,null,2);
  let box=$('#saveBackupBoxV34');
  if(box){box.classList.remove('hidden'); let ta=$('#saveBackupTextV34'); if(ta)ta.value=txt;}
  if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>toast('Сейв скопійовано в буфер')).catch(()=>toast('Сейв показано в полі нижче'));
  else toast('Сейв показано в полі нижче');
}
function importSaveV34(){
  let ta=$('#saveBackupTextV34');
  let txt=(ta&&ta.value.trim())||prompt('Встав JSON сейву:','');
  if(!txt)return;
  try{
    let data=JSON.parse(txt);
    if(!data.master||!data.profiles)throw new Error('не схоже на сейв V34');
    localStorage.setItem(PROFILE_MASTER_STORE_V33, JSON.stringify(data.master));
    Object.keys(data.profiles).forEach(id=>localStorage.setItem(profileStoreKeyV33(id), JSON.stringify(data.profiles[id]||{})));
    toast('Сейв імпортовано. Перезавантажую КПК...');
    setTimeout(()=>location.reload(),650);
  }catch(e){toast('Не вдалося імпортувати сейв: '+e.message)}
}
function resetActiveRunV34(){
  if(!confirm('Прибрати тільки незавершений рейд активного профілю? Прогрес і колекція лишаться.'))return;
  clearActiveRunV33(); renderProfilePanelV33(); toast('Незавершений рейд прибрано');
}

const _origRenderProfilePanelV34 = renderProfilePanelV33;
renderProfilePanelV33 = function(){
  _origRenderProfilePanelV34();
  let box=$('#profilePanelV33'); if(!box)return;
  if(!$('#backupProfileBtnV34')){
    box.insertAdjacentHTML('beforeend','<div class="profileBackup"><div class="grid2"><button id="backupProfileBtnV34">Експорт сейву</button><button id="importProfileBtnV34">Імпорт сейву</button><button id="clearRunBtnV34" class="ghost">Скинути незавершений рейд</button></div><div id="saveBackupBoxV34" class="hidden"><textarea id="saveBackupTextV34" class="backupArea" placeholder="Тут буде JSON сейву або сюди можна вставити сейв для імпорту"></textarea><div class="smallFinalNote">Експорт/імпорт працює локально через браузер. Це страховка перед тестом на телефоні або зміною Safari/Chrome/Telegram.</div></div></div>');
  }
  bind($('#backupProfileBtnV34'),exportSaveV34);
  bind($('#importProfileBtnV34'),()=>{let b=$('#saveBackupBoxV34'); if(b)b.classList.remove('hidden'); importSaveV34();});
  bind($('#clearRunBtnV34'),resetActiveRunV34);
};

const _origSetupUIV34 = setupUI;
setupUI = function(){
  _origSetupUIV34();
  document.title='Аномальне поле · V37 Контакти Зони';
  let hero=document.querySelector('.heroCall .small');
  if(hero)hero.textContent=V34_PATCH_NOTE;
  let btn=$('#selfCheckBtn'); if(btn)btn.textContent='Самоперевірка V37';
  let panel=$('#setupPanel');
  if(panel&&!$('#finalChecklistV34')){
    let node=document.createElement('div');
    node.id='finalChecklistV34'; node.className='finalChecklist';
    node.innerHTML='<b>Перед перевіркою:</b><br>1) Навчальний рейд — зрозуміти болт/скан/евакуацію.<br>2) Швидкий рейд — перевірити баланс.<br>3) Закрити сторінку посеред рейду й натиснути “Продовжити”.<br>4) Винести артефакт, зайти в Лабораторію й взяти його в наступний рейд.';
    let rumor=panel.querySelector('.rumorBox'); panel.insertBefore(node, rumor||panel.lastChild);
  }
  renderProfilePanelV33();
};

const _origShowSelfCheckV34 = showSelfCheck;
showSelfCheck = function(){
  _origShowSelfCheckV34();
  let p=$('#selfCheckPanel');
  if(p){
    let title=p.querySelector('b'); if(title)title.textContent='Самоперевірка V37';
    p.insertAdjacentHTML('beforeend','<div class="quickRead"><b>V34:</b> фінальний playtest-cut активний · сейв профілів можна експортувати · ранні ходи м’якші · остання дія не пророкує майбутнє · кожен крок має сенсорне відчуття місцевості.</div>');
  }
};

const _origShowArchiveV34 = showArchive;
showArchive=function(){
  _origShowArchiveV34();
  let panel=$('#archivePanel'); if(!panel)return;
  panel.insertAdjacentHTML('beforeend','<br><b>Checkpoint V36</b><div class="archiveList"><div class="archiveItem"><b>Journal UX Cut</b><br>Ця версія прибирає зайвий статичний текст під полем, показує живу останню дію одразу під мапою, тримає нові записи журналу зверху і робить довідку кнопок помітною.</div></div>');
};

const _origExportCardV34 = exportCard;
exportCard=function(){let base=_origExportCardV34();return base+'\nВерсія тесту: V34 Journal UX Cut\nСейв: профільний localStorage, доступний експорт/імпорт у меню профілю.';};



// === V35 TRUE PLAYTEST READY PATCH ===
// Останній шар перед живим тестом: менше тертя, краща підказка "що робити зараз",
// чистіший старт і безпечніше розкриття складних дій без нової великої системи.
const V35_PATCH_NOTE = 'V37 — Контакти Зони: надрідкісна зустріч у полі, новий контакт у КПК і листування після рейду.';
let v35AdvancedOpen=false;

function hasGearV35(g){return !!(state && state.gear && state.gear.includes(g));}
function setDetailV35(main,why,next,tone='good'){
  if(!state)return;
  state.actionDetail={main,why,next,tone};
  state.lastAction=main;
  renderActionFeedback();
  sound(tone==='bad'?'warn':'tab');
}
function explainNowV35(){
  if(!state){toast('Почни з навчального рейду або швидкого рейду.');return;}
  if(state.finished){toast('Рейд завершено. Можна почати новий або відкрити архів.');return;}
  if(state.boltMode){setDetailV35('Режим болта активний.','Жовті сусідні клітини можна перевірити без кроку.','Торкнись жовтої клітини. Якщо передумав — натисни “Болт” ще раз.', 'warn');return;}
  if(state.hasArtifact && state.stabilize<3){
    setDetailV35('Артефакт уже виявлено, але він ще нестабільний.','Поки стабілізація не завершена, рейд лишається небезпечним.','Натискай “Стаб.”, доки не буде 3/3. Потім шукай край поля або старт ▣.', 'good');return;
  }
  if(state.hasArtifact && state.stabilize>=3){
    let edge = state.pos.x===0||state.pos.y===0||state.pos.x===SIZE-1||state.pos.y===SIZE-1;
    setDetailV35(edge?'Ти на краю поля з артефактом.':'Артефакт стабілізовано. Час виходити.',edge?'Край поля може бути точкою евакуації.':'Після знахідки Зона тисне сильніше, тому шлях назад важливіший за лут.','Шукай кнопку “Вийти з поля” на краю або повертайся до ▣.', 'good');return;
  }
  if(state.rad>=Math.max(3,(state.radLimit||6)-2) && hasGearV35('antirad')){
    setDetailV35('Радіація вже небезпечна.','Антирад не робить рейд безпечним, але дає запас для помилки.','Можеш натиснути “Антирад -2☢” або скоротити маршрут.', 'bad');return;
  }
  if(state.charge<=1 && hasGearV35('detector')){
    setDetailV35('Заряду КПК мало.','Скан допомагає, але тепер кожен заряд важливий.','Краще перевіряти небезпечні кроки болтом і не витрачати скан без потреби.', 'warn');return;
  }
  if(state.moves<3){
    setDetailV35('Перші ходи — розвідка.','Гра не вимагає бігти. Болт не є слабкістю, це головний інструмент виживання.','Кинь болт у сумнівну сусідню клітину або зроби короткий крок стрілкою.', 'good');return;
  }
  setDetailV35('КПК не бачить прямої відповіді.','Це нормально: Зона не дає повної мапи, тільки наслідки й уривки сигналу.','Рухайся обережно: болт перед ризиком, скан коли губиш напрям, антирад коли фон стає високим.', 'good');
}

function toggleAdvancedV35(){
  v35AdvancedOpen=!v35AdvancedOpen;
  let d=$('#controlDock'); if(d)d.classList.toggle('advancedOpen', v35AdvancedOpen);
  let b=$('#moreActionsBtnV35'); if(b)b.textContent=v35AdvancedOpen?'Сховати дії':'Дії +';
  toast(v35AdvancedOpen?'Додаткові дії відкрито':'Додаткові дії сховано');
}
function ensureV35Dock(){
  let actions=document.querySelector('.controlDock .actions');
  if(actions && !$('#nowBtnV35')){
    let now=document.createElement('button'); now.id='nowBtnV35'; now.textContent='Що робити зараз?'; now.title='Коротко пояснює поточний стан без спойлерів і без пророцтв.';
    actions.insertBefore(now, actions.firstChild);
    bind(now,explainNowV35);
  }
  if(actions && !$('#moreActionsBtnV35')){
    let more=document.createElement('button'); more.id='moreActionsBtnV35'; more.textContent='Дії +'; more.title='Показати або сховати додаткові кнопки.';
    let deep=$('#deepBtn'); actions.insertBefore(more, deep||actions.lastChild);
    bind(more,toggleAdvancedV35);
  }
  let d=$('#controlDock'); if(d)d.classList.toggle('advancedOpen', v35AdvancedOpen);
}

function addStartStripV35(){
  let panel=$('#setupPanel'); if(!panel||$('#startStripV35'))return;
  let node=document.createElement('div'); node.id='startStripV35'; node.className='v35StartStrip';
  node.innerHTML='<b>V35 перед тестом:</b> головне — не перемогти з першого разу, а зрозуміти ритм: болт → крок → слухати КПК → не жадібничати → винести артефакт. <div class="v35QuietLine">Складні дії сховані за “Дії +”, а кнопка “Що робити зараз?” пояснює стан без спойлерів.</div>';
  let first=panel.querySelector('.row.wrap'); if(first)first.insertAdjacentElement('afterend',node); else panel.prepend(node);
}

const _origRenderV35 = render;
render=function(){
  _origRenderV35();
  ensureV35Dock();
  if(state && (state.stabilize>0 || (state.hasArtifact&&state.stabilize<3))){
    v35AdvancedOpen=true; let d=$('#controlDock'); if(d)d.classList.add('advancedOpen'); let b=$('#moreActionsBtnV35'); if(b)b.textContent='Сховати дії';
  }
};

const _origRenderActionFeedbackV35 = renderActionFeedback;
renderActionFeedback=function(){
  _origRenderActionFeedbackV35();
  let p=$('#lastActionPanel');
  if(p && state && !p.querySelector('#v35MicroTip')){
    let txt='Підказка: дивись не на майбутнє, а на наслідок останньої дії. Зона не зобов’язана бути чесною.';
    if(state.tutorial)txt='Навчальний режим: помилки тут м’якші. Вчися ритму — болт, крок, скан, вихід.';
    else if(state.hasArtifact)txt='Артефакт змінює темп рейду. Після знахідки лут стає менш важливим за евакуацію.';
    p.insertAdjacentHTML('beforeend','<div id="v35MicroTip" class="v35HintBox"><b>КПК:</b> '+esc(txt)+'</div>');
  }
};

const _origSetupUIV35 = setupUI;
setupUI=function(){
  _origSetupUIV35();
  document.title='Аномальне поле · V37 Контакти Зони';
  let hero=document.querySelector('.heroCall .small'); if(hero)hero.textContent=V35_PATCH_NOTE;
  let btn=$('#selfCheckBtn'); if(btn)btn.textContent='Самоперевірка V37';
  addStartStripV35(); ensureV35Dock();
};

const _origShowSelfCheckV35 = showSelfCheck;
showSelfCheck=function(){
  _origShowSelfCheckV35();
  let p=$('#selfCheckPanel'); if(!p)return;
  let title=p.querySelector('b'); if(title)title.textContent='Самоперевірка V37';
  p.insertAdjacentHTML('beforeend','<div class="quickRead"><b>V35:</b> кнопка “Що робити зараз?” активна · складні дії сховані за “Дії +” · повідомлення після кроку не пророкують майбутнє · перший екран коротше пояснює ритм гри · stabilise force-opens advanced actions.</div>');
};

const _origShowArchiveV35 = showArchive;
showArchive=function(){
  _origShowArchiveV35();
  let panel=$('#archivePanel'); if(!panel)return;
  panel.insertAdjacentHTML('beforeend','<br><b>Checkpoint V36</b><div class="archiveList"><div class="archiveItem"><b>True Playtest Ready</b><br>Це остання передтестова версія: не додає новий великий контент, а зменшує тертя — ситуаційна підказка, сховані складні дії, зрозуміший старт і чистіша самоперевірка.</div></div>');
};

const _origExportCardV35 = exportCard;
exportCard=function(){let base=_origExportCardV35();return base+'\nВерсія тесту: V35 True Playtest Ready\nПередтестовий режим: ситуаційна підказка, сховані складні дії, профільний сейв.';};



/* ===================== V37 — CONTACTS OF THE ZONE =====================
   Глобальна ідея: надрідкісна зустріч у полі відкриває контакт у КПК.
   Після рейду контакт може написати, а гравець відповідає коротким вибором.
   Це не магазин і не стандартний квестодавець — це слід Зони, який пам’ятає.
============================================================================= */
const V37_PATCH_NOTE='V37 — Контакти Зони: надрідкісна зустріч у полі, новий контакт у КПК і листування після рейду.';
const zoneContactsV37={
  nobody:{name:'Сталкер, якого не було',kind:'аномальний контакт',first:'Ти теж бачив, як світло стоїть на місці?',afterWin:'Ти виніс артефакт. Добре. Тепер не продавай перше, що гріє руку.',afterLoss:'Ти повернувся не з тим, за чим ішов. Це теж відповідь.',gift:'deadPath'},
  conductor:{name:'Старий Провідник',kind:'людина або дуже стара пам’ять',first:'Не вір прямій дорозі. У Зоні пряма дорога найчастіше веде вниз.',afterWin:'Наступного разу шукай не артефакт. Шукай місце, де болт не падає.',afterLoss:'Твоя помилка ще тепла. Я покажу, де вона лежить.',gift:'beacon'},
  child:{name:'Дитина Зони',kind:'тихий канал',first:'Не бійся. Вона не зла. Вона просто не людська.',afterWin:'Ти забрав її іскру. Скажи їй дякую, поки вона не згасла.',afterLoss:'Вона не хотіла тебе вбити. Вона хотіла, щоб ти зупинився.',gift:'stash'},
  happiness:{name:'Счастье',kind:'невідомий адресат',first:'Счастья всем даром. А ти що попросиш?',afterWin:'Тобі дали вихід. Не плутай це з перемогою.',afterLoss:'Никто не уйдет обиженным. Навіть ті, хто не дійшов.',gift:'traderBattery'}
};
function v37Store(){let st=loadStore();st.zoneContacts=st.zoneContacts||{};st.zoneInbox=st.zoneInbox||[];return st}
function v37Save(st){saveStore(st);renderContactsMenuBadgeV37()}
function nowV37(){return new Date().toLocaleString('uk-UA')}
function addContactMessageV37(id,text,from='them'){let st=v37Store(),c=zoneContactsV37[id];if(!c)return;st.zoneContacts[id]=st.zoneContacts[id]||{id,name:c.name,kind:c.kind,metAt:nowV37(),trust:0,thread:[]};st.zoneContacts[id].thread.unshift({time:nowV37(),from,text});st.zoneInbox.unshift({id,time:nowV37(),text});st.zoneInbox=st.zoneInbox.slice(0,12);v37Save(st)}
function unlockContactV37(id,reason){let st=v37Store(),c=zoneContactsV37[id];if(!c)return;let first=!st.zoneContacts[id];st.zoneContacts[id]=st.zoneContacts[id]||{id,name:c.name,kind:c.kind,metAt:nowV37(),trust:0,thread:[]};if(first){st.zoneContacts[id].thread.unshift({time:nowV37(),from:'system',text:'Контакт відкрито після події: '+reason});st.zoneContacts[id].thread.unshift({time:nowV37(),from:'them',text:c.first});st.zoneInbox.unshift({id,time:nowV37(),text:c.first});rememberRumor('Хтось новий з’явився у КПК після рейду. Номер без номера, ім’я без людини.');}
  v37Save(st); if(state)log('КПК зберіг новий контакт: '+c.name+'. Після рейду він може написати.');
}
function maybeRareContactV37(){
  if(!state||state.finished||state.tutorial||state.rareContactSeenV37)return;
  if(state.moves<6||state.hasArtifact)return;
  let chance=0.009; // надрідкісно: приблизно раз на багато рейдів
  if(state.rad>=2)chance+=0.006;
  if(level()>=4)chance+=0.004;
  if(rand()>chance)return;
  state.rareContactSeenV37=true;
  let ids=Object.keys(zoneContactsV37); let id=choose(ids); let c=zoneContactsV37[id];
  state.eventLock=true;
  let ov=document.createElement('div');ov.className='eventOverlay';
  ov.innerHTML='<div class="eventCard rareEncounterV37"><b>Рідкісна зустріч: '+esc(c.name)+'</b><div class="small">На краю поля стоїть силует. Детектор не показує ні людину, ні аномалію. У КПК з’являється порожній чат.</div><div class="replyGridV37"><button class="primary" id="v37Listen">Вислухати</button><button id="v37Ask">Запитати: “Хто ти?”</button><button id="v37Ignore">Не відповідати</button><button class="ghost" id="v37Bolt">Кинути болт між вами</button></div></div>';
  document.body.appendChild(ov);
  bind($('#v37Listen'),()=>{unlockContactV37(id,'ти вислухав силует у полі');log(c.name+': “'+c.first+'”');state.eventLock=false;ov.remove();render();});
  bind($('#v37Ask'),()=>{unlockContactV37(id,'ти поставив питання тому, кого КПК не бачив');state.charge=Math.max(0,state.charge-1);log('Ти запитав, хто він. КПК втратив 1 заряд, але контакт лишився в пам’яті.');state.eventLock=false;ov.remove();render();});
  bind($('#v37Ignore'),()=>{log('Ти не відповів. Силует зник, але в журналі лишилась порожня строка без часу.');rememberRumor('Іноді найстрашніше повідомлення — те, яке ти не відкрив.');state.eventLock=false;ov.remove();render();});
  bind($('#v37Bolt'),()=>{if(state.bolts>0)state.bolts--;unlockContactV37(id,'болт завис у повітрі між вами');log('Болт завис у повітрі й упав уже після того, як силует зник. -1 болт.');state.eventLock=false;ov.remove();render();});
  sound('radio');pulseScreen('warn');
}
const _origAfterTurnV37=afterTurn;
afterTurn=function(){_origAfterTurnV37();maybeRareContactV37();};
const _origUpdateStoreV37=updateStore;
updateStore=function(win,reason){_origUpdateStoreV37(win,reason);let st=v37Store();let ids=Object.keys(st.zoneContacts||{});if(ids.length){let id=choose(ids), c=zoneContactsV37[id];let text=win?(c.afterWin||c.first):(c.afterLoss||c.first);st.zoneContacts[id].thread.unshift({time:nowV37(),from:'them',text});st.zoneInbox.unshift({id,time:nowV37(),text});if(c.gift&&rand()<.55)st.nextHook={type:c.gift,text:'Повідомлення від контакту “'+c.name+'” лишило зачіпку на наступний рейд.'};v37Save(st);}}
function renderContactsMenuBadgeV37(){let b=$('#contactsBtnV37');if(!b)return;let st;try{st=loadStore()}catch(e){st={}};let n=Object.keys(st.zoneContacts||{}).length, inbox=(st.zoneInbox||[]).length;b.classList.add('zoneContactBtn');b.innerHTML='Контакти Зони'+(n?'<span class="contactBadgeV37">'+n+'</span>':'');if(inbox)b.title='Є повідомлення: '+inbox;}
function showContactsV37(){hideAll();let panel=$('#contactsPanelV37');if(!panel)return;panel.classList.remove('hidden');let st=v37Store(), ids=Object.keys(st.zoneContacts||{});let html='<div class="row"><b>Контакти Зони</b><button id="closeContactsV37">Назад</button></div><div class="v37Note">Це не звичайні NPC. Контакти відкриваються дуже рідко через зустрічі в полі. Вони пишуть після рейдів, іноді дають зачіпки, іноді брешуть, іноді просто нагадують: Зона пам’ятає.</div>';
  if(!ids.length)html+='<div class="contactPanelV37"><b>Порожній ефір</b><div class="small">Поки що в КПК немає дивних контактів. Вони не відкриваються кнопкою — тільки подіями Зони.</div></div>';
  ids.forEach(id=>{let cc=st.zoneContacts[id], def=zoneContactsV37[id]||{};let thread=(cc.thread||[]).slice(0,6).map(m=>'<div class="messageV37"><b>'+esc(m.from==='them'?(cc.name||def.name):m.from==='me'?'Ти':'КПК')+'</b> · '+esc(m.time)+'<br>'+esc(m.text)+'</div>').join('');html+='<div class="contactCardV37"><div class="contactNameV37">'+esc(cc.name||def.name)+'</div><div class="contactMetaV37">'+esc(cc.kind||def.kind||'невідомо')+' · перший контакт: '+esc(cc.metAt||'—')+'</div>'+thread+'<div class="replyGridV37"><button data-reply="careful" data-id="'+esc(id)+'">Відповісти обережно</button><button data-reply="ask" data-id="'+esc(id)+'">Запитати про Зону</button><button data-reply="thanks" data-id="'+esc(id)+'">Подякувати</button><button class="ghost" data-reply="silent" data-id="'+esc(id)+'">Промовчати</button></div></div>';});
  panel.innerHTML=html;bind($('#closeContactsV37'),()=>{hideAll();$('#setupPanel').classList.remove('hidden');renderContactsMenuBadgeV37();});$$('[data-reply]').forEach(btn=>bind(btn,()=>replyContactV37(btn.dataset.id,btn.dataset.reply)));sound('tab');}
function replyContactV37(id,kind){let st=v37Store(), c=zoneContactsV37[id], cc=st.zoneContacts[id];if(!c||!cc)return;let my={careful:'Я буду обережним.',ask:'Що ти знаєш про це місце?',thanks:'Дякую. Я почув.',silent:'...' }[kind]||'...';cc.thread.unshift({time:nowV37(),from:'me',text:my});let ans={careful:'Обережність — це не страх. Це плата за повернення.',ask:'Зона не місце. Вона відповідь, яку ніхто не просив.',thanks:'Не дякуй уголос. Тут навіть вдячність має відлуння.',silent:'Мовчання прийнято. Воно теж звучить.'}[kind];cc.thread.unshift({time:nowV37(),from:'them',text:ans});cc.trust=(cc.trust||0)+(kind==='thanks'?2:1);st.zoneContacts[id]=cc;if(kind==='careful')st.nextHook={type:c.gift||'beacon',text:'Контакт “'+c.name+'” лишив тиху зачіпку на наступний рейд.'};v37Save(st);showContactsV37();}
const _origSetupUIV37=setupUI;
setupUI=function(){_origSetupUIV37();document.title='Аномальне поле · V37 Контакти Зони';let hero=document.querySelector('.heroCall .small');if(hero)hero.textContent=V37_PATCH_NOTE;let btn=$('#selfCheckBtn');if(btn)btn.textContent='Самоперевірка V37';bind($('#contactsBtnV37'),showContactsV37);renderContactsMenuBadgeV37();let panel=$('#setupPanel');if(panel&&!$('#v37StartNote')){let node=document.createElement('div');node.id='v37StartNote';node.className='v37Note';node.innerHTML='<b>V37:</b> у Зоні тепер можуть траплятися надрідкісні зустрічі. Якщо контакт відкриється, він житиме в КПК і писатиме після рейдів. Це перший крок до великої системи “Зона пам’ятає”.';let rumor=panel.querySelector('.rumorBox');panel.insertBefore(node,rumor||panel.lastChild);}}
const _origShowArchiveV37=showArchive;
showArchive=function(){_origShowArchiveV37();let panel=$('#archivePanel');if(!panel)return;panel.insertAdjacentHTML('beforeend','<br><b>Checkpoint V37</b><div class="archiveList"><div class="archiveItem"><b>Контакти Зони</b><br>Додано надрідкісну зустріч у полі, відкриття контакту в КПК, повідомлення після рейду, короткі відповіді й зачіпки на наступний рейд. Центральна ідея: не просто “NPC”, а відчуття, що Зона впізнала гравця.</div></div>');};
const _origShowSelfCheckV37=showSelfCheck;
showSelfCheck=function(){_origShowSelfCheckV37();let p=$('#selfCheckPanel');if(!p)return;let title=p.querySelector('b');if(title)title.textContent='Самоперевірка V37';p.insertAdjacentHTML('beforeend','<div class="quickRead"><b>V37:</b> Contacts of the Zone active · rare field encounter · persistent КПК contacts · post-raid messages · next-run hooks from contacts.</div>');};
const _origExportCardV37=exportCard;
exportCard=function(){let base=_origExportCardV37();return base+'\nВерсія тесту: V37 Контакти Зони\nНове: надрідкісні зустрічі, контакти КПК, листування після рейду, зачіпки на наступний рейд.';};

setupUI();document.addEventListener('keydown',e=>{if(!state||state.finished)return;if(e.key==='ArrowUp')move(0,-1);if(e.key==='ArrowDown')move(0,1);if(e.key==='ArrowLeft')move(-1,0);if(e.key==='ArrowRight')move(1,0);if(e.key===' ')scan(false)});
