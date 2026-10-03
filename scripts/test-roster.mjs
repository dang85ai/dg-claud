import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {formations,formationSlots,placePlayer} from '../lib/roster-formations.mjs';
for(const formation of formations){const slots=formationSlots(formation.name);assert.equal(slots.length,formation.size);assert.equal(new Set(slots.map(s=>s.id)).size,formation.size);for(const s of slots){assert.ok(s.x>0&&s.x<100);assert.ok(s.y>0&&s.y<100);}assert.equal(slots[0].id,'GK');}
assert.deepEqual(placePlayer({GK:'a',ST:'b'},'a','ST'),{GK:'b',ST:'a'});
assert.deepEqual(placePlayer({GK:'a'},'b','ST'),{GK:'a',ST:'b'});
assert.deepEqual(placePlayer({GK:'a',ST:'b'},'c','GK'),{GK:'c',ST:'b'});
const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const ts=require('typescript');const Module=require('node:module');const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
const filename=new URL('../components/InteractiveField.tsx',import.meta.url);const jsx=await readFile(filename,'utf8');const compiled=ts.transpileModule(jsx,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const mod=new Module(filename.pathname);mod.require=name=>name==='@/lib/roster-formations.mjs'?{formationSlots}:name==='./RosterAvatar'?{RosterAvatar:()=>React.createElement('span',null,'Approved avatar')}:name==='@/lib/roster-api'?{rosterPhoto:id=>'/photo/'+id}:require(name);mod._compile(compiled,filename.pathname);
const player={id:'a',name:'Fixture Player',number:12,position:'MID',active:true,slot:'GK',show_on_field:true,photo_id:'photo'};
const markup=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[player],formation:'1-3-2-1'}));
assert.match(markup,/Fixture Player/);assert.match(markup,/Approved avatar/);assert.match(markup,/MID/);assert.equal((markup.match(/empty position/g)||[]).length,6);
const nine=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[],formation:'1-3-3-2'}));assert.equal((nine.match(/empty position/g)||[]).length,9);
const hidden=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[{...player,slot:null,show_on_field:false}],formation:'1-3-2-1'}));assert.ok(!hidden.includes('Fixture Player'),'Field-hidden player must also be absent from rotating squad');
const editable=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[player],formation:'1-3-2-1',editable:true}));assert.match(editable,/draggable="true"/);assert.ok(!markup.includes('draggable="true"'));
const field=await readFile(new URL('../components/InteractiveField.tsx',import.meta.url),'utf8');assert.match(field,/formationSlots\(formation\)/);assert.match(field,/aria-label/);assert.match(field,/empty position/);assert.match(field,/p\.show_on_field/);
console.log('Roster tests passed: valid 7v7/9v9 coordinates, unique slots, player swaps, bench assignment and field placeholders. Server permission cases are in scripts/test-roster.sql.');
