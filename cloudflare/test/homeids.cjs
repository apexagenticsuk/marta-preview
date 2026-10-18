// New Home ids (hero headline, both buttons, trust strip, quote, form heading, kept chips and reviews): saved text and links reach the HTML a no-JS visitor gets.
// Usage: node cloudflare/test/homeids.cjs [base]   (local passcode by default; PASS env for another)
const BASE=process.argv[2]||'http://localhost:8792';const PASS=process.env.PASS||'local-test-passcode-0001';
const res=[];const ok=(n,c,x)=>{res.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(x&&!c?' '+x:''));};
const H={'X-DY-Editor':'1','Content-Type':'application/json',Origin:BASE};
(async()=>{const lr=await fetch(BASE+'/api/login',{method:'POST',headers:H,body:JSON.stringify({passcode:PASS})});const ck=(lr.headers.get('set-cookie')||'').split(';')[0];const A=Object.assign({},H,{Cookie:ck});
const orig=(await (await fetch(BASE+'/api/export',{headers:A})).json()).content;const c=JSON.parse(JSON.stringify(orig));
const h0=await (await fetch(BASE+'/')).text();const main=h0.slice(h0.indexOf('<main'),h0.indexOf('<footer'));
const ids=s=>(/data-dy="([^"]*)"/.exec(s||'')||[])[1].split(' ');
const get=(k,re)=>{const m=re.exec(main);return m?ids(m[0]):null;};
const pickT=ids=>ids.find(x=>/^t\d+$/.test(x)),pickA=ids=>ids.find(x=>/^a\d+$/.test(x)),pickI=ids=>ids.find(x=>/^i\d+$/.test(x));
const sets={h1:get('h1',/<h1[^>]*data-dy="[^"]*"/),chk:get('chk',/<a[^>]*data-dy="[^"]*"[^>]*>Check availability/),call:get('call',/<a[^>]*data-dy="[^"]*"[^>]*>Call Marta/),lead:get('lead',/<p[^>]*data-dy="[^"]*"[^>]*class="lead"/),trust:get('trust',/<span[^>]*data-dy="[^"]*"[^>]*class="tt"/),funs:get('funs',/<li[^>]*data-dy="[^"]*"[^>]*>Magic<\/li>/),band:get('band',/<h2[^>]*data-dy="[^"]*"[^>]*>Let/),enq:get('enq',/<h2[^>]*data-dy="[^"]*"[^>]*>Contact me/),rvh:get('rvh',/<h2[^>]*data-dy="[^"]*"[^>]*>What they/),hero:get('hero',/<img[^>]*data-dy="[^"]*"[^>]*hero_marta/)};
for(const k of Object.keys(sets))ok('found editable ids for '+k,!!sets[k]&&(k==='hero'?!!pickI(sets[k]):!!pickT(sets[k])),JSON.stringify(sets[k]));
const st='HID'+Date.now().toString(36);const P=c.pages=c.pages||{};P.index=P.index||{};const T=P.index.text=P.index.text||{};P.index.link=P.index.link||{};P.index.img=P.index.img||{};
const marks={};for(const k of Object.keys(sets)){if(!sets[k]||k==='hero')continue;const t=pickT(sets[k]);if(t){marks[k]=st+k;T[t]=st+k;}}
P.index.link[pickA(sets.chk)]='https://example.com/'+st+'chk';P.index.link[pickA(sets.call)]='tel:+353000'+'111222';P.index.img[pickI(sets.hero)]={src:'assets/hero_marta.webp',alt:'alt '+st};
c.version=new Date().toISOString().replace(/\.\d+Z$/,'Z');
const pr=await fetch(BASE+'/api/publish',{method:'POST',headers:A,body:JSON.stringify(c)});ok('publish of the new Home ids accepted',pr.status===200,pr.status);
const h=await (await fetch(BASE+'/')).text();const body=h.slice(h.indexOf('<main'),h.indexOf('<footer'));
for(const k of Object.keys(marks))ok('no-JS HTML carries the saved text for '+k,body.indexOf(marks[k])>-1);
ok('Check availability link saved in the HTML',body.indexOf('href="https://example.com/'+st+'chk"')>-1);
ok('Call Marta link saved in the HTML',body.indexOf('href="tel:+353000111222"')>-1);
ok('hero picture alt saved in the HTML',body.indexOf('alt="alt '+st+'"')>-1);
ok('noindex kept',/name="robots" content="noindex/.test(h));
// restore (twice, so the saved version moves on)
for(let i=0;i<2;i++){const o=Object.assign({},orig,{version:new Date(Date.now()+1000*(i+1)).toISOString().replace(/\.\d+Z$/,'Z')});await fetch(BASE+'/api/publish',{method:'POST',headers:A,body:JSON.stringify(o)});}
const back=await (await fetch(BASE+'/')).text();ok('original restored: markers gone from the HTML',back.indexOf(st)<0);
const k=res.filter(Boolean).length;console.log('SUMMARY '+k+'/'+res.length);process.exit(k===res.length?0:1);})().catch(e=>{console.error(e.message);process.exit(1);});
