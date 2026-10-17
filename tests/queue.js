// Daniel's re-sweep fixes: favicon, hero button grid, dock clearance, folded blog. Usage: node tests/queue.js <base>
const {chromium}=require(process.env.PW||'playwright');
const base=(process.argv[2]||'http://localhost:8765').replace(/\/$/,'');
const PAGES=['index','about','gallery','testimonials','blog','contact'];let bad=0,n=0;
const ok=(m,c,x)=>{n++;if(!c){bad++;console.log('FAIL '+m+(x?' '+x:''))}else if(process.env.V)console.log('PASS '+m)};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
// favicon
const fi=await fetch(`${base}/favicon.ico`);ok('/favicon.ico returns 200 and an image',fi.status===200&&/icon|image/.test(fi.headers.get('content-type')||'')&&(await fi.arrayBuffer()).byteLength>100,fi.headers.get('content-type'));
for(const pg of [...PAGES,'page']){const h=await (await fetch(`${base}/${pg}.html`)).text();ok(`${pg}: <link rel=icon> points at favicon.ico`,/<link rel="icon" href="favicon\.ico"/.test(h));}
{const h=await (await fetch(`${base}/admin/index.html`)).text();ok('admin: has favicon link',/rel="icon" href="\.\.\/favicon\.ico"/.test(h));}
// hero buttons: centred, even grid
for(const w of [360,375,390,430]){const ctx=await b.newContext({viewport:{width:w,height:800}});const p=await ctx.newPage();await p.emulateMedia({reducedMotion:'reduce'});
 for(const [pg,sel] of [['index','.hero .btnrow'],['contact','.enquire .btnrow']]){await p.goto(`${base}/${pg}.html`);await p.waitForTimeout(400);
  const g=await p.evaluate(sel=>{const row=document.querySelector(sel),R=row.getBoundingClientRect();const bs=[...row.children].map(e=>e.getBoundingClientRect());return {R:[R.left,R.right],bs:bs.map(r=>[r.left,r.right,r.top,r.bottom])}},sel);
  const [a,t,e]=g.bs;const L=Math.min(...g.bs.map(x=>x[0])),Rr=Math.max(...g.bs.map(x=>x[1]));
  ok(`${pg}@${w}: hero buttons span the row evenly (left/right margins equal)`,Math.abs((L-g.R[0])-(g.R[1]-Rr))<1.5,JSON.stringify(g));
  ok(`${pg}@${w}: Text and Enquire are equal width, side by side, 10px+ apart`,Math.abs((t[1]-t[0])-(e[1]-e[0]))<1.5&&Math.abs(t[2]-e[2])<1.5&&e[0]-t[1]>=10,JSON.stringify(g));
  ok(`${pg}@${w}: Call button is full width above them`,Math.abs((a[1]-a[0])-(Rr-L))<1.5&&t[2]-a[3]>=10,JSON.stringify(g));}
 // dock clearance + hides while typing
 await p.goto(`${base}/contact.html`);await p.waitForTimeout(500);await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(300);
 const d=await p.evaluate(()=>{const k=document.querySelector('.sticky.dock').getBoundingClientRect();const f=document.querySelector('footer');const fr=f.getBoundingClientRect();return {dockTop:k.top,dockH:k.height,footBottom:fr.bottom,pad:parseFloat(getComputedStyle(document.body).paddingBottom),inner:innerHeight}});
 ok(`contact@${w}: page end clears the dock (footer bottom ${d.footBottom|0} <= dock top ${d.dockTop|0})`,d.footBottom<=d.dockTop+1&&d.pad>=d.dockH,JSON.stringify(d));
 await p.focus('form.enq input[name=Name]');await p.waitForTimeout(400);
 const vis=await p.evaluate(()=>{const k=document.querySelector('.sticky.dock'),s=getComputedStyle(k);return s.visibility==='hidden'||+s.opacity===0});
 ok(`contact@${w}: dock hidden while a form field is focused`,vis);
 await p.evaluate(()=>document.activeElement.blur());await p.waitForTimeout(400);
 ok(`contact@${w}: dock returns after the field loses focus`,await p.evaluate(()=>getComputedStyle(document.querySelector('.sticky.dock')).visibility==='visible'));
 await ctx.close()}
// bottom CTA band: same grid as the hero
for(const w of [360,375,390,430]){const ctx=await b.newContext({viewport:{width:w,height:800}});const p=await ctx.newPage();await p.emulateMedia({reducedMotion:'reduce'});
 for(const pg of ['about','gallery','testimonials','blog']){await p.goto(`${base}/${pg}.html`);await p.waitForTimeout(300);
  const g=await p.evaluate(()=>{const row=document.querySelector('.band .btnrow');const R=row.getBoundingClientRect();return {R:[R.left,R.right],bs:[...row.children].map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right,r.top,r.bottom]})}});
  const [a,t,e]=g.bs;const L=Math.min(...g.bs.map(x=>x[0])),Rr=Math.max(...g.bs.map(x=>x[1]));
  ok(`${pg}@${w}: bottom CTA: Call full width, Text and Enquire side by side and equal, margins even`,Math.abs((a[1]-a[0])-(Rr-L))<1.5&&Math.abs((t[1]-t[0])-(e[1]-e[0]))<1.5&&Math.abs(t[2]-e[2])<1.5&&e[0]-t[1]>=10&&t[2]-a[3]>=10&&Math.abs((L-g.R[0])-(g.R[1]-Rr))<1.5,JSON.stringify(g));}
 await ctx.close()}
// fold label swaps to Hide when open (with and without script)
for(const js of [true,false]){const ctx=await b.newContext({viewport:{width:375,height:800},javaScriptEnabled:js});const p=await ctx.newPage();await p.goto(`${base}/blog.html`);await p.waitForTimeout(300);
 const lab=()=>p.evaluate(()=>{const s=document.querySelector('details.older>summary');return s.innerText.trim()});
 ok(`blog (script ${js}): closed summary reads "Show older posts (24)"`,(await lab())==='Show older posts (24)',await lab());
 await p.click('details.older>summary');await p.waitForTimeout(200);
 ok(`blog (script ${js}): open summary reads "Hide older posts"`,(await lab())==='Hide older posts',await lab());
 await p.click('details.older>summary');await p.waitForTimeout(200);ok(`blog (script ${js}): it folds again and the label returns`,(await lab())==='Show older posts (24)');
 await ctx.close()}
// folded blog
const raw=await (await fetch(`${base}/blog.html`)).text();
const ids=[...raw.matchAll(/<article[^>]*class="post"[^>]*id="(post-\d+)"/g)].map(m=>m[1]);
ok('blog: all 36 posts are in the static HTML',ids.length===36,ids.length);
const di=raw.indexOf('<details class="older"');const before=[...raw.slice(0,di).matchAll(/class="post"/g)].length;
ok('blog: first batch (12 posts) is outside the fold, rest inside <details>',di>0&&before===12&&[...raw.slice(di).matchAll(/class="post"/g)].length===24,before);
ok('blog: summary says how many older posts there are',/<summary><span class="s-show">Show older posts \(24\)<\/span><span class="s-hide">Hide older posts<\/span><\/summary>/.test(raw));
{const ctx=await b.newContext({viewport:{width:375,height:800}});const p=await ctx.newPage();await p.emulateMedia({reducedMotion:'reduce'});await p.goto(`${base}/blog.html`);await p.waitForTimeout(500);
 ok('blog: older posts start closed',!(await p.evaluate(()=>document.querySelector('details.older').open)));
 const h0=await p.evaluate(()=>document.documentElement.scrollHeight);
 await p.click('.pindex a[href="#post-30"]');await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{const t=document.getElementById('post-30').getBoundingClientRect();return {open:document.querySelector('details.older').open,vis:t.height>0&&t.top<innerHeight&&t.bottom>0}});
 ok('blog: clicking an older post in the index opens the fold and shows it',r.open&&r.vis,JSON.stringify(r));
 const ts=await p.evaluate(()=>document.querySelector('details.older>summary').getBoundingClientRect().height);ok('blog: summary is a 44px+ target',ts>=44,ts);
 await ctx.close()}
await b.close();console.log(bad?`FAIL queue: ${bad}/${n}`:`PASS queue: ${n}/${n} checks`);process.exit(bad?1:0)})()
