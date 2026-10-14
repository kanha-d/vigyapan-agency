import fs from 'node:fs';
import vm from 'node:vm';
// Pre-render the CMS snapshot for fast first paint, indexing and no-JS reading.
const nodes=new Map();
const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',value:'',options:[]});return nodes.get(key);};
const context=vm.createContext({document:{querySelector:node},URL,location:{href:'http://localhost/'}});
const source=fs.readFileSync(new URL('app.js',import.meta.url),'utf8');
vm.runInContext(source.slice(0,source.indexOf("document.addEventListener('click', event")),context);
vm.runInContext(`data=snapshot=${fs.readFileSync(new URL('content.json',import.meta.url),'utf8')};render();`,context);
const path=new URL('index.html',import.meta.url);
let html=fs.readFileSync(path,'utf8');
// Replace the marked static regions; repeatable with fresh source data.
for(const [key,value] of nodes){
 if(!value.innerHTML)continue;
 const id=key.slice(1);
 const start=`<!-- snapshot:${id} -->`,end=`<!-- /snapshot:${id} -->`;
 if(html.includes(start))html=html.replace(new RegExp(`${start}[\\s\\S]*?${end}`),()=>start+value.innerHTML+end);
 else if(id==='service')html=html.replace(/(<select id="service"[^>]*>)[\s\S]*?(<\/select>)/,(_,a,b)=>a+start+value.innerHTML+end+b);
 else html=html.replace(new RegExp(`(<div id="${id}"[^>]*>)(</div>)`),(_,a,b)=>a+start+value.innerHTML+end+b);
}
html=html.replace(/<span id="year">.*?<\/span>/,`<span id="year">${new Date().getFullYear()}</span>`);
fs.writeFileSync(path,html);
console.log('Static CMS snapshot rendered. No framework or bundler required.');
