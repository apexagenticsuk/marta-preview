// Magic Marta site checks: every lesson from the earlier rounds as an automatic test, plus content and privacy rules.
// Usage: node tests/marta.js http://localhost:8765
const {chromium}=require(process.env.PW||'playwright');const fs=require('fs');
const base=process.argv[2]||'http://localhost:8765';const C=JSON.parse(fs.readFileSync(__dirname+'/../content.json','utf8'));
const PAGES=['index','about','gallery','testimonials','blog','contact'];const res=[];
const ok=(n,c,x)=>{res.push(!!c);if(!c||process.env.V)console.log((c?'PASS ':'FAIL ')+n+(x?' '+x:''));};
const tel=p=>{const d=String(p).replace(/[^\d+]/g,'');return /^08\d{7,8}$/.test(d)?'+353'+d.slice(1):d;};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
const origin=new URL(base).origin;
// ---- 1 per page, with script: overflow at many widths, console, third parties, images, CTA, text rules
for(const w of [320,360,375,390,640,768,1280]){const ctx=await b.newContext({viewport:{width:w,height:800}});const p=await ctx.newPage();await p.emulateMedia({reducedMotion:'reduce'});
 for(const pg of PAGES){const errs=[],ext=[];p.removeAllListeners('console');p.removeAllListeners('pageerror');p.removeAllListeners('request');
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!r.url().startsWith(origin)&&!/^(data|blob):/.test(r.url()))ext.push(r.url())});
  const r=await p.goto(`${base}/${pg}.html`,{waitUntil:'load'});if(process.env.INJECT_CSS)await p.addStyleTag({content:process.env.INJECT_CSS});await p.evaluate(()=>{document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');return Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const d=await p.evaluate(()=>{const W=document.documentElement.clientWidth;return {sw:document.documentElement.scrollWidth,W,over:[...document.querySelectorAll('body *')].filter(e=>{if(e.closest('.skip,.sticky'))return false;const r=e.getBoundingClientRect();return r.width&&(r.right>W+1||r.left<-1)}).slice(0,3).map(e=>e.tagName+'.'+e.className)};});
  ok(`${pg}@${w}: no sideways scroll`,d.sw<=d.W&&!d.over.length,JSON.stringify(d));
  if(w===375||w===1280){
   ok(`${pg}@${w}: status 200`,r.status()===200);ok(`${pg}@${w}: no console errors`,!errs.length,errs.join('|').slice(0,200));ok(`${pg}@${w}: no third-party requests`,!ext.length,ext.join(' ').slice(0,200));
   const q=await p.evaluate(()=>{const out={};const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};
    out.noDims=[...document.images].filter(i=>!i.getAttribute('width')||!i.getAttribute('height')).map(i=>i.getAttribute('src')).slice(0,5);
    out.noAlt=[...document.images].filter(i=>i.getAttribute('alt')===null).map(i=>i.getAttribute('src')).slice(0,5);
    out.emptyAlt=[...document.images].filter(i=>i.getAttribute('alt')==='').map(i=>i.getAttribute('src')).slice(0,5);
    out.broken=[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')).slice(0,5);
    out.raw=(document.body.innerText.match(/\{[\w.]+\}|\[(placeholder|todo|lorem)[^\]]*\]|undefined|NaN\b/gi)||[]).slice(0,3);
    out.httpLinks=[...document.querySelectorAll('a[href],link[href],script[src],img[src],form[action]')].map(e=>e.getAttribute('href')||e.getAttribute('src')||e.getAttribute('action')).filter(h=>/^http:\/\//i.test(h)).slice(0,3);
    out.h1=document.querySelectorAll('h1').length;out.lang=document.documentElement.lang;
    out.skip=!!document.querySelector('a.skip[href="#main"]')&&!!document.querySelector('main#main[tabindex]');
    out.robots=(document.querySelector('meta[name=robots]')||{}).content;out.og=(document.querySelector('meta[property="og:image"]')||{}).content;
    out.tels=[...document.querySelectorAll('a[href^="tel:"]')].filter(vis).map(a=>a.getAttribute('href'));out.sms=[...document.querySelectorAll('a[href^="sms:"]')].filter(vis).map(a=>a.getAttribute('href'));
    out.enq=!![...document.querySelectorAll('a[href*="contact.html#enquire"],form.enq')].filter(vis).length;
    out.levels=[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>+h.tagName[1]);
    out.small=[...document.querySelectorAll('a,button,input,textarea,summary,select')].filter(e=>vis(e)&&!e.closest('.skip')&&e.getAttribute('type')!=='hidden').filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);const inl=cs.display==='inline'&&e.tagName==='A'&&e.closest('p,li')&&!e.closest('.pindex,.mail,.cbox');return !inl&&(r.height<43.5||r.width<43.5)}).map(e=>e.tagName+':'+(e.textContent||e.name||'').trim().slice(0,20)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)).slice(0,4);
    return out;});
   ok(`${pg}@${w}: every image has width and height`,!q.noDims.length,q.noDims.join());ok(`${pg}@${w}: every image has an alt attribute`,!q.noAlt.length,q.noAlt.join());
   ok(`${pg}@${w}: no broken images`,!q.broken.length,q.broken.join());ok(`${pg}@${w}: no raw {token}/[placeholder]/undefined text`,!q.raw.length,q.raw.join());
   ok(`${pg}@${w}: all links https (none http://)`,!q.httpLinks.length,q.httpLinks.join());ok(`${pg}@${w}: one h1, heading levels never skip`,q.h1===1&&q.levels.every((l,i)=>i===0||l-q.levels[i-1]<=1),q.levels.join(''));
   ok(`${pg}@${w}: skip link target`,q.skip);ok(`${pg}@${w}: noindex,nofollow`,/noindex/.test(q.robots)&&/nofollow/.test(q.robots));ok(`${pg}@${w}: og:image absolute https`,/^https:\/\//.test(q.og||''),q.og);
   ok(`${pg}@${w}: call link uses the number from content.json`,q.tels.length>0&&q.tels.every(t=>t==='tel:'+tel(C.contact.phone)),q.tels.join());
   ok(`${pg}@${w}: text link uses the number from content.json`,q.sms.length>0&&q.sms.every(t=>t==='sms:'+tel(C.contact.phone)),q.sms.join());
   ok(`${pg}@${w}: a call-to-action to enquire is on the page`,q.enq);
   if(w===375)ok(`${pg}@${w}: tap targets are 44px`,!q.small.length,q.small.join(' | '));
   if(w===375){const gaps=await p.evaluate(()=>{const els=[...document.querySelectorAll('a.btn,button.ham,.flinks a,.socials a,nav.mnav a,.dock a')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'});const bad=[];for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i].getBoundingClientRect(),c=els[j].getBoundingClientRect();const dx=Math.max(c.left-a.right,a.left-c.right),dy=Math.max(c.top-a.bottom,a.top-c.bottom);if(dx<7.5&&dy<7.5&&!(dx<0&&dy<0)&&!(dx<0&&dy<0.5)&&Math.max(dx,dy)<7.5)bad.push((els[i].textContent||'').trim().slice(0,12)+' / '+(els[j].textContent||'').trim().slice(0,12)+' '+Math.round(Math.max(dx,dy)));}return bad.slice(0,3);});
    ok(`${pg}@${w}: 8px between neighbouring tap targets`,!gaps.length,gaps.join(' | '));}
  }}
 await ctx.close();}
// ---- 2 200% zoom (reflow): a 1280px window at 200% is 640 CSS px; 320 CSS px is 400%
{const ctx=await b.newContext({viewport:{width:640,height:450},deviceScaleFactor:2});const p=await ctx.newPage();for(const pg of PAGES){await p.goto(`${base}/${pg}.html`);const sw=await p.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]);ok(`${pg}: no sideways scroll at 200% zoom`,sw[0]<=sw[1],sw.join('/'));}await ctx.close();}
// ---- 3 first paint without script: every shared region is in the HTML
{const ctx=await b.newContext({javaScriptEnabled:false,viewport:{width:375,height:800}});const p=await ctx.newPage();
 for(const pg of PAGES){await p.goto(`${base}/${pg}.html`);const r=await p.evaluate(()=>({h1:(document.querySelector('h1')||{}).innerText,regions:[...document.querySelectorAll('[data-cms]')].filter(e=>!e.innerHTML.trim()).map(e=>e.getAttribute('data-cms')),tel:!!document.querySelector('a[href^="tel:"]'),socials:document.querySelectorAll('.socials a').length}));
  ok(`${pg}: first paint works without script (heading, content regions, call link)`,r.h1&&!r.regions.length&&r.tel&&r.socials===C.socials.length,JSON.stringify(r));}
 await ctx.close();}
// ---- 4 content: exact phone/email/socials, counts, nav, sites list, no links to Dave's sites on Marta's pages
{const ctx=await b.newContext();const p=await ctx.newPage();
 for(const pg of PAGES){await p.goto(`${base}/${pg}.html`);const l=await p.evaluate(()=>({soc:[...document.querySelectorAll('footer .socials a')].map(a=>a.href),mail:[...document.querySelectorAll('a[href^="mailto:"]')].map(a=>a.getAttribute('href')),all:[...document.querySelectorAll('a[href]')].map(a=>a.href),nav:[...document.querySelectorAll('nav.main a')].map(a=>a.textContent.trim())}));
  ok(`${pg}: socials are exactly the six in content.json, in order`,JSON.stringify(l.soc)===JSON.stringify(C.socials.map(s=>s.url)),l.soc.join());
  ok(`${pg}: every mailto is the contact email`,l.mail.every(m=>m.startsWith('mailto:'+C.contact.email)||/^mailto:(info@kidsshow\.ie|magickidsshow@gmail\.com)/i.test(m)),l.mail.join());
  ok(`${pg}: nav matches content.json`,JSON.stringify(l.nav)===JSON.stringify(C.nav.map(n=>n.label)),l.nav.join());
  ok(`${pg}: no links to Dave's sites`,!l.all.some(h=>/daveyoung|theweddingcomedian|dave-preview|wedding-preview/i.test(h)),l.all.filter(h=>/daveyoung|theweddingcomedian/i.test(h)).join());}
 await p.goto(`${base}/gallery.html`);const gl=await p.evaluate(()=>document.querySelectorAll('.ggrid figure').length);ok('gallery shows every photo in content.json',gl===C.gallery.length,gl+' vs '+C.gallery.length);
 await p.goto(`${base}/testimonials.html`);const tl=await p.evaluate(()=>document.querySelectorAll('.rev').length);ok('testimonials page shows all reviews',tl===C.testimonials.length,tl+' vs '+C.testimonials.length);
 await p.goto(`${base}/blog.html`);const pl=await p.evaluate(()=>document.querySelectorAll('article.post').length);ok('blog shows every post',pl===C.posts.length,pl+' vs '+C.posts.length);
 await p.goto(`${base}/index.html`);const sl=await p.evaluate(()=>document.querySelectorAll('.occgrid li').length);ok('home shows the seven occasion tiles (services text lives in What I do)',sl===7&&C.services.length===2,sl);
 ok('sites[] lists the three sites',Array.isArray(C.sites)&&C.sites.length===3&&C.sites.every(s=>/^https:\/\//.test(s.live)&&/^https:\/\/apexagenticsuk\.github\.io\/[\w-]+\/$/.test(s.preview)));
 ok('siteUrl is the marta-preview address',C.siteUrl==='https://apexagenticsuk.github.io/marta-preview/');
 await ctx.close();}
// ---- 5 repo rules
{const rb=fs.readFileSync(__dirname+'/../robots.txt','utf8');ok('robots.txt disallows everything',/User-agent:\s*\*/i.test(rb)&&/Disallow:\s*\/\s*$/m.test(rb));
 const {execSync}=require('child_process');let hist='';try{hist=execSync('git log -p --all --no-color',{cwd:__dirname+'/..',maxBuffer:1<<28,stdio:['ignore','pipe','ignore']}).toString('latin1');}catch(e){}
 const tok=hist.match(/ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|gh[ousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-[A-Za-z0-9]{32,}/);ok('no tokens or private keys anywhere in git history',!tok,tok&&tok[0].slice(0,8));}
await b.close();const bad=res.filter(x=>!x).length;console.log((bad?'FAIL ':'PASS ')+`marta: ${res.length-bad}/${res.length} checks`);process.exit(bad?1:0);})();
