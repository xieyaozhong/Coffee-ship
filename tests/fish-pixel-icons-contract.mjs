import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const iconSource = read('coffee-ship-fish-pixel-icons.js');
const deckSource = read('deck-fishing.js');
const extraSource = read('extra-fish-50.js');
const mutantSource = read('mutant-creatures.js');
const backpackSource = read('backpack-manager.js');
const indexSource = read('index.html');

function poolRows(source) {
  const rows = [];
  const pattern = /\['([^']+)','([^']+)','([^']+)',([\d.]+),([\d.]+),'([^']+)'\]/g;
  for (const match of source.matchAll(pattern)) {
    rows.push({name:match[1],zone:match[2],rarity:match[3],kind:match[6]});
  }
  return rows;
}

function mutantRows(source) {
  const rows = [];
  const pattern = /id:'([^']+)',icon:'[^']+',name:'([^']+)',rarity:'([^']+)'/g;
  for (const match of source.matchAll(pattern)) {
    rows.push({id:match[1],name:match[2],rarity:match[3],kind:'mutant'});
  }
  return rows;
}

function fakeCanvas() {
  const commands = [];
  const context = {
    imageSmoothingEnabled:true,
    fillStyle:'#000',
    fillRect(...args) { commands.push(['fill',this.fillStyle,...args]); },
    clearRect(...args) { commands.push(['clear',...args]); },
    save() { commands.push(['save']); },
    restore() { commands.push(['restore']); },
    drawImage(...args) { commands.push(['draw',...args.slice(1)]); }
  };
  return {
    width:0,
    height:0,
    setAttribute() {},
    getContext() { return context; },
    toDataURL() { return `data:image/png;base64,${Buffer.from(JSON.stringify(commands)).toString('base64')}`; }
  };
}

const document = {
  readyState:'loading',
  addEventListener() {},
  createElement(name) {
    assert.equal(name,'canvas');
    return fakeCanvas();
  }
};
const window = {};
vm.runInNewContext(iconSource,{window,document,console,Set,Map,Math,String,Number,Array,Object,RegExp});
const icons = window.COFFEE_SHIP_FISH_ICONS;

assert.ok(icons);
assert.equal(icons.version,1);
assert.equal(icons.size,24);
assert.ok(!iconSource.includes('<svg'));
assert.ok(!iconSource.includes('data:image/svg'));

const pool = [...poolRows(deckSource),...poolRows(extraSource)].filter(row => row.kind !== 'trash');
const mutants = mutantRows(mutantSource);
const species = [...pool,...mutants];
assert.equal(pool.length,103,'expected 103 canonical fishing species');
assert.equal(mutants.length,20,'expected 20 mutant creatures');
assert.equal(new Set(species.map(item => item.name)).size,123,'active species names must be unique');

const descriptors = species.map(item => icons.descriptor(item));
assert.equal(new Set(descriptors.map(item => item.key)).size,species.length,'every species needs a unique key');
assert.equal(new Set(descriptors.map(item => item.signature)).size,species.length,'every species needs a unique pixel signature');

const urls = species.map(item => icons.dataUrl(item));
assert.ok(urls.every(url => url.startsWith('data:image/png;base64,')));
assert.equal(new Set(urls).size,species.length,'every species must render a distinct pixel bitmap');

const sample = {name:'星空鰻',kind:'fish',rarity:'稀有'};
const changedCatch = {name:'星空鰻',kind:'fish',rarity:'傳說',quality:'完美',weight:88};
assert.equal(icons.descriptor(sample).key,icons.descriptor(changedCatch).key);
assert.equal(icons.descriptor(sample).signature,icons.descriptor(changedCatch).signature);
assert.equal(icons.dataUrl(sample),icons.dataUrl(changedCatch));
assert.equal(icons.descriptor({name:'傳說咖啡鯨'}).key,icons.descriptor({name:'傳說咖啡鯨',kind:'whale'}).key);
assert.equal(icons.dataUrl({name:'傳說咖啡鯨'}),icons.dataUrl({name:'傳說咖啡鯨',kind:'whale'}));

assert.equal(icons.familyOf({name:'深海拿鐵鯊',kind:'fish'}),'shark');
assert.equal(icons.familyOf({name:'宇宙翻車魚',kind:'fish'}),'sunfish');
assert.equal(icons.familyOf({name:'月影魟魚',kind:'fish'}),'ray');
assert.equal(icons.familyOf({name:'古代鸚鵡螺',kind:'shell'}),'shell');
assert.equal(icons.familyOf({name:'百眼鮟鱇',kind:'mutant'}),'angler');
assert.equal(icons.isBiological({name:'漂流塑膠袋',kind:'trash'}),false);
assert.equal(icons.isBiological({name:'星海龍魚',kind:'fish'}),true);

const html = icons.iconHtml({name:'<星海龍魚>',kind:'fish',rarity:'傳說'},'test-icon');
assert.ok(html.includes('cs-fish-pixel-icon'));
assert.ok(html.includes('aria-hidden="true"'));
assert.ok(!html.includes('<星海龍魚>'));

const polishIndex = indexSource.indexOf('fish-item-icon-polish-v3.js');
const pixelsIndex = indexSource.indexOf('coffee-ship-fish-pixel-icons.js');
const bridgeIndex = indexSource.indexOf('coffee-ship-v2-bridge.js');
assert.ok(polishIndex >= 0 && pixelsIndex > polishIndex && bridgeIndex > pixelsIndex,'pixel icons must load after icon polish and before the game bridge');
assert.match(deckSource,/function pixelIcon\(/);
assert.match(deckSource,/kind:item\.kind \|\| previous\.kind/);
assert.match(deckSource,/fh-dex-species-icon/);
assert.match(backpackSource,/function itemIconMarkup\(/);
assert.match(backpackSource,/bp-species-icon/);

console.log(JSON.stringify({
  ok:true,
  canonicalSpecies:pool.length,
  mutantSpecies:mutants.length,
  totalSpecies:species.length,
  silhouettes:new Set(descriptors.map(item => item.family)).size,
  uniqueBitmaps:new Set(urls).size
},null,2));
