'use strict';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = value => { try { const u = new URL(String(value), location.href); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const rows = value => (Array.isArray(value) ? value : []).filter(x => String(x.active).toUpperCase() === 'YES').sort((a,b) => Number(a.sort)-Number(b.sort));
let data = {}, snapshot = {}, currentFilter = 'all', draft = '', syncBusy = false;
const setting = key => String((data.settings || []).find(x => x.key === key)?.value || '');
const localAsset = (item, field = 'imageUrl') => {
  const original = [...(snapshot.products || []), ...(snapshot.gallery || []), ...(snapshot.hero || [])].find(x => x.id === item.id);
  if (original && original[field] === item[field] && item[field] && item.type !== 'video') return 'assets/' + encodeURIComponent(item.id) + '.jpg';
  return safeURL(item[field]);
};
const serviceSymbols = ['↗', 'Aa', '▶', '✳', '▤', '</>', '⌕'];
const serviceDescriptions = {
  'Social Media Marketing': 'Keep your brand part of the conversation with thoughtful content and creative campaigns.',
  'Graphic Designing': 'Turn complex ideas into clear, distinctive visuals across your marketing materials.',
  'Video Production': 'Bring your message to life through reels, advertisements and business videos.',
  'Branding & Logo Design': 'Create a recognizable identity that connects every expression of your brand.',
  'Printing & Packaging': 'Take your brand from the screen into people’s hands with considered print and packaging.',
  'Website & App Development': 'Give your business a digital home that is clear, useful and designed around your audience.',
  'SEO Services': 'Help the right people discover your business through stronger search visibility.'
};
const projects = [
  {id:'concept-identity', title:'Make your mark.', category:'Branding', label:'STUDIO CONCEPT', image:'assets/identity.svg', alt:'Orange business cards and cream stationery in an original Vigyapan identity concept', description:'An original VIGYAPAN studio exploration of a bold, connected identity across stationery and business cards. Illustrative concept work, not a commissioned client project.'},
  {id:'source-jewelry', title:'Elegance, in every detail.', category:'Branding', label:'EXISTING GALLERY', image:'assets/GA73513046.jpg', alt:'Jewellery advertising artwork from the existing VIGYAPAN gallery', description:'Jewellery campaign artwork retained from the existing website’s Branding gallery. The original source does not provide a project brief or confirmed client credit; no client relationship or campaign result is claimed.'},
  {id:'concept-poster', title:'Bold by design.', category:'Print', label:'STUDIO CONCEPT', image:'assets/poster.svg', alt:'Yellow and black typographic poster with an orange arrow', description:'An original print concept exploring oversized type, a restrained palette and strong hierarchy. A demonstration of visual direction, not confirmed client work.'},
  {id:'concept-digital', title:'Made to stop the scroll.', category:'Digital', label:'STUDIO CONCEPT', image:'assets/digital.svg', alt:'Original social campaign concept with an orange creative and yellow phone mockup', description:'An original digital campaign exploration, connecting social artwork and mobile design through one expressive visual language. Sample concept only; no marketing performance is claimed.'}
];
function renderWork() {
  const visible = projects.filter(x => currentFilter === 'all' || x.category === currentFilter);
  $('#work-grid').innerHTML = visible.map(x => `<article class="work-card"><button type="button" data-project="${x.id}" aria-label="View ${escapeHTML(x.title)}"><div class="work-image"><img src="${x.image}" alt="${escapeHTML(x.alt)}" width="1000" height="800" loading="lazy"><span class="tag">${x.label}</span><span class="open-mark" aria-hidden="true">↗</span></div><div class="work-caption"><h3>${x.title}</h3><p>${x.category} / ${x.label === 'STUDIO CONCEPT' ? 'Concept exploration' : 'Source artwork'}</p></div></button></article>`).join('');
}
function render() {
  $('#service-list').innerHTML = rows(data.services).map((x,i) => `<article class="service-row"><span class="service-index">${String(i+1).padStart(2,'0')}</span><h3>${escapeHTML(x.name)}</h3><div class="service-art" aria-hidden="true">${escapeHTML(serviceSymbols[i % serviceSymbols.length])}</div><p>${escapeHTML(serviceDescriptions[x.name] || x.description)}</p><a href="#contact" data-enquiry="${escapeHTML(x.name)}" aria-label="Discuss this service: ${escapeHTML(x.name)}">↗</a></article>`).join('');
  $('#product-grid').innerHTML = rows(data.products).map(x => `<article class="product-card"><div class="product-visual"><img src="${escapeHTML(x.id === 'P3' ? 'assets/banner.svg' : localAsset(x))}" alt="${escapeHTML(x.name)} ${x.id === 'P3' ? 'illustrative outdoor design concept' : 'example from the existing product catalogue'}" width="500" height="500" loading="lazy">${x.id === 'P3' ? '<small>ILLUSTRATIVE CONCEPT</small>' : ''}</div><h3>${escapeHTML(x.name)}</h3><p>${escapeHTML(x.shortDescription)}</p>${x.price ? `<span class="price">From ${escapeHTML(x.price)}</span>` : '<span class="price">Request a quote</span>'}<button class="text-link" data-product="${escapeHTML(x.id)}">Details & Enquiry <span>↗</span></button></article>`).join('');
  $('#plan-grid').innerHTML = rows(data.plans).map(x => `<article class="plan-card"><h3>${escapeHTML(x.name)}</h3><p>${escapeHTML(x.tagline)}</p><div class="plan-price">${escapeHTML(x.price || 'Request a Quote')} <small>${escapeHTML(x.period)}</small></div><ul>${String(x.features || '').split('|').filter(Boolean).map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul><a class="button" href="#contact" data-enquiry="${escapeHTML(x.name)}">Enquire About Plan <span>↗</span></a></article>`).join('') || '<div class="custom-plan"><h3>Plans tailored to your project.</h3><a class="button" href="#contact">Request a Quote ↗</a></div>';
  const oldService = $('#service').value;
  const options = [...new Set([...rows(data.services), ...rows(data.products), ...rows(data.plans)].map(x=>x.name).concat(['Custom project']))];
  $('#service').innerHTML = '<option value="">Select a service</option>' + options.map(x=>`<option>${escapeHTML(x)}</option>`).join('');
  if (options.includes(oldService)) $('#service').value = oldService;
  const phone=setting('phone'), email=setting('email'), address=setting('address');
  const emailLink = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `<a href="mailto:${escapeHTML(email)}">${escapeHTML(email)} ↗</a>` : '';
  const phoneLink = phone ? `<a href="tel:${escapeHTML(phone.replace(/[^+\d]/g,''))}">${escapeHTML(phone)}</a>` : '';
  $('#contact-info').innerHTML = emailLink + phoneLink + (address ? `<span class="address">${escapeHTML(address)}</span>` : 'Please contact the agency for current contact details.');
  $('#footer-contact').innerHTML = emailLink + phoneLink + (address ? `<p>${escapeHTML(address)}</p>` : '');
  const socials=[['facebook','Facebook'],['instagram','Instagram'],['youtube','YouTube'],['linkedin','LinkedIn']].map(([key,label])=>({url:safeURL(setting(key)),label})).filter(x=>x.url && new URL(x.url).pathname.replace(/\//g,'').length > 0).map(x=>`<a href="${escapeHTML(x.url)}" target="_blank" rel="noopener noreferrer">${x.label} ↗</a>`).join('');
  $('#contact-socials').innerHTML=socials; $('#footer-socials').innerHTML=socials;
  // The source contains a decorative fake map, not an actual map integration.
  const seen = new Set();
  $('#original-gallery').innerHTML = rows(data.gallery).filter(x=> { if(!x.mediaUrl || seen.has(x.mediaUrl)) return false; seen.add(x.mediaUrl); return true; }).map(x=>x.type === 'video' ? `<a class="text-link" href="${escapeHTML(safeURL(x.mediaUrl))}" target="_blank" rel="noopener noreferrer">View original video ↗</a>` : `<button type="button" data-gallery="${escapeHTML(x.id)}"><img src="${escapeHTML(localAsset(x,'mediaUrl'))}" alt="${escapeHTML(x.section || 'Advertising')} artwork from the original gallery" width="400" height="300" loading="lazy"><span>${escapeHTML(x.section === 'New Gallery' ? 'Print & digital artwork' : x.section)} ↗</span></button>`).join('');
  renderWork();
}
function selectEnquiry(value) {
  const select=$('#service');
  if (![...select.options].some(x=>x.value === value)) select.add(new Option(value,value));
  select.value=value;
  if ($('#detail-dialog').open) $('#detail-dialog').close();
  location.hash='contact';
  select.focus({preventScroll:true});
}
function showDialog(content) {
  $('#dialog-content').innerHTML=content;
  $('#detail-dialog').showModal();
  document.body.style.overflow='hidden';
}
document.addEventListener('click', event => {
  const enquiry=event.target.closest('[data-enquiry]');
  if(enquiry){event.preventDefault();selectEnquiry(enquiry.dataset.enquiry);return;}
  const product=event.target.closest('[data-product]');
  if(product){const x=rows(data.products).find(x=>String(x.id)===product.dataset.product);if(!x)return;showDialog(`<img class="dialog-image" src="${escapeHTML(localAsset(x))}" alt="${escapeHTML(x.name)}"><div class="dialog-body"><p class="eyebrow">${escapeHTML(x.category)} / PRODUCT DETAILS</p><h2 id="dialog-title">${escapeHTML(x.name)}</h2><p>${escapeHTML(x.description || x.shortDescription)}</p><ul>${String(x.features || '').split('|').filter(Boolean).map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul><p>Published starting price: ${escapeHTML(x.price || 'Request a quote')}. Confirm quantity, specifications, finish and timing with the team.</p><a class="button" href="#contact" data-enquiry="${escapeHTML(x.name)}">Enquire About This Product ↗</a></div>`);return;}
  const project=event.target.closest('[data-project]');
  if(project){const x=projects.find(x=>x.id===project.dataset.project);showDialog(`<img class="dialog-image" src="${x.image}" alt="${escapeHTML(x.alt)}"><div class="dialog-body"><p class="eyebrow">${x.category} / ${x.label}</p><h2 id="dialog-title">${x.title}</h2><p>${x.description}</p><a class="button" href="#contact" data-enquiry="Custom project">Discuss Your Project ↗</a></div>`);return;}
  const gallery=event.target.closest('[data-gallery]');
  if(gallery){const x=rows(data.gallery).find(x=>String(x.id)===gallery.dataset.gallery);showDialog(`<img class="dialog-image" src="${escapeHTML(localAsset(x,'mediaUrl'))}" alt="Original gallery artwork"><div class="dialog-body"><p class="eyebrow">EXISTING WEBSITE GALLERY</p><h2 id="dialog-title">${escapeHTML(x.section === 'New Gallery' ? 'Creative showcase' : x.section)}</h2><p>Retained from the original website. Project attribution and client relationship are not independently verified.</p></div>`);}
});
$('#detail-dialog').addEventListener('close',()=>{document.body.style.overflow='';});
$('.dialog-close').addEventListener('click',()=>$('#detail-dialog').close());
$('#detail-dialog').addEventListener('click',e=>{if(e.target === $('#detail-dialog')) $('#detail-dialog').close();});
function closeMenu(){ $('#navigation').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded','false'); $('#menu-toggle').setAttribute('aria-label','Open navigation'); }
$('#menu-toggle').addEventListener('click',()=> { const open=$('#navigation').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation'); });
$('#navigation').addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape' && $('#navigation').classList.contains('open')){closeMenu();$('#menu-toggle').focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('header'))closeMenu();});
window.addEventListener('resize',()=>{if(innerWidth>950)closeMenu();});
window.addEventListener('scroll',()=>$('#header').classList.toggle('scrolled',scrollY>10),{passive:true});
$('.filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;currentFilter=b.dataset.filter;$('.filters').querySelectorAll('button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderWork();});
$('#year').textContent=new Date().getFullYear();
const navigationObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){$('#navigation').querySelectorAll('a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}}},{rootMargin:'-15% 0px -65% 0px'});
['home','about','services','products','gallery','plans','contact'].forEach(id=>navigationObserver.observe(document.getElementById(id)));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal');revealObserver.unobserve(entry.target);}}),{threshold:.1});
document.querySelectorAll('.section-heading,.about-copy,.steps,.why-title').forEach(x=>revealObserver.observe(x));
const form=$('#enquiry-form');
const errors={name:'Please enter your name.',email:'Please enter a valid email address.',phone:'Please enter a valid phone number (7–15 digits).',service:'Please select a service or project.',details:'Please add at least 10 characters about your project.'};
function validateField(name){const el=form.elements[name];const value=el.value.trim();let valid=Boolean(value);if(name==='email')valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);if(name==='phone')valid=/^[+\d\s().-]+$/.test(value)&&value.replace(/\D/g,'').length>=7&&value.replace(/\D/g,'').length<=15;if(name==='details')valid=value.length>=10;if(!el.checkValidity())valid=false;el.setAttribute('aria-invalid',String(!valid));el.setAttribute('aria-describedby',name+'-error');$('#'+name+'-error').textContent=valid?'':errors[name];return valid;}
form.addEventListener('submit',event=>{
  event.preventDefault();if(form.elements.website.value)return;
  const invalid=Object.keys(errors).filter(name=>!validateField(name));
  if(invalid.length){$('#form-status').textContent='Please check the highlighted fields.';$('#enquiry-actions').hidden=true;form.elements[invalid[0]].focus();return;}
  const fields=new FormData(form);
  draft=`Hello VIGYAPAN,\n\nI would like to discuss a project.\n\nName: ${fields.get('name')}\nCompany: ${fields.get('company') || 'Not specified'}\nEmail: ${fields.get('email')}\nPhone: ${fields.get('phone')}\nInterested in: ${fields.get('service')}\nBudget: ${fields.get('budget') || 'Let’s discuss'}\n\nProject details:\n${fields.get('details')}`;
  const email=setting('email'), whatsapp=setting('whatsapp').replace(/\D/g,'');
  $('#email-draft').hidden=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  $('#email-draft').href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Project enquiry — '+fields.get('service'))}&body=${encodeURIComponent(draft)}`;
  $('#whatsapp-draft').hidden=!whatsapp; $('#whatsapp-draft').href=`https://wa.me/${whatsapp}?text=${encodeURIComponent(draft)}`;
  $('#enquiry-actions').hidden=false;
  $('#form-status').textContent='Your enquiry is ready. Nothing has been sent. Open your email draft or WhatsApp, review the details, and send when you’re ready.';
});
form.addEventListener('input',e=>{if(e.target.getAttribute('aria-invalid')==='true' && errors[e.target.name])validateField(e.target.name);if(!$('#enquiry-actions').hidden){$('#enquiry-actions').hidden=true;$('#form-status').textContent='Your details changed. Prepare the enquiry again to update your draft.';}});
$('#copy-enquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft);$('#form-status').textContent='Enquiry copied. Paste it into your preferred email or messaging app. Nothing has been sent.';}catch{$('#form-status').textContent='Copy was unavailable. Use Open Email Draft or Open WhatsApp instead.';}});
// Retain the existing read-only Apps Script CMS connection. No credentials are stored.
function jsonp(action){return new Promise((resolve,reject)=>{const cb='vigyapan_'+Date.now()+'_'+Math.random().toString(36).slice(2);const script=document.createElement('script');let timer;const cleanup=()=>{clearTimeout(timer);script.remove();delete window[cb];};timer=setTimeout(()=>{cleanup();reject(new Error('CMS timeout'));},12000);window[cb]=value=>{cleanup();resolve(value);};script.onerror=()=>{cleanup();reject(new Error('CMS unavailable'));};script.src=window.VIGYAPAN_CONFIG.API+'?action='+encodeURIComponent(action)+'&callback='+cb;document.body.append(script);});}
async function syncContent(){if(syncBusy||document.hidden||!window.VIGYAPAN_CONFIG?.API)return;syncBusy=true;try{const version=await jsonp('version');if(String(version.version)!==String(data.version)){const fresh=await jsonp('public');if(fresh?.version && Array.isArray(fresh.products)){fresh.settings=(fresh.settings||[]).filter(x=>!/(password|secret|token)/i.test(x.key));data=fresh;render();}}}catch{/* Keep the local, last published content when the CMS is unavailable. */}finally{syncBusy=false;}}
fetch('content.json').then(r=>{if(!r.ok)throw new Error('Content unavailable');return r.json();}).then(d=>{data=d;snapshot=d;render();syncContent();setInterval(syncContent,Math.max(5000,window.VIGYAPAN_CONFIG?.POLL_MS||5000));}).catch(()=>{ $('#form-status').textContent='Content could not load. Please reload or use the listed email address.'; });
