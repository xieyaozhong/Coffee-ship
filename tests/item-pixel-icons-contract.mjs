import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../',import.meta.url);
const read = name => fs.readFileSync(new URL(name,root),'utf8');
const iconSource = read('coffee-ship-item-pixel-icons.js');
const indexSource = read('index.html');
const backpackSource = read('backpack-manager.js');
const storySource = read('backpack-story-series.js');
const deckSource = read('deck-fishing.js');
const catalogFiles = [
  'loot-bottle-core.js','coffee-ship-v2-db.js','ocean-carnival-events.js','carnival-island-bottles.js',
  'fishing-adventure-events.js','fishing-adventure-expansion.js','mermaid-event.js','auction-ship-event.js',
  'sea-merchant-event.js','coral-roulette-event.js','mutant-creatures.js','mutant-hunting-tools.js','deck-fishing.js'
];

function fakeCanvas() {
  const commands = [];
  const context = {
    imageSmoothingEnabled:true,fillStyle:'#000',
    fillRect(...args) { commands.push(['fill',this.fillStyle,...args]); },
    clearRect(...args) { commands.push(['clear',...args]); },
    save() { commands.push(['save']); },restore() { commands.push(['restore']); },
    drawImage(...args) { commands.push(['draw',...args.slice(1)]); }
  };
  return {
    width:0,height:0,setAttribute() {},getContext() { return context; },
    toDataURL() { return `data:image/png;base64,${Buffer.from(JSON.stringify(commands)).toString('base64')}`; }
  };
}

const document = {readyState:'loading',addEventListener() {},createElement(name) { assert.equal(name,'canvas'); return fakeCanvas(); }};
const biologicalKinds = new Set(['fish','mutant','shrimp','crab','squid','jelly','angler','octopus','whale','shark','ray','eel','lobster','shell']);
const window = {COFFEE_SHIP_FISH_ICONS:{isBiological:item => biologicalKinds.has(String(item?.kind || '').toLowerCase())}};
vm.runInNewContext(iconSource,{window,document,console,Set,Map,Math,String,Number,Array,Object,RegExp});
const icons = window.COFFEE_SHIP_ITEM_PIXEL_ICONS;

assert.ok(icons);
assert.equal(icons.version,1);
assert.equal(icons.size,24);
assert.ok(!iconSource.includes('<svg'));
assert.ok(!iconSource.includes('data:image/svg'));

const catalogNames = new Set();
for (const file of catalogFiles) {
  const source = read(file);
  for (const match of source.matchAll(/\bname\s*:\s*'([^']+)'/g)) catalogNames.add(match[1]);
  for (const match of source.matchAll(/\['[^']+','[^']+','([^']+)'/g)) catalogNames.add(match[1]);
}
['漂流塑膠袋','生鏽瓶蓋','破吸管','皺掉的杯套'].forEach(name => catalogNames.add(name));
const rawCatalogItems = [...catalogNames].map(name => ({name,kind:'treasure',rarity:'稀有'}));
assert.ok(rawCatalogItems.length >= 260,`expected at least 260 catalog item names, got ${rawCatalogItems.length}`);
const catalogItems = [...new Map(rawCatalogItems.map(item => [icons.keyOf(item),item])).values()];
assert.ok(catalogItems.length >= 250,`expected at least 250 normalized catalog identities, got ${catalogItems.length}`);

const descriptors = catalogItems.map(item => icons.descriptor(item));
const urls = catalogItems.map(item => icons.dataUrl(item));
assert.equal(new Set(descriptors.map(row => row.key)).size,catalogItems.length,'catalog item keys must be unique');
assert.equal(new Set(descriptors.map(row => row.signature)).size,catalogItems.length,'catalog signatures must be unique');
assert.equal(new Set(urls).size,catalogItems.length,'catalog item bitmaps must be unique');
assert.ok(urls.every(url => url.startsWith('data:image/png;base64,')));

const seriesCases = [
  ['coffeeShipMermaidLyrics','mermaid-lyrics'],['coffeeShipSailorLogLetters','sailor-log'],
  ['coffeeShipBottleLetters','meme-bottle'],['coffeeShipLanarLetters','lanar-bottle'],
  ['coffeeShipArielLetters','ariel-bottle'],['coffeeShipIslandLetters','coco-bottle'],
  ['coffeeShipBlackbeardLetters','blackbeard-map'],['coffeeShipMadPriestLetters','mad-priest-pages'],
  ['coffeeShipCarnivalLetters','carnival-bottle'],['coffeeShipTurtleSoupLetters','turtle-soup']
];
const seriesUrls = [];
for (const [store,expected] of seriesCases) {
  const first = {key:store,seriesKey:store,name:'第一章',title:'第一章',number:1,kind:'letter',rarity:'普通'};
  const later = {key:store,seriesKey:store,name:'完全不同標題',title:'完全不同標題',number:29,kind:'letter',rarity:'世界級',at:999999};
  assert.equal(icons.canonicalSeries(first),expected);
  assert.equal(icons.keyOf(first),icons.keyOf(later),`${store} must share one series key`);
  assert.equal(icons.dataUrl(first),icons.dataUrl(later),`${store} must share one series bitmap`);
  seriesUrls.push(icons.dataUrl(first));
}
assert.equal(new Set(seriesUrls).size,seriesCases.length,'different story series need different bitmaps');

assert.equal(icons.canonicalSeries({series:'冷笑話漂流瓶',kind:'letter'}),'meme-bottle');
assert.equal(icons.canonicalSeries({series:'迷因百科',kind:'letter'}),'meme-bottle');
assert.equal(icons.canonicalSeries({series:'孤島三角戀漂流瓶',kind:'letter'}),'coco-bottle');
assert.equal(icons.canonicalSeries({name:'瓶裝順風',kind:'treasure'}),'');
assert.match(icons.keyOf({name:'瓶裝順風',kind:'treasure'}),/^item:/);

const legacyItem = {id:'legacy_tide_compass',name:'潮汐藍眼羅盤',kind:'treasure',rarity:'普通'};
const currentItem = {id:'merchant_tide_compass',name:'潮汐藍眼羅盤',kind:'treasure',rarity:'世界級',weight:500,at:123};
assert.equal(icons.keyOf(legacyItem),icons.keyOf(currentItem));
assert.equal(icons.dataUrl(legacyItem),icons.dataUrl(currentItem));
assert.equal(icons.isItem({name:'星空鰻',kind:'fish'}),false);
assert.equal(icons.isItem({name:'天空魚鱗',kind:'treasure'}),true);
assert.equal(icons.familyOf({name:'天空魚鱗',kind:'treasure'}),'material');

const html = icons.iconHtml({name:'<古代羅盤>',kind:'treasure',rarity:'傳說'},'test-item');
assert.ok(html.includes('cs-item-pixel-icon'));
assert.ok(html.includes('aria-hidden="true"'));
assert.ok(!html.includes('<古代羅盤>'));

const fishIndex = indexSource.indexOf('coffee-ship-fish-pixel-icons.js');
const itemIndex = indexSource.indexOf('coffee-ship-item-pixel-icons.js');
const bridgeIndex = indexSource.indexOf('coffee-ship-v2-bridge.js');
assert.ok(fishIndex >= 0 && itemIndex > fishIndex && bridgeIndex > itemIndex,'item pixels must load after fish pixels and before the bridge');
assert.match(backpackSource,/COFFEE_SHIP_ITEM_PIXEL_ICONS\?\.iconHtml/);
assert.match(backpackSource,/seriesKey:letter\.key/);
assert.match(backpackSource,/'mollusk','shell','turtle'/);
assert.match(storySource,/function storyIcon\(/);
assert.match(storySource,/seriesKey:group\.meta\.key/);
assert.match(deckSource,/function eventIcon\(/);

console.log(JSON.stringify({
  ok:true,
  catalogItems:catalogItems.length,
  bottleSeries:seriesCases.length,
  itemFamilies:new Set(descriptors.map(row => row.family)).size,
  uniqueItemBitmaps:new Set(urls).size,
  uniqueSeriesBitmaps:new Set(seriesUrls).size
},null,2));
