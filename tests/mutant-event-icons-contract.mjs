import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../',import.meta.url);
const read = name => fs.readFileSync(new URL(name,root),'utf8');
const iconSource = read('coffee-ship-fish-pixel-icons.js');
const mutantSource = read('mutant-creatures.js');
const gateSource = read('mutant-hunt-start-gate.js');
const deckSource = read('deck-fishing.js');

const mutants = [...mutantSource.matchAll(/id:'([^']+)',icon:'[^']+',name:'([^']+)',rarity:'([^']+)'/g)].map(match => ({
  id:match[1],mutantId:match[1],name:match[2],rarity:match[3],kind:'mutant'
}));
const expectedIds = [
  'hundred_eye_angler','two_head_megalodon','abyss_maw_octopus','glowing_skeleton_fish','crystal_king_crab',
  'venom_puffer_king','scythe_shrimp','black_hole_squid','corrupted_blue_whale','abyss_devourer',
  'abyss_serpent_emperor','lava_lobster','star_core_butterflyfish','blood_moon_jelly_king','cursed_hermit_crab',
  'nightmare_eel','thousand_leg_sea_spider','void_whale','leviathan_juvenile','eye_of_cthulhu'
];
const expectedFamilies = ['angler','shark','octopus','fish','crab','puffer','shrimp','squid','whale','shark','eel','lobster','fish','jelly','crab','eel','spider','whale','leviathan','eye'];

const canvases = [];
function fakeCanvas() {
  const commands = [];
  const context = {
    imageSmoothingEnabled:true,fillStyle:'#000',
    fillRect(...args) { commands.push(['fill',this.fillStyle,...args]); },
    clearRect(...args) { commands.push(['clear',...args]); },
    save() {},restore() {},drawImage() {}
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
const icons = window.COFFEE_SHIP_FISH_ICONS;

assert.equal(mutants.length,20,'mutant catalog must keep twenty creatures');
assert.deepEqual(mutants.map(row => row.id),expectedIds);
const descriptors = mutants.map(row => icons.descriptor(row));
assert.deepEqual(descriptors.map(row => row.family),expectedFamilies);
assert.deepEqual(descriptors.map(row => row.mutantId),expectedIds);
assert.equal(new Set(descriptors.map(row => row.mutantTrait)).size,20,'each mutant needs an explicit trait identity');
assert.equal(new Set(descriptors.map(row => row.signature)).size,20,'each mutant needs a unique signature');

const bitmaps = mutants.map(row => icons.dataUrl(row));
assert.equal(new Set(bitmaps).size,20,'each mutant needs a unique pixel bitmap');
assert.ok(bitmaps.every(url => url.startsWith('data:image/png;base64,')));

for (const mutant of mutants) {
  const idOnly = {mutantId:mutant.id,rarity:mutant.rarity};
  assert.equal(icons.mutantIdOf({eventId:`mutant:${mutant.id}`}),mutant.id);
  assert.equal(icons.descriptor(idOnly).name,mutant.name);
  assert.equal(icons.dataUrl(idOnly),icons.dataUrl(mutant),'stable ID and catalog name must share the same bitmap');
  const html = icons.iconHtml(mutant,'mh-pixel-species-icon');
  assert.match(html,new RegExp(`data-mutant-id="${mutant.id}"`));
  assert.match(html,/aria-hidden="true"/);
}

const traitBlock = iconSource.slice(iconSource.indexOf('function addMutantTraits'),iconSource.indexOf('function drawFish'));
for (const mutant of mutants) assert.ok(traitBlock.includes(mutant.name),`${mutant.name} needs an authored visual trait`);

for (const canvas of canvases) {
  for (const command of canvas.commands.filter(row => row[0] === 'fill')) {
    const [,color,x,y,width,height] = command;
    assert.ok(x >= 0 && y >= 0 && width >= 0 && height >= 0,`negative pixel bounds for ${color}`);
    assert.ok(x + width <= 24 && y + height <= 24,`pixel exceeds 24x24 canvas for ${color}`);
  }
}

assert.match(iconSource,/spider:drawSpider,eye:drawEye,leviathan:drawLeviathan/);
assert.match(iconSource,/\.mh-creature-icon,\.mh-encounter-icon,\.mh-side:first-child>span,\.mh-result-icon/);
assert.match(deckSource,/eventKind === 'mutant'/);
assert.match(deckSource,/fh-mutant-event-icon/);
assert.match(deckSource,/item\.id === mutantId/);
assert.match(mutantSource,/iconRarity:creature\?\.rarity/);
assert.match(gateSource,/iconRarity:creature\?\.rarity/);

console.log(JSON.stringify({
  ok:true,
  mutantSpecies:mutants.length,
  silhouettes:new Set(descriptors.map(row => row.family)).size,
  uniqueTraits:new Set(descriptors.map(row => row.mutantTrait)).size,
  uniqueBitmaps:new Set(bitmaps).size
},null,2));
