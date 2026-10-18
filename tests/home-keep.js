// Nothing from the old Home page may go missing: every text block, picture, link and video of the pre-upgrade page (tests/home-before.json) must still be on the page. node tests/home-keep.js
const fs=require('fs');const html=require('fs').readFileSync(__dirname+'/../index.html','utf8');const old=JSON.parse(fs.readFileSync(__dirname+'/home-before.json','utf8'));
const ent=s=>s.replace(/&#8217;|&rsquo;/g,'’').replace(/&#8216;/g,'‘').replace(/&#8220;/g,'“').replace(/&#8221;/g,'”').replace(/&middot;/g,'·').replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/&#8211;/g,'–').replace(/&#8212;/g,'—');
const main=html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'');const b=(main.match(/<main[\s\S]*?<\/main>/)||[main])[0];
const blob=ent(b.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ');const norm=s=>ent(s).replace(/\s+/g,' ').trim();
let bad=0,n=0;const ck=(k,v,c)=>{n++;if(!c){bad++;console.log('FAIL missing '+k+': '+v);}};
// checklist lines are written when CHECKLIST=path is set
const rows=[];
old.text.forEach(t=>{const c=blob.indexOf(norm(t))>-1;ck('text',t,c);rows.push(['text',t,c]);});
old.img.forEach(t=>{const c=b.indexOf('src="'+t+'"')>-1;ck('image',t,c);rows.push(['image',t,c]);});
old.link.forEach(t=>{const c=b.indexOf('href="'+t+'"')>-1;ck('link',t,c);rows.push(['link',t,c]);});
old.media.forEach(t=>{const c=b.indexOf(t)>-1;ck('video/media',t,c);rows.push(['media',t,c]);});
ck('H1 wording "Hey! I’m Magic Marta!" kept',"",/Hey! I’m Magic Marta!/.test(blob));
if(process.env.CHECKLIST)fs.writeFileSync(process.env.CHECKLIST,'# Home page content checklist (old page vs new page)\n\n| Kind | Old content | Still present |\n|---|---|---|\n'+rows.map(r=>'| '+r[0]+' | '+r[1].replace(/\|/g,'/').slice(0,140)+' | '+(r[2]?'yes':'NO')+' |').join('\n')+'\n');
console.log((bad?'FAIL':'PASS')+' home-keep: '+(n-bad)+'/'+n+' old items still on the page');process.exit(bad?1:0);
