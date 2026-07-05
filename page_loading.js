"use client";
import { useEffect, useState } from "react";

const NL = String.fromCharCode(92,110);
const DR = new RegExp("^\\d{2}/\\d{2}/\\d{4}$");
const DN = new RegExp("^\\d+$");
const S26 = "12ifCX85urqUxt67Ad5xr26ffzGxvGNz5FFZT38oKZM8";
const S25 = "1hf-QOppWoC4oxzVIfluS82y8ZIRLv5AMP7ghpLRHeeE";
const S24 = "1X8sU5TbwIFrfva-Hv3lJwKmNWBAXlF4wKWLq4TUkXkY";
const FSID = "1f0xEiBz5Mzu79zxks1Ew0lfAdwQu-7VKvKxaUcz3VzU";
const LSID = "1Pl9uQvDSq4qWVT6MzqWCiZoI4Oga0wMhVu7wFwMoW4I";
const LG = [0,76269533,1004144241,1047687838,1049487848,1269180586,1269826655,1375079069,1508503184,1668129507,1704465439,2057032683,2092131821,2106161542,2142536146,226069595,233866909,246287253,256317823,338679084,443409010,456439832,456923066,527597092,543521900,556096497,742200864,762801297,867905108,936206001,993453517];
const LU = ["TARGET SHIFT","OMZET","% PENCAPAIN","GAP VS TARGET","CASH","DEBIT MANDIRI","DEBIT QRIS","NOTA","FAKTUR","SETORAN"];
const P26M = [{g:"0",l:"Jan"},{g:"1981407338",l:"Feb"},{g:"1445967367",l:"Mar"},{g:"1565950911",l:"Apr"},{g:"2013738206",l:"Mei"},{g:"163552086",l:"Jun"},{g:"1190948522",l:"Jul"}];
const FM = [{g:"0",l:"Jan"},{g:"914339812",l:"Feb"},{g:"1942627049",l:"Mar"},{g:"85697732",l:"Apr"},{g:"452486501",l:"Mei"}];
const M24 = {0:"Jan",1462383099:"Feb",907772167:"Mar",232891112:"Apr",282938849:"Mei",731458776:"Jun",1406355561:"Jul",1803306864:"Agu",1496176196:"Sep",1600880255:"Okt",139141189:"Nov",1094972947:"Des"};
const M25 = {0:"Jan",200361189:"Feb",948223844:"Mar",1168220512:"Apr",1057815698:"Mei",278075545:"Jun",10910240:"Jul",126222887:"Agu",1341963010:"Sep",1387254622:"Okt",2067058499:"Sep",889768507:"DG"};

function p(v){return parseInt((v||"0").replace(/[Rp\s,."]/g,""),10)||0;}
function fr(n){return typeof n==="number"?("Rp "+n.toLocaleString("id-ID")):"-";}

export default function Home(){
  const [L,setL]=useState(true);const [E,setE]=useState("");const [T,setT]=useState("p");
  const [P26,setP26]=useState({});const [P25,setP25]=useState({});const [P24,setP24]=useState({});
  const [F,setF]=useState({});const [LP,setLP]=useState({});
  const [BA,setBA]=useState("");const [B24,setB24]=useState("");const [B25,setB25]=useState("");
  const [FB,setFB]=useState("Jan");const [LD,setLD]=useState("");

  useEffect(()=>{(async()=>{try{
    const a={};
    for(const m of P26M){try{
      const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+S26+"/export?format=csv&gid="+m.g));
      const t=await r.text();
      const ll=t.split(NL).filter(l=>l.trim());
      const ps=ll.slice(4).filter(r=>{const c=r.split(",");return c[0]&&DR.test(c[0].replace(/"/g,""));}).map(r=>{
        const c=r.split(",");return {tgl:c[0].replace(/"/g,""),tt:p(c[9]),kj:p(c[10])};});
      if(ps.length>0)a[m.l]=ps;
    }catch(e){}}
    setP26(a);
    const b={};
    for(const [gid,bln]of Object.entries(M25)){if(bln==="DG")continue;try{
      const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+S25+"/export?format=csv&gid="+gid));
      const t=await r.text();
      const ll=t.split(NL).filter(l=>l.trim());
      const ps=ll.slice(4).filter(r=>{const c=r.split(",");return c[0]&&DR.test(c[0].replace(/"/g,""));}).map(r=>{
        const c=r.split(",");return {tgl:c[0].replace(/"/g,""),tt:p(c[9]),kj:p(c[10])};});
      if(ps.length>0)b[bln]=ps;
    }catch(e){}}
    setP25(b);
    const c={};
    for(const [gid,bln]of Object.entries(M24)){try{
      const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+S24+"/export?format=csv&gid="+gid));
      const t=await r.text();
      const ll=t.split(NL).filter(l=>l.trim());
      const ps=ll.slice(4).filter(r=>{const c=r.split(",");return c[0]&&DR.test(c[0].replace(/"/g,""));}).map(r=>{
        const c=r.split(",");return {tgl:c[0].replace(/"/g,""),tt:p(c[3]),kj:p(c[4])};});
      if(ps.length>0)c[bln]=ps;
    }catch(e){}}
    setP24(c);
    const sf={};
    for(const m of FM){try{
      const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+FSID+"/export?format=csv&gid="+m.g));
      const t=await r.text();
      const ll=t.split(NL).filter(l=>l.trim());
      const ps=ll.slice(4).filter(r=>{const c=r.split(",");return c[0]&&DN.test(c[0].replace(/"/g,""));}).map(r=>{
        const c=r.split(",");return{no:c[0].replace(/"/g,""),pbf:(c[1]||"").replace(/"/g,""),jml:p(c[2]),sb:(c[5]||"").replace(/"/g,"").trim().toUpperCase()==="TRUE"};});
      if(ps.length>0)sf[m.l]=ps;
    }catch(e){}}
    setF(sf);
    const lm={};
    for(const gid of LG){try{
      const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+LSID+"/export?format=csv&gid="+gid));
      const t=await r.text();
      const ll=t.split(NL).filter(l=>l.trim());
      const tg=ll[2]?.split(",")[3]?.replace(/"/g,"")?.trim()||"";if(!tg)continue;const rr=[];
      for(const l of ll){const c=l.split(",").map(x=>x.replace(/"/g,"").trim());const u=c[0].toUpperCase().trim();if(LU.some(v=>u===v||u.startsWith(v)))rr.push({u:c[0],p:c[1]||"-",s:c[2]||"-",t:c[3]||"-"});}
      if(rr.length>0)lm[tg]={tg,rr};
    }catch(e){}}
    setLP(lm);
    const ka=Object.keys(a);if(ka.length>0)setBA(ka[ka.length-1]);
    const kb=Object.keys(b);if(kb.length>0)setB25(kb[0]);
    const kc=Object.keys(c);if(kc.length>0)setB24(kc[0]);
    const ds=Object.keys(lm).sort();if(ds.length>0)setLD(ds[ds.length-1]);
  }catch(e){setE("Err: "+e.message);}setL(false);})();},[]);

  const pj=BA?(P26[BA]||[]):[];const tt26=pj.reduce((s,d)=>s+d.tt,0);
  const p24=B24?(P24[B24]||[]):[];const tt24=p24.reduce((s,d)=>s+d.tt,0);
  const p25=B25?(P25[B25]||[]):[];const tt25=p25.reduce((s,d)=>s+d.tt,0);
  const fk=FB?(F[FB]||[]):[];
  const lds=Object.keys(LP).sort();const lp=LD?LP[LD]:null;

  if(L) return <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1e40af 100%)",gap:16}}>
<div style={{width:48,height:48,border:"4px solid rgba(255,255,255,.2)",borderTop:"4px solid #60a5fa",borderRadius:"50%",animation:"spin 1s linear infinite"}}></div>
<p style={{color:"rgba(255,255,255,.7)",fontSize:14}}>Memuat data...</p>
<p style={{color:"rgba(255,255,255,.4)",fontSize:11}}>Mohon tunggu 10-20 detik</p>
<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>;
  if(E) return <div style={{padding:32,color:"#dc2626"}}>{E}</div>;

  return <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#1e40af 60%,#2563eb 100%)"}}>
    <style>{"@media print{body *{visibility:hidden!important}#lp,#lp *{visibility:visible!important}#lp{position:absolute;left:0;top:0;width:100%;padding:8px 12px;font-size:7px;max-width:210mm}@page{margin:6mm 8mm;size:A4 landscape}}"}</style>
    <div style={{background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",color:"white",padding:"20px 24px"}}>
      <h1 style={{fontSize:22,fontWeight:"bold",margin:0}}>Apotek Bali Bagas Medika</h1>
      <p style={{fontSize:13,opacity:.7,margin:"4px 0 0"}}>Dashboard Monitoring</p></div>
    <div style={{display:"flex",background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid #e5e7eb",paddingLeft:16}}>
      {[{k:"p",l:"Penjualan"},{k:"l",l:"LPH"},{k:"f",l:"Faktur"}].map(t=>(
        <button key={t.k} onClick={()=>setT(t.k)} style={{padding:"12px 20px",border:"none",background:"transparent",cursor:"pointer",borderBottom:T===t.k?"2px solid #2563eb":"2px solid transparent",color:T===t.k?"#2563eb":"#6b7280",fontWeight:T===t.k?600:400,fontSize:14,outline:"none"}}>{t.l}</button>))}
    </div>
    <div style={{padding:16,maxWidth:1200,margin:"0 auto"}}>
      {T==="p"&&<Penjualan BA={BA} setBA={setBA} kl26={Object.keys(P26)} pj={pj} tt26={tt26}
        B24={B24} setB24={setB24} kl24={Object.keys(P24)} p24={p24} tt24={tt24}
        B25={B25} setB25={setB25} kl25={Object.keys(P25)} p25={p25} tt25={tt25}/>}
      {T==="l"&&<LPH lds={lds} LD={LD} setLD={setLD} lp={lp}/>}
      {T==="f"&&<Faktur Fkeys={Object.keys(F)} FB={FB} setFB={setFB} fk={fk}/>}
    </div>
  </div>;
}

function Kartu({label,v,color:c}){return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.08)",border:"1px solid rgba(255,255,255,.6)"}}>
<p style={{fontSize:11,color:"#9ca3af",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:.5}}>{label}</p>
<p style={{fontSize:22,fontWeight:"bold",margin:0,color:c||"#111827"}}>{v}</p></div>;}

function Penjualan({BA,setBA,kl26,pj,tt26,B24,setB24,kl24,p24,tt24,B25,setB25,kl25,p25,tt25}){
  return <div>
<div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
<span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2026:</span>
<select value={BA} onChange={e=>setBA(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
{kl26.map(b=><option key={b} value={b}>{b}</option>)}</select>
<span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2025:</span>
<select value={B25} onChange={e=>setB25(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
{kl25.map(b=><option key={b} value={b}>{b}</option>)}</select>
<span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2024:</span>
<select value={B24} onChange={e=>setB24(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
{kl24.map(b=><option key={b} value={b}>{b}</option>)}</select>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
<Kartu label={"Omzet 2026"} v={fr(tt26)} c="#f59e0b"/><Kartu label={"Omzet 2025"} v={fr(tt25)} c="#3b82f6"/><Kartu label={"Omzet 2024"} v={fr(tt24)} c="#10b981"/>
</div>
{kl26.length>0&&Array.isArray(pj)&&pj.length>0&&<Tabel title={"Penjualan Harian 2026 - "+BA} data={[...pj].reverse()} cols={["tgl","tt","kj"]} fmt={(k,v)=>k==="tt"?fr(v):v}/>}
{kl25.length>0&&Array.isArray(p25)&&p25.length>0&&<Tabel title={"Penjualan Harian 2025 - "+B25} data={[...p25].reverse()} cols={["tgl","tt","kj"]} fmt={(k,v)=>k==="tt"?fr(v):v}/>}
{kl24.length>0&&Array.isArray(p24)&&p24.length>0&&<Tabel title={"Penjualan Harian 2024 - "+B24} data={[...p24].reverse()} cols={["tgl","tt","kj"]} fmt={(k,v)=>k==="tt"?fr(v):v}/>}
</div>;}

function Tabel({title,data,cols,rowBg,fmt,extraCol:xc}){
  const rows=Array.isArray(data)?data:[];
  return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,border:"1px solid rgba(255,255,255,.6)",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.08)",marginBottom:20}}>
<div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>{title}</div>
<div style={{maxHeight:400,overflow:"auto"}}><table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
<thead style={{background:"#f1f5f9",position:"sticky",top:0,boxShadow:"0 1px 3px rgba(0,0,0,.08)"}}>
<tr>{[{k:"tgl",l:"Tanggal"},{k:"tt",l:"Total"},{k:"kj",l:"Kunjungan"}].filter(c=>cols.includes(c.k)).map(c=>(
  <th key={c.k} style={{padding:"8px 12px",borderBottom:"1px solid #e5e7eb",fontSize:11,color:"#475569",textAlign:c.k==="tgl"?"left":"right"}}>{c.l}</th>))}{xc&&<th style={{padding:"8px 12px",borderBottom:"1px solid #e5e7eb",fontSize:11,color:"#475569",textAlign:"center"}}>Status</th>}</tr></thead>
<tbody>{rows.map((d,i)=>{const bg=rowBg?rowBg(d):i%2===0?"white":"#f8fafc";return <tr key={i} style={{background}}>
{cols.map(c=><td key={c} style={{padding:"5px 8px",borderBottom:"1px solid #f1f5f9",fontSize:11,fontWeight:c==="tt"?600:400,color:c==="tt"?"#2563eb":"#374151",textAlign:c==="tgl"?"left":"right"}}>{fmt?fmt(c,d[c]):d[c]}</td>)}{xc&&xc(d)}</tr>;})}</tbody></table></div></div>;}

function LPH({lds,LD,setLD,lp}){return <div>
{lds.length>0&&<div style={{marginBottom:16}}><label style={{fontSize:12,color:"rgba(255,255,255,.7)",display:"block",marginBottom:6}}>Pilih Tanggal:</label>
<select value={LD} onChange={e=>setLD(e.target.value)} style={{padding:"10px 16px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,maxWidth:300,background:"white",cursor:"pointer"}}>
{lds.map(d=><option key={d} value={d}>{d}</option>)}</select></div>}
{lp&&<div><div style={{textAlign:"right",marginBottom:12}}><button onClick={()=>window.print()} style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"white",border:"none",padding:"8px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>Cetak</button></div>
<div id="lp" style={{background:"white",padding:"10px",borderRadius:8}}>
<div style={{textAlign:"center",marginBottom:6}}><h2 style={{fontSize:12,fontWeight:"bold",margin:0}}>LAPORAN PENJUALAN HARIAN (LPH)</h2>
<p style={{fontSize:9,margin:"1px 0"}}>APOTEK BALI BAGAS MEDIKA (BBM)</p><p style={{fontSize:9,fontWeight:"bold",margin:"3px 0 0"}}>TANGGAL : {lp.tg}</p></div>
<table style={{width:"100%",fontSize:8,borderCollapse:"collapse",border:"1px solid #000"}}>
<thead><tr style={{background:"#e5e7eb"}}><th style={{border:"1px solid #000",padding:"2px 4px"}}>URAIAN</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>PAGI</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>SIANG</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>TOTAL</th></tr></thead>
<tbody>{lp.rr.map((r,i)=>(<tr key={i} style={{background:i%2===0?"white":"#f9fafb"}}><td style={{border:"1px solid #000",padding:"2px 4px"}}>{r.u}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.p}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.s}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.t}</td></tr>))}</tbody></table></div>
</div>}
{!lp&&<div style={{padding:32,textAlign:"center",color:"rgba(255,255,255,.5)"}}>Pilih tanggal</div>}
</div>;}

function Faktur({Fkeys,FB,setFB,fk}){
  const bs=(a,k)=>({padding:"6px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:13,background:a===k?"#3b82f6":"white",color:a===k?"white":"#374151",borderColor:a===k?"#3b82f6":"#d1d5db"});
  return <div>
{Fkeys.length>0&&<div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{Fkeys.map(b=><button key={b} onClick={()=>setFB(b)} style={bs(FB,b)}>{b}</button>)}</div>}
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
<Kartu label={"Faktur "+FB} v={fk.length+" faktur"} c="#3b82f6"/><Kartu label="Lunas" v={fk.filter(d=>d.sb).length+" faktur"} c="#10b981"/><Kartu label="Belum" v={fk.filter(d=>!d.sb).length+" faktur"} c="#ef4444"/><Kartu label="Nilai" v={fr(fk.reduce((s,d)=>s+d.jml,0))} c="#8b5cf6"/>
</div>
<Tabel title={"Faktur "+FB} data={fk.slice(0,50)} cols={["no","pbf","jml"]} fmt={(k,v)=>k==="jml"?fr(v):v} rowBg={(d)=>d.sb?"#f0fdf4":"#fef2f2"} extraCol={(d)=><td style={{padding:"8px 12px",textAlign:"center"}}><span style={{padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:500,background:d.sb?"#dcfce7":"#fee2e2",color:d.sb?"#16a34a":"#dc2626"}}>{d.sb?"LUNAS":"BELUM"}</span></td>}/>
</div>;}
