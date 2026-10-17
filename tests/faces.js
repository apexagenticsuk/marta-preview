// Face-safe images: at 375, 768 and 1280, every detected face (tests/faces.json) in every image on every page must sit fully inside the part of the picture that is actually visible
// (object-fit/object-position crops, round or blob border-radius corners). Natural-aspect images pass by construction; any cropped one is checked here.
const {chromium}=require(process.env.PW||'playwright');const fs=require('fs');
const base=process.argv[2]||'http://localhost:8765';const F=JSON.parse(fs.readFileSync(__dirname+'/faces.json','utf8'));
const PAGES=['index','about','gallery','testimonials','blog','contact'];let bad=0,n=0,imgs=0;
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const w of [375,768,1280]){const ctx=await b.newContext({viewport:{width:w,height:900}});const p=await ctx.newPage();await p.emulateMedia({reducedMotion:'reduce'});
 for(const pg of PAGES){await p.goto(`${base}/${pg}.html`,{waitUntil:'load'});if(process.env.FACES_CSS)await p.addStyleTag({content:process.env.FACES_CSS});
  await p.evaluate(async()=>{document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const r=await p.evaluate((F)=>{const out=[];document.querySelectorAll('img').forEach(im=>{const key=(im.getAttribute('src')||'').replace(/\?.*/,'').replace(/_(480|420)\.webp$/,'.webp');const f=F[key];if(!f||!f.main||!f.main.length)return;
   const R=im.getBoundingClientRect();if(!R.width||!R.height)return;const cs=getComputedStyle(im);const nw=im.naturalWidth,nh=im.naturalHeight;
   const bw=parseFloat(cs.borderLeftWidth)||0,bt=parseFloat(cs.borderTopWidth)||0;const cw=R.width-2*bw,ch=R.height-2*bt;
   let sx=1,sy=1,ox=0,oy=0,vis=[0,0,1,1];
   const fit=cs.objectFit,pos=cs.objectPosition.split(' ').map(v=>parseFloat(v)/100);
   if(fit==='cover'){const s=Math.max(cw/nw,ch/nh);const dw=nw*s,dh=nh*s;const px=(dw-cw)*pos[0],py=(dh-ch)*pos[1];vis=[px/dw,py/dh,(px+cw)/dw,(py+ch)/dh];}
   else if(fit==='contain'||fit==='scale-down'||fit==='none'){vis=[0,0,1,1];}
   else{ /* fill: whole image shown; check aspect distortion */ const d=Math.abs((cw/ch)/(nw/nh)-1);if(d>0.03)out.push({k:key,sq:d});}
   const br=parseFloat(cs.borderTopLeftRadius)||0;const round=br>=Math.min(cw,ch)*0.4;
   const ents=[];for(const [x,y,fw,fh] of f.main){const ins=x>=vis[0]-.005&&y>=vis[1]-.005&&x+fw<=vis[2]+.005&&y+fh<=vis[3]+.005;
     let corner=true;if(round){const vw=vis[2]-vis[0],vh=vis[3]-vis[1];const cx=((x+fw/2)-vis[0])/vw-.5,cy=((y+fh/2)-vis[1])/vh-.5;corner=(cx*cx+cy*cy)<=0.25*0.97;}
     ents.push({ins,corner});}
   out.push({k:key,faces:ents,vis,mode:fit});});return out;},F);
  for(const e of r){if(e.sq){bad++;console.log('FAIL squashed image',w,pg,e.k,e.sq.toFixed(2));continue;}imgs++;for(const f of e.faces){n++;if(!f.ins||!f.corner){bad++;console.log('FAIL face cut',w,pg,e.k,e.mode,JSON.stringify(e.vis.map(v=>+v.toFixed(2))),f.ins?'(rounded corner)':'');}}}}
 await ctx.close();}
await b.close();console.log((bad?'FAIL ':'PASS ')+'faces: '+n+' faces in '+imgs+' image instances across 3 widths, '+bad+' problems');process.exit(bad?1:0);})();
