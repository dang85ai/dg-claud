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
const five=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[player],formation:'1-2-1-1'}));assert.equal((five.match(/empty position/g)||[]).length,4);
const fiveTwo=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[],formation:'1-2-2'}));assert.equal((fiveTwo.match(/empty position/g)||[]).length,5);
const nine=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[],formation:'1-3-3-2'}));assert.equal((nine.match(/empty position/g)||[]).length,9);
const hidden=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[{...player,slot:null,show_on_field:false}],formation:'1-3-2-1'}));assert.ok(!hidden.includes('Fixture Player'),'Field-hidden player must also be absent from rotating squad');
const editable=renderToStaticMarkup(React.createElement(mod.exports.InteractiveField,{players:[player],formation:'1-3-2-1',editable:true}));assert.match(editable,/data-roster-draggable="true"/);assert.ok(!markup.includes('data-roster-draggable="true"'));
const field=await readFile(new URL('../components/InteractiveField.tsx',import.meta.url),'utf8');assert.match(field,/formationSlots\(formation\)/);assert.match(field,/aria-label/);assert.match(field,/empty position/);assert.match(field,/p\.show_on_field/);
console.log('Roster tests passed: valid 5v5/7v7/9v9 coordinates, unique slots, player swaps, bench assignment and field placeholders. Server permission cases are in scripts/test-roster.sql.');

const profilesPath=new URL('../components/RosterProfiles.tsx',import.meta.url);const profilesJs=ts.transpileModule(await readFile(profilesPath,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const squadPath=new URL('../lib/team-squad.ts',import.meta.url);const squadMod=new Module(squadPath.pathname);squadMod._compile(ts.transpileModule(await readFile(squadPath,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,squadPath.pathname);
const profilesMod=new Module(profilesPath.pathname);profilesMod.require=name=>name==='@/lib/team-squad'?squadMod.exports:name==='./PlayerKitCard'?{PlayerKitCard:({name})=>React.createElement('article',null,name)}:name==='./InteractiveField'?{InteractiveField:()=>React.createElement('section',null,'FIELD_AFTER_SQUAD')}:name==='next/link'?{default:({children,...props})=>React.createElement('a',props,children)}:name.startsWith('@/lib/')||name==='./RosterAvatar'||name==='./RosterPlayerEditor'?{}:require(name);profilesMod._compile(profilesJs,profilesPath.pathname);
const squadMarkup=renderToStaticMarkup(React.createElement(profilesMod.exports.RosterProfiles));assert.equal((squadMarkup.match(/<article/g)||[]).length,9,'Approved kit cards must render without any published profile');for(const member of squadMod.exports.teamSquad)assert.ok(squadMarkup.includes(member.name));assert.ok(squadMarkup.indexOf('Milania')<squadMarkup.indexOf('FIELD_AFTER_SQUAD'),'Squad must precede field');
