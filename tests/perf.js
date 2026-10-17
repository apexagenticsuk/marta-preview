// Guards for layout shift (Blog) and gallery loading speed. Usage: node tests/perf.js <base>
const {chromium}=require(process.env.PW||'playwright');const fs=require('fs');
const base=(process.argv[2]||'http://localhost:8765').replace(/\/$/,'');
const PAGES=['index','about','gallery','testimonials','blog','contact'];let bad=0,n=0;
const ok=(m,c,x)=>{n++;if(!c){bad++;console.log('FAIL '+m+(x?' '+x:''))}else if(process.env.V)console.log('PASS '+m)};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
// 1. every <img> has width+height, in the served HTML and after script ran
for(const pg of PAGES){const html=await (await fetch(`${base}/${pg}.html`)).text();
 const raw=(html.match(/<img\b[^>]*>/g)||[]).filter(t=>!/\swidth=/.test(t)||!/\sheight=/.test(t));
 ok(`${pg}: every <img> in the HTML has width and height`,!raw.length,raw[0]&&raw[0].slice(0,120));
 const p=await b.newPage({viewport:{width:375,height:800}});await p.goto(`${base}/${pg}.html`);await p.waitForTimeout(700);
 const un=await p.evaluate(()=>[...document.images].filter(i=>!i.getAttribute('width')||!i.getAttribute('height')).map(i=>i.src));
 ok(`${pg}: every <img> has width and height after script`,!un.length,un[0]);await p.close();}
// 2. fonts: preloaded statically, with metric-matched fallbacks
const css=await (await fetch(`${base}/style.css`)).text();
for(const f of ['Nunito','Fredoka'])ok(`style.css has a size-adjusted fallback for ${f}`,new RegExp(`font-family:'${f} Fallback'[^}]*size-adjust`).test(css));
for(const pg of PAGES){const html=await (await fetch(`${base}/${pg}.html`)).text();
 ok(`${pg}: body and heading fonts preloaded in static HTML`,['fredoka_700','nunito_400','nunito_700'].every(f=>html.includes(`href="assets/font_${f}.woff2"`)));}
// 3. Blog CLS under slow fonts and a throttled CPU/network (the conditions Lighthouse uses)
for(const w of [375,412]){const ctx=await b.newContext({viewport:{width:w,height:800},deviceScaleFactor:2});const p=await ctx.newPage();
 await p.route(/\.woff2$/,async r=>{await new Promise(s=>setTimeout(s,+process.env.FD||400));r.continue()});
 const c=await ctx.newCDPSession(p);await c.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true})});
 await p.goto(`${base}/blog.html`,{waitUntil:'load'});await p.waitForTimeout(3500);
 for(let y=0;y<4000;y+=400){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(100)}
 const cls=await p.evaluate(()=>window.__cls);ok(`blog@${w}: CLS ${cls.toFixed(3)} is under 0.05 with slow fonts`,cls<0.05);await ctx.close();}
// 4. Gallery: LCP image eager + high priority + preloaded; below the fold lazy; right-sized variants
const gh=await (await fetch(`${base}/gallery.html`)).text();
const imgs=gh.match(/<img\b[^>]*>/g)||[];const pre=gh.match(/<link rel="preload" as="image"[^>]*>/);
ok('gallery: first image is not lazy and has fetchpriority=high',imgs[0]&&!/loading="lazy"/.test(imgs[0])&&/fetchpriority="high"/.test(imgs[0]));
ok('gallery: exactly the LCP image is preloaded, with the same srcset',pre&&gh.match(/rel="preload" as="image"/g).length===1&&imgs[0].match(/srcset="([^"]+)"/)[1]===pre[0].match(/imagesrcset="([^"]+)"/)[1]);
const below=imgs.filter(t=>!/fetchpriority="high"/.test(t));
ok('gallery: images below the fold are lazy (at most one more eager)',below.filter(t=>!/loading="lazy"/.test(t)).length<=1);
const big=imgs.filter(t=>{const m=t.match(/width="(\d+)"/);return m&&+m[1]>=800});
ok('gallery: every 800px+ image has a srcset with a variant of 640px or less',big.every(t=>/srcset="[^"]*_(480|640)\.webp/.test(t)&&/sizes=/.test(t)),big.find(t=>!/_(480|640)/.test(t)));
ok('gallery: all images are WebP',imgs.every(t=>/src="[^"]+\.webp"/.test(t)));
// phone transfer: images fetched before scrolling stay small
{const ctx=await b.newContext({viewport:{width:375,height:700},deviceScaleFactor:2});const p=await ctx.newPage();let bytes=0,count=0;await p.addInitScript(()=>{new PerformanceObserver(l=>{const e=l.getEntries().pop();window.__lcp=e.element?{tag:e.element.tagName,lazy:e.element.loading==='lazy',src:e.element.getAttribute('src')}:null}).observe({type:'largest-contentful-paint',buffered:true})});
 p.on('response',async r=>{if(/\/assets\/g_.*\.webp/.test(r.url())){count++;bytes+=(await r.body().catch(()=>Buffer.alloc(0))).length}});
 await p.goto(`${base}/gallery.html`,{waitUntil:'load'});await p.waitForTimeout(1500);
 ok(`gallery@375: before scrolling only ${count} gallery images load (${(bytes/1024)|0} KB)`,count<=6&&bytes<260*1024);
 const lcp=await p.evaluate(()=>window.__lcp);
 ok('gallery@375: LCP element is a gallery image that is not lazy',lcp&&lcp.tag==='IMG'&&!lcp.lazy&&/g_/.test(lcp.src),JSON.stringify(lcp));
 await ctx.close();}
await b.close();console.log(bad?`FAIL perf: ${bad}/${n}`:`PASS perf: ${n}/${n} checks`);process.exit(bad?1:0)})()
