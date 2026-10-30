(function(root){
  'use strict';
  const finite=(v,min,max)=>Math.min(max,Math.max(min,Number.isFinite(Number(v))?Number(v):min));
  const models={
    charge({vdd=1.1,cell=20,bitline=200,bit=1}={}){
      vdd=finite(vdd,.1,5);cell=finite(cell,1,1000);bitline=finite(bitline,1,10000);
      const pre=vdd/2,stored=bit?vdd:0,shared=(cell*stored+bitline*pre)/(cell+bitline);
      return {pre,stored,shared,delta:shared-pre};
    },
    timing({cl=14,rcd=14,rp=14,mode='conflict'}={}){
      cl=finite(cl,0,1000);rcd=finite(rcd,0,1000);rp=finite(rp,0,1000);
      const segments=mode==='hit'?[['READ → 首数据',cl]]:mode==='closed'?[['ACT → READ',rcd],['READ → 首数据',cl]]:[['PRE → ACT',rp],['ACT → READ',rcd],['READ → 首数据',cl]];
      return {segments,total:segments.reduce((s,x)=>s+x[1],0)};
    },
    roofline({peak=400,bw=2,ai=32}={}){
      peak=finite(peak,1,100000);bw=finite(bw,.01,100);ai=finite(ai,.01,100000);
      return {compute:peak,memory:bw*ai,achievable:Math.min(peak,bw*ai),ridge:peak/bw,bound:bw*ai<peak?'带宽':'计算'};
    },
    capacity({params=70,bits=4,layers=80,kvHeads=8,headDim=128,seq=32768,batch=1,kvBytes=2}={}){
      params=finite(params,.1,10000);bits=finite(bits,1,64);layers=finite(layers,1,1000);kvHeads=finite(kvHeads,1,1000);headDim=finite(headDim,1,4096);seq=finite(seq,1,10000000);batch=finite(batch,1,10000);kvBytes=finite(kvBytes,.125,8);
      const weights=params*1e9*bits/8,kv=2*layers*kvHeads*headDim*seq*batch*kvBytes;
      return {weightsGB:weights/1e9,weightsGiB:weights/2**30,kvGB:kv/1e9,kvGiB:kv/2**30,totalGB:(weights+kv)/1e9};
    },
    hbf({peak=1,latency=20,pageKiB=16,concurrency=1024,usefulKiB=4}={}){
      peak=finite(peak,.01,100);latency=finite(latency,.1,10000);pageKiB=finite(pageKiB,.125,1024);concurrency=finite(concurrency,1,1e7);usefulKiB=finite(usefulKiB,.001,pageKiB);
      const bytes=pageKiB*1024,latencyS=latency*1e-6,raw=Math.min(peak*1e12,concurrency*bytes/latencyS),eff=usefulKiB/pageKiB;
      return {rawTB:raw/1e12,usefulTB:raw*eff/1e12,required:Math.ceil(peak*1e12*latencyS/bytes),bufferMB:peak*1e12*latencyS/1e6,readAmplification:1/eff,utilization:raw/(peak*1e12)};
    },
    cim({inputs=[8,4,12,2],bits=6,noise=2}={}){
      const weights=[[2,-3,1,2],[-1,2,3,-2],[3,1,-2,1],[1,-2,2,3]],x=inputs.map(v=>finite(v,0,15)),q=2**(Math.round(finite(bits,2,12))-1)-1;
      const exact=weights.map(row=>row.reduce((s,w,i)=>s+w*x[i],0));
      const full=weights.map(row=>row.reduce((s,w)=>s+Math.abs(w)*15,0));
      const perturbed=exact.map((y,i)=>y+full[i]*finite(noise,0,25)/100*[-.83,.37,-.24,.71][i]);
      const approx=perturbed.map((y,i)=>Math.round(Math.min(1,Math.max(-1,y/full[i]))*q)/q*full[i]);
      const nrmse=Math.sqrt(approx.reduce((s,y,i)=>s+((y-exact[i])/full[i])**2,0)/4)*100;
      return {weights,exact,approx,full,nrmse};
    },
    bitProduct({x=13,w=9,signed=false}={}){
      x=Math.round(finite(x,0,15));w=Math.round(finite(w,0,15));signed=Boolean(signed);
      const xb=Array.from({length:4},(_,i)=>(x>>i)&1),wb=Array.from({length:4},(_,i)=>(w>>i)&1),weights=[1,2,4,signed?-8:8];
      const partial=xb.map((a,i)=>wb.map((b,j)=>a*b*weights[i]*weights[j]));
      return {xb,wb,weights,partial,xValue:signed&&x>=8?x-16:x,wValue:signed&&w>=8?w-16:w,product:partial.flat().reduce((a,b)=>a+b,0)};
    },
    amdahl({share=20,speedup=10}={}){
      share=finite(share,0,100);speedup=finite(speedup,1,10000);const fraction=share/100;
      return {totalSpeedup:1/(1-fraction+fraction/speedup),remaining:1-fraction+fraction/speedup,saved:fraction*(1-1/speedup)*100};
    }
  };
  root.MemoryModels=models;
  if(typeof module!=='undefined')module.exports=models;
})(typeof globalThis!=='undefined'?globalThis:window);
