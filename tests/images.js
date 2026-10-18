// Image parity with the live kidsshow.ie: every banner, background, grid, logo and tile is on Home as a real, editable, sized, lazy image. node tests/images.js http://localhost:8771
const {chromium}=require('playwright');const fs=require('fs');
const base=process.argv[2]||'http://localhost:8765';const C=JSON.parse(fs.readFileSync(__dirname+'/../content.json','utf8'));
const raw=fs.readFileSync(__dirname+'/../index.html','utf8').replace(/ data-dy="[^"]*"/g,'');
let bad=0,n=0;const ok=(k,c,d)=>{n++;if(!c){bad++;console.log('FAIL '+k+(d!==undefined?' '+JSON.stringify(d):''));}};
const LIVE_CLIENTS=["St Michael's House","Windsor","Peugeot","Cocoon","Ardmore","Kepak","Paul","Crowne Plaza","Equipet","MAO","Corvil","O2","Fine Gael","Sq.","Ellucian","Zalando","B&Q","Musgrave Market Place","Credit Union","Giraffe","KBC","An Garda Síochána","Liffey Valley","BOC"];
const ORIG17=["Flying Tiger","Web Summit","Coca-Cola","BMW","Lidl","Harvey Norman","SuperValu","Tesco","J.P. Morgan","Bank of Ireland","Salesforce","Matheson","Vodafone","Fitbit","Cystic Fibrosis Ireland","Citibank","IKEA"];
for(const f of ['blog-frame','blog-bg','magician-cutout','orig-header-banner','orig-hero-poster'])ok('live image saved: assets/live/'+f+'.webp',fs.existsSync(__dirname+'/../assets/live/'+f+'.webp'));
ok('blog page uses the live frame and background',/blogban/.test(fs.readFileSync(__dirname+'/../blog.html','utf8'))&&/blog-bg\.webp/.test(fs.readFileSync(__dirname+'/../style.css','utf8')));
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
// ---- no-JS: the artwork is in the HTML
const src=s=>(raw.match(new RegExp('src="'+s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'"','g'))||[]).length;
const counts={};const cat=(k,v,exp)=>{counts[k]=v;ok('count '+k+' = '+exp,v===exp,v);};
cat('header artwork',src('assets/live/header-art.webp'),1);
cat('six service icons',(raw.match(/assets\/live\/icon-(birthday|communion|weddings|corporate|christmas|festivals)\.webp/g)||[]).length,6);
cat('hero (magician with children)',src('assets/live/hero-kids.webp'),1);
cat('about banner',src('assets/live/about-banner.webp'),1);
cat('instagram banner',src('assets/live/instagram-banner.webp'),1);
cat('online show TV/Zoom image',src('assets/live/online-tv.webp'),1);
cat('face painting photos',(raw.match(/<div class="pgrid g4">[\s\S]*?<\/div>/)[0].match(/<img/g)||[]).length,4);
cat('balloon photos',(raw.match(/<div class="pgrid g3">[\s\S]*?<\/div>/)[0].match(/<img/g)||[]).length,3);
cat('wedding photos',(raw.match(/<div class="pgrid g3 wed">[\s\S]*?<\/div>/)[0].match(/<img/g)||[]).length,3);
cat('communion graphic',src('assets/live/communion-graphic.webp'),1);
cat('home gallery strip',(raw.match(/<div class="gs6">[\s\S]*?<\/div>/)[0].match(/<img/g)||[]).length,6);
cat('five-star image',src('assets/live/five-stars.webp'),1);
cat('get-in-touch cartoon',(raw.match(/assets\/live\/get-in-touch-350\.webp"/g)||[]).length,1);
cat('instagram tile images',(raw.match(/assets\/live\/ig-\d\d-360\.webp"/g)||[]).length,9);
const bgs=['bg-brushes','bg-balloons','bg-roses','bg-peach','bg-glitter','bg-cakepops','bg-galaxy','bg-stars','bg-sparkle-red','strip-red'];
cat('section background photos',bgs.filter(x=>raw.includes('assets/live/'+x+'.webp')).length,10);
// clients: exactly the live set, alt = company name
const names=C.clients.map(c=>c.name);const cl=raw.match(/data-cms="clients"[\s\S]*?<\/ul>/)[0];const alts=[...cl.matchAll(/<img[^>]*alt="([^"]*)"/g)].map(m=>m[1].replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'"));
cat('client logos (grid)',alts.length,ORIG17.length+LIVE_CLIENTS.length);
LIVE_CLIENTS.concat(ORIG17).forEach(x=>ok('client logo with alt = "'+x+'"',alts.includes(x)||alts.includes(x.replace(/'/g,'’'))));
ok('client alt equals company name for every logo',alts.every(a=>names.some(nm=>nm===a||nm.replace(/'/g,'’')===a||nm.replace(/'/g,'&#39;')===a)));
ok('Woodstown logo present (testimonial)',/assets\/live\/t-woodstown-dental-centre\.webp/.test(raw));
// every image file referenced exists and every Home img is sized
const files=[...raw.matchAll(/(?:src|srcset)="([^"]+)"/g)].flatMap(m=>m[1].split(',').map(s=>s.trim().split(' ')[0])).filter(s=>/^assets\//.test(s));
files.forEach(f=>ok('file exists '+f,fs.existsSync(__dirname+'/../'+f)));
[...raw.matchAll(/<img\b[^>]*>/g)].forEach(m=>{const t=m[0];ok('sized+alt '+(t.match(/src="([^"]+)"/)||[])[1],/\swidth="\d+"/.test(t)&&/\sheight="\d+"/.test(t)&&/\salt="/.test(t));});
ok('header art is preloaded and high priority',/rel="preload" as="image"[^>]*header-art/.test(raw)&&/header-art\.webp"[^>]*fetchpriority="high"/.test(raw));
const lazyBad=[...raw.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).filter(t=>/src="assets\/live\/(bg-|about|online|ig-|get-in|five|instagram)/.test(t)&&!/loading="lazy"/.test(t)&&!/fetchpriority="low"/.test(t));
ok('below-the-fold images are lazy',lazyBad.length===0,lazyBad.slice(0,2));
// ---- browser: loaded, editable ids, CLS, contrast
for(const [name,w,h] of [['phone',390,844],['desktop',1280,900]]){
 const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();
 await p.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
 await p.goto(base+'/index.html',{waitUntil:'load'});await p.waitForTimeout(800);
 const H=await p.evaluate(()=>document.body.scrollHeight);for(let y=0;y<H;y+=300){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(90);}await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{const im=[...document.querySelectorAll('main img')];return {n:im.length,broken:im.filter(i=>!(i.complete&&i.naturalWidth>0)).map(i=>i.getAttribute('src')),noid:im.filter(i=>!/\bi\d+\b/.test(i.getAttribute('data-dy')||'')&&!i.closest('[data-cms]')).map(i=>i.getAttribute('src')),over:document.documentElement.scrollWidth>innerWidth+1,cls:window.__cls};});
 ok(name+': every image loads ('+r.n+')',r.broken.length===0,r.broken);ok(name+': every static image has an editor id (data-dy i#)',r.noid.length===0,r.noid.slice(0,3));ok(name+': no sideways scroll',!r.over);ok(name+': CLS < 0.02 ('+r.cls.toFixed(4)+')',r.cls<0.02);
 // contrast over photos
 await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.evaluate(()=>scrollTo(0,0));
 const sels=['.hero3 h1','.hero3 .rightplace','.hero3 .bring','.hero3 .welcome','.hero3 .lead','.mtag','.sixrow span','.onlineshow h2','.onlineshow .big','.joy .pull','.band h2','.band .big','.wts','.cl-home h2'];
 const items=await p.evaluate(sels=>{const o=[];sels.forEach(s=>{const e=document.querySelector(s);if(e){e.scrollIntoView({block:'center'});}});return sels;},sels);
 for(const s of sels){
  const info=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const cs=getComputedStyle(e);const r=e.getBoundingClientRect();return {c:cs.color,fs:parseFloat(cs.fontSize),fw:+cs.fontWeight,r:{x:Math.max(0,r.x),y:r.y+scrollY,w:Math.min(r.width,innerWidth-Math.max(0,r.x)),h:r.height}}},s);
  if(!info)continue;
  await p.addStyleTag({content:'*{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important}'}).then(async h=>{await p.waitForTimeout(150);});
  const buf=await p.screenshot({fullPage:true,clip:{x:info.r.x,y:info.r.y,width:Math.max(1,info.r.w),height:Math.max(1,info.r.h)}});
  await p.evaluate(()=>{document.querySelectorAll('style').forEach(st=>{if(/transparent!important/.test(st.textContent))st.remove();});});
  const pg=await ctx.newPage();await pg.setContent('<canvas id=c></canvas>');
  const lum=await pg.evaluate(async b64=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.getElementById('c');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};let ls=[];for(let i=0;i<d.length;i+=4)ls.push(.2126*f(d[i])+.7152*f(d[i+1])+.0722*f(d[i+2]));ls.sort((a,b)=>a-b);return {p50:ls[Math.floor(ls.length*.5)],p90:ls[Math.floor(ls.length*.9)],p10:ls[Math.floor(ls.length*.1)]};},buf.toString('base64'));await pg.close();
  const m=info.c.match(/\d+(\.\d+)?/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};const tl=.2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]);
  const worst=tl>.5?lum.p90:lum.p10;const cr=(Math.max(tl,worst)+.05)/(Math.min(tl,worst)+.05);const large=info.fs>=24||(info.fs>=18.66&&info.fw>=700);
  ok(name+': contrast '+s+' '+cr.toFixed(1)+':1 (need '+(large?3:4.5)+')',cr>=(large?3:4.5),{cr:+cr.toFixed(2)});
 }
 await ctx.close();}
console.log('COUNTS',JSON.stringify(counts));
console.log(bad?'FAIL images: '+(n-bad)+'/'+n:'SUMMARY images '+n+'/'+n);await b.close();process.exit(bad?1:0);})();
