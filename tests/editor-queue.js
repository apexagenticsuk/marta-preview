// Editor fixes from Daniel's sweep (demo mode): first screen, Enquire button, page titles, new page at the end, preview warning.
const {chromium}=require(process.env.PW||'playwright');const base=(process.argv[2]||'http://localhost:8765').replace(/\/$/,'');let bad=0,n=0;
const ok=(m,c,x)=>{n++;if(!c){bad++;console.log('FAIL '+m+(x?' '+x:''))}else if(process.env.V)console.log('PASS '+m)};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1400,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(base+'/admin/');await p.waitForSelector('#demo');
const lg=await p.evaluate(()=>{const d=document.querySelector('#demo').getBoundingClientRect(),t=document.querySelector('#tok').getBoundingClientRect(),c=document.querySelector('#login .card').innerText;return {demoTop:d.top,tokTop:t.top,text:c,order:!!(document.querySelector('#demo').compareDocumentPosition(document.querySelector('#tok'))&4)}});
ok('sign-in: demo button comes before the key box',lg.order&&lg.demoTop<lg.tokTop,JSON.stringify([lg.demoTop,lg.tokTop]));
ok('sign-in: softer wording ("look around", nothing goes on the real website)',/look around/i.test(lg.text)&&/Nothing you do here goes on the real website/i.test(lg.text)&&!/dave/i.test(lg.text));
ok('sign-in: the key box is headed "Ready to change the real website?"',/Ready to change the real website\?/.test(lg.text));
await p.click('#demo');await p.waitForFunction(()=>window.DYE&&window.DYE.state().content&&document.querySelector('#frame').contentWindow.DYI,null,{timeout:20000});
const F=()=>p.frame({url:/edit=1/});await p.waitForTimeout(800);
// Enquire button edits directly
await F().evaluate(()=>scrollTo(0,0));
await F().locator('.hero [data-cms=actions] a[data-enq]').first().click();await p.waitForTimeout(400);
const pn=await p.evaluate(()=>{const pp=document.querySelector('#panel')||document.querySelector('.sidep')||document.body;return {words:!!document.querySelector('[data-words]'),title:(document.querySelector('#sharedm')||{}).hidden,txt:document.body.innerText.slice(0,0)}});
ok('Enquire button: click opens the button editor (words + link), not the Shared panel',pn.words&&(pn.title!==false),JSON.stringify(pn));
await p.fill('[data-words]','Ask about a party');
await p.evaluate(()=>{document.querySelector('[data-kind="web"],[data-v="web"]').click()});
await p.fill('[data-web]','https://example.com/party');await p.click('[data-save]');await p.waitForTimeout(900);
const st=await p.evaluate(()=>JSON.parse(JSON.stringify(DYE.state().content.cta)));
ok('Enquire button: words and link saved in content (cta)',st.enquireLabel==='Ask about a party'&&st.enquireHref==='https://example.com/party',JSON.stringify(st));
const bt=await F().evaluate(()=>[...document.querySelectorAll('[data-cms=actions] a[data-enq]')].map(a=>a.textContent.trim()+'|'+a.getAttribute('href')));
ok('Enquire button: the page shows the new words and link everywhere (header, hero)',bt.length>=2&&bt.every(x=>/example\.com\/party/.test(x))&&bt.some(x=>/^Ask about a party/.test(x)),JSON.stringify(bt));
ok('Enquire button: ...as one undoable step',await p.evaluate(()=>!document.querySelector('#undo').disabled));
await p.evaluate(()=>{const e=document.querySelector('#undo');e.click()});await p.waitForTimeout(900);
ok('Enquire button: Undo puts the original words back',await F().evaluate(()=>[...document.querySelectorAll('[data-cms=actions] a[data-enq]')].every(a=>/contact\.html#enquire/.test(a.getAttribute('href')))));
// Call button: explains instead of garbling
await F().locator('.hero [data-cms=actions] a.btn.rose').first().click();await p.waitForTimeout(300);
ok('Call button: shows its own note, not Shared content',await p.evaluate(()=>/rings your phone number/.test(document.body.innerText))&&await p.evaluate(()=>(!document.querySelector('#sharedm')||document.querySelector('#sharedm').hidden)));
await p.evaluate(()=>DYE.closePanel());
// Pages list
await p.click('#pagesb');await p.waitForSelector('#pagesm:not([hidden])');
const rows=await p.evaluate(()=>[...document.querySelectorAll('#plist .prow')].map(r=>({v:r.querySelector('[data-f=label]').value,small:r.querySelector('small').textContent})));
ok('Pages list: shows the names Home and What’s Up?',rows.some(r=>r.v==='Home')&&rows.some(r=>/What.s Up\?/.test(r.v)),JSON.stringify(rows.map(r=>r.v)));
ok('Pages list: no file names (.html) shown',rows.every(r=>!/\.html|index|blog/i.test(r.small)),JSON.stringify(rows.map(r=>r.small)));
// New page goes to the end of the menu
await p.evaluate(()=>document.querySelector('#pagesm').hidden=true);
await p.evaluate(()=>document.querySelector('#newpb').click());await p.waitForSelector('#newpm:not([hidden])');
await p.fill('#np-title','Party packages');await p.click('#np-go');await p.waitForTimeout(1200);
const nav=await p.evaluate(()=>DYE.state().content.nav.map(x=>x.key));
ok('New page: added at the END of the menu, after Contact',nav[nav.length-1]==='party-packages'&&nav.indexOf('contact')===nav.length-2,JSON.stringify(nav));
// Preview warns first
let pops=0;ctx.on('page',()=>pops++);
await p.click('#preview');await p.waitForTimeout(500);
ok('Preview: a warning appears and nothing opens yet',await p.isVisible('#dlg')&&/new browser tab/i.test(await p.innerText('#dlg'))&&pops===0);
await p.click('#dlg-cancel');await p.waitForTimeout(500);ok('Preview: Not now opens nothing',pops===0&&!(await p.isVisible('#dlg')));
await p.click('#preview');await p.waitForSelector('#dlg:not([hidden])');await p.click('#dlg-ok');await p.waitForTimeout(1500);ok('Preview: Open preview opens the tab',pops===1);
ok('no script errors in the editor',!errs.length,errs.join('|').slice(0,200));
await b.close();console.log(bad?`FAIL editor-queue: ${bad}/${n}`:`PASS editor-queue: ${n}/${n} checks`);process.exit(bad?1:0)})()
