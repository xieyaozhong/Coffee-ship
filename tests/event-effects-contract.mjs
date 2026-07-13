import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../',import.meta.url);
const read = name => fs.readFileSync(new URL(name,root),'utf8');
const fxSource = read('coffee-ship-event-effects.js');
const indexSource = read('index.html');
const deckSource = read('deck-fishing.js');
const adventureSource = read('fishing-adventure-events.js');
const expansionSource = read('fishing-adventure-expansion.js');
const expandedSource = read('ocean-carnival-events.js');
const mermaidSource = read('mermaid-event.js');
const sharkSource = read('deck-shark-event.js');
const mutantSource = read('mutant-creatures.js');
const pirateSource = read('pirate-gambling-event.js');
const oceanQteSource = read('ocean-friends-qte.js');
const salvageQteSource = read('salvage-qte.js');
const coralSource = read('coral-roulette-event.js');
const merchantSource = read('sea-merchant-event.js');
const auctionSource = read('auction-ship-event.js');

function adventureDefinitions(source) {
  const rows = [];
  const pattern = /\{id:'([^']+)',tone:'([^']+)'[^{}]*?title:'([^']+)'/g;
  for (const match of source.matchAll(pattern)) rows.push({id:match[1],tone:match[2],title:match[3]});
  return rows;
}

function arrayBlock(source,name) {
  return source.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n  \\];`))?.[1] || '';
}

function firstColumn(block) {
  return [...block.matchAll(/\['([^']+)'/g)].map(match => match[1]);
}

function objectNames(source,anchor,endAnchor) {
  const start = source.indexOf(anchor);
  const end = endAnchor ? source.indexOf(endAnchor,start) : source.length;
  const block = source.slice(start,end > start ? end : source.length);
  return [...block.matchAll(/\bname:\s*'([^']+)'/g)].map(match => match[1]);
}

function mutantNames(source) {
  return [...source.matchAll(/\bid:'[^']+',icon:'[^']+',name:'([^']+)',rarity:'[^']+'/g)].map(match => match[1]);
}

const document = {readyState:'loading',addEventListener() {}};
const window = {matchMedia:() => ({matches:false,addEventListener() {}})};
vm.runInNewContext(fxSource,{window,document,console,Set,Map,Math,String,Number,Array,Object,RegExp});
const fx = window.COFFEE_SHIP_EVENT_FX;
assert.ok(fx);
assert.equal(fx.version,1);
assert.ok(!fxSource.includes('Math.random'));
assert.equal((fxSource.match(/document\.createElement\('canvas'\)/g) || []).length,1,'director must own one canvas factory');

const events = [];
for (const event of [...adventureDefinitions(adventureSource),...adventureDefinitions(expansionSource)]) {
  if (event.id !== 'abyss_auction') events.push(event);
}
for (const category of ['OCEAN_EVENTS','CARNIVAL_EVENTS','SALVAGE_EVENTS','WORLD_EVENTS']) {
  firstColumn(arrayBlock(expandedSource,category)).forEach(title => events.push({id:`${category}:${title}`,title,eventKind:'special'}));
}
const mermaidBlock = arrayBlock(mermaidSource,'encounters');
firstColumn(mermaidBlock).forEach(title => events.push({id:`mermaid:${title}`,title:`美人魚事件｜${title}`,eventKind:'mermaid'}));
firstColumn(arrayBlock(sharkSource,'sharks')).forEach(title => events.push({id:`shark:${title}`,title:`鯊魚事件｜${title}`,eventKind:'shark'}));
mutantNames(mutantSource).forEach(title => events.push({id:`mutant:${title}`,title:`變異生物｜${title}`,eventKind:'mutant'}));
objectNames(pirateSource,'const GAMES = {','const SUITS').forEach(title => events.push({id:`pirate:${title}`,title:`海盜賭局｜${title}`,eventKind:'special'}));
events.push({id:'sea-merchant',title:'神秘商船靠近',eventKind:'special'});
events.push({id:'auction-ship',title:'黑金船靠舷',eventKind:'auction-ship'});

assert.equal(events.length,205,'active event inventory must stay explicit');
const profiles = events.map(event => fx.profile(event));
assert.equal(new Set(profiles.map(row => row.key)).size,events.length,'event keys must be unique');
assert.equal(new Set(profiles.map(row => row.signature)).size,events.length,'every event needs a unique effect signature');
assert.ok(new Set(profiles.map(row => row.theme)).size >= 12,'catalog should span semantic effect themes');
assert.ok(new Set(profiles.map(row => `${row.motion}:${row.shape}:${row.motif}`)).size >= 15,'catalog should span distinct motion recipes');

const stableA = fx.profile({id:'black_fog',title:'黑霧籠罩',tone:'negative',castId:'cast_1',at:1,reward:10});
const stableB = fx.profile({id:'black_fog',title:'黑霧籠罩',tone:'negative',castId:'cast_999',at:999,reward:9000});
assert.deepEqual(stableA,stableB);
assert.equal(stableA.theme,'ghost');
assert.equal(fx.profile({id:'pearl_rain',title:'珍珠雨',tone:'positive'}).theme,'positive');
assert.equal(fx.profile({id:'coral_roulette',title:'珊瑚輪盤',tone:'risk'}).theme,'coral');
assert.notEqual(fx.profile({id:'event',title:'特殊事件',text:'獲得 10 珍珠'}).key,fx.profile({id:'event',title:'特殊事件',text:'船體遭到破壞'}).key);
assert.equal(fx.profile({id:'event',title:'特殊事件',text:'獲得 10 珍珠'}).key,fx.profile({id:'event',title:'特殊事件',text:'獲得 999 珍珠'}).key);

assert.match(fxSource,/prefers-reduced-motion: reduce/);
assert.match(fxSource,/pointer-events:none!important/);
assert.match(fxSource,/const limit = width < 760 \? 34 : 56/);
assert.match(fxSource,/coffee-ship:event-triggered/);
assert.match(deckSource,/eventId:String\(options\.eventId/);
assert.match(deckSource,/data-event-tone=/);
assert.match(adventureSource,/eventId:event\.id/);
assert.match(mermaidSource,/eventId:`mermaid:\$\{encounter\[0\]\}`/);
assert.match(sharkSource,/eventId:`shark:\$\{shark\[0\]\}`/);
assert.match(expandedSource,/eventId:`\$\{category\}:\$\{event\[0\]\}`/);
assert.match(oceanQteSource,/eventId:`ocean:\$\{eventName\}`/);
assert.match(salvageQteSource,/eventId:`salvage:\$\{active\.event\[0\]\}`/);
assert.match(mutantSource,/eventId:creatureId \? `mutant:\$\{creatureId\}`/);
assert.match(pirateSource,/eventId: `pirate:\$\{visit\?\.gameType \|\| 'ship'\}`/);
assert.match(coralSource,/eventId:`coral-roulette:\$\{segment\.id\}`/);
assert.match(merchantSource,/eventId:'sea-merchant'/);
assert.match(auctionSource,/eventId:'auction-ship'/);

const itemIndex = indexSource.indexOf('coffee-ship-item-pixel-icons.js');
const eventIndex = indexSource.indexOf('coffee-ship-event-effects.js');
const bridgeIndex = indexSource.indexOf('coffee-ship-v2-bridge.js');
assert.ok(itemIndex >= 0 && eventIndex > itemIndex && bridgeIndex > eventIndex,'event director must load after icon systems and before the bridge');

// Wrapper contract: preserve the original call and return value, and never nest wrappers.
const canvasContext = {setTransform() {},clearRect() {},createRadialGradient() { return {addColorStop() {}}; },fillRect() {},save() {},restore() {},translate() {},rotate() {},beginPath() {},arc() {},stroke() {},moveTo() {},lineTo() {},closePath() {},fill() {}};
const fakeCanvas = {isConnected:false,id:'',style:{},classList:{add() {},remove() {}},setAttribute() {},getContext:() => canvasContext};
const eventCalls = [];
const fakeBody = {appendChild(node) { node.isConnected = true; },classList:{add() {},remove() {}}};
const runtimeDocument = {readyState:'loading',addEventListener() {},getElementById:() => null,createElement:() => fakeCanvas,body:fakeBody,documentElement:{clientWidth:960,clientHeight:576},hidden:false};
const runtimeWindow = {
  innerWidth:960,innerHeight:576,devicePixelRatio:1,
  matchMedia:() => ({matches:false,addEventListener() {}}),
  dispatchEvent:event => eventCalls.push(event),
  COFFEE_SHIP_FISHING_API:{calls:0,pushEvent(options) { this.calls += 1; return `saved:${options.title}`; }}
};
class FakeCustomEvent { constructor(type,options) { this.type=type; this.detail=options?.detail; } }
const runtimeContext = {window:runtimeWindow,document:runtimeDocument,console,Set,Map,Math,String,Number,Array,Object,RegExp,performance:{now:() => 100},requestAnimationFrame:() => 1,cancelAnimationFrame() {},CustomEvent:FakeCustomEvent};
vm.runInNewContext(fxSource,runtimeContext);
const runtimeFx = runtimeWindow.COFFEE_SHIP_EVENT_FX;
assert.equal(runtimeFx.patchFishingApi(),true);
const result = runtimeWindow.COFFEE_SHIP_FISHING_API.pushEvent({title:'珍珠雨',eventId:'pearl_rain',eventKind:'special'});
assert.equal(result,'saved:珍珠雨');
assert.equal(runtimeWindow.COFFEE_SHIP_FISHING_API.calls,1);
assert.equal(eventCalls.filter(event => event.type === 'coffee-ship:event-triggered').length,1);
assert.equal(runtimeFx.patchFishingApi(),false);
runtimeWindow.COFFEE_SHIP_FISHING_API.pushEvent({title:'黑霧籠罩',eventId:'black_fog'});
assert.equal(runtimeWindow.COFFEE_SHIP_FISHING_API.calls,2,'idempotent patch must not duplicate the original call');
runtimeWindow.COFFEE_SHIP_FISHING_API.pushEvent({title:'珊瑚輪盤｜珍珠獎勵',eventId:'coral-roulette:gain25a'});
runtimeWindow.COFFEE_SHIP_FISHING_API.pushEvent({title:'珊瑚輪盤｜珍珠獎勵',eventId:'coral-roulette:gain25b'});
const coralEvents = eventCalls.filter(event => event.type === 'coffee-ship:event-triggered').slice(-2);
assert.notEqual(coralEvents[0].detail.key,coralEvents[1].detail.key,'eventId must distinguish same-title outcomes');
assert.notEqual(coralEvents[0].detail.signature,coralEvents[1].detail.signature,'eventId must distinguish effect signatures');

console.log(JSON.stringify({
  ok:true,
  activeEvents:events.length,
  themes:new Set(profiles.map(row => row.theme)).size,
  recipes:new Set(profiles.map(row => `${row.motion}:${row.shape}:${row.motif}`)).size,
  uniqueEffects:new Set(profiles.map(row => row.signature)).size
},null,2));
