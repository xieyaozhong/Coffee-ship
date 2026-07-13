import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../',import.meta.url);
const read = name => fs.readFileSync(new URL(name,root),'utf8');
const iconSource = read('coffee-ship-mermaid-pixel-icons.js');
const mermaidSource = read('mermaid-event.js');
const deckSource = read('deck-fishing.js');
const indexSource = read('index.html');

const encounterBlock = mermaidSource.match(/const encounters = \[([\s\S]*?)\n  \];/)?.[1] || '';
const encounters = [...encounterBlock.matchAll(/\['([^']+)','[^']+','[^']+','[^']+','[^']+','([^']+)'\]/g)].map(match => ({title:match[1],id:match[2]}));
const expectedTitles = ['月光歌聲','深海珍珠','魚群祝福','藍色鱗片','失落航海圖','海潮安眠曲','傳說魚餌','皇冠碎片','瓶中歌詞','深海藍寶','無聲的微笑','泡沫回音'];
const expectedIds = ['moon_song','deep_pearl','shoal_blessing','blue_scale','lost_chart','tide_lullaby','legendary_bait','crown_fragment','bottled_lyrics','deep_sapphire','silent_smile','bubble_echo'];

const canvases = [];
function fakeCanvas() {
  const commands = [];
  const context = {
    imageSmoothingEnabled:true,fillStyle:'#000',
    fillRect(...args) { commands.push(['fill',this.fillStyle,...args]); },
    clearRect(...args) { commands.push(['clear',...args]); }
  };
  const canvas = {
    width:0,height:0,commands,setAttribute() {},getContext:() => context,
    toDataURL:() => `data:image/png;base64,${Buffer.from(JSON.stringify(commands)).toString('base64')}`
  };
  canvases.push(canvas);
  return canvas;
}

const document = {readyState:'loading',addEventListener() {},createElement(name) { assert.equal(name,'canvas'); return fakeCanvas(); }};
const window = {};
vm.runInNewContext(iconSource,{window,document,console,Set,Map,Math,String,Number,Array,Object,RegExp});
const icons = window.COFFEE_SHIP_MERMAID_ICONS;

assert.ok(icons);
assert.equal(icons.version,1);
assert.equal(icons.size,24);
assert.equal(encounters.length,12,'mermaid catalog must keep twelve encounters');
assert.deepEqual(encounters.map(row => row.title),expectedTitles);
assert.deepEqual(encounters.map(row => row.id),expectedIds);
assert.deepEqual(Array.from(icons.definitions,row => row.id),expectedIds);
assert.equal(new Set(Array.from(icons.definitions,row => row.motif)).size,12,'each event needs a distinct authored motif');

const descriptors = encounters.map(row => icons.descriptor({eventId:`mermaid:${row.id}`,title:`美人魚事件｜${row.title}`}));
const bitmaps = encounters.map(row => icons.dataUrl({eventId:`mermaid:${row.id}`}));
assert.equal(new Set(descriptors.map(row => row.signature)).size,12,'each mermaid event needs a unique signature');
assert.equal(new Set(bitmaps).size,12,'each mermaid event needs a unique pixel bitmap');
assert.ok(bitmaps.every(url => url.startsWith('data:image/png;base64,')));

for (const encounter of encounters) {
  const canonical = {eventId:`mermaid:${encounter.id}`};
  const legacyId = {eventId:`mermaid:${encounter.title}`};
  const legacyTitle = {title:`美人魚事件｜${encounter.title}`};
  assert.equal(icons.dataUrl(canonical),icons.dataUrl(legacyId));
  assert.equal(icons.dataUrl(canonical),icons.dataUrl(legacyTitle));
  const html = icons.iconHtml(canonical,'fh-mermaid-event-icon');
  assert.match(html,new RegExp(`data-mermaid-id="${encounter.id}"`));
  assert.match(html,/aria-hidden="true"/);
  assert.match(html,/width="24" height="24"/);
}

for (const canvas of canvases) {
  for (const command of canvas.commands.filter(row => row[0] === 'fill')) {
    const [,color,x,y,width,height] = command;
    assert.ok(x >= 0 && y >= 0 && width >= 0 && height >= 0,`negative pixel bounds for ${color}`);
    assert.ok(x + width <= 24 && y + height <= 24,`pixel exceeds 24x24 canvas for ${color}`);
  }
}

assert.match(iconSource,/#f2a4d5|#e8a6ee/,'reference-inspired pink or lilac hair is required');
assert.match(iconSource,/#7562c7/,'reference-inspired purple tail is required');
assert.match(iconSource,/#63e4ee/,'reference-inspired aqua water light is required');
assert.match(iconSource,/imageSmoothingEnabled = false/);
assert.ok(!iconSource.includes('<svg'));
assert.match(deckSource,/eventKind === 'mermaid'/);
assert.match(deckSource,/COFFEE_SHIP_MERMAID_ICONS\?\.iconHtml/);
assert.match(mermaidSource,/eventId:`mermaid:\$\{encounter\[5\]\}`/);

const fishIndex = indexSource.indexOf('coffee-ship-fish-pixel-icons.js');
const itemIndex = indexSource.indexOf('coffee-ship-item-pixel-icons.js');
const mermaidIconIndex = indexSource.indexOf('coffee-ship-mermaid-pixel-icons.js');
const eventFxIndex = indexSource.indexOf('coffee-ship-event-effects.js');
const mermaidEventIndex = indexSource.indexOf('mermaid-event.js');
assert.ok(fishIndex >= 0 && itemIndex > fishIndex && mermaidIconIndex > itemIndex && eventFxIndex > mermaidIconIndex && mermaidEventIndex > eventFxIndex,'mermaid icons must load before event producers');

console.log(JSON.stringify({
  ok:true,
  mermaidEvents:encounters.length,
  uniqueMotifs:new Set(Array.from(icons.definitions,row => row.motif)).size,
  uniqueBitmaps:new Set(bitmaps).size
},null,2));
