"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const S26 = "12ifCX85urqUxt67Ad5xr26ffzGxvGNz5FFZT38oKZM8";
const S25 = "1hf-QOppWoC4oxzVIfluS82y8ZIRLv5AMP7ghpLRHeeE";
const S24 = "1X8sU5TbwIFrfva-Hv3lJwKmNWBAXlF4wKWLq4TUkXkY";
const FSID = "1f0xEiBz5Mzu79zxks1Ew0lfAdwQu-7VKvKxaUcz3VzU";
const LSID = "1Pl9uQvDSq4qWVT6MzqWCiZoI4Oga0wMhVu7wFwMoW4I";
const LG = [0,76269533,1004144241,1047687838,1049487848,1269180586,1269826655,1375079069,1508503184,1668129507,1704465439,2057032683,2092131821,2106161542,2142536146,226069595,233866909,246287253,256317823,338679084,443409010,456439832,456923066,527597092,543521900,556096497,742200864,762801297,867905108,936206001,993453517];
const LU = ["TARGET SHIFT","OMZET","% PENCAPAIN","GAP VS TARGET","CASH","DEBIT MANDIRI","DEBIT QRIS","NOTA","FAKTUR","SETORAN"];

const M2024 = {0:"Jan",1462383099:"Feb",907772167:"Mar",232891112:"Apr",282938849:"Mei",731458776:"Jun",1406355561:"Jul",1803306864:"Agu",1496176196:"Sep",1600880255:"Okt",139141189:"Nov",1094972947:"Des"};
const M2025 = {0:"Jan",200361189:"Feb",948223844:"Mar",1168220512:"Apr",1057815698:"Mei",278075545:"Jun",10910240:"Jul",126222887:"Agu"};

const P26 = [{g:"0",l:"Jan"},{g:"1981407338",l:"Feb"},{g:"1445967367",l:"Mar"},{g:"1565950911",l:"Apr"},{g:"2013738206",l:"Mei"},{g:"163552086",l:"Jun"},{g:"1190948522",l:"Jul"}];
const FM = [{g:"0",l:"Jan"},{g:"914339812",l:"Feb"},{g:"1942627049",l:"Mar"},{g:"85697732",l:"Apr"},{g:"452486501",l:"Mei"}];

const NL = String.fromCharCode(92,110);
const WT = {2024:"#10b981",2025:"#3b82f6",2026:"#f59e0b"};
const BS = {JAN:"Jan",FEB:"Feb",MAR:"Mar",APR:"Apr",MEI:"Mei",JUN:"Jun",JUL:"Jul",AUG:"Agu",SEP:"Sep",OKT:"Okt",NOV:"Nov",DES:"Des"};

function p(v) { return parseInt((v||"0").replace(/[Rp\\s,."]/g,""),10)||0; }
function fr(n) { return typeof n==="number"?("Rp "+n.toLocaleString("id-ID")):"-"; }

export default function Home() {
  const [L,setL]=useState(true);
  const [P,setP]=useState({});
  const [P24,setP24]=useState({});
  const [P25,setP25]=useState({});
  const [F,setF]=useState({});
  const [LP,setLP]=useState({});
  const [DG,setDG]=useState({2024:[],2025:[],2026:[]});
  const [E,setE]=useState("");
  const [T,setT]=useState("p");
  const [BA,setBA]=useState("");
  const [B24,setB24]=useState("");
  const [B25,setB25]=useState("");
  const [FB,setFB]=useState("Jan");
  const [LD,setLD]=useState("");
  
  useEffect(()=>{ (async()=>{
    try{
      const semua={};
      for(const m of P26){ try{
        const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+S26+"/export?format=csv&gid="+m.g));
        const t=await r.text();
        const ll=t.split(NL).filter(l=>l.trim());
        const ps=ll.slice(4).filter(r=>{const c=r.split(",");return c[0]&&/^\\d{2}\\\\/\\d{2}\\\\/\\d{4}$/.test(c[0].replace(/"/g,""));}).map(r=>{
          const c=r.split(",");return{tgl:c[0].replace(/"/g,""),pc:p(c[1]),pm:p(c[2]),pq:p(c[3]),pj:p(c[4]),sc:p(c[5]),sm:p(c[6]),sq:p(c[7]),sj:p(c[8]),tt:p(c[9]),kj:p(c[10])};});
        if(ps.length>0) semua[m.l]=ps;
      }catch(e){}}
      setP(semua);

      const a24={};
      for(const [gid,bln] of Object.entries(M2024)){ try{
        const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+S24+"/export?format=csv&gid="+gid));
        const t=await r.text();const ll=t.split(NL).filter(l=>l.trim());
        const ps=ll.slice(4).filter(r=>{const c=r.split(",");return c[0]&&/^\\d{2}\\\\/\\d{2}\\\\/\\d{4}$/.test(c[0].replace(/"/g,""));}).map(r=>{
          const c=r.split(",");return{tgl:c[0].replace(/"/g,""),pg:p(c[1]),sg:p(c[2]),tt:p(c[3]),kj:p(c[4])};});
        if(ps.length>0) a24[bln]=ps;
      }catch(e){}}
      setP24(a24);

      const a25={};
      for(const [gid,bln] of Object.entries(M2025)){ try{
        const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+S25+"/export?format=csv&gid="+gid));
        const t=await r.text();const ll=t.split(NL).filter(l=>l.trim());
        const ps=ll.slice(4).filter(r=>{const c=r.split(",");return c[0]&&/^\\d{2}\\\\/\\d{2}\\\\/\\d{4}$/.test(c[0].replace(/"/g,""));}).map(r=>{
          const c=r.split(",");return{tgl:c[0].replace(/"/g,""),pc:p(c[1]),pm:p(c[2]),pq:p(c[3]),pj:p(c[4]),sc:p(c[5]),sm:p(c[6]),sq:p(c[7]),sj:p(c[8]),tt:p(c[9]),kj:p(c[10])};});
        if(ps.length>0) a25[bln]=ps;
      }catch(e){}}
      setP25(a25);

      const sf={};
      for(const m of FM){ try{
        const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+FSID+"/export?format=csv&gid="+m.g));
        const t=await r.text();const ll=t.split(NL).filter(l=>l.trim());
        const ps=ll.slice(4).filter(r=>{const c=r.split(",");return c[0]&&/^\\d+$/.test(c[0].replace(/"/g,""));}).map(r=>{
          const c=r.split(",");return {no:c[0].replace(/"/g,""),pbf:(c[1]||"").replace(/"/g,""),jml:p(c[2]),sb:(c[5]||"").replace(/"/g,"").trim().toUpperCase()==="TRUE"};});
        if(ps.length>0) sf[m.l]=ps;
      }catch(e){}}
      setF(sf);

      const lm={};
      for(const gid of LG){ try{
        const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+LSID+"/export?format=csv&gid="+gid));
        const t=await r.text();const ll=t.split(NL).filter(l=>l.trim());
        const tg=ll[2]?.split(",")[3]?.replace(/"/g,"")?.trim()||""; if(!tg) continue;
        const rr=[];
        for(const l of ll){ const c=l.split(",").map(x=>x.replace(/"/g,"").trim()); const u=c[0].toUpperCase().trim();
          if(LU.some(v=>u===v||u.startsWith(v))) rr.push({u:c[0],p:c[1]||"-",s:c[2]||"-",t:c[3]||"-"}); }
        if(rr.length>0) lm[tg]={tg,rr};
      }catch(e){}}
      setLP(lm);

      async function loadDiagram(sid, startRow){
        const dr=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+sid+"/export?format=csv&gid=889768507"));
        const dt=await dr.text(); const dl=dt.split(NL).filter(l=>l.trim());
        const r=[]; for(let i=startRow;i<startRow+12&&i<dl.length;i++){ const c=dl[i].split(","); const b=c[0]?.replace(/"/g,"")?.trim()||""; const tl=p(c[1]); const kj=p(c[4]); if(b) r.push({b:BS[b]||b,t:tl,k:kj}); }
        return r;
      }
      
      const d26raw=await loadDiagram(S26,2);
      const d25raw=[]; let d24raw=[];
      try{ const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+S25+"/export?format=csv&gid=889768507"));
        const t=await r.text(); const dl=t.split(NL).filter(l=>l.trim());
        for(let i=2;i<14&&i<dl.length;i++){ const c=dl[i].split(","); const b=c[0]?.replace(/"/g,"")?.trim()||""; const tl=p(c[1]); const kj=p(c[4]); if(b) d25raw.push({b:BS[b]||b,t:tl,k:kj}); }
      }catch(e){}
      setDG({2024:d24raw,2025:d25raw,2026:d26raw});

      const kl=Object.keys(semua);
      if(kl.length>0) setBA(kl[kl.length-1]);
      const k24=Object.keys(a24);
      if(k24.length>0) setB24(k24[0]);
      const k25=Object.keys(a25);
      if(k25.length>0) setB25(k25[0]);
      const ds=Object.keys(lm).sort((a,b)=>{const[d1,m1,y1]=a.split(".");const[d2,m2,y2]=b.split(".");return new Date(y1,m1-1,d1)-new Date(y2,m2-1,d2);});
      if(ds.length>0) setLD(ds[ds.length-1]);
    } catch(e){ setE("Err: "+e.message); }
    setL(false);
  })();},[]);

  const kl=Object.keys(P); const pj=BA?(P[BA]||[]):[]; const ttP=pj.reduce((s,d)=>s+d.tt,0); const tk=pj.reduce((s,d)=>s+d.kj,0);
  const smt=Object.values(P).flat().reduce((s,d)=>s+d.tt,0);
  const k24=Object.keys(P24); const p24=B24?(P24[B24]||[]):[]; const tt24=p24.reduce((s,d)=>s+d.tt,0); const tk24=p24.reduce((s,d)=>s+d.kj,0);
  const k25=Object.keys(P25); const p25=B25?(P25[B25]||[]):[]; const tt25=p25.reduce((s,d)=>s+d.tt,0); const tk25=p25.reduce((s,d)=>s+d.kj,0);
  const fkl=Object.keys(F); const fk=FB?(F[FB]||[]):[];
  const lds=Object.keys(LP).sort((a,b)=>{const[d1,m1,y1]=a.split(".");const[d2,m2,y2]=b.split(".");return new Date(y1,m1-1,d1)-new Date(y2,m2-1,d2);});
  const lp=LD?LP[LD]:null;
  const dr=DG&&DG[2026]&&DG[2026].length>0;

  if(L) return [...];
  if(E) return <div style={{padding:32,color:"#dc2626"}}>{E}</div>;
  const bs=(a,k)=>({padding:"6px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:13,background:a===k?"#3b82f6":"white",color:a===k?"white":"#374151",borderColor:a===k?"#3b82f6":"#d1d5db",outline:"none",fontWeight:a===k?600:400});

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#1e40af 60%,#2563eb 100%)"}}>
    <style>{"@media print{body *{visibility:hidden!important}#lp,#lp *{visibility:visible!important}#lp{position:absolute;left:0;top:0;width:100%;padding:8px 12px;font-size:7px;max-width:210mm;box-sizing:border-box}@page{margin:6mm 8mm;size:A4 landscape}}"}</style>
    <div style={{background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",color:"white",padding:"20px 24px"}}>
      <h1 style={{fontSize:22,fontWeight:"bold",margin:0}}>Apotek Bali Bagas Medika</h1>
      <p style={{fontSize:13,opacity:.7,margin:"4px 0 0"}}>Dashboard Monitoring</p></div>
    <div style={{display:"flex",background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid #e5e7eb",paddingLeft:16}}>
      {[{k:"p",l:"Penjualan"},{k:"l",l:"LPH"},{k:"d",l:"Diagram"},{k:"f",l:"Faktur"}].map(t=>(
        <button key={t.k} onClick={()=>setT(t.k)} style={{padding:"12px 20px",border:"none",background:"transparent",cursor:"pointer",borderBottom:T===t.k?"2px solid #2563eb":"2px solid transparent",color:T===t.k?"#2563eb":"#6b7280",fontWeight:T===t.k?600:400,fontSize:14,outline:"none"}}>{t.l}</button>))}
    </div>

    {/* PENJUALAN */}
    {T==="p"&&<div style={{padding:16,maxWidth:1200,margin:"0 auto"}}>
      <div style={{marginBottom:16}}>
        <select value={BA} onChange={e=>setBA(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,background:"white",marginRight:8}}>
          {kl.map(b=><option key={b} value={b}>{b+" 2026"}</option>)}
        </select>
        <select value={B24} onChange={e=>setB24(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,background:"white",marginRight:8}}>
          {k24.map(b=><option key={b} value={b}>{b+" 2024"}</option>)}
        </select>
        <select value={B25} onChange={e=>setB25(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,background:"white"}}>
          {k25.map(b=><option key={b} value={b}>{b+" 2025"}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:20}}>
        <K label={"2026 "+BA} v={fr(ttP)} c="#f59e0b"/><K label={"2025 "+B25} v={fr(tt25)} c="#3b82f6"/><K label={"2024 "+B24} v={fr(tt24)} c="#10b981"/>
      </div>
      {pj.length>0&&<DS data={pj} tahun="2026" bl={BA}/>}
      {B24&&p24.length>0&&<DS24 data={p24} tahun="2024" bl={B24}/>}
      {B25&&p25.length>0&&<DS data={p25} tahun="2025" bl={B25}/>}
    </div>}

    {/* LPH */}
    {T==="l"&&<div style={{padding:16,maxWidth:1200,margin:"0 auto"}}>
      {lds.length>0&&<div style={{marginBottom:16}}><label style={{fontSize:12,color:"rgba(255,255,255,.7)",display:"block",marginBottom:6}}>Pilih Tanggal:</label>
      <select value={LD} onChange={e=>setLD(e.target.value)} style={{padding:"10px 16px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,maxWidth:300,background:"white",cursor:"pointer"}}>
        {lds.map(d=><option key={d} value={d}>{d}</option>)}</select></div>}
      {lp&&<div><div style={{textAlign:"right",marginBottom:12}}><button onClick={()=>window.print()} style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"white",border:"none",padding:"8px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>🖨 Cetak</button></div>
      <div id="lp" style={{background:"white",padding:"10px",borderRadius:8}}>
        <div style={{textAlign:"center",marginBottom:6}}><h2 style={{fontSize:12,fontWeight:"bold",margin:0}}>LAPORAN PENJUALAN HARIAN (LPH)</h2><p style={{fontSize:9,margin:"1px 0"}}>APOTEK BALI BAGAS MEDIKA (BBM)</p><p style={{fontSize:9,fontWeight:"bold",margin:"3px 0 0"}}>TANGGAL : {lp.tg}</p></div>
        <table style={{width:"100%",fontSize:8,borderCollapse:"collapse",border:"1px solid #000"}}>
          <thead><tr style={{background:"#e5e7eb"}}><th style={{border:"1px solid #000",padding:"2px 4px"}}>URAIAN</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>PAGI</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>SIANG</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>TOTAL</th></tr></thead>
          <tbody>{lp.rr.map((r,i)=>(<tr key={i} style={{background:i%2===0?"white":"#f9fafb"}}><td style={{border:"1px solid #000",padding:"2px 4px"}}>{r.u}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.p}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.s}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.t}</td></tr>))}</tbody></table></div>
      </div>}
      {!lp&&<div style={{padding:32,textAlign:"center",color:"rgba(255,255,255,.5)"}}>Pilih tanggal</div>}
    </div>}

    {/* DIAGRAM */}
    {T==="d"&&<div style={{padding:16,maxWidth:1200,margin:"0 auto"}}>
      {dr&&<><div style={{background:"white",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:20}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Omzet Bulanan 2024-2026</div>
        <div style={{padding:16}}><ResponsiveContainer width="100%" height={350}>
          <BarChart data={(()=>{const m={};for(const t of [2024,2025,2026])for(const d of DG[t]){if(!m[d.b])m[d.b]={b:d.b};m[d.b][t]=d.t}return Object.keys(m).map(k=>({...m[k]}));})()}>
          <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="b" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} tickFormatter={(v)=>(v/1e6).toFixed(0)+"jt"}/>
          <Tooltip formatter={(v,n)=>["Rp "+v.toLocaleString("id-ID"),n]}/>
          {[2024,2025,2026].map(t=><Bar key={t} dataKey={t} name={""+t} fill={WT[t]} radius={[4,4,0,0]}/>)}
          <Legend/>
        </BarChart></ResponsiveContainer></div></div>
        <div style={{background:"white",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Kunjungan Bulanan 2024-2026</div>
          <div style={{padding:16}}><ResponsiveContainer width="100%" height={300}>
            <BarChart data={(()=>{const m={};for(const t of [2024,2025,2026])for(const d of DG[t]){if(!m[d.b])m[d.b]={b:d.b};m[d.b][t]=d.k}return Object.keys(m).map(k=>({...m[k]}));})()}>
            <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="b" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/>
            {[2024,2025,2026].map(t=><Bar key={t} dataKey={t} name={""+t} fill={WT[t]} radius={[4,4,0,0]} opacity={0.7}/>)}
            <Legend/>
          </BarChart></ResponsiveContainer></div></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:20}}>
            {[2024,2025,2026].map(t=>{const dd=DG[t]||[];return <K key={t} label={"Total "+t} v={fr(dd.reduce((s,d)=>s+d.t,0))} c={WT[t]}/>;})}
          </div>
      </>}
      {!dr&&<div style={{padding:32,textAlign:"center",color:"rgba(255,255,255,.5)"}}>Data diagram tidak tersedia</div>}
    </div>}

    {/* FAKTUR */}
    {T==="f"&&<div style={{padding:16,maxWidth:1200,margin:"0 auto"}}>
      {fkl.length>0&&<div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {fkl.map(b=><button key={b} onClick={()=>setFB(b)} style={bs(FB,b)}>{b}</button>)}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        <K label={"Faktur "+FB} v={fk.length+" faktur"} c="#3b82f6"/>
        <K label="Lunas" v={fk.filter(d=>d.sb).length+" faktur"} c="#10b981"/>
        <K label="Belum" v={fk.filter(d=>!d.sb).length+" faktur"} c="#ef4444"/>
        <K label="Nilai" v={fr(fk.reduce((s,d)=>s+d.jml,0))} c="#8b5cf6"/>
      </div>
      <Tabel title={"Faktur "+FB} data={fk.slice(0,50)} cols={["no","pbf","jml"]} fmt={(k,v)=>k==="jml"?fr(v):v} rowBg={(d)=>d.sb?"#f0fdf4":"#fef2f2"} extraCol={(d)=><td style={{padding:"8px 12px",textAlign:"center"}}><span style={{padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:500,background:d.sb?"#dcfce7":"#fee2e2",color:d.sb?"#16a34a":"#dc2626"}}>{d.sb?"LUNAS":"BELUM"}</span></td>}/>
    </div>}
  </div>);
}

function K({label,v,color:c}){return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.08)",border:"1px solid rgba(255,255,255,.6)"}}><p style={{fontSize:11,color:"#9ca3af",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:.5}}>{label}</p><p style={{fontSize:22,fontWeight:"bold",margin:0,color:c||"#111827"}}>{v}</p></div>;}

function Tabel({title,data,cols,rowBg,fmt,extraCol:xc}){
return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,border:"1px solid rgba(255,255,255,.6)",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.08)",marginBottom:20}}>
<div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>{title}</div>
<div style={{maxHeight:400,overflow:"auto"}}><table style={{width:"100%",fontSize:13,borderCollapse:"collapse"}}>
<thead style={{background:"#f1f5f9",position:"sticky",top:0}}><tr>{cols.map(c=><th key={c} style={{textAlign:"left",padding:"10px 12px",borderBottom:"1px solid #e5e7eb",fontSize:12,color:"#475569"}}>{c==="tgl"?"Tanggal":c==="tt"?"Omzet":c==="kj"?"Kunj":c==="jml"?"Jumlah":c}</th>)}
{xc&&<th style={{textAlign:"center",padding:"10px 12px",borderBottom:"1px solid #e5e7eb",fontSize:12,color:"#475569"}}>Status</th>}</tr></thead>
<tbody>{data.map((d,i)=>{const bg=rowBg?rowBg(d):i%2===0?"white":"#f8fafc";return <tr key={i} style={{background:bg}}>{cols.map(c=><td key={c} style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9",textAlign:c==="tt"||c==="jml"?"right":"left"}}>{fmt?fmt(c,d[c]):d[c]}</td>)}{xc&&xc(d)}</tr>;})}</tbody></table></div></div>;
function DS({data, tahun, bl}){
  const f=n=>typeof n==="number"&&n>0?fr(n):"-";
  return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,border:"1px solid rgba(255,255,255,.6)",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.08)",marginBottom:20}}>
<div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Detail Harian {tahun} - {bl}</div>
<div style={{maxHeight:500,overflow:"auto"}}><table style={{width:"100%",fontSize:9,borderCollapse:"collapse"}}>
<thead style={{background:"#f1f5f9",position:"sticky",top:0}}>
<tr><th rowSpan={2} style={{padding:"3px 5px",border:"1px solid #e5e7eb",fontSize:8,color:"#475569",textAlign:"center"}}>Tgl</th>
<th colSpan={4} style={{padding:"3px 5px",border:"1px solid #e5e7eb",fontSize:8,color:"#475569",textAlign:"center",background:"#e0e7ff"}}>PAGI</th>
<th colSpan={4} style={{padding:"3px 5px",border:"1px solid #e5e7eb",fontSize:8,color:"#475569",textAlign:"center",background:"#fef3c7"}}>SIANG</th>
<th rowSpan={2} style={{padding:"3px 5px",border:"1px solid #e5e7eb",fontSize:8,color:"#475569",textAlign:"center"}}>Total</th>
<th rowSpan={2} style={{padding:"3px 5px",border:"1px solid #e5e7eb",fontSize:8,color:"#475569",textAlign:"center"}}>Kunj</th></tr>
<tr><th style={{padding:"2px 3px",border:"1px solid #e5e7eb",fontSize:7,color:"#6b7280",textAlign:"center"}}>Cash</th>
<th style={{padding:"2px 3px",border:"1px solid #e5e7eb",fontSize:7,color:"#6b7280",textAlign:"center"}}>Mandiri</th>
<th style={{padding:"2px 3px",border:"1px solid #e5e7eb",fontSize:7,color:"#6b7280",textAlign:"center"}}>QRIS</th>
<th style={{padding:"2px 3px",border:"1px solid #e5e7eb",fontSize:7,color:"#6b7280",textAlign:"center"}}>Jml</th>
<th style={{padding:"2px 3px",border:"1px solid #e5e7eb",fontSize:7,color:"#6b7280",textAlign:"center"}}>Cash</th>
<th style={{padding:"2px 3px",border:"1px solid #e5e7eb",fontSize:7,color:"#6b7280",textAlign:"center"}}>Mandiri</th>
<th style={{padding:"2px 3px",border:"1px solid #e5e7eb",fontSize:7,color:"#6b7280",textAlign:"center"}}>QRIS</th>
<th style={{padding:"2px 3px",border:"1px solid #e5e7eb",fontSize:7,color:"#6b7280",textAlign:"center"}}>Jml</th></tr></thead>
<tbody>{[...data].reverse().map((d,i)=>(<tr key={i} style={{background:i%2===0?"white":"#f8fafc"}}>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",fontSize:8,fontWeight:500,textAlign:"center"}}>{d.tgl}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8}}>{f(d.pc)}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8}}>{f(d.pm)}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8}}>{d.pq?f(d.pq):"-"}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8,fontWeight:500}}>{f(d.pj)}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8}}>{f(d.sc)}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8}}>{f(d.sm)}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8}}>{d.sq?f(d.sq):"-"}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8,fontWeight:500}}>{f(d.sj)}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"right",fontSize:8,fontWeight:700,color:"#2563eb"}}>{f(d.tt)}</td>
<td style={{padding:"2px 3px",border:"1px solid #f1f5f9",textAlign:"center",fontSize:8}}>{d.kj}</td></tr>))}
</tbody></table></div></div>;}

function DS24({data, tahun, bl}){
  const f=n=>typeof n==="number"&&n>0?fr(n):"-";
  return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,border:"1px solid rgba(255,255,255,.6)",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.08)",marginBottom:20}}>
<div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Detail Harian {tahun} - {bl}</div>
<div style={{maxHeight:400,overflow:"auto"}}><table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
<thead style={{background:"#f1f5f9",position:"sticky",top:0}}><tr><th style={{padding:"6px 8px",borderBottom:"1px solid #e5e7eb",fontSize:11,color:"#475569",textAlign:"left"}}>Tanggal</th>
<th style={{padding:"6px 8px",borderBottom:"1px solid #e5e7eb",fontSize:11,color:"#475569",textAlign:"right"}}>Pagi</th>
<th style={{padding:"6px 8px",borderBottom:"1px solid #e5e7eb",fontSize:11,color:"#475569",textAlign:"right"}}>Siang</th>
<th style={{padding:"6px 8px",borderBottom:"1px solid #e5e7eb",fontSize:11,color:"#475569",textAlign:"right"}}>Total</th>
<th style={{padding:"6px 8px",borderBottom:"1px solid #e5e7eb",fontSize:11,color:"#475569",textAlign:"right"}}>Kunj</th></tr></thead>
<tbody>{[...data].reverse().map((d,i)=>(<tr key={i} style={{background:i%2===0?"white":"#f8fafc"}}>
<td style={{padding:"5px 8px",borderBottom:"1px solid #f1f5f9",fontSize:11}}>{d.tgl}</td>
<td style={{padding:"5px 8px",textAlign:"right",borderBottom:"1px solid #f1f5f9",fontSize:11}}>{f(d.pg)}</td>
<td style={{padding:"5px 8px",textAlign:"right",borderBottom:"1px solid #f1f5f9",fontSize:11}}>{f(d.sg)}</td>
<td style={{padding:"5px 8px",textAlign:"right",borderBottom:"1px solid #f1f5f9",fontSize:11,fontWeight:600,color:"#2563eb"}}>{f(d.tt)}</td>
<td style={{padding:"5px 8px",textAlign:"right",borderBottom:"1px solid #f1f5f9",fontSize:11}}>{d.kj}</td></tr>))}
</tbody></table></div></div>;}

}
