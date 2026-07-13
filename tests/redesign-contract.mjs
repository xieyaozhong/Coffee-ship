import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const index = read('index.html');
const game = read('game.js');
const world = read('coffee-ship-world-renderer.js');
const core = read('coffee-ship-voyage-core.js');
const styles = read('coffee-ship-game-redesign.css');
const port = read('port.js');

for (const asset of [
  'coffee-ship-game-redesign.css',
  'coffee-ship-world-renderer.js',
  'coffee-ship-voyage-core.js'
]) {
  assert(index.includes(asset), `index.html is missing ${asset}`);
  assert(fs.existsSync(path.join(root, asset)), `missing project asset ${asset}`);
}

assert(
  index.indexOf('coffee-ship-world-renderer.js') < index.indexOf('momo-sprite-v1.js'),
  'world renderer must load before the legacy character loader'
);
assert(
  index.indexOf('coffee-ship-voyage-core.js') > index.indexOf('onboarding-stability-v1.js'),
  'voyage core must load after boarding and runtime compatibility modules'
);

for (const eventName of [
  'coffee-ship:npc-interaction',
  'coffee-ship:coffee-ordered',
  'coffee-ship:rested',
  'coffee-ship:message-posted'
]) {
  assert(game.includes(eventName), `game bridge is missing ${eventName}`);
}

for (const contract of [
  'COFFEE_SHIP_WORLD_RENDERER',
  'worldCanvasV1',
  "['cafe','deck','port']"
]) {
  assert(world.includes(contract), `world renderer is missing ${contract}`);
}

for (const contract of [
  'COFFEE_SHIP_CORE_V3',
  'coffee-ship:voyage-started',
  'coffee-ship:voyage-progressed',
  'coffee-ship:voyage-settled',
  'voyageJournal'
]) {
  assert(core.includes(contract), `voyage core is missing ${contract}`);
}

for (const selector of ['#worldCanvasV1', '#voyageHud', '#voyageJournal']) {
  assert(styles.includes(selector), `redesign stylesheet is missing ${selector}`);
}

assert(port.includes('COFFEE_SHIP_PORT'), 'port compatibility API is missing');
assert(port.includes("coffee-ship:scene"), 'port scene event bridge is missing');

console.log(JSON.stringify({
  ok: true,
  scripts: 3,
  scenes: 3,
  routes: 3,
  bridgeEvents: 4
}, null, 2));
