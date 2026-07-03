(() => {
  'use strict';

  const names = ['哈斯','可可','莫納'];
  const beats = [
    '我們在暴雨後被沖上孤島，哈斯說他認識一個叫威爾伯德的人，若他也失蹤了，這片海一定出事了。',
    '可可把最後的淡水分給莫納，哈斯看見後沉默很久。我第一次感覺，飢餓之外還有更難說出口的東西。',
    '莫納在沙上寫下威爾伯德的名字，說他以前教過我們辨認黑礁石。原來他們真的互相認識。',
    '哈斯想做木筏，可可卻想先找水源。莫納夾在他們中間，像在替兩個人的心跳決定方向。',
    '夜裡可可發燒，哈斯守在旁邊。莫納背對我們坐著，我聽見她偷偷哭。',
    '我們找到一個舊瓶子，裡面有威爾伯德寫過的半張紙。哈斯說，他可能也在附近某座島上。',
    '可可問哈斯，如果只能救一個人，他會救誰。哈斯沒有回答，莫納卻先走進雨裡。',
    '海面漂來破木板，上面刻著 Coffee Ship。威爾伯德、我們、這些島，似乎被同一場海難串在一起。',
    '莫納抓到魚，第一口給了可可。哈斯笑了，但那個笑比哭還難看。',
    '第十天，我們還活著。可可說她夢見王子與人魚，醒來後只問：被拋下的人要怎麼繼續愛？',
    '哈斯承認他喜歡可可，卻也說自己離不開莫納。孤島沒有審判，可是沉默會把人逼瘋。',
    '莫納說她不想成為任何人的第二選擇。她把今天的信交給海浪，像把自己也放走一點。',
    '可可找到淡水泉，我們得救了一半。她笑著抱住莫納，哈斯站在後面，手裡的椰殼掉了。',
    '我們嘗試點火求救。煙升起時，可可握住哈斯，莫納卻在看遠方。三個人都在等不同的人回頭。',
    '威爾伯德以前說，黑礁石附近有逆流。若有人收到這封信，請也找他。他不是會輕易死掉的人。',
    '第十六天，哈斯和莫納吵架。莫納說：你愛她，就不要用愧疚抱著我。這句話讓整座島安靜。',
    '可可開始迴避哈斯。她說愛在孤島上會變形，分不清是心動，還是害怕一個人死去。',
    '我們發現山洞牆上有威爾伯德留下的箭頭。他真的來過這裡，或者至少離我們很近。',
    '莫納手被礁石割傷，哈斯替她包紮。可可看見後走開。海浪把所有人的表情都推回岸上。',
    '第二十天，可可說如果能回去，她會假裝沒有愛過任何人。哈斯說他做不到。莫納說她早就知道。',
    '夜裡有巨大的黑影繞島。牠的呼吸像船笛。哈斯說那可能也是威爾伯德信裡提過的海獸。',
    '我們把三個人的名字刻在同一棵樹上。可可刻得最深，像怕回去以後有人不承認這段日子。',
    '莫納問我：如果救援只來一次，我們會不會為了上船互相推開？沒有人回答。',
    '哈斯找到一枚舊指南針，上面刻著 W。也許是威爾伯德的。指針一直指向黑礁石。',
    '第二十五天，可可終於哭著說她也喜歡哈斯。莫納聽完點點頭，然後把晚餐讓給他們。',
    '莫納失蹤了半天，我們在北岸找到她。她說她只是想知道，一個人活下去是不是比較簡單。',
    '哈斯把木筏拆了，因為他不想留下任何人。可可罵他自私，莫納卻說這是他第一次誠實。',
    '我們在海邊看到遠處火光。可可喊威爾伯德的名字，哈斯也跟著喊。沒有人回應。',
    '莫納開始教可可用星星辨方向。她們笑的時候，哈斯看起來又幸福又痛苦。',
    '第三十天，雨季來了。山洞裡太冷，三個人只能靠在一起取暖。愛與求生在黑暗裡變得很像。',
    '可可說她不想搶走莫納重要的人。莫納回答：人不是東西，搶不走；會走的本來就會走。',
    '哈斯夢見威爾伯德站在黑礁石上，要我們別靠近。他醒來後整天不敢看海。',
    '我們做了第二艘木筏，這次三個人的名字都刻在底部。就算沉了，也要一起留下證明。',
    '莫納找到能吃的果子，但味道苦得像後悔。她說這座島一直在逼我們說真話。',
    '第三十五天，可可親了哈斯。莫納看見了。晚上海面很平，卻沒有人睡得著。',
    '莫納沒有責怪可可，她只是把自己那份魚分成兩半給他們。這比責怪更讓人難受。',
    '哈斯向莫納道歉，說自己太貪心。莫納說：你不是貪心，你只是害怕失去任何一個能讓你活下去的人。',
    '我們再次找到威爾伯德的刻痕：第十天，往東生火。原來他的求救信不是傳說，他真的撐過那裡。',
    '可可開始把每封信編號。她說如果我們死在這裡，至少後來的人會知道我們不是只有名字。',
    '第四十天，海獸撞上礁石，浪把營地沖毀。哈斯救了莫納，可可救了火種。每個人都救了自己最害怕失去的東西。',
    '莫納說她會離開他們兩個，如果有船來。可可抱住她，說我們不是因為愛錯人才相遇。',
    '哈斯終於說：我愛可可，也愛莫納，但兩種愛不一樣。這句話沒有解決問題，卻讓我們停止假裝。',
    '遠方有船影，卻沒有靠近。可可把信丟出去時說：拜託，如果你見過威爾伯德，也請告訴他我們還在。',
    '第四十四天，我們的腳都長了傷。莫納仍每天巡岸，哈斯做陷阱，可可寫信。活著變成一種分工。',
    '夜裡可可問莫納恨不恨她。莫納說恨過，但更多時候是羨慕。羨慕她敢把想要的說出來。',
    '哈斯在黑礁石附近找到一條布帶，上面有 W。威爾伯德可能被救走，也可能只是又漂到更遠的島。',
    '第四十七天，我們決定等滿五十天就冒險出海。可可說，若死在海上，也比把心困死在島上好。',
    '莫納把自己的項鍊交給可可，說如果她先撐不住，就讓可可替她回家。可可罵她不准說這種話。',
    '第四十九天，哈斯、可可、莫納一起把最後三封信封好。哈斯寫威爾伯德，可可寫愛，莫納寫自由。',
    '第五十天以上。我們還在島上，但已經不只是遇難者。若 Coffee Ship 收到這封信，請循著黑礁石找威爾伯德，也找我們。'
  ];
  let lock = false;

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function addStyle(){ if(document.getElementById('islandTriangleStyle')) return; const s=document.createElement('style'); s.id='islandTriangleStyle'; s.textContent='.island-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:48;background:rgba(20,15,30,.98);border:3px solid #d7bb79;border-radius:18px;padding:16px;color:#fff4d8;text-align:left;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32);line-height:1.65;max-width:92%;pointer-events:none}.island-card.hidden{display:none}.island-title{text-align:center;font-size:21px;margin-bottom:8px;color:#ffe16b}.island-text{padding:10px;border:2px solid #76536a;border-radius:12px;background:#1a1220}@media(max-width:760px){.island-card{position:fixed;top:38%;width:min(88vw,360px);max-height:58dvh;overflow-y:auto;padding:14px}}'; document.head.appendChild(s); }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('islandCard')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='islandCard'; c.className='island-card hidden'; p.appendChild(c); }
  function saveRead(title,text){ let list=[]; try{list=JSON.parse(localStorage.getItem('coffeeShipIslandLetters')||'[]');}catch(e){} if(!list.some(x=>x.title===title)) list.push({title,text,at:Date.now()}); localStorage.setItem('coffeeShipIslandLetters',JSON.stringify(list.slice(-60))); }
  function showLetter(){ const card=document.getElementById('islandCard'); if(!card) return; const i=Math.floor(Math.random()*beats.length); const day=i+1; const speaker=names[i%3]; const title=`${speaker}的漂流瓶 Day ${day}`; const text=beats[i]; saveRead(title,text); card.innerHTML=`<div class="island-title">🏝️ ${title}</div><div class="island-text">${text}</div>`; card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'),7800); }
  function tryIsland(e){ if(!isDeckOpen()||lock) return false; if(Math.random()>.18) return false; lock=true; e?.preventDefault?.(); e?.stopImmediatePropagation?.(); setTimeout(()=>{showLetter(); lock=false;},700+Math.random()*900); return true; }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c')tryIsland(e);},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>tryIsland(e),true); }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();