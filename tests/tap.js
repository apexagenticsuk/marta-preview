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
   for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i],c=R[j];if(a.e.contains(c.e)||c.e.contains(a.e))continue;if(a.e.closest('.sticky')||c.e.closest('.sticky'))continue; /* the fixed dock slides over content as you scroll; its clearance is tested separately */
    const gx=Math.max(c.r.left-a.r.right,a.r.left-c.r.right),gy=Math.max(c.r.top-a.r.bottom,a.r.top-c.r.bottom);
    const ox=Math.min(a.r.right,c.r.right)-Math.max(a.r.left,c.r.left),oy=Math.min(a.r.bottom,c.r.bottom)-Math.max(a.r.top,c.r.top);
    // only compare things on the same row (vertical overlap) or same column (horizontal overlap)
    if(oy>2&&gx>=0&&gx<9.5)out.push('gap '+gx.toFixed(1)+'px '+nm(a.e)+' | '+nm(c.e));
    else if(ox>2&&gy>=0&&gy<9.5&&!(a.e.closest('.post,.pindex,.prose,p')&&c.e.closest('.post,.pindex,.prose,p')))out.push('gap '+gy.toFixed(1)+'px(v) '+nm(a.e)+' | '+nm(c.e))}
   return [...new Set(out)]});
  n++;if(r.length){bad++;console.log(`FAIL ${pg}@${w}: ${r.length} tap problems`);r.slice(0,process.env.ALL?99:6).forEach(x=>console.log('   '+x))}}
 await ctx.close()}
await b.close();console.log(bad?`FAIL tap: ${bad}/${n} page-widths`:`PASS tap: ${n}/${n} page-widths`);process.exit(bad?1:0)})()
