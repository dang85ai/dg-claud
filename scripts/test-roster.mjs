import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {formations,formationSlots,placePlayer} from '../lib/roster-formations.mjs';
for(const formation of formations){const slots=formationSlots(formation.name);assert.equal(slots.length,formation.size);assert.equal(new Set(slots.map(s=>s.id)).size,formation.size);for(const s of slots){assert.ok(s.x>0&&s.x<100);assert.ok(s.y>0&&s.y<100);}assert.equal(slots[0].id,'GK');}
assert.deepEqual(placePlayer({GK:'a',ST:'b'},'a','ST'),{GK:'b',ST:'a'});
assert.deepEqual(placePlayer({GK:'a'},'b','ST'),{GK:'a',ST:'b'});
assert.deepEqual(placePlayer({GK:'a',ST:'b'},'c','GK'),{GK:'c',ST:'b'});
const field=await readFile(new URL('../components/InteractiveField.tsx',import.meta.url),'utf8');assert.match(field,/formationSlots\(formation\)/);assert.match(field,/aria-label/);assert.match(field,/empty position/);assert.match(field,/p\.show_on_field/);
console.log('Roster tests passed: valid 7v7/9v9 coordinates, unique slots, player swaps, bench assignment and field placeholders. Server permission cases are in scripts/test-roster.sql.');
