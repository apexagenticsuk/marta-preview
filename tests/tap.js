// Tap targets: every visible link/button/field >= 44px both ways, and >= 8px between neighbouring targets.
// Usage: node tests/tap.js <base>   (ALL=1 lists every problem)
const {chromium}=require(process.env.PW||'playwright');
const base=(process.argv[2]||'http://localhost:8765').replace(/\/$/,'');
const PAGES=['index','about','gallery','testimonials','blog','contact'];let bad=0,n=0;
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const w of [360,375,430,768,1280]){const ctx=await b.newContext({viewport:{width:w,height:800}});const p=await ctx.newPage();await p.emulateMedia({reducedMotion:'reduce'});
 for(const pg of PAGES){await p.goto(`${base}/${pg}.html`);await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const out=[];const els=[...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button]')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&!e.closest('[hidden],.skip,[aria-hidden=true]')&&!(e.classList.contains('skip'))});
   const R=els.map(e=>({e,r:e.getBoundingClientRect()}));const nm=e=>(e.tagName+'.'+(e.className||'')+' '+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,28)).trim();
   for(const {e,r} of R){if(r.height<43.5||r.width<43.5)out.push('size '+Math.round(r.width)+'x'+Math.round(r.height)+' '+nm(e))}
   for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i],c=R[j];if(a.e.contains(c.e)||c.e.contains(a.e))continue;const da=!!a.e.closest('.sticky'),dc=!!c.e.closest('.sticky');if(da&&dc)continue;if(da||dc){const gv=Math.max(c.r.top-a.r.bottom,a.r.top-c.r.bottom);if(gv>=0&&gv<11.5&&Math.min(a.r.right,c.r.right)-Math.max(a.r.left,c.r.left)>2)out.push('dock gap '+gv.toFixed(1)+'px '+nm(a.e)+' | '+nm(c.e));continue;} /* content hidden under the dock is fine; content just above it needs 12px */
    const gx=Math.max(c.r.left-a.r.right,a.r.left-c.r.right),gy=Math.max(c.r.top-a.r.bottom,a.r.top-c.r.bottom);
    const ox=Math.min(a.r.right,c.r.right)-Math.max(a.r.left,c.r.left),oy=Math.min(a.r.bottom,c.r.bottom)-Math.max(a.r.top,c.r.top);
    // only compare things on the same row (vertical overlap) or same column (horizontal overlap)
    if(oy>2&&gx>=0&&gx<9.5)out.push('gap '+gx.toFixed(1)+'px '+nm(a.e)+' | '+nm(c.e));
    else if(ox>2&&gy>=0&&gy<9.5&&!(a.e.closest('.post,.pindex,.prose,p')&&c.e.closest('.post,.pindex,.prose,p')))out.push('gap '+gy.toFixed(1)+'px(v) '+nm(a.e)+' | '+nm(c.e))}
   return [...new Set(out)]});
  n++;if(r.length){bad++;console.log(`FAIL ${pg}@${w}: ${r.length} tap problems`);r.slice(0,process.env.ALL?99:6).forEach(x=>console.log('   '+x))}}
 await ctx.close()}
// blog index links just above the dock (the 'New customers!' case) at several phone heights
for(const [w,h] of [[360,640],[375,667],[390,844],[430,800],[430,932],[768,800]]){const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();await p.emulateMedia({reducedMotion:'reduce'});await p.goto(`${base}/blog.html`);await p.waitForTimeout(400);
 const g=await p.evaluate(()=>{const k=document.querySelector('.sticky.dock');if(!k||getComputedStyle(k).display==='none')return [];const kb=[...k.querySelectorAll('a')].map(a=>a.getBoundingClientRect());const top=Math.min(...kb.map(r=>r.top));return [...document.querySelectorAll('.pindex a,.post a')].map(a=>({t:a.textContent.trim().slice(0,20),r:a.getBoundingClientRect()})).filter(x=>x.r.height>0&&x.r.bottom<=top+0.5).map(x=>({t:x.t,gap:top-x.r.bottom})).filter(x=>x.gap<11.5)});
 n++;if(g.length){bad++;console.log(`FAIL blog@${w}x${h}: link(s) closer than 12px above the dock: `+JSON.stringify(g.slice(0,3)))}await ctx.close()}
await b.close();console.log(bad?`FAIL tap: ${bad}/${n} page-widths`:`PASS tap: ${n}/${n} page-widths`);process.exit(bad?1:0)})()
