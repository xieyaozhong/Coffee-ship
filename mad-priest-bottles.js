(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MAD_PRIEST_V3__) return;
  window.__COFFEE_SHIP_MAD_PRIEST_V3__ = true;

  const KEY = 'coffeeShipMadPriestLetters';
  const META = { icon:'📜', series:'瘋狂神父殘頁', rarity:'傳說', count:30 };

  const PAGES = [
    {number:1, chapter:'第一章：宮廷醫師', title:'瘋狂神父殘頁 01｜王室病歷室', text:'我曾經不叫神父。我的名字寫在瓦洛里亞王宮的病歷簿上：塞拉芬・維爾，王室首席醫師與聲學研究官。我治療失眠、驚恐與戰後幻聽，從不相信神蹟，只相信脈搏、呼吸和可以測量的聲音。後來人們把我叫作瘋子，是因為我證明了聲音確實能改變一個人，只是沒有人願意承認，最先要求我繼續實驗的正是王室。'},
    {number:2, chapter:'第一章：宮廷醫師', title:'瘋狂神父殘頁 02｜路西安的導師', text:'路西安・阿斯特拉王子七歲時怕雷，十歲時怕海，十五歲時已學會在所有人面前微笑。我不只是他的醫師，也是他的宮廷導師。我教他辨認星圖、潮汐與人心的謊言，卻沒教會他如何拒絕別人的期待。他總能讓每個人覺得自己受到重視，那不是天賦，而是王室從小訓練出的生存方式。愛麗兒後來愛上的，正是這個被所有人需要、卻不知道自己想要什麼的孩子。'},
    {number:3, chapter:'第一章：宮廷醫師', title:'瘋狂神父殘頁 03｜伊莉莎白女王的命令', text:'海戰結束後，伊莉莎白女王把一份密令交給我。數百名水手回國後仍在夜裡聽見砲聲，王宮不願讓街上充滿崩潰的英雄。女王要我建立一座遠離大陸的療養島，讓戰士、孤兒與海難生還者重新學會睡眠。她不是殘酷的人，但王冠逼她把痛苦藏到看不見的地方。那座島最初不是監獄，也不是樂園，它只是一間被海包圍的醫院。'},
    {number:4, chapter:'第一章：宮廷醫師', title:'瘋狂神父殘頁 04｜不能被治好的悲傷', text:'我記錄過一百四十七種創傷反應。有人只要聞到火藥就發抖，有人每天替早已沉沒的同伴準備早餐，也有人忘記自己的孩子，卻記得每一具漂過船邊的身體。藥物能讓他們睡，卻不能讓夢停止。我開始研究節奏，因為心跳也是一種鐘聲。如果人的恐懼能被聲音喚起，也許就能被另一種聲音帶走。這個想法後來成為狂歡島的第一塊地基。'},
    {number:5, chapter:'第一章：宮廷醫師', title:'瘋狂神父殘頁 05｜海底第七鐘', text:'建島時，工人在礁岩下發現一口不屬於任何教堂的古鐘。它沒有鐘舌，卻會在滿潮時自行震動。前六次聲音只能透過骨頭感覺，第七次則會讓所有聽見的人想起最不願面對的名字。拉納爾後來稱它為深淵共鳴器，我當時只把它視為罕見的聲學遺物。我錯了。它不是在發出聲音，而是在等待島上的人替它補完旋律。'},

    {number:6, chapter:'第二章：三件遺物', title:'瘋狂神父殘頁 06｜戴維・瓊斯來訪', text:'一艘沒有登記的黑船在無月夜靠岸。船長自稱黑鬍子，我卻從舊海軍名冊認出他真正的名字：戴維・瓊斯。他帶來兩件不能公開出現在港口的寶物，要求用它們交換安全補給與三晚停泊。我明知它們來路不正，仍答應了。那時我以為自己只是借用海盜的贓物救人，沒有想到救人的理由也能替災難打開門。'},
    {number:7, chapter:'第二章：三件遺物', title:'瘋狂神父殘頁 07｜月潮沙漏', text:'第一件遺物是海倫娜・莫爾的月潮沙漏。沙粒落下時，房間裡的呼吸、燭火與疼痛都會變慢。我用它延長治療時間，讓病人在一個夜晚中完成數日的睡眠。戴維警告我不要在古鐘附近翻轉沙漏，因為時間與潮汐都不喜歡被命令。我沒有聽。研究者最危險的傲慢，就是把警告誤認為尚未證實的迷信。'},
    {number:8, chapter:'第二章：三件遺物', title:'瘋狂神父殘頁 08｜玻璃小提琴', text:'第二件遺物是伊索德・維恩的玻璃小提琴。它奏出的旋律會讓聽者看見最思念的人。我讓病人先面對幻象，再用規律鼓點帶他們回到現實，早期效果近乎奇蹟。有人第一次停止哭泣，有人終於向死者告別。可我沒有發現，古鐘也在學習琴聲。每一次治療，都讓海底的共鳴更接近完整。'},
    {number:9, chapter:'第二章：三件遺物', title:'瘋狂神父殘頁 09｜晨潮療養島', text:'這座島原名「晨潮療養島」。島上有白色病舍、果園、燈塔與一座沒有神像的小禮堂。病人每天在海邊散步，傍晚聽音樂，夜裡按自己的名字簽到。那時面具只是治療道具，讓不敢談論創傷的人暫時扮成別人；彩帶只是用來標示康復進度；舞蹈只是呼吸訓練。後來留下來的所有恐怖，都曾有一個善意而普通的起點。'},
    {number:10, chapter:'第二章：三件遺物', title:'瘋狂神父殘頁 10｜第一批病人', text:'第一批住民有七十二人，其中包括退役水手、戰爭孤兒與六名從沉船獲救的孩子。他們很久沒有笑過，所以當音樂治療讓第一個人笑出聲時，全島都以為我們成功了。那個人隔天忘記了亡妻的死，也忘記了亡妻的名字。我把這件事記成短暫記憶障礙，沒有立刻停止療程。狂歡島不是在一夜之間誕生的，它誕生於我第一次替異常找到合理解釋的那一刻。'},

    {number:11, chapter:'第三章：第一場狂歡', title:'瘋狂神父殘頁 11｜慰靈祭', text:'為紀念戰爭結束，女王批准島上舉辦一夜慰靈祭。伊索德的琴、月潮沙漏與古鐘第一次同時運作。病人戴上面具，象徵暫時放下舊身分；樂師重複同一段旋律，讓所有人的呼吸同步。午夜以前，一切都很美。人們擁抱、哭泣，第一次能說出死者姓名。午夜之後，哭聲停止了，但不是因為他們接受悲傷，而是因為那些名字從記憶中消失了。'},
    {number:12, chapter:'第三章：第一場狂歡', title:'瘋狂神父殘頁 12｜第七聲', text:'古鐘在沒有人敲擊的情況下響了七次。第七聲過後，沙漏裡的沙停在半空，玻璃琴則自己奏起尚未完成的樂句。島民開始跳舞，說只要不停下來，就不會想起痛苦。我命令樂師停止，卻發現他們的手已不再聽從自己。那一夜沒有真正結束。太陽仍會升起，但島上的人從此只把每一天稱作今晚。'},
    {number:13, chapter:'第三章：第一場狂歡', title:'瘋狂神父殘頁 13｜快樂的副作用', text:'最初幾天，所有症狀看似都消失了。沒有人失眠，沒有人恐懼，也沒有人為死者哭泣。他們只想唱歌、飲酒、換上更華麗的衣服。王室觀察員把它稱作空前成功，我卻發現島民無法回答自己為何快樂。沒有悲傷的快樂只是一張沒有臉的面具。我本該立刻摧毀設備，卻選擇繼續觀察。這是我第二次用研究之名保護自己的野心。'},
    {number:14, chapter:'第三章：第一場狂歡', title:'瘋狂神父殘頁 14｜名字開始消失', text:'島民先忘記死者，再忘記家鄉，最後忘記自己。名冊上的墨水也開始褪色，只剩床號與面具圖案。為了維持秩序，我要求每個人把名字寫在紙條上掛於胸前，可紙條到了午夜就會變成空白。有人大笑著說，名字是離島的人才需要的東西。那句話後來成為狂歡島最流行的格言，而說出它的人原本是一位只想記住女兒聲音的父親。'},
    {number:15, chapter:'第三章：第一場狂歡', title:'瘋狂神父殘頁 15｜封島命令', text:'伊莉莎白女王收到我的報告後，立即下令停止實驗、撤離病人並封鎖島嶼。她甚至準備親自登島，因為她知道這場錯誤始於自己的密令。然而命令尚未執行，她的晨星王冠便在海上加冕禮中被戴維・瓊斯奪走。女王被迫退位，王室陷入內鬥，晨潮療養島也從官方航海圖上被刪除。失去監督的島，被留給我和一場不肯結束的夜晚。'},

    {number:16, chapter:'第四章：神父誕生', title:'瘋狂神父殘頁 16｜我穿上祭袍', text:'病人開始把古鐘稱為海下之神，把我稱作能翻譯鐘聲的人。我原本否認，後來卻穿上禮堂留下的祭袍，因為醫師的命令已無人服從，神父的話卻能讓他們暫時安靜。我告訴自己，這只是另一種治療角色。久而久之，我也開始相信那些經文是從潮聲裡聽見的。瘋狂神父並不是突然取代塞拉芬，而是塞拉芬一次次選擇更容易被服從的身分。'},
    {number:17, chapter:'第四章：神父誕生', title:'瘋狂神父殘頁 17｜戴維取回贓物', text:'戴維・瓊斯在災變後返回。他看見永不停止的宴會，沒有驚訝，只說我把借來的東西用壞了。他取走月潮沙漏與玻璃小提琴，日後又把它們藏進自己的寶藏地圖。可即使兩件遺物離島，時間仍沒有恢復，琴聲也仍從地下傳來。因為古鐘早已記住它們的力量。戴維離開前問我要不要一起走，我拒絕了。我說病人需要我，其實是我不敢面對島外的審判。'},
    {number:18, chapter:'第四章：神父誕生', title:'瘋狂神父殘頁 18｜拉納爾的警告', text:'海洋學家拉納爾曾靠近島嶼，記錄到魚群因鐘聲產生異常。百眼鮟鱇會同時望向島心，黑洞烏賊則在第七聲後浮上水面。他把警告塞進漂流瓶，說共鳴正在改變海底生物。我讀完後沒有公開，因為一旦承認鐘聲能越過海岸，我就必須承認災難已不再只屬於島民。今日那些可被釣起的變異生物，也許都是我們第一次慰靈祭留下的回音。'},
    {number:19, chapter:'第四章：神父誕生', title:'瘋狂神父殘頁 19｜哈斯的求救瓶', text:'一封來自荒島的求救信漂到岸邊，署名哈斯，信中提到可可與莫納。我安排一艘補給艇前往，卻被宴會主持人改掛彩旗，當成招攬新客的船。那艘艇沒有抵達他們的島。我後來得知哈斯死於一場由嫉妒造成的意外，便一直在想：如果真正的救援曾經到達，他們三人的結局是否會不同。狂歡島害人的方式，不只是留下來的人，也包括它讓救援永遠無法出發。'},
    {number:20, chapter:'第四章：神父誕生', title:'瘋狂神父殘頁 20｜莫納沒有靠岸', text:'多年後，我在岸外看見一艘小船。莫納掌舵，可可坐在船尾，兩人都疲憊得像已經失去一部分靈魂。島上的音樂立刻轉向她們，燈火也亮起引航圖案。莫納看見海面漂浮的面具與哈斯信中提過的彩旗，沒有靠岸，反而割斷一切可能纏住船身的繩索。她救了可可，也拒絕了島替她們提供的遺忘。我站在岸上沒有呼喊。那是我少數沒有阻止別人離開的時刻。'},

    {number:21, chapter:'第五章：王子與人魚', title:'瘋狂神父殘頁 21｜路西安歸來', text:'路西安王子成年後來到狂歡島。他一眼就認出我，問為什麼王室檔案說塞拉芬・維爾早已死去。我回答，死去的是醫師，留下的是神父。他仍像兒時一樣對所有人溫柔，也因此很快被每一場宴會需要。島最喜歡這種人：害怕讓人失望、無法拒絕邀請，並把他人的快樂當成自己的責任。我試著叫他離開，他卻說只再停留一晚。島上的每一個永遠，都是從這句話開始。'},
    {number:22, chapter:'第五章：王子與人魚', title:'瘋狂神父殘頁 22｜礁石後的人魚', text:'王子登島後，海面一直有一位紅髮人魚守著。她不敢靠岸，只在礁石後等待他回頭。我知道她就是暴風雨中救過路西安的人，也看見她掌心曾握著王子留下的貝殼。她的沉默不是順從，而是被奪走的聲音。我曾想把真相寫給路西安，卻發現他在狂歡中已聽不進任何沒有音樂的話。愛麗兒最後離開時，海比島上所有人的哭聲都安靜。'},
    {number:23, chapter:'第五章：王子與人魚', title:'瘋狂神父殘頁 23｜假的離島船票', text:'路西安終於在第七夜想離開。他把紅寶石誓戒交給一名戴羽毛面具的商人，換取一張寫著「明天」的船票。我認出那人是戴維・瓊斯，卻沒有及時阻止。戴維知道島上沒有明天，也知道王子的戒指值得收藏。路西安到碼頭時船已遠去，他站了很久，最後又走回宴會。後來戴維把這件事寫進第六張藏寶圖，彷彿欺騙一個迷失的人也只是一段精彩航海史。'},
    {number:24, chapter:'第五章：王子與人魚', title:'瘋狂神父殘頁 24｜王子失去名字', text:'路西安先忘記王國，再忘記誓戒，最後忘記自己的全名。島民只叫他狐狸王子，因為他一直戴著第一夜得到的狐狸面具。我在名冊上反覆寫下「路西安・阿斯特拉」，墨水卻每到午夜就消失。他偶爾望向海面，像仍記得有人在等，但那份記憶已沒有名字可以依附。愛麗兒以為王子消失在島上；其實他的身體仍在跳舞，真正消失的是能夠回去的那個人。'},
    {number:25, chapter:'第五章：王子與人魚', title:'瘋狂神父殘頁 25｜空王座', text:'午夜遊行的花車上一直有一張空王座。島民以為它在等待新的統治者，其實那是我為伊莉莎白女王保留的位置。我曾相信她會帶著封島命令回來，結束我的錯誤。王冠失竊後，她再也沒有出現，空王座便被島民解釋成海下之神的座位。人總會替空缺尋找意義，正如我替自己的罪行發明信仰。'},

    {number:26, chapter:'第六章：最後告解', title:'瘋狂神父殘頁 26｜深淵不是神', text:'我終於承認，深淵沒有向我傳授經文。那些句子來自病歷、王室命令與我自己的研究筆記，被鐘聲扭曲後重新送回耳中。古鐘不是神，只是一件會放大記憶與渴望的裝置；真正讓它成為神的，是島上所有人都需要一個比自己更大的理由，解釋為何不願停下來。我也是其中之一。把錯誤稱為啟示，比承認自己害了所有人容易得多。'},
    {number:27, chapter:'第六章：最後告解', title:'瘋狂神父殘頁 27｜我維持了狂歡', text:'最初的狂歡也許是意外，但後來每一場宴會都是我親手維持。我調整鐘聲、安排面具、命令樂師不准停止，因為只要音樂持續，島民就不會恢復記憶，也不會質問我。我說這是為了避免集體崩潰，其實也是為了避免審判。狂歡島的怪物不在海底，而在一個明知治療已經失敗，仍不肯結束實驗的醫師心裡。'},
    {number:28, chapter:'第六章：最後告解', title:'瘋狂神父殘頁 28｜島的真正機關', text:'狂歡島之所以沒有明天，是三種力量留下的疊加：月潮沙漏曾讓時間停滯，玻璃小提琴讓記憶化作幻象，海底古鐘則把所有人的心跳鎖進同一段節奏。戴維雖取回前兩件遺物，它們的痕跡已被鐘記住。每當新的人靠岸，島就從他的記憶補充新的旋律。因此狂歡不是能源，遺忘才是。海岸上的衣物與玩具，都是島消化一個人後吐出的外殼。'},
    {number:29, chapter:'第六章：最後告解', title:'瘋狂神父殘頁 29｜狂歡島的創造者', text:'不要再把狂歡島的起源歸咎於詛咒、海怪或命運。伊莉莎白提供命令與資金，戴維帶來被偷走的遺物，古鐘提供力量，但把它們組合起來的人是我。第一場祭典的聲學圖、沙漏位置與琴聲節拍，全出自我的手。島上每一張笑臉都與我有關。這不是神的國度，而是一座由醫療理想、王室羞恥、海盜贓物與研究者傲慢共同建成的牢籠。'},
    {number:30, chapter:'第六章：最後告解', title:'瘋狂神父殘頁 30｜塞拉芬・維爾', text:'這是最後一次告解。我的本名是塞拉芬・維爾，曾任瓦洛里亞王室首席醫師、聲學研究官，也是路西安・阿斯特拉王子的導師。我不是受神選中的神父，只是一名害怕承認失敗的醫師。若你讀到這一頁，請把我的名字記住，因為島會先奪走名字，再把罪變成傳說。不要原諒我，也不要來尋找我。請摧毀海底第七鐘，讓狂歡終於迎來它一直拒絕的明天。'}
  ];

  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (error) { return fallback; } }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function canonicalNumber(value, fallback=1) { const n=Number(value); return Number.isFinite(n)&&n>=1 ? ((Math.floor(n)-1)%META.count)+1 : ((fallback-1)%META.count)+1; }
  function numberFromEntry(entry, fallback) { if (Number.isFinite(Number(entry?.priestIndex))) return canonicalNumber(entry.priestIndex,fallback); const m=String(entry?.title||'').match(/(\d{1,3})/); return m?canonicalNumber(m[1],fallback):canonicalNumber(fallback,1); }
  function entryFor(number, original={}) { const base=PAGES[canonicalNumber(number)-1]; return {...original,...base,icon:META.icon,series:META.series,rarity:META.rarity,priestIndex:base.number,priestCompleteSeries:true,at:original.at||Date.now()}; }
  function normalizePriest() { const list=read(KEY,[]); if(!Array.isArray(list)) return; const seen=new Set(); const next=[]; list.forEach((entry,index)=>{if(!entry||typeof entry!=='object')return;const n=numberFromEntry(entry,index+1);if(seen.has(n))return;seen.add(n);next.push(entryFor(n,entry));}); if(JSON.stringify(list)!==JSON.stringify(next))save(KEY,next.slice(-120)); }
  function nextNumber(list) { const seen=new Set(list.map((entry,index)=>numberFromEntry(entry,index+1))); for(let i=1;i<=META.count;i++)if(!seen.has(i))return i; return 1+Math.floor(Math.random()*META.count); }
  function createPriestPage() { const list=read(KEY,[]); const safe=Array.isArray(list)?list:[]; const entry=entryFor(nextNumber(safe)); safe.push(entry); save(KEY,safe.slice(-120)); return entry; }

  function addStyle(){
    if(document.getElementById('madPriestBottleStyle')) return;
    const s=document.createElement('style'); s.id='madPriestBottleStyle';
    s.textContent='.mad-priest-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:48;background:rgba(18,14,22,.98);border:3px solid #b8a6ff;border-radius:18px;padding:16px;color:#fff4d8;text-align:left;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32),0 0 28px rgba(184,166,255,.25);line-height:1.65;width:min(92%,720px);pointer-events:none}.mad-priest-card.hidden{display:none}.mad-priest-title{text-align:center;font-size:21px;margin-bottom:8px;color:#d8ccff}.mad-priest-meta{font-size:13px;color:#b8a6ff;text-align:center;margin-bottom:8px}.mad-priest-text{padding:12px;border:2px solid #6b5a8f;border-radius:12px;background:#120e18}@media(max-width:760px){.mad-priest-card{position:fixed;top:42%;width:min(92vw,410px);max-height:68dvh;overflow-y:auto;padding:14px;z-index:14000}.mad-priest-text{max-height:48dvh;overflow-y:auto}}';
    document.head.appendChild(s);
  }
  function ensureCard(){const p=document.getElementById('gamePanel');if(!p||document.getElementById('madPriestCard'))return;if(getComputedStyle(p).position==='static')p.style.position='relative';const c=document.createElement('div');c.id='madPriestCard';c.className='mad-priest-card hidden';p.appendChild(c);}
  function showPage(entry=createPriestPage()){const card=document.getElementById('madPriestCard');if(!card)return;card.innerHTML=`<div class="mad-priest-title">${META.icon} ${entry.title}</div><div class="mad-priest-meta">${entry.chapter}｜${entry.rarity}</div><div class="mad-priest-text">${entry.text}</div>`;card.classList.remove('hidden');setTimeout(()=>card.classList.add('hidden'),12000);}

  function patchRuntime(){
    window.COFFEE_SHIP_BOTTLE_PROVIDERS=window.COFFEE_SHIP_BOTTLE_PROVIDERS||{};
    window.COFFEE_SHIP_BOTTLE_PROVIDERS.priest={META,getEntry:n=>entryFor(n),create:createPriestPage};
    const restore=window.COFFEE_SHIP_BOTTLE_RESTORE;
    if(restore?.META?.priest)Object.assign(restore.META.priest,META);
    if(restore?.STORE)restore.STORE.priest=KEY;
    if(restore)restore.priestCompleteSeries=PAGES;
    const db=window.COFFEE_SHIP_DB;
    if(db){db.madPriestPages=PAGES;db.createPriestPage=createPriestPage;if(Array.isArray(db.bottles)){let found=false;db.bottles=db.bottles.map(row=>{if(!Array.isArray(row)||!['priest','mad_priest'].includes(row[0]))return row;found=true;return ['priest',META.icon,META.series,META.rarity,PAGES[0].text];});if(!found)db.bottles.push(['priest',META.icon,META.series,META.rarity,PAGES[0].text]);}}
  }

  let lock=false;
  function isDeckOpen(){const api=window.COFFEE_SHIP_DECK;if(api?.isDeckOpen)return api.isDeckOpen();const d=document.getElementById('deckOverlay');return d&&!d.classList.contains('hidden');}
  function tryPage(event){if(!isDeckOpen()||lock||Math.random()>.13)return false;lock=true;event?.preventDefault?.();event?.stopImmediatePropagation?.();setTimeout(()=>{showPage();lock=false;},700+Math.random()*900);return true;}
  function bind(){window.addEventListener('keydown',event=>{const k=event.key?.length===1?event.key.toLowerCase():event.key;if(k==='f'||k==='c')tryPage(event);},true);document.getElementById('coffeeBtn')?.addEventListener('click',event=>tryPage(event),true);}
  function init(){addStyle();ensureCard();normalizePriest();patchRuntime();bind();[500,1500,3500].forEach(ms=>setTimeout(()=>{normalizePriest();patchRuntime();},ms));}

  window.COFFEE_SHIP_MAD_PRIEST_SERIES={META,PAGES,realName:'塞拉芬・維爾',formerIdentity:'瓦洛里亞王室首席醫師、聲學研究官、路西安王子的宮廷導師',getEntry:n=>entryFor(n),createPriestPage,normalizePriest,showPage};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();