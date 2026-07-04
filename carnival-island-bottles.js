(() => {
  'use strict';
  if (window.__COFFEE_SHIP_CARNIVAL_V3__) return;
  window.__COFFEE_SHIP_CARNIVAL_V3__ = true;

  const KEY = 'coffeeShipCarnivalLetters';
  const META = { icon:'🎭', series:'狂歡島漂流瓶', rarity:'史詩', count:30 };

  const LETTERS = [
    {number:1, chapter:'第一章：島還沒有面具', narrator:'王室測量員', title:'狂歡島漂流瓶 01｜晨潮療養島', text:'這裡最初不叫狂歡島，而叫晨潮療養島。伊莉莎白女王在海戰後下令建造它，讓失眠的士兵、失去家人的孩子與海難生還者遠離王都休養。島上只有白色病舍、果園、燈塔與一間沒有神像的小禮堂。第一份地圖甚至把廣場標成「安靜庭院」。沒有人能想像，後來最吵鬧、最不肯結束的宴會，會從一座為了讓人重新睡著的醫院開始。'},
    {number:2, chapter:'第一章：島還沒有面具', narrator:'王室文書官', title:'狂歡島漂流瓶 02｜女王的密令', text:'女王的密令寫得很清楚：島上所有療程必須自願，病人必須保留姓名，每三十日接受王室審查。她不希望戰爭英雄倒在街頭，也不希望王國看見勝利背後的代價。晨潮島因此同時是一座醫院與一個被藏起來的秘密。王室後來把它從航海圖上刪除，並不是因為不知道島的存在，而是因為太清楚自己曾經批准什麼。'},
    {number:3, chapter:'第一章：島還沒有面具', narrator:'護士艾妲', title:'狂歡島漂流瓶 03｜塞拉芬醫師', text:'主持療養島的人叫塞拉芬・維爾。他是王室首席醫師、聲學學者，也是路西安王子的導師。他不穿祭袍，只穿總是沾著墨水的灰色外套。他相信人的心跳可以被另一種節奏安撫，也相信悲傷不是罪，只是一種無法獨自承受的重量。後來島民叫他瘋狂神父，但我記得最初的他會逐床確認病人是否睡著，還會替沒有家人的孩子寫回信。'},
    {number:4, chapter:'第一章：島還沒有面具', narrator:'第十二床病人', title:'狂歡島漂流瓶 04｜第一批住民', text:'我們是第一批病人，共七十二人。有人夜裡仍聽見砲聲，有人每天把餐點留給已經死去的同伴。我們白天種花，傍晚聽琴，睡前必須在名冊上簽名。塞拉芬說，名字能把人固定在現實裡。那時面具只是治療遊戲，讓害怕開口的人暫時扮成狐狸、鹿或鳥。沒有人強迫我們笑，也沒有人告訴我們不能悲傷。'},
    {number:5, chapter:'第一章：島還沒有面具', narrator:'礦工羅德', title:'狂歡島漂流瓶 05｜礁岩下的古鐘', text:'挖蓄水池時，我們在島心下方發現一口古鐘。它沒有鐘舌，也沒有任何已知王國的文字，滿潮時卻會自行震動。前六次只能從牙齒與骨頭感到，第七次會讓人想起最不願面對的名字。塞拉芬把它當成聲學奇蹟，要求我們保留原位並建造共鳴室。如今每一場宴會的鼓點，仍然跟著那口鐘的節奏。'},

    {number:6, chapter:'第二章：三件遺物', narrator:'港口守衛', title:'狂歡島漂流瓶 06｜黑船靠岸', text:'一艘掛著破旗的黑船在無月夜靠岸。船長自稱黑鬍子，塞拉芬卻低聲叫他戴維・瓊斯。他帶來兩只上鎖木箱，要求補給、醫療與三夜安全停泊。箱子裡不是金銀，而是一只月潮沙漏與一把玻璃小提琴。戴維說兩件東西都不是他的，卻笑得像全世界的失物最後都應該屬於他。'},
    {number:7, chapter:'第二章：三件遺物', narrator:'研究助理', title:'狂歡島漂流瓶 07｜月潮沙漏', text:'月潮沙漏能讓一個房間裡的時間變慢。塞拉芬用它延長病人的深層睡眠，最初效果驚人。原本每夜尖叫的人終於能睡到清晨，折磨多年的痛也像被拉遠。然而有人醒來後堅稱自己已在夢中活過數月。更糟的是，沙漏一旦靠近古鐘，裡面的沙就會在半空停住，像連時間也在等待第七聲。'},
    {number:8, chapter:'第二章：三件遺物', narrator:'樂師費恩', title:'狂歡島漂流瓶 08｜玻璃小提琴', text:'玻璃小提琴原屬歌劇家伊索德・維恩。琴聲會讓聽者看見最思念的人，因此塞拉芬把它用於告別療程。病人能在幻象中說出最後一句話，再跟著鼓點回到現實。可琴每演奏一次，海底古鐘就會回應一次。後來即使玻璃琴被戴維取走，島上仍會在午夜奏出同一段旋律，因為鐘已經學會如何模仿人的懷念。'},
    {number:9, chapter:'第二章：三件遺物', narrator:'治療記錄員', title:'狂歡島漂流瓶 09｜面具療法', text:'面具原本不是詛咒。病人戴上動物面具後，可以用另一個身分說出不敢承認的恐懼。狐狸代表狡猾，鹿代表逃跑，熊代表憤怒，鳥代表想回家。療程結束後，每個人都必須摘下面具並說出本名。第一次有人拒絕摘下面具時，我們以為他只是還沒準備好。後來，全島都忘了摘下來。'},
    {number:10, chapter:'第二章：三件遺物', narrator:'孩子米拉', title:'狂歡島漂流瓶 10｜彩帶不是裝飾', text:'彩帶原本用來記錄康復進度。藍色表示能安睡，綠色表示願意談話，金色表示準備離島。第一場祭典後，顏色失去意義，所有彩帶都被縫到衣服與面具上。大人說越華麗就越快樂，可我看見一名病人把代表離島的金色彩帶纏在手腕上，一直纏到看不見自己的名字牌。'},

    {number:11, chapter:'第三章：第一場祭典', narrator:'護士艾妲', title:'狂歡島漂流瓶 11｜慰靈祭開始', text:'為紀念海戰結束，女王批准一場只舉行一夜的慰靈祭。病人戴面具、點燈、唱出死者姓名，玻璃小提琴負責引出回憶，月潮沙漏延長療程，古鐘則提供穩定節拍。午夜前，人們哭得很痛快，我以為我們真的治好了什麼。午夜後，所有哭聲同時停止，因為大家忽然想不起自己在悼念誰。'},
    {number:12, chapter:'第三章：第一場祭典', narrator:'無名樂師', title:'狂歡島漂流瓶 12｜第七聲之後', text:'古鐘響到第七聲時，月潮沙漏的沙停住，玻璃小提琴自行演奏。所有人的腳開始跟著節拍移動，包括已經累倒的人。有人說只要繼續跳，就不會再痛。那句話像火一樣傳遍廣場。太陽隔天照常升起，可大家仍說「今晚的宴會才剛開始」。從此，島上有白晝，卻沒有明天。'},
    {number:13, chapter:'第三章：第一場祭典', narrator:'第三十六床病人', title:'狂歡島漂流瓶 13｜快樂得太乾淨', text:'第二天，我不再夢見沉船，也不再想念死去的弟弟。那種輕鬆讓我害怕，因為我知道自己應該記得他，卻連他的臉都想不起來。其他人說這就是痊癒，拉著我繼續喝酒跳舞。我第一次明白，快樂也可能是一種症狀。它把痛拿走時，也把證明我曾經愛過誰的東西一起帶走。'},
    {number:14, chapter:'第三章：第一場祭典', narrator:'名冊管理員', title:'狂歡島漂流瓶 14｜空白名冊', text:'先是病人忘記死者，接著忘記家鄉，最後忘記自己。名冊上的墨水每到午夜都會褪色，胸前姓名牌也只剩空白。我要求大家重新簽名，有人卻大笑說：「名字是離島的人才需要的東西。」那句話成了島上的新規則。從那晚起，面具圖案取代姓名，床號取代人生。'},
    {number:15, chapter:'第三章：第一場祭典', narrator:'王室觀察員', title:'狂歡島漂流瓶 15｜封島命令沒有抵達', text:'我把災變報告送回王都。伊莉莎白女王立刻簽署封島與撤離命令，準備親自處理。然而她的晨星王冠很快被戴維・瓊斯在海上奪走，貴族藉機逼她退位。新政府不願承認王室曾建立這座實驗療養院，於是命令被鎖進檔案室，島也從海圖上消失。狂歡島不是被世界遺忘，而是被世界故意假裝不存在。'},

    {number:16, chapter:'第四章：島開始狩獵', narrator:'前宴會侍者', title:'狂歡島漂流瓶 16｜塞拉芬穿上祭袍', text:'病人不再服從醫師，卻會聽從自稱能翻譯鐘聲的人。塞拉芬於是穿上禮堂祭袍，開始用經文般的語氣發布治療指令。他說自己只是換一種方式維持秩序，可每次鐘響，他的話就更像布道。島民開始叫他神父，後來又在背後叫他瘋狂神父。真正可怕的不是他突然瘋了，而是所有人都需要他扮演一個能替災難解釋意義的人。'},
    {number:17, chapter:'第四章：島開始狩獵', narrator:'黑船水手', title:'狂歡島漂流瓶 17｜戴維取回寶物', text:'戴維・瓊斯回來取走月潮沙漏與玻璃小提琴。他說塞拉芬把借來的東西用壞了，還笑著問島上的人是否願意加入他的船。沒有人回答，因為大家忙著跳舞。兩件遺物離開後，時間仍未恢復，琴聲也沒有停止。古鐘已把它們的力量記在島裡。戴維後來把沙漏與小提琴列入自己的十件寶物，卻從不承認狂歡島也改變了他。'},
    {number:18, chapter:'第四章：島開始狩獵', narrator:'拉納爾', title:'狂歡島漂流瓶 18｜變異魚群', text:'我是海洋學家拉納爾。島外魚群會在第七聲後同時轉向島心，百眼鮟鱇共享同一視線，黑洞烏賊則吸走鐘聲附近的光。這些變異生物並非偶然聚集，牠們正被同一段低頻共鳴改造。我把警告交給塞拉芬，他卻藏起報告。若你能釣到那些世界級或變異生物，請記住：牠們身上的異常，可能是狂歡島向整片海域擴散的傷口。'},
    {number:19, chapter:'第四章：島開始狩獵', narrator:'失職船夫', title:'狂歡島漂流瓶 19｜哈斯的求救信', text:'一只漂流瓶從南方荒島送來，署名哈斯，信裡還提到可可與莫納。塞拉芬命令我駕補給艇救援，可宴會主持人把船掛滿彩旗，說新客人比求救者更重要。我沒有反抗。那艘船最後只繞著附近海域招攬旅客，從未抵達哈斯所在的島。後來另一封信說哈斯已死。我仍保留他的第一封求救信，因為它證明狂歡島也會殺死從未登岸的人。'},
    {number:20, chapter:'第四章：島開始狩獵', narrator:'岸邊守燈人', title:'狂歡島漂流瓶 20｜莫納拒絕燈火', text:'我看見莫納駕著小船經過，可可坐在船尾。島上的燈立刻排列成安全港的形狀，音樂也換成最能讓疲憊者安心的旋律。莫納卻看見海面漂著與哈斯求救信相同的彩旗，當場轉舵。可可曾望向島上，像很想讓某種記憶消失，最後仍選擇跟著莫納離開。她們是少數聽見音樂後仍拒絕靠岸的人。'},

    {number:21, chapter:'第五章：王子消失', narrator:'碼頭迎賓員', title:'狂歡島漂流瓶 21｜路西安王子', text:'那位總對所有人微笑的王子登島了。他的本名是路西安・阿斯特拉，卻要求我們不要聲張身分。他說只想暫時擺脫王冠、婚約與所有人的期待。我替他戴上狐狸面具，因為狐狸最懂得在不同人面前露出恰好的表情。島不需要綁住他，只要不停邀請，他就會因為不願讓任何人失望而一次次留下。'},
    {number:22, chapter:'第五章：王子消失', narrator:'海岸清潔工', title:'狂歡島漂流瓶 22｜海裡的愛麗兒', text:'王子登島後，礁石外每天都有一位人魚等待。她是愛麗兒，也是暴風雨中救過路西安的人。她不能說話，只能看著王子在岸上接受每一場宴會與每一個陌生人的笑。她曾游得很近，路西安卻只把她當成海面上一道普通影子。當她最後離開時，海流帶走一枚藍色貝殼，島上的音樂卻比任何時候更響。'},
    {number:23, chapter:'第五章：王子消失', narrator:'假票販子助手', title:'狂歡島漂流瓶 23｜寫著明天的船票', text:'路西安在第七夜想離開。他用紅寶石誓戒向戴羽毛面具的商人購買船票。那名商人其實是戴維・瓊斯，船票上寫著啟航時間「明天」。路西安直到碼頭才想起，狂歡島沒有明天。戴維帶著戒指離開，後來把它藏進黑鬍子的第六張藏寶圖。王子則回到廣場，因為比承認受騙更容易的事，是再喝一杯。'},
    {number:24, chapter:'第五章：王子消失', narrator:'名冊管理員', title:'狂歡島漂流瓶 24｜狐狸王子', text:'我每天在名冊上寫下「路西安・阿斯特拉」，每到午夜名字都會消失。他先忘記王國，再忘記愛麗兒，最後只記得大家叫他狐狸王子。他仍然溫柔，仍會替女孩撿起絲巾、替醉倒的人披上外套，只是不再知道這份溫柔從何而來。愛麗兒以為他消失了。其實他的身體仍在島上，消失的是那個能回應自己名字的人。'},
    {number:25, chapter:'第五章：王子消失', narrator:'遺失物管理員', title:'狂歡島漂流瓶 25｜海岸上的外殼', text:'面具、鞋子、晚禮服、玩具、戒指與樂器每天都被海推回岸邊。它們不是普通遺失物，而是島民忘記某段人生後留下的外殼。有人忘記孩子，玩具熊就會出現在海灘；有人忘記婚約，戒指便掉進潮水；有人忘記自己曾經想離開，船票就會變成空白。玩家釣起的狂歡島物品，每一件都曾屬於一個被島慢慢吃掉的人。'},

    {number:26, chapter:'第六章：狂歡島真相', narrator:'瘋狂神父', title:'狂歡島漂流瓶 26｜空王座的主人', text:'午夜遊行最前方的花車上有一張空王座。島民說它屬於海下之神，其實塞拉芬最初是為伊莉莎白女王保留位置。他一直相信女王會帶著封島命令回來，替他結束實驗。王冠失竊、女王退位後，座位再也沒有主人。空缺被神話填滿，悔恨被儀式包裝，最後沒有人記得那只是一張等待問責者的椅子。'},
    {number:27, chapter:'第六章：狂歡島真相', narrator:'地下樂師', title:'狂歡島漂流瓶 27｜島靠什麼活著', text:'狂歡島不靠酒、糖或音樂活著。它靠遺忘。月潮沙漏留下停滯的時間，玻璃小提琴留下會成真的回憶，古鐘則把所有人的心跳鎖進同一段節奏。每當新的人靠岸，島就從他的悲傷裡取得新的旋律，再用快樂交換他的名字。宴會只是消化過程；海灘上的遺失物，則是它無法吞下的部分。'},
    {number:28, chapter:'第六章：狂歡島真相', narrator:'前主持人', title:'狂歡島漂流瓶 28｜宴會主人不是一個人', text:'大家都以為狂歡島有一名神秘主人。其實主持人會不斷更換：第一位是療養院的行政官，第二位是忘記家人的病人，第三位是我。披上由緞帶縫成的外套後，你會自動知道下一首曲目，也會本能地阻止任何人停下。真正的主人不是穿披風的人，而是海底古鐘。主持人只是它用來維持節奏的手。'},
    {number:29, chapter:'第六章：狂歡島真相', narrator:'塞拉芬・維爾', title:'狂歡島漂流瓶 29｜真正的起源', text:'狂歡島不是遠古詛咒自然形成的。它源於一項王室療養計畫：伊莉莎白女王提供資金與密令，塞拉芬・維爾設計聲學治療，戴維・瓊斯帶來偷得的月潮沙漏與玻璃小提琴，礁岩下的古鐘則放大了所有人的渴望。第一場慰靈祭把四者結合，創造了永不結束的今晚。善意、羞恥、贓物與傲慢共同建成了這座島。'},
    {number:30, chapter:'第六章：狂歡島真相', narrator:'未知逃亡者', title:'狂歡島漂流瓶 30｜讓明天重新存在', text:'若要終止狂歡，不能只停止音樂，也不能燒掉面具。必須在最低潮時進入島心共鳴室，讓一個仍記得本名的人敲響古鐘的第八聲。第七聲奪走名字，第八聲會把所有記憶一次歸還。那可能讓整座島同時面對數十年的悲傷，也可能讓被困的人終於醒來。瘋狂神父最後留下的名字是塞拉芬・維爾。若你願意記住它，也許明天就還沒有完全消失。'}
  ];

  const ITEMS = [
    ['👒','華麗羽毛帽',0.1,0.4],['🎭','狂歡面具',0.2,0.8],['🎈','褪色派對氣球',0.01,0.05],['🧸','舊布偶',0.2,0.9],['🎠','壞掉的音樂盒',0.4,1.4],['🥂','裂紋水晶杯',0.2,0.7],['🍾','空酒瓶',0.3,1.1],['🎲','刻字骰子',0.05,0.2],['🎺','金色小喇叭',0.4,1.2],['🪇','斷柄沙鈴',0.15,0.5],['👗','華麗禮服碎片',0.1,0.6],['👔','黑色燕尾服',0.6,1.6],['👠','單隻高跟鞋',0.3,0.9],['👞','發霉皮鞋',0.4,1.2],['🎀','濕掉的緞帶',0.02,0.1],['💍','鍍金戒指',0.01,0.05],['🧤','白手套',0.03,0.12],['🎩','泡水禮帽',0.2,0.7],['📿','彩色項鍊',0.05,0.2],['🪞','裂開的化妝鏡',0.3,0.9]
  ];

  function read(key, fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch(error){return fallback;}}
  function save(key,value){localStorage.setItem(key,JSON.stringify(value));}
  function canonicalNumber(value,fallback=1){const n=Number(value);return Number.isFinite(n)&&n>=1?((Math.floor(n)-1)%META.count)+1:((fallback-1)%META.count)+1;}
  function numberFromEntry(entry,fallback){if(Number.isFinite(Number(entry?.carnivalIndex)))return canonicalNumber(entry.carnivalIndex,fallback);const m=String(entry?.title||'').match(/(\d{1,3})/);return m?canonicalNumber(m[1],fallback):canonicalNumber(fallback,1);}
  function entryFor(number,original={}){const base=LETTERS[canonicalNumber(number)-1];return{...original,...base,icon:META.icon,series:META.series,rarity:META.rarity,carnivalIndex:base.number,carnivalCompleteSeries:true,at:original.at||Date.now()};}
  function normalizeCarnival(){const list=read(KEY,[]);if(!Array.isArray(list))return;const seen=new Set();const next=[];list.forEach((entry,index)=>{if(!entry||typeof entry!=='object')return;const n=numberFromEntry(entry,index+1);if(seen.has(n))return;seen.add(n);next.push(entryFor(n,entry));});if(JSON.stringify(list)!==JSON.stringify(next))save(KEY,next.slice(-120));}
  function nextNumber(list){const seen=new Set(list.map((entry,index)=>numberFromEntry(entry,index+1)));for(let i=1;i<=META.count;i++)if(!seen.has(i))return i;return 1+Math.floor(Math.random()*META.count);}
  function createCarnivalLetter(){const list=read(KEY,[]);const safe=Array.isArray(list)?list:[];const entry=entryFor(nextNumber(safe));safe.push(entry);save(KEY,safe.slice(-120));return entry;}

  function addStyle(){
    if(document.getElementById('carnivalIslandStyle'))return;
    const s=document.createElement('style');s.id='carnivalIslandStyle';
    s.textContent='.carnival-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:48;background:rgba(26,12,30,.98);border:3px solid #ffb86b;border-radius:18px;padding:16px;color:#fff4d8;text-align:left;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32),0 0 28px rgba(255,184,107,.25);line-height:1.65;width:min(92%,720px);pointer-events:none}.carnival-card.hidden{display:none}.carnival-title{text-align:center;font-size:21px;margin-bottom:8px;color:#ffcf7a}.carnival-meta{text-align:center;color:#ffb86b;font-size:13px;margin-bottom:8px}.carnival-text{padding:12px;border:2px solid #8b5a77;border-radius:12px;background:#1a0f20}@media(max-width:760px){.carnival-card{position:fixed;top:42%;width:min(92vw,410px);max-height:68dvh;overflow-y:auto;padding:14px;z-index:14000}.carnival-text{max-height:48dvh;overflow-y:auto}}';
    document.head.appendChild(s);
  }
  function ensureCard(){const p=document.getElementById('gamePanel');if(!p||document.getElementById('carnivalCard'))return;if(getComputedStyle(p).position==='static')p.style.position='relative';const c=document.createElement('div');c.id='carnivalCard';c.className='carnival-card hidden';p.appendChild(c);}
  function showLetter(entry=createCarnivalLetter()){const card=document.getElementById('carnivalCard');if(!card)return;card.innerHTML=`<div class="carnival-title">${META.icon} ${entry.title}</div><div class="carnival-meta">${entry.chapter}｜記錄者：${entry.narrator}｜${entry.rarity}</div><div class="carnival-text">${entry.text}</div>`;card.classList.remove('hidden');setTimeout(()=>card.classList.add('hidden'),12000);}
  function showItem(){const card=document.getElementById('carnivalCard');if(!card)return;const itemData=ITEMS[Math.floor(Math.random()*ITEMS.length)];const weight=itemData[2]+Math.random()*(itemData[3]-itemData[2]);const item={name:itemData[1],zone:'狂歡島漂流物',rarity:'稀有',quality:'遺失物',weight,kind:'treasure',icon:itemData[0],note:'某位被狂歡島奪走記憶的人留下的外殼。',at:Date.now()};const bag=read('coffeeShipFishBag',[]);bag.push(item);save('coffeeShipFishBag',bag.slice(-220));card.innerHTML=`<div class="carnival-title">${item.icon} 狂歡島遺失物</div><div class="carnival-meta">遺失物｜稀有</div><div class="carnival-text">釣到了：${item.name}<br>來源：狂歡島海域<br>重量：${weight.toFixed(2)} kg<br><br>${item.note}</div>`;card.classList.remove('hidden');setTimeout(()=>card.classList.add('hidden'),6500);}

  function patchRuntime(){
    window.COFFEE_SHIP_BOTTLE_PROVIDERS=window.COFFEE_SHIP_BOTTLE_PROVIDERS||{};
    window.COFFEE_SHIP_BOTTLE_PROVIDERS.carnival={META,getEntry:n=>entryFor(n),create:createCarnivalLetter};
    const restore=window.COFFEE_SHIP_BOTTLE_RESTORE;
    if(restore?.META?.carnival)Object.assign(restore.META.carnival,META);
    if(restore?.STORE)restore.STORE.carnival=KEY;
    if(restore)restore.carnivalCompleteSeries=LETTERS;
    const db=window.COFFEE_SHIP_DB;
    if(db){db.carnivalLetters=LETTERS;db.createCarnivalLetter=createCarnivalLetter;if(Array.isArray(db.bottles)){let found=false;db.bottles=db.bottles.map(row=>{if(!Array.isArray(row)||row[0]!=='carnival')return row;found=true;return['carnival',META.icon,META.series,META.rarity,LETTERS[0].text];});if(!found)db.bottles.push(['carnival',META.icon,META.series,META.rarity,LETTERS[0].text]);}}
  }

  let lock=false;
  function isDeckOpen(){const api=window.COFFEE_SHIP_DECK;if(api?.isDeckOpen)return api.isDeckOpen();const d=document.getElementById('deckOverlay');return d&&!d.classList.contains('hidden');}
  function tryCarnival(event){if(!isDeckOpen()||lock||Math.random()>.16)return false;lock=true;event?.preventDefault?.();event?.stopImmediatePropagation?.();setTimeout(()=>{Math.random()<.62?showLetter():showItem();lock=false;},700+Math.random()*900);return true;}
  function bind(){window.addEventListener('keydown',event=>{const k=event.key?.length===1?event.key.toLowerCase():event.key;if(k==='f'||k==='c')tryCarnival(event);},true);document.getElementById('coffeeBtn')?.addEventListener('click',event=>tryCarnival(event),true);}
  function init(){addStyle();ensureCard();normalizeCarnival();patchRuntime();bind();[500,1500,3500].forEach(ms=>setTimeout(()=>{normalizeCarnival();patchRuntime();},ms));}

  window.COFFEE_SHIP_CARNIVAL_SERIES={META,LETTERS,origin:'晨潮療養島的王室聲學治療實驗失控',founder:'塞拉芬・維爾',getEntry:n=>entryFor(n),createCarnivalLetter,normalizeCarnival,showLetter};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();