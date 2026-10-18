const {chromium}=require(process.env.PW||'playwright');
const base=process.argv[2]||'http://localhost:8765';
const pages=(process.argv[3]||'index,about,gallery,testimonials,blog,contact').split(',');
const norm=s=>s.replace(/\s+/g,' ').trim().toLowerCase();
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const seen={};
for(const pg of pages){const p=await b.newPage();await p.goto(`${base}/${pg}.html`,{waitUntil:'networkidle'});
const blocks=await p.evaluate(()=>{const out=[];document.querySelectorAll('main *, body>section *, body>div *').forEach(e=>{if(e.closest('header,footer,nav,script,style,.proto,[data-cms],.band'))return;
 if(!/^(P|H1|H2|H3|H4|BLOCKQUOTE|LI|SPAN|B|CITE|A|SUMMARY|DIV)$/.test(e.tagName))return;
 if([...e.children].some(c=>/^(P|H1|H2|H3|H4|DIV|BLOCKQUOTE|LI)$/.test(c.tagName)))return;
 if(e.closest('.whathome,.welcome'))return; /* live kidsshow.ie shows these on Home; About keeps them too (Kane: nothing lost) */
 const t=e.innerText&&e.innerText.trim();if(t&&t.length>=28)out.push(t);});return out;});
for(const t of new Set(blocks.map(norm)))(seen[t]=seen[t]||[]).push(pg);await p.close();}
const shared={};
// (4) a topic (Christmas parties, 30 years, the bio blurb) is told in ONE place: body text outside pointer cards/buttons may mention it on one page only
const TOPICS={'the occasions blurb':/from birthday parties, communions/i,'the happy children line':/happy children\. huge smiles/i,'the communion booking notice':/now booking for 2027 communion/i,'the welcome line':/welcome to my magical world/i};
const topicPages={};
for(const pg of pages){const p=await b.newPage();await p.goto(`${base}/${pg}.html`,{waitUntil:'networkidle'});
 const txt=await p.evaluate(()=>[...document.querySelectorAll('main p, main h1, main h2, main h3, main .lead')].filter(e=>!e.closest('.btn,.hact,.enq,.rev,.paybox,.cbox,details,.sticky,.dock,.fine')&&!e.querySelector('.btn')).map(e=>e.innerText.replace(/\s+/g,' ')));
 for(const [k,re] of Object.entries(TOPICS))if(txt.some(t=>re.test(t)))(topicPages[k]=topicPages[k]||[]).push(pg);await p.close();}
let topicBad=0;for(const [k,ps] of Object.entries(topicPages))if(ps.length>1&&!(ps.join('+')==='index+about'&&/communion booking|welcome line/.test(k))){topicBad++;console.log('TOPIC REPEATED',k,'on',ps.join('+'));}
// extra checks: (1) the same image used twice on one page, (2) collection items (reviews, credits, service cards, date rows) repeated across pages,
// (3) the same collection region rendered with identical text on two pages
let extra=topicBad;const items={},regions={};
for(const pg of pages){const p=await b.newPage();await p.goto(`${base}/${pg}.html`,{waitUntil:'networkidle'});
 const d=await p.evaluate(()=>{const n=s=>s.replace(/\s+/g,' ').trim().toLowerCase();const imgs={};
  document.querySelectorAll('main img').forEach(i=>{if(i.closest('footer,.socials,.gal,.galstrip,.blk-gallery'))return;const k=(i.getAttribute('src')||'').replace(/\?.*/,'');if(k)imgs[k]=(imgs[k]||0)+1;});
  const it=[...document.querySelectorAll('main .rev:not([data-cms=testimonials] .rev), main .vt, main details, main .post, main .card, main .facts li, main .facts div')].map(e=>n(e.innerText)).filter(t=>t.length>12);
  const rg=[...document.querySelectorAll('main [data-cms]')].filter(e=>e.children.length>2&&!/^(actions|testimonials)$/.test(e.getAttribute('data-cms'))).map(e=>e.getAttribute('data-cms')+'|'+n(e.innerText));
  return {imgs:Object.entries(imgs).filter(([k,v])=>v>1).map(([k])=>k),it,rg};});
 d.imgs.forEach(k=>{extra++;console.log('IMAGE USED TWICE on',pg,'|',k);});
 new Set(d.it).forEach(t=>(items[t]=items[t]||[]).push(pg));new Set(d.rg).forEach(t=>(regions[t]=regions[t]||[]).push(pg));await p.close();}
const LIVE_HOME=/^(face painting|balloon modelling|weddings|communion entertainment) /;
for(const [t,ps] of Object.entries(items))if(ps.length>1&&!(ps.join('+')==='index+about'&&LIVE_HOME.test(t))){extra++;console.log('ITEM REPEATED',ps.join('+'),'|',t.slice(0,90));}
for(const [t,ps] of Object.entries(regions))if(ps.length>1){extra++;console.log('REGION REPEATED',ps.join('+'),'|',t.slice(0,90));}

// content.json itself: each fact once
const fs=require('fs');const C=JSON.parse(fs.readFileSync(__dirname+'/../content.json','utf8'));let cj=0;const strs={};
(function w(o,path){if(path.startsWith('dims'))return;if(typeof o==='string'){if(/\.alt$/.test(path))return;const t=o.replace(/\s+/g,' ').trim().toLowerCase();if(t.length>=28&&!/^assets\//.test(t))(strs[t]=strs[t]||[]).push(path);}else if(o&&typeof o==='object')Object.keys(o).forEach(k=>w(o[k],path+'.'+k));})(C,'');
for(const [t,ps] of Object.entries(strs))if(ps.length>1&&!ps.some(x=>/^\.sites\./.test(x))&&!(ps.length===2&&ps.some(x=>/^\.clips\.\d+\.title$/.test(x))&&ps.some(x=>/^\.posts\.\d+\.title$/.test(x)))){cj++;console.log('CONTENT.JSON DUPLICATE',ps.join(' & '),'|',t.slice(0,80));}
const facts=[[/info@martasmagic\.com/i,'contact.email'],[/087[- ]?2616[- ]?317|0872616317/,'contact.phone'],[/085[- ]?1?66[- ]?6?125|0851666125|0851-666-125/,'(old number, never shown)']];
(function w(o,path){if(path.startsWith('.dims')||path.startsWith('._help'))return;if(typeof o==='string'){for(const [re,home] of facts)if(re.test(o)&&path!=='.'+home&&!/^\.(cta\.bookHref|seo\.index\.description)$/.test(path)&&!(/old number/.test(home)&&/^\.(posts\.(8|15)\.body|seo\.index\.description)$/.test(path))){cj++;console.log('FACT LITERAL outside',home,'at',path,'|',o.slice(0,70));}}else if(o&&typeof o==='object')Object.keys(o).forEach(k=>w(o[k],path+'.'+k));})(C,'');
for(const pg of pages){const p=await b.newPage();await p.goto(`${base}/${pg}.html`,{waitUntil:'networkidle'});
 const bad=await p.evaluate(()=>[...document.querySelectorAll('a,button,h1,h2,h3,[data-cms=deposit],.paybox')].filter(e=>/deposit|payment|pay the/i.test(e.innerText||'')||e.matches('[data-cms=deposit],.paybox')).map(e=>e.tagName+':'+(e.innerText||'').slice(0,40)));
 bad.forEach(x=>{cj++;console.log('DEPOSIT UI on',pg,x);});
 const dep=await p.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>/deposit/i.test(e.innerText||'')&&![...e.children].some(c=>/deposit/i.test(c.innerText||''))&&!e.closest('details')).map(e=>e.tagName));
 dep.forEach(x=>{cj++;console.log('DEPOSIT TEXT outside FAQ on',pg,x);});await p.close();}
if(C.deposit){cj++;console.log('content.json still has a deposit object');}
extra+=cj;
let n=0;for(const [t,ps] of Object.entries(seen))if(ps.length>1){n++;console.log(ps.join('+'),'|',t.slice(0,110));}
console.log('DUPLICATED BLOCKS',n,'EXTRA',extra);await b.close();process.exit(n||extra?1:0);})();
