(() => {
  'use strict';

  const KEY = 'coffeeShipArielLetters';
  const META = { icon:'🧜‍♀️', series:'愛麗兒漂流瓶', rarity:'史詩', count:30 };

  const ARIEL_BOTTLES = [
    {
      number:1, chapter:'第一章：相遇', title:'愛麗兒漂流瓶 01｜暴風雨裡的人類',
      text:'今晚的海非常可怕。閃電一次又一次劃開天空，浪高得幾乎遮住月亮。我本來只是想去看看那艘被暴風推翻的船，卻在沉船旁看見一個人類。他拼命抓著斷裂的木板，每一道浪都像要把他拖進更深的地方。我知道人魚不該靠近人類，父親總說他們會害怕我們，也會傷害我們。可是他的手還在微微動著。如果我現在離開，他一定會死。所以，我第一次游向了人類。我扶住他的肩膀，他的身體很冰，胸口卻還有微弱的心跳。那是我第一次碰觸人類，也是第一次如此希望一個陌生人能活下來。'
    },
    {
      number:2, chapter:'第一章：相遇', title:'愛麗兒漂流瓶 02｜他醒來以前',
      text:'我把他帶到了沙灘。一路上，他沒有醒，只是偶爾因疼痛皺起眉頭。等我把他放到岸邊時，天已經快亮了。我躲在礁石後面，看著潮水慢慢退去。沒多久，一群穿著華麗衣服的人跑來，不停喊著「王子」。原來，他不是普通的人。他們把他抬走以前，他的眼睛微微睜開了一下，目光朝海面停留了片刻。我不知道他是不是看見了我，卻牢牢記住了那雙像清晨天空一樣的眼睛。我把這個念頭藏進心裡，像把珍珠藏進最深的貝殼。'
    },
    {
      number:3, chapter:'第一章：相遇', title:'愛麗兒漂流瓶 03｜岸上的歌聲',
      text:'第三天，我又去了那片海岸。王子已經能夠坐起來，很多人圍在他身旁，有人替他換藥，有人唱歌給他聽。他忽然笑了一下，所有人也跟著笑。我從來不知道，一個人的笑容真的能讓海水變得溫柔。後來，他聽見遠處有女孩唱歌，便轉頭看了很久。那個女孩不是我，可是他眼裡的溫柔仍讓我心裡既安靜又疼痛。我開始想，如果我也能站在岸上，如果我也能讓他聽見我的聲音，他會不會記得暴風雨裡曾有一雙手，把他重新推回世界。'
    },
    {
      number:4, chapter:'第一章：相遇', title:'愛麗兒漂流瓶 04｜每天經過的船',
      text:'王子的船修好了。從那天起，我每天都游到同一片航道，等待白色船帆從海平線出現。他總喜歡站在船頭，有時向岸上的孩子揮手，有時扶起跌倒的人，有時只是安靜看著大海。我不知道他在看什麼，卻總希望他的目光能在海面多停留一會兒，說不定就能看見我。我本該為他的善良感到高興，卻第一次知道，心會因為一個人的溫柔而變得貪心。我只是海裡一個不能開口的秘密，偷偷跟著他的船，假裝這也算陪伴。'
    },
    {
      number:5, chapter:'第一章：相遇', title:'愛麗兒漂流瓶 05｜第一次心動',
      text:'今天，他的船停在離我很近的地方。一枚白色貝殼被海浪推到甲板旁，他彎腰把它撿起來，放進口袋。那枚貝殼，是我昨天遺落在礁石上的。我不知道他是否認出它來自那場暴風雨，也不知道他是不是只覺得它漂亮。可是我看見他低頭端詳貝殼時，眼神比看寶石還柔和。海水突然變得很亮，連魚群都像在替我保守秘密。直到今天，我才終於承認，我喜歡上了那位王子。不是因為他的王冠，而是因為他在快要沉入海底時，仍然拼命抓住海面，像相信明天真的會來。'
    },
    {
      number:6, chapter:'第二章：靠近', title:'愛麗兒漂流瓶 06｜海風裡的名字',
      text:'今天，我第一次聽見他的名字。港口的人遠遠向他行禮，孩子們追著他的馬車跑，老人也笑著朝他揮手。他沒有急著離開，而是一個個回應。他似乎願意記住所有人的名字，也願意停下來聽每一個無關緊要的故事。我開始理解，為什麼那麼多人喜歡他。我忽然希望，有一天他也能知道我的名字。可是當我在海裡輕聲念出「愛麗兒」時，只有泡沫聽見。海風把岸上的名字帶到我面前，卻沒有辦法把我的名字送到他的耳邊。'
    },
    {
      number:7, chapter:'第二章：靠近', title:'愛麗兒漂流瓶 07｜他總是很溫柔',
      text:'今天有個小女孩在港口跌倒了，哭得很大聲。王子立刻蹲下來，替她拍掉裙子上的沙，還把胸前的一朵白花放進她手裡。女孩很快就笑了。我躲在水下看著這一切，心裡暖得像照進陽光。我想，他一定是世界上最溫柔的人。如果有一天，他也能如此看著我，也能問我疼不疼，那一定會是最幸福的事情。可是當他離開後，我才發現自己竟然記住了他觸碰女孩頭髮的方式。原來羨慕和心動，有時候看起來那麼相似。'
    },
    {
      number:8, chapter:'第二章：靠近', title:'愛麗兒漂流瓶 08｜港口的另一位女孩',
      text:'今天，一位穿藍裙的女孩站在碼頭等他。王子下船時，她立刻跑了過去，他也很自然地摸了摸她的頭。兩個人說笑的模樣像認識了很久。我原本以為她一定是他的戀人，胸口忽然像被漁網勒住。可是沒多久，女孩便揮手離開，王子又繼續和其他人交談。我鬆了一口氣，卻不知道自己憑什麼鬆一口氣。他甚至不知道我存在。我第一次發現，只要看著他，我就會替每一個眼神尋找意義，也會為每一個靠近他的人感到害怕。'
    },
    {
      number:9, chapter:'第二章：靠近', title:'愛麗兒漂流瓶 09｜我開始等待',
      text:'不知道從什麼時候開始，每天最重要的事情變成等待那艘船。有時它晚一點出現，有時整天都不會回港。每當海平線空空的，我便忍不住猜想：他是不是又遇見暴風雨？是不是去了更遠的港口？是不是在另一片海上對別人露出同樣的笑容？我的心情開始跟著他的船一起航行。他回來，我便覺得海水明亮；他沒有回來，整片海都顯得沉重。我從前以為海是世界上最廣闊的地方，現在才知道，等待一個人時，再大的海也只剩下一條航線。'
    },
    {
      number:10, chapter:'第二章：靠近', title:'愛麗兒漂流瓶 10｜那枚白色貝殼',
      text:'今天，他又把那枚白色貝殼拿了出來。他獨自坐在甲板上，看了很久，最後輕輕笑了一下。我躲在船影下面，幾乎相信他還記得暴風雨，還記得有人曾把他送回岸邊。也許他不知道那個人是我，卻至少沒有忘記那一天。我開始相信，總有一天我們一定會真正相遇。我甚至想像他看見我的臉、聽見我的名字，然後把貝殼放回我的掌心。現在想來，那也許只是我替一個普通動作寫下的童話。可當時的我，真的把他的微笑當作海給我的承諾。'
    },
    {
      number:11, chapter:'第三章：多情', title:'愛麗兒漂流瓶 11｜他對每個人都笑',
      text:'今天，我離岸更近了一些。我看見王子向每一位經過的人點頭，扶起老人、陪孩子玩、替漁夫搬魚籃，也替一位年輕女孩整理被風吹亂的頭髮。每一個人都笑了，而他也對每一個人露出相同的溫柔。我忽然不知道，我最喜歡的那個笑容，究竟是不是只屬於我幻想中的他。或許他從未給過我任何暗示，只是我把他對世界的善意偷偷切下一小塊，藏起來，假裝那是只為我準備的愛。海水仍然溫暖，我卻第一次在陽光下感到冷。'
    },
    {
      number:12, chapter:'第三章：多情', title:'愛麗兒漂流瓶 12｜第一束花',
      text:'今天有位女孩送給王子一束花。他笑著收下，還低頭聞了聞花香。女孩的臉立刻紅了。下一刻，另一位女孩又送來一串貝殼項鍊，他依然溫柔地接受，甚至親自替她戴好。後來還有第三個、第四個人靠近他，每個人都像相信自己得到了特別的回應。我突然明白，他的溫柔從來沒有分給誰比較多，也沒有分給誰比較少。他擅長讓每個人覺得自己被看見，卻未必真正看見任何一個人。我仍替他辯解，說這只是王子的禮貌，可心裡那枚白色貝殼，第一次失去了光。'
    },
    {
      number:13, chapter:'第三章：多情', title:'愛麗兒漂流瓶 13｜我替他找理由',
      text:'今天，他陪另一位女孩沿著海岸散步。她笑得很開心，他替她提著鞋，讓她赤腳踩過潮水。我本來想離開，卻還是遠遠跟著，直到夕陽沉下去。我不停告訴自己：他只是善良，只是不忍心拒絕，只是對所有朋友都這樣。每找出一個理由，我就能再多喜歡他一會兒。可是理由越來越多，我也越來越分不清，自己是在理解他，還是在欺騙自己。人魚會用歌聲迷惑水手，而我沒有唱歌，卻被自己編出的故事困住了。'
    },
    {
      number:14, chapter:'第三章：多情', title:'愛麗兒漂流瓶 14｜他記不住我',
      text:'今天，我第一次游得離船那麼近，近到能聽見他的呼吸。他靠在欄杆上看海，目光從我藏身的浪花上掠過，沒有停留。他記得港口商人的女兒喜歡玫瑰，記得小女孩的生日，也記得每一位來訪貴族的稱呼，卻永遠不可能記得我。暴風雨那晚，把他送回岸上的人就在不到十步之外，可在他的世界裡，那個人從未存在。我突然明白，沒有被遺忘和從未被記住，是兩種不同的痛。前者至少證明曾經擁有，後者連失去的資格都沒有。'
    },
    {
      number:15, chapter:'第三章：多情', title:'愛麗兒漂流瓶 15｜我開始害怕',
      text:'以前，我總期待他的船出現。現在我仍然期待，卻也開始害怕。害怕看見他和別人一起笑，害怕他對每一位女孩都露出一模一樣的眼神，更害怕有一天我終於站到他的面前，才發現自己只是他生命裡另一位陌生人。今晚，我第一次沒有追著他的船，只是靜靜浮在海面，看著它越來越遠，直到夜色將它吞沒。我不知道自己是在等待一場愛情，還是在等待一場注定不會發生的相遇。可即使害怕，我仍然無法讓自己不再想他。'
    },
    {
      number:16, chapter:'第四章：代價', title:'愛麗兒漂流瓶 16｜沒有人屬於我',
      text:'今天港口舉辦了舞會。許多女孩穿著漂亮的禮服，圍在王子身旁。他依然溫柔，依然耐心，也依然讓每個靠近他的人都以為自己是特別的。我忽然明白，我從來沒有真正擁有過他，所以也沒有資格說自己失去了他。可是，為什麼心還是這麼痛？也許愛並不需要得到允許，就會在身體裡生根；而嫉妒也不需要任何承諾，就能長出刺。我躲在港口外的黑暗中，看著舞會的燈映在海面，第一次覺得自己的尾巴像一條無法跨越的鎖鏈。'
    },
    {
      number:17, chapter:'第四章：代價', title:'愛麗兒漂流瓶 17｜海巫婆的代價',
      text:'今天，我去找了海巫婆。她早就知道我的名字，也知道我每天偷偷跟著王子的船。她笑著問：「妳想站到他身邊嗎？」我點了點頭。她拿出一瓶像月光一樣透明的藥水，說喝下去，我就能擁有雙腳，但會永遠失去聲音。她警告我，每一步都會像踩在碎玻璃上，而我仍然沒有猶豫。我一直以為，只要能站在他身旁，有沒有聲音都不重要。現在回想起來，那是我犯下最傲慢的錯誤：我以為愛可以代替語言，也以為他會願意聽懂一個沉默的人。'
    },
    {
      number:18, chapter:'第四章：代價', title:'愛麗兒漂流瓶 18｜第一眼',
      text:'今天，我終於站在陸地上。每一步都像踩在碎玻璃上，疼痛從腳底一路刺進胸口，可我仍然笑了，因為我終於來到他的世界。王子看見我快要跌倒，立刻伸手扶住我。他問：「妳還好嗎？」我努力張開嘴，卻發不出任何聲音。他沒有生氣，只是溫柔地說：「別怕，我會照顧妳。」那一刻，我幾乎相信所有代價都是值得的。我沒有注意到，他對受傷的小女孩、迷路的旅人、甚至每一位需要幫助的陌生人，都曾說過幾乎相同的話。'
    },
    {
      number:19, chapter:'第四章：代價', title:'愛麗兒漂流瓶 19｜沉默的人',
      text:'王子把我留在城堡裡。他帶我去花園，陪我散步，也向我說了許多航海故事。我只能微笑、點頭，或在紙上寫下最簡單的句子。有時他會問：「妳到底想告訴我什麼？」我多想說，暴風雨那天救你的人就是我；多想告訴他，我在海裡等了他那麼久。可是我的聲音早已沉進海底，而他似乎更喜歡我的沉默。他可以把所有想法說給我聽，不必擔心我反駁，也不必真正理解我。原來被留在身邊，並不等於被看見。'
    },
    {
      number:20, chapter:'第四章：代價', title:'愛麗兒漂流瓶 20｜狂歡島',
      text:'今天，王子興奮地告訴我，海上有一座神奇的島。那裡沒有煩惱、沒有規矩、沒有身分，只有永遠不會結束的宴會。許多王公貴族、商人和旅人都前往那裡，所有去過的人都說，那是世界上最快樂的地方。他笑著問我：「妳想一起去嗎？」我看著窗外的大海，不知道為什麼，海面突然安靜得可怕，連海鳥都沒有飛過。我不是害怕那座島，而是害怕他談起它時眼裡的光。那是一種比愛情更急切的渴望，像他已經開始離開。'
    },
    {
      number:21, chapter:'第五章：消失', title:'愛麗兒漂流瓶 21｜最後一次啟航',
      text:'今天，港口比平常更熱鬧，船上掛滿彩旗。王子站在甲板上，笑著向岸上的人揮手。他走到我面前，把一枚藍色貝殼放進我的掌心，說：「等我回來。」我努力點頭，仍然發不出聲音。我想抓住他的手，想警告他不要前往那座島，可我的沉默再次替他做了決定。他轉身登船，白帆慢慢離開港口。我一直站在岸邊，直到船變成海平線上的一個小點。那句「等我回來」，成了他留給我的最後一句承諾，也成了我後來最不願放下的謊言。'
    },
    {
      number:22, chapter:'第五章：消失', title:'愛麗兒漂流瓶 22｜跟著他的航線',
      text:'第二天，我回到海裡，沿著他的航線追上了船。他不知道，船底下始終有一條人魚陪著。夜裡，甲板上的音樂傳進海水，他和許多人跳舞、舉杯、歡笑。他總能讓身邊的人快樂，也總能被新的笑聲吸引。我忽然發現，他很少停下來問自己真正想去哪裡，只是不斷朝下一場宴會前進。海流開始改變方向，魚群紛紛避開前方，連年老的鯨都發出低沉的警告。船上的人沒有聽見，或者他們聽見了，卻把那聲音當成音樂的一部分。'
    },
    {
      number:23, chapter:'第五章：消失', title:'愛麗兒漂流瓶 23｜不自然的海',
      text:'越往北，海越安靜。沒有海鳥，沒有海豚，甚至沒有鯨魚。只有一片平靜得詭異的海，像某種東西正在屏住呼吸。海面上開始漂來許多物品：紅色洋裝、舞鞋、破掉的小丑面具、彩色氣球和孩子的玩具。我起初以為那是沉船留下的東西，直到發現每一件衣物都乾乾淨淨，像昨天才有人穿過；每一件玩具也沒有破損，像主人只是突然鬆開了手。船上的人把它們撈起來當作紀念品，只有我明白，海正在把警告一件件送到我們面前。'
    },
    {
      number:24, chapter:'第五章：消失', title:'愛麗兒漂流瓶 24｜狂歡島',
      text:'今天，我終於看見那座島。它比故事裡更漂亮，森林裡掛滿燈火，音樂穿過海霧，海岸上的每個人都在笑。所有人都戴著不同的面具：狐狸、獅子、狼、鹿、鳥，像早已忘記自己的臉。王子笑著走下船，有人替他戴上一張狐狸面具，他沒有拒絕，甚至笑得比以前更開心。我躲在近岸的礁石後，不敢再前進。那裡沒有守衛，也沒有高牆，可每一個登島的人都像跨過一道看不見的門。我看著王子走進燈火，第一次覺得自己也許永遠追不上他。'
    },
    {
      number:25, chapter:'第五章：消失', title:'愛麗兒漂流瓶 25｜他沒有回頭',
      text:'我一直待在海裡，看著王子走進人群。他和陌生人跳舞、喝酒、唱歌，笑得比我認識他的任何一天都更開心。我等他回頭，等他再看一眼大海，等他想起那枚白色貝殼，也等他想起曾有一位人魚在暴風雨裡救過他。可是，直到夜色吞沒整座島，直到所有燈火亮起，他始終沒有回頭。我流著眼淚游回深海。那一天，我第一次覺得自己失去的並不是王子，而是那個曾經相信，只要付出足夠多，童話就一定會有好結局的自己。'
    },
    {
      number:26, chapter:'第六章：警告', title:'愛麗兒漂流瓶 26｜狂歡之後沒有明天',
      text:'我在島外等了七天。第一天，我以為他只是玩累了；第二天，我以為他喝醉了；第三天，我開始擔心。到了第七天，我終於發現，從來沒有任何人真正離開狂歡島。每天都有新的船靠岸，每天都有新的人登島，可返回海上的只有空船。那些船被潮汐慢慢推回大海，甲板上還放著未喝完的酒，船艙裡還留著行李，卻一個人也沒有。我曾經把「等我回來」當作承諾，現在才明白，在那座沒有明天的島上，承諾是第一個被遺忘的東西。'
    },
    {
      number:27, chapter:'第六章：警告', title:'愛麗兒漂流瓶 27｜海流送來的東西',
      text:'最近，海流每天都從島上送來新的東西。一雙舞鞋、一頂狐狸面具、一件仍有香水味的禮服、孩子的玩具熊、戒指、項鍊，甚至還有寫到一半的日記。我從來沒有找到任何人的遺體。那些物品像是主人突然從世界上消失，只留下最後一次穿戴和玩耍的痕跡。我把它們一件件推向遠離島嶼的海流，希望有人能撿到，能從中看見警告。海正在替那座島保守秘密，也正在用它唯一能做到的方式，把真相送出去。'
    },
    {
      number:28, chapter:'第六章：警告', title:'愛麗兒漂流瓶 28｜我再也認不出他',
      text:'今天，我終於又看見王子。他站在碼頭，穿著比以前更華麗的衣服，臉上戴著新的面具。他仍然笑著，卻像已經忘記笑容原本是為了什麼。以前的他總愛望向遠方，現在他的眼裡只剩眼前的狂歡。我游到很近的地方，他低頭看了一眼海面，目光從我身上掠過，像只是看見一條普通的魚。他沒有認出我，也沒有認出那片曾救過他的海。那一刻我明白，消失的不是他的記憶，而是原本的他。王子仍站在那裡，可我愛過的那個人已經不在了。'
    },
    {
      number:29, chapter:'第六章：警告', title:'愛麗兒漂流瓶 29｜我沒有再等',
      text:'今晚，狂歡島依舊熱鬧，音樂比以前更響，笑聲比以前更多。可是我沒有再停留。我把他送給我的藍色貝殼放回海裡，看著它慢慢沉進黑暗。我終於承認，我一直等待的不是戴著王冠的王子，而是暴風雨裡那個拼命想活下來的人。那個人也許在踏上狂歡島時，就已經留在了碼頭。愛並沒有拯救他，我的犧牲也沒有讓他更懂得珍惜。離開不是背叛，而是我第一次把自己從一段沒有回應的等待裡救出來。'
    },
    {
      number:30, chapter:'第六章：警告', title:'愛麗兒漂流瓶 30｜如果你撿到這封信',
      text:'如果你正在讀這封信，代表海又把它送了出去。請答應我，不要追逐那座燈火通明的島，不要相信那裡永遠的笑聲，也不要因為孤單，就想尋找永遠的快樂。我曾經以為愛能改變一個人，後來才知道，有些地方會改變所有人。如果你在海面看見漂亮的衣服、乾淨的玩具和沒有主人的面具，請立刻轉身。當你開始覺得遠方的音樂很好聽時，通常已經太晚了。真正漂流的從來不是那些物品，而是那些再也回不了家的人。'
    }
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (error) { return fallback; }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function canonicalNumber(value, fallback = 1) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 1) return ((Math.floor(parsed) - 1) % META.count) + 1;
    return ((fallback - 1) % META.count) + 1;
  }

  function numberFromEntry(entry, fallback) {
    if (entry && Number.isFinite(Number(entry.arielIndex))) return canonicalNumber(entry.arielIndex, fallback);
    const match = String(entry?.title || '').match(/(?:漂流瓶\s*)?(\d{1,3})/);
    return match ? canonicalNumber(match[1], fallback) : canonicalNumber(fallback, 1);
  }

  function entryFor(number, original = {}) {
    const index = canonicalNumber(number) - 1;
    const base = ARIEL_BOTTLES[index];
    return {
      ...original,
      ...base,
      icon:META.icon,
      series:META.series,
      rarity:META.rarity,
      arielIndex:base.number,
      arielCompleteSeries:true,
      at:original.at || Date.now()
    };
  }

  function collectedNumbers(list) {
    return new Set(list.map((entry, index) => numberFromEntry(entry, index + 1)));
  }

  function nextBottleNumber(list) {
    const collected = collectedNumbers(list);
    for (let number = 1; number <= META.count; number += 1) {
      if (!collected.has(number)) return number;
    }
    return 1 + Math.floor(Math.random() * META.count);
  }

  function normalizeAriel() {
    const list = read(KEY, []);
    if (!Array.isArray(list)) return;

    let changed = false;
    const next = list.map((entry, index) => {
      if (!entry || typeof entry !== 'object') return entry;
      const canonical = entryFor(numberFromEntry(entry, index + 1), entry);
      if (
        entry.title !== canonical.title ||
        entry.text !== canonical.text ||
        entry.icon !== canonical.icon ||
        entry.series !== canonical.series ||
        entry.rarity !== canonical.rarity ||
        entry.chapter !== canonical.chapter ||
        Number(entry.arielIndex) !== canonical.arielIndex
      ) changed = true;
      return canonical;
    });

    if (changed) save(KEY, next.slice(-120));
  }

  function createArielBottle() {
    const list = read(KEY, []);
    const safeList = Array.isArray(list) ? list : [];
    const entry = entryFor(nextBottleNumber(safeList));
    safeList.push(entry);
    save(KEY, safeList.slice(-120));
    return entry;
  }

  function patchBottleRestore() {
    const restore = window.COFFEE_SHIP_BOTTLE_RESTORE;
    if (!restore) return;

    restore.ARIEL_BOTTLES = ARIEL_BOTTLES;
    restore.arielChapterOne = ARIEL_BOTTLES.slice(0, 5);
    restore.arielCompleteSeries = ARIEL_BOTTLES;
    if (restore.META?.ariel) restore.META.ariel.count = META.count;

    const current = restore.createFullBottle;
    if (typeof current === 'function' && !current.__arielThirtyPatched) {
      const original = current;
      const wrapped = function createFullBottleWithAriel(type) {
        return type === 'ariel' ? createArielBottle() : original.call(this, type);
      };
      wrapped.__arielThirtyPatched = true;
      restore.createFullBottle = wrapped;
    }
  }

  function patchBottleCore() {
    const core = window.COFFEE_SHIP_BOTTLE_CORE;
    if (!core) return;

    if (core.bottleSeries?.coffeeShipArielLetters) {
      core.bottleSeries.coffeeShipArielLetters.icon = META.icon;
      core.bottleSeries.coffeeShipArielLetters.series = META.series;
      core.bottleSeries.coffeeShipArielLetters.rarity = META.rarity;
    }

    const current = core.createBottle;
    if (typeof current === 'function' && !current.__arielThirtyPatched) {
      const original = current;
      const wrapped = function createBottleWithAriel(key, title, text) {
        const signature = `${key || ''} ${title || ''} ${text || ''}`;
        if (/Ariel|愛麗兒/.test(signature)) return createArielBottle();
        return original.call(this, key, title, text);
      };
      wrapped.__arielThirtyPatched = true;
      core.createBottle = wrapped;
    }
  }

  function patchDatabase() {
    const db = window.COFFEE_SHIP_DB;
    if (!db) return;

    if (Array.isArray(db.bottles)) {
      let found = false;
      db.bottles = db.bottles.map(row => {
        if (!Array.isArray(row) || row[0] !== 'ariel') return row;
        found = true;
        return ['ariel', META.icon, META.series, META.rarity, ARIEL_BOTTLES[0].text];
      });
      if (!found) db.bottles.push(['ariel', META.icon, META.series, META.rarity, ARIEL_BOTTLES[0].text]);
    }

    db.arielBottles = ARIEL_BOTTLES;
    db.createArielBottle = createArielBottle;
  }

  function patchRuntime() {
    patchBottleRestore();
    patchBottleCore();
    patchDatabase();
  }

  function init() {
    normalizeAriel();
    patchRuntime();
    setInterval(() => {
      normalizeAriel();
      patchRuntime();
    }, 1200);
  }

  window.COFFEE_SHIP_ARIEL_CHAPTER1 = {
    CHAPTER_ONE:ARIEL_BOTTLES.slice(0, 5),
    createArielChapter1:createArielBottle,
    normalizeAriel
  };

  window.COFFEE_SHIP_ARIEL_SERIES = {
    META,
    ARIEL_BOTTLES,
    getEntry:number => entryFor(number),
    createArielBottle,
    normalizeAriel
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();