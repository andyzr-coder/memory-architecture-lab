const assert=require('node:assert/strict');
const M=require('../dist/models.js');
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
close(M.charge().shared,.6);close(M.charge({bit:0}).shared,.5);
close(M.timing({mode:'hit'}).total,14);close(M.timing({mode:'closed'}).total,28);close(M.timing().total,42);
close(M.roofline().achievable,64);close(M.roofline().ridge,200);
close(M.capacity().weightsGB,35);close(M.capacity().kvGiB,10);
close(M.hbf().rawTB,.8388608);close(M.hbf().usefulTB,.2097152);assert.equal(M.hbf().required,1221);
close(M.hbf({concurrency:2000,usefulKiB:16}).usefulTB,1);
close(M.amdahl().totalSpeedup,1/.82);close(M.amdahl({share:100,speedup:10}).totalSpeedup,10);
close(M.bitProduct().product,117);close(M.bitProduct({signed:true}).product,21);close(M.bitProduct({x:3,w:9,signed:true}).product,-21);
for(let x=0;x<16;x++)for(let w=0;w<16;w++)for(const signed of [false,true]){const p=M.bitProduct({x,w,signed});close(p.product,p.xValue*p.wValue);}
assert.equal(M.cim().exact.length,4);assert.ok(M.cim({noise:0,bits:12}).nrmse<M.cim({noise:0,bits:2}).nrmse);
close(M.cim({inputs:[0,0,0,0],noise:0}).nrmse,0);
for(const input of [NaN,Infinity,-20,0,1e9]) for(const result of [M.hbf({latency:input}),M.capacity({batch:input}),M.roofline({bw:input})]) for(const value of Object.values(result))if(typeof value==='number')assert.ok(Number.isFinite(value));
console.log('PASS: charge sharing, row timings, roofline, GQA KV capacity, HBF concurrency, CIM quantization, Amdahl and input bounds.');
