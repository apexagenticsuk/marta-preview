// Editor end to end in demo mode (no key, no network writes): load, edit text, picture, review, gallery photo and video, undo, preview, publish.
const {chromium}=require(process.env.PW||'playwright');const base=process.argv[2]||'http://localhost:8765';const res=[];
const ok=(n,c,x)=>{res.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(x?' '+x:''));};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1400,height:900}});const gh=[];ctx.on('request',r=>{if(/api\.github\.com/.test(r.url())&&r.method()!=='GET')gh.push(r.method()+' '+r.url());});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/compute-pressure/.test(m.text()))errs.push(m.text())});
await p.goto(base+'/admin/');await p.waitForSelector('#demo');ok('editor sign-in page offers demo mode without a key',true);
await p.click('#demo');await p.waitForFunction(()=>window.DYE&&window.DYE.state().content&&document.querySelector('#frame').contentWindow.DYI,null,{timeout:20000});ok('editor loads the home page in demo mode',await p.isVisible('#demobadge'));
const F=()=>p.frame({url:/edit=1/});const ready=async()=>{await p.waitForFunction(()=>{try{return !!document.querySelector('#frame').contentWindow.DYI&&document.querySelector('#frame').contentDocument.readyState==='complete';}catch(e){return false}});await p.waitForTimeout(700);};
const state=()=>p.evaluate(()=>JSON.parse(JSON.stringify(DYE.state().content)));
// 1 text: edit the hero heading inline
const h1=F().locator('.hero h1').first();await h1.click();await p.keyboard.press('End');await p.keyboard.type(' Hello!');await F().locator('.occ h2').first().click();await p.waitForTimeout(600);
const t1=await p.evaluate(()=>JSON.stringify(DYE.state().content.pages.index||{}));ok('editing text inline is recorded',/Hello!/.test(t1));
ok('...and Undo is available',await p.evaluate(()=>!document.querySelector('#undo').disabled));
// 2 picture: replace the hero picture through the editor API (same call the picture panel makes)
await p.evaluate(()=>{const R=document.querySelector('#frame').contentWindow.DY.R;const el=document.querySelector('#frame').contentDocument.querySelector('.heropic img');const id=[...R.ids.get(el)?Object.values(R.ids.get(el)):[]].find(v=>/^i\d+/.test(v));window.DYE.change(c=>{const P=c.pages.index=c.pages.index||{};P.img=P.img||{};P.img[id]={src:'assets/g_frog_hat.webp',alt:'Test picture'};},{reload:true});});await ready();
ok('replacing a picture shows the new picture',await F().evaluate(()=>/g_frog_hat/.test(document.querySelector('.heropic img').getAttribute('src'))&&document.querySelector('.heropic img').alt==='Test picture'));
// 3 review, 4 gallery photo, 5 video: shared editors
await p.evaluate(()=>DYE.openShared('testimonials'));await p.waitForSelector('#sharedm:not([hidden])');
const row=p.locator('#sharedm details.shrow').first();await row.evaluate(d=>d.open=true);const ta=row.locator('textarea').first();await ta.fill('E2E review text');await ta.dispatchEvent('change');await p.waitForTimeout(500);
ok('editing a review updates the page',(await state()).testimonials[0].text==='E2E review text'&&/E2E review text/.test(await F().evaluate(()=>document.body.innerText)));
await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);
await p.evaluate(()=>DYE.openShared('gallery'));await p.waitForSelector('#sharedm:not([hidden])');const n0=(await state()).gallery.length;
await p.evaluate(()=>DYE.change(c=>{c.gallery.push({img:'assets/g_blue_face.webp',alt:'E2E photo',cap:''});}));await p.waitForTimeout(400);
ok('adding a gallery photo is saved',(await state()).gallery.length===n0+1);await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);
await p.evaluate(()=>DYE.openShared('clips'));await p.waitForSelector('#sharedm:not([hidden])');
const vr=p.locator('#sharedm details.shrow').first();await vr.evaluate(d=>d.open=true);const vi=vr.locator('label.shf:has(span:text-is("Video ID (the code in the link)")) input').first();await vi.fill('AAAAAAAAAAA');await vi.dispatchEvent('change');await p.waitForTimeout(700);
ok('changing a video is saved and shown',(await state()).clips[0].vid==='AAAAAAAAAAA'&&await F().evaluate(()=>!!document.querySelector('.lite[data-yt="AAAAAAAAAAA"]')));await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);
// 6 preview
const [pv]=await Promise.all([ctx.waitForEvent('page',{timeout:8000}).catch(()=>null),p.click('#preview')]);
if(pv){await pv.waitForLoadState('load');await pv.waitForTimeout(800);ok('Preview shows the unpublished changes with a banner',await pv.evaluate(()=>/PREVIEW of unpublished/i.test(document.body.innerText)&&/E2E review text|Hello!/.test(document.body.innerText)));await pv.close();}else ok('Preview opens',false);
// 7 publish in demo mode: explains, writes nothing
await p.click('#publish');await p.waitForTimeout(600);const dlg=await p.evaluate(()=>{const d=document.querySelector('#dlg');return !d.hidden&&/demo/i.test(d.innerText);});ok('Publish in demo mode explains it is a practice copy',dlg);
await p.keyboard.press('Escape');await p.waitForTimeout(300);ok('Publish in demo mode made no write to GitHub',!gh.length,gh.join());
// 8 undo walks everything back
for(let i=0;i<40&&await p.evaluate(()=>!document.querySelector('#undo').disabled);i++){await p.click('#undo');await p.waitForTimeout(200);}
const c=await state();ok('Undo restores the original content',c.testimonials[0].who==='Claire'&&!/E2E/.test(JSON.stringify(c))&&c.clips[0].vid==='mTJYoEMKo8o');
ok('no console errors in the editor',!errs.length,errs.join('|').slice(0,200));
await b.close();const bad=res.filter(x=>!x).length;console.log((bad?'FAIL ':'PASS ')+`editor-e2e: ${res.length-bad}/${res.length}`);process.exit(bad?1:0);})().catch(e=>{console.error('CRASH',e.message);process.exit(1);});
