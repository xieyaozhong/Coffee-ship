import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../',import.meta.url);
const read = name => fs.readFileSync(new URL(name,root),'utf8');
const iconSource = read('coffee-ship-fish-pixel-icons.js');
const sharkSource = read('deck-shark-event.js');
const deckSource = read('deck-fishing.js');

const sharks = [...sharkSource.matchAll(/\['([^']+)','([^']+)',(\d+),(\d+),(\d+)\]/g)].map(match => ({
  name:match[1],rarity:match[2],kind:'shark'
}));

function fakeCanvas() {
  const commands = [];
  const context = {
    imageSmoothingEnabled:true,
    fillStyle:'#000',
    fillRect(...args) { commands.push(['fill',this.fillStyle,...args]); },
    clearRect(...args) { commands.push(['clear',...args]); },
    save() {},restore() {},drawImage() {}
  };
  return {
    width:0,height:0,setAttribute() {},getContext:() => context,
    toDataURL:() => `data:image/png;base64,${Buffer.from(JSON.stringify(commands)).toString('base64')}`
  };
}

const document = {
  readyState:'loading',addEventListener() {},
  createElement(name) { assert.equal(name,'canvas'); return fakeCanvas(); }
};
const window = {};
vm.runInNewContext(iconSource,{window,document,console,Set,Map,Math,String,Number,Array,Object,RegExp});
const icons = window.COFFEE_SHIP_FISH_ICONS;

assert.equal(sharks.length,8,'shark event must keep eight species');
assert.deepEqual(sharks.map(row => row.name),['黑鰭礁鯊','護士鯊','雙髻鯊','虎鯊','大白鯊','深海幽影鯊','巨齒鯊','星海巨齒鯊']);
assert.ok(sharks.every(row => icons.familyOf(row) === 'shark'));

const descriptors = sharks.map(row => icons.descriptor(row));
const bitmaps = sharks.map(row => icons.dataUrl(row));
assert.equal(new Set(descriptors.map(row => row.signature)).size,8,'every shark needs a unique signature');
assert.equal(new Set(bitmaps).size,8,'every shark needs a unique pixel bitmap');
assert.ok(bitmaps.every(url => url.startsWith('data:image/png;base64,')));

for (const shark of sharks) {
  const html = icons.iconHtml(shark,'fh-shark-event-icon');
  assert.match(html,/cs-fish-pixel-icon/);
  assert.match(html,/fh-shark-event-icon/);
  assert.ok(html.includes(`data-icon-key="${shark.name}"`));
}

for (const trait of ['黑鰭礁鯊','護士鯊','雙髻鯊','虎鯊','大白鯊','深海幽影鯊','星海巨齒鯊','巨齒鯊']) {
  assert.ok(iconSource.includes(trait),`${trait} needs a dedicated drawing trait`);
}
assert.match(deckSource,/const eventKind = row\.eventKind \|\| eventKindFor\(row\.title\)/);
assert.match(deckSource,/eventKind === 'shark'/);
assert.match(deckSource,/fh-shark-event-icon/);
assert.match(deckSource,/iconRarity:String\(options\.iconRarity/);
assert.match(sharkSource,/eventId:`shark:\$\{shark\[0\]\}`/);
assert.match(sharkSource,/iconRarity:shark\[1\]/);

const legacyTitle = '鯊魚事件｜大白鯊';
const legacyName = legacyTitle.split('｜').at(-1).trim();
assert.equal(legacyName,'大白鯊');
assert.equal(icons.familyOf({name:legacyName,kind:'shark'}),'shark');
assert.match(icons.iconHtml({name:legacyName,kind:'shark',rarity:'史詩'},'fh-shark-event-icon'),/data-icon-key="大白鯊"/);

console.log(JSON.stringify({
  ok:true,
  sharkSpecies:sharks.length,
  uniqueSignatures:new Set(descriptors.map(row => row.signature)).size,
  uniqueBitmaps:new Set(bitmaps).size
},null,2));
