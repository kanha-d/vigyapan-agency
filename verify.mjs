import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('.',import.meta.url);
const html=fs.readFileSync(new URL('index.html',root),'utf8');
const content=JSON.parse(fs.readFileSync(new URL('content.json',root),'utf8'));
assert(!content.settings.some(x=>/password|secret|token/i.test(x.key)),'Public snapshot must not include credentials');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'IDs must be unique');
for(const [,anchor] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(anchor),'Missing anchor: '+anchor);
for(const [,asset] of html.matchAll(/(?:src|href)="(assets\/[^"?#]+|[\w.-]+\.(?:css|js))"/g))assert(fs.existsSync(new URL(asset,root)),'Missing asset: '+asset);
for(const group of ['services','products','plans'])for(const x of content[group].filter(x=>x.active==='YES')){
 assert(html.includes(x.name.replaceAll('&','&amp;')),'Missing published item: '+x.name);
 if(x.price)assert(html.includes(x.price),'Missing published price: '+x.price);
}
for(const id of ['name','email','phone','service','details'])assert(html.includes('id="'+id+'-error"'),'Missing field error region');
assert(!html.includes('adminPassword'));
assert(html.includes('Nothing')||html.includes('does not store or submit'));
console.log('PASS: published content/prices, unique IDs, anchors, local assets, validation regions and snapshot credential exclusion.');
