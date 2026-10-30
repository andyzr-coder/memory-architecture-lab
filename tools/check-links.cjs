// Optional audit: a denied request is not evidence that a source does not exist.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const data = JSON.parse(fs.readFileSync(path.join(root,'dist/downloads/course-data.json'),'utf8'));
const sources = [...new Map(data.sources.map(s=>[s.url,s])).values()];
const queue = [...sources], results = [];
async function check(s) {
  try {
    let r = await fetch(s.url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(18000)});
    if (r.status===405 || r.status===501) {
      r = await fetch(s.url,{redirect:'follow',signal:AbortSignal.timeout(18000)});
      if (r.body) await r.body.cancel();
    }
    return {id:s.id,url:s.url,status:r.status,finalUrl:r.url};
  } catch (e) { return {id:s.id,url:s.url,status:'unavailable',reason:e.message}; }
}
async function worker(){while(queue.length){const s=queue.shift();results.push(await check(s));}}
Promise.all([worker(),worker(),worker()]).then(()=>{
  fs.mkdirSync(path.join(root,'output'),{recursive:true});
  fs.writeFileSync(path.join(root,'output/source-links.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({checked:results.length,statuses:results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{}),notFound:results.filter(r=>r.status===404||r.status===410),note:'403/429/timeouts are access limitations, not confirmed broken links.'},null,2));
});
