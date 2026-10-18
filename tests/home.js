// Home page upgrade: structure, real-site wording, widths, contrast, layout shift, sticky dock vs form, no-JS.  node tests/home.js <base>
const {chromium}=require('playwright');const fs=require('fs');const base=process.argv[2];
const res=[];const ok=(n,c,x)=>{res.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(x&&!c?' '+String(x).slice(0,300):''));};
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
(async()=>{
// 1 structure (cheap, no browser)
const h1=(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]||'';const h1t=h1.replace(/<[^>]+>/g,'').replace(/&#8217;|&rsquo;/g,'’').replace(/&amp;/g,'&');
ok('H1 is the live headline (Magic Marta! Looking for MAGIC, LAUGHTER and unforgettable fun?), not parent-first',/^Magic Marta! Looking for MAGIC, LAUGHTER and unforgettable fun\?$/.test(h1t.replace(/\s+/g,' ').trim())&&!/children.s birthday parties full of/i.test(html),h1t);
ok('exactly one H1, noindex kept',(html.match(/<h1[\s>]/g)||[]).length===1&&/name="robots" content="noindex/.test(html));
ok('"Check availability" button goes to the on-page form',/<a[^>]*href="#enquire"[^>]*>Check availability<\/a>/.test(html)&&/id="enquire"/.test(html));
ok('"Call Marta" button is the verified number',/<a[^>]*href="tel:\+353872616317"[^>]*>Call Marta<\/a>/.test(html));
ok('Claire quote is exactly the real wording',require('../content.json').testimonials.filter(t=>t.place==='home').map(t=>t.who+'|'+t.role+'|'+t.text).join()==='Claire|Woodstown Dental Centre|“Great job, kept the kids entertained and stress free before their appoinment! The magic sweets helped lol!”');
ok('no empty headings on Home (George/Judy block and its heading removed on purpose: not on the live Home)',!/<h2[^>]*>\s*<\/h2>/.test(html)&&!/Square Tallaght|Axis Insurance/.test(html));
ok('no links to Dave’s sites',!/apexagentics(?!uk\.github\.io\/marta-preview)|daveyoung|theweddingcomedian|youngcomedy/i.test(html.replace(/info@theweddingcomedian/g,'')));
ok('no invented claims (insured, vetted, garda, rated, 5-star, from €)',!/insured|vetted|garda|from €|€\s?\d|5.star|rated|packages?\b/i.test(html.replace(/<img[^>]*>|<script[\s\S]*?<\/script>|<blockquote[\s\S]*?<\/blockquote>/g,'')));
const ids=[...html.matchAll(/data-dy="([^"]+)"/g)].map(m=>m[1]);ok('new home text, picture and link ids exist',ids.length>90&&/t1[2-9]/.test(ids.join(' ')));
const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
// 2 no-JS
{const c=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:800}});const p=await c.newPage();await p.goto(base+'/index.html');
 const t=await p.evaluate(()=>({h1:document.querySelector('h1').innerText,a:[...document.querySelectorAll('.herocta a')].map(a=>a.innerText.trim()+'>'+a.getAttribute('href')),form:!!document.querySelector('#enquire form.enq'),q:document.querySelector('.topq')&&document.querySelector('.topq').innerText}));
 ok('no JS: headline, both buttons, form and quote are in the HTML',/Looking for MAGIC, LAUGHTER/i.test(t.h1)&&t.a.join()==='Check availability>#enquire,Call Marta>tel:+353872616317'&&t.form&&/Claire/.test(t.q),JSON.stringify(t));await c.close();}
for(const W of [320,360,390,430,768,1280]){
 const c=await b.newContext({viewport:{width:W,height:W<800?800:900},deviceScaleFactor:1});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
 await p.goto(base+'/index.html');await p.waitForTimeout(1200);
 const m=await p.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {t:b.top+scrollY,b:b.bottom+scrollY,l:b.left,r:b.right,w:b.width,h:b.height};};
  return {sw:document.documentElement.scrollWidth,vh:innerHeight,cta:[...document.querySelectorAll('.herocta a')].map(a=>{const b=a.getBoundingClientRect();return {t:b.top,b:b.bottom,l:b.left,r:b.right,h:b.height}}),h1:r('.hero2 h1'),form:r('#enquire'),trust:r('.trust'),q:r('.topq')};});
 {const t=await p.evaluate(()=>[...document.querySelectorAll('.svcgrid .svc')].map(e=>{const b=e.getBoundingClientRect();return {l:b.left,r:b.right,t:b.top,w:b.width}}));const g=await p.evaluate(()=>{const b=document.querySelector('.svcgrid').getBoundingClientRect();return {l:b.left,r:b.right}});
  const L=Math.min(...t.map(x=>x.l)),R=Math.max(...t.map(x=>x.r));
  ok(W+': the two service tiles fit, and the tile block is centred (balanced)',t.length===2&&L>=0&&R<=W&&Math.abs(L-(W-R))<=3,JSON.stringify([t,W]));}
 ok(W+': no sideways scroll',m.sw<=W,m.sw);
 ok(W+': both hero buttons are visible in the first screen, ≥44px tall, gap ≥8px',m.cta.length===2&&m.cta.every(x=>x.b<=m.vh&&x.h>=44)&&(m.cta[0].r+8<=m.cta[1].l||m.cta[0].b+8<=m.cta[1].t||m.cta[1].r+8<=m.cta[0].l||m.cta[1].b+8<=m.cta[0].t),JSON.stringify(m.cta));
 ok(W+': contact form is in the top part of the page (above Watch/occasions)',await p.evaluate(()=>{const f=document.querySelector('#enquire').getBoundingClientRect().top+scrollY,w=document.querySelector('#watch').getBoundingClientRect().top+scrollY,o=document.querySelector('.occ').getBoundingClientRect().top+scrollY;return f<w&&w<o;}));
 // contrast: hide text, sample backgrounds
 const els=await p.evaluate(()=>{const out=[];document.querySelectorAll('.hero2 h1,.hero2 .eyebrow,.hero2 p,.herocta a,.trustlist .tt,.topq blockquote,.topq figcaption b,.topq figcaption small,.enq-top h2,.enq-top p:not(.phoneline):not(.enq-fallback),.enq-lead,.phoneline a,.enq-addr,.enq-top label,.enq-note,.dock a,.topq .btn').forEach((e,i)=>{if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;const b=e.getBoundingClientRect();if(b.width<2||b.height<2)return;const cs=getComputedStyle(e);const col=cs.color.match(/[\d.]+/g).map(Number);const fs=parseFloat(cs.fontSize),bold=parseInt(cs.fontWeight)>=700;e.setAttribute('data-ct',i);out.push({i,sel:e.className||e.tagName,col,large:fs>=24||(fs>=18.66&&bold),top:b.top+scrollY,left:b.left,w:b.width,h:b.height,tag:e.tagName});});return out;});
 const bad=[];
 for(const e of els){await p.evaluate(()=>{if(!window.__sh){window.__sh=new CSSStyleSheet();window.__sh.replaceSync('*{transition:none!important;animation:none!important;} .js-rv{opacity:1!important;transform:none!important} *{color:transparent!important;text-shadow:none!important;caret-color:transparent!important}svg{visibility:hidden!important}input::placeholder,textarea::placeholder{color:transparent!important}');}document.adoptedStyleSheets=[window.__sh];});
  await p.evaluate(y=>scrollTo(0,Math.max(0,y-200)),e.top);await p.waitForTimeout(60);
  const box=await p.evaluate(i=>{const b=document.querySelector('[data-ct="'+i+'"]').getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height};},e.i);
  const x=Math.max(0,box.x),y=Math.max(0,box.y),w=Math.min(box.w,W-x),h=Math.min(box.h,p.viewportSize().height-y);if(w<2||h<2)continue;
  const buf=await p.screenshot({clip:{x,y,width:w,height:h}});const png=require('pngjs').PNG.sync.read(buf);let worst=99;
  const x0=Math.floor(png.width*.15),x1=Math.ceil(png.width*.85),y0=Math.floor(png.height*.25),y1=Math.ceil(png.height*.75);for(let yy=y0;yy<Math.max(y1,y0+1);yy+=Math.max(1,(y1-y0)>>3))for(let xx=x0;xx<Math.max(x1,x0+1);xx+=Math.max(1,(x1-x0)>>4)){const k=(yy*png.width+xx)*4;worst=Math.min(worst,cr(e.col,[png.data[k],png.data[k+1],png.data[k+2]]));}
  if(worst<(e.large?3:4.5))bad.push(e.sel+' '+worst.toFixed(2));
  await p.evaluate(()=>{document.adoptedStyleSheets=[];});}
 ok(W+': text contrast ≥4.5 (≥3 large) on '+els.length+' text blocks over the real backgrounds',bad.length===0,bad.join('; '));
 await p.evaluate(()=>scrollTo(0,0));
 // scroll whole page then CLS
 await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}scrollTo(0,0);});await p.waitForTimeout(500);
 const cls=await p.evaluate(()=>window.__cls);ok(W+': layout shift (CLS) is 0',cls<0.001,cls);
 // sticky dock vs form
 if(W<900){const dk=await p.evaluate(()=>{const d=document.querySelector('.sticky.dock');if(!d)return null;const cs=getComputedStyle(d);return {pos:cs.position,disp:cs.display,vis:d.getBoundingClientRect().height>0,links:[...d.querySelectorAll('a,button')].map(a=>{const b=a.getBoundingClientRect();return {l:b.left,r:b.right,h:b.height}}) };});
  ok(W+': mobile sticky call/book bar is there with ≥44px buttons and ≥8px gaps',dk&&dk.pos==='fixed'&&dk.vis&&dk.links.length>=2&&dk.links.every(l=>l.h>=44)&&dk.links.every((l,i)=>i===0||l.l-dk.links[i-1].r>=8),JSON.stringify(dk));
  let cover=[];for(const sel of ['#enquire input:not([type=hidden])','#enquire textarea','#enquire button[type=submit]','#enquire .enq-copy','footer a:last-of-type']){const n=await p.locator(sel).count();for(let i=0;i<n;i++){const el=p.locator(sel).nth(i);await el.scrollIntoViewIfNeeded();await el.evaluate(e=>e.scrollIntoView({block:'end'}));await p.waitForTimeout(60);
   const o=await el.evaluate(e=>{const d=document.querySelector('.sticky.dock'),b=e.getBoundingClientRect(),k=d.getBoundingClientRect();const hidden=getComputedStyle(d).display==='none'||k.height===0||d.classList.contains('hide')||getComputedStyle(d).visibility==='hidden'||getComputedStyle(d).transform!=='none'&&k.top>=innerHeight;return !hidden&&b.bottom>k.top+1&&b.top<k.bottom;});if(o)cover.push(sel+'#'+i);}}
  ok(W+': sticky bar never covers a form field, button or the last footer link when scrolled into view',cover.length===0,cover.join());
  await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(100);
  ok(W+': at the bottom of the page the last content clears the bar',await p.evaluate(()=>{const d=document.querySelector('.sticky.dock').getBoundingClientRect();const f=document.querySelector('footer').getBoundingClientRect();return f.bottom<=d.top+1||getComputedStyle(document.querySelector('.sticky.dock')).display==='none'||parseFloat(getComputedStyle(document.body).paddingBottom)>=d.height-1;}));}
 ok(W+': no page errors',errs.length===0,errs.join());
 await c.close();}
// reduced motion: reveal does not hide or move content
{const c=await b.newContext({viewport:{width:390,height:800},reducedMotion:'reduce'});const p=await c.newPage();await p.goto(base+'/index.html');await p.waitForTimeout(600);
 ok('prefers-reduced-motion: no element is hidden or offset by the reveal',await p.evaluate(()=>[...document.querySelectorAll('.js-rv')].every(e=>{const s=getComputedStyle(e);return s.opacity==='1'&&(s.transform==='none'||s.transform==='matrix(1, 0, 0, 1, 0, 0)');})));await c.close();}
await b.close();const n=res.length,pp=res.filter(Boolean).length;console.log('SUMMARY '+pp+'/'+n);process.exit(pp===n?0:1);})().catch(e=>{console.log('FAIL error '+String(e.stack||e).slice(0,500));process.exit(1);});
