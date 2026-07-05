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
const BL26 = [{g:"0",l:"Jan"},{g:"1981407338",l:"Feb"},{g:"1445967367",l:"Mar"},{g:"1565950911",l:"Apr"},{g:"2013738206",l:"Mei"},{g:"163552086",l:"Jun"},{g:"1190948522",l:"Jul"}];
const FM = [{g:"0",l:"Jan"},{g:"914339812",l:"Feb"},{g:"1942627049",l:"Mar"},{g:"85697732",l:"Apr"},{g:"452486501",l:"Mei"}];
const G24 = {Jan:0,Feb:1462383099,Mar:907772167,Apr:232891112,Mei:282938849,Jun:731458776,Jul:1406355561,Agu:1803306864,Sep:1496176196,Okt:1600880255,Nov:139141189,Des:1094972947};
const G25 = {Jan:0,Feb:200361189,Mar:948223844,Apr:1168220512,Mei:1057815698,Jun:278075545,Jul:10910240,Agu:126222887,Sep:1341963010,Okt:1387254622,Nop:2067058499,Des:889768507};

function p(v){return parseInt((v||"0").replace(/[Rp\s,."]/g,""),10)||0;}
function fr(n){return typeof n==="number"?("Rp "+n.toLocaleString("id-ID")):"-";}

async function fetchCSV(sid,gid){try{const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+sid+"/export?format=csv&gid="+gid));return await r.text();}catch(e){return "";}}

function parseTotal(csv,is5Col){
  const ll=csv.split(NL).filter(l=>l.trim()).slice(4);
  let t=0,k=0,cnt=0;
  for(const l of ll){
    const c=l.split(",");const tgl=(c[0]||"").replace(/"/g,"");
    if(!DR.test(tgl))continue;cnt++;
    if(is5Col){t+=p(c[3]);k+=p(c[4]);}else{t+=p(c[9]);k+=p(c[10]);}
  }
  return{t,k,cnt};
}

async function loadLP(){
  for(const gid of LG){const csv=await fetchCSV(LSID,gid);const ll=csv.split(NL).filter(l=>l.trim());const tg=ll[2]?.split(",")[3]?.replace(/"/g,"")?.trim()||"";if(!tg)continue;const rr=[];for(const l of ll){const c=l.split(",").map(x=>x.replace(/"/g,"").trim());const u=c[0].toUpperCase().trim();if(LU.some(v=>u===v||u.startsWith(v)))rr.push({u:c[0],p:c[1]||"-",s:c[2]||"-",t:c[3]||"-"});}if(rr.length>0)return{tg,rr};}
  return null;
}

export default function Home(){
  const [L,setL]=useState(true);const [T,setT]=useState("p");
  const [BA,setBA]=useState("Jul");const [B24,setB24]=useState("Des");const [B25,setB25]=useState("Des");
  const [FB,setFB]=useState("Jan");const [LD,setLD]=useState("");
  const [d26,setD26]=useState({t:0,k:0,cnt:0,ld:false});
  const [d24,setD24]=useState({t:0,k:0,cnt:0,ld:false});
  const [d25,setD25]=useState({t:0,k:0,cnt:0,ld:false});
  const [fk,setFk]=useState([]);const [fkld,setFkld]=useState(false);
  const [lp,setLp]=useState(null);const [lpld,setLpld]=useState(false);
  const [lds,setLds]=useState([]);

  useEffect(()=>{(async()=>{
    // Lazy load: ambil semua data sekaligus di background
    async function getLP(){const r=await loadLP();if(r){setLp(r);setLds([r.tg]);setLD(r.tg);setLpld(true);}}
    async function get26(){const csv=await fetchCSV(S26,"0");setD26({...parseTotal(csv,false),ld:true});}
    async function get24(){const csv=await fetchCSV(S24,G24["Des"]);setD24({...parseTotal(csv,true),ld:true});}
    async function get25(){const csv=await fetchCSV(S25,G25["Des"]);setD25({...parseTotal(csv,false),ld:true});}
    async function getFk(){const csv=await fetchCSV(FSID,"0");const ll=csv.split(NL).filter(l=>l.trim()).slice(4);
      const ps=ll.filter(r=>{const c=r.split(",");return c[0]&&DN.test(c[0].replace(/"/g,""));}).map(r=>{const c=r.split(",");return{no:c[0].replace(/"/g,""),pbf:(c[1]||"").replace(/"/g,""),jml:p(c[2]),sb:(c[5]||"").replace(/"/g,"").trim().toUpperCase()==="TRUE"};});
      setFk(ps);setFkld(true);
    }
    // Run all in parallel
    await Promise.all([getLP(),get26(),get24(),get25(),getFk()]);
    setL(false);
  })();},[]);

  // Fetch 2026 when BA changes
  useEffect(()=>{(async()=>{if(!BA)return;const m=BL26.find(x=>x.l===BA);if(!m)return;setD26({...d26,ld:false});const csv=await fetchCSV(S26,m.g);setD26({...parseTotal(csv,false),ld:true});})();},[BA]);
  useEffect(()=>{(async()=>{if(!B24)return;const g=G24[B24];if(!g)return;setD24({...d24,ld:false});const csv=await fetchCSV(S24,g);setD24({...parseTotal(csv,true),ld:true});})();},[B24]);
  useEffect(()=>{(async()=>{if(!B25)return;const g=G25[B25];if(!g)return;setD25({...d25,ld:false});const csv=await fetchCSV(S25,g);setD25({...parseTotal(csv,false),ld:true});})();},[B25]);
  useEffect(()=>{(async()=>{if(!FB)return;const m=FM.find(x=>x.l===FB);if(!m)return;setFkld(false);const csv=await fetchCSV(FSID,m.g);const ll=csv.split(NL).filter(l=>l.trim()).slice(4);
    const ps=ll.filter(r=>{const c=r.split(",");return c[0]&&DN.test(c[0].replace(/"/g,""));}).map(r=>{const c=r.split(",");return{no:c[0].replace(/"/g,""),pbf:(c[1]||"").replace(/"/g,""),jml:p(c[2]),sb:(c[5]||"").replace(/"/g,"").trim().toUpperCase()==="TRUE"};});
    setFk(ps);setFkld(true);
  })();},[FB]);

  if(L)return <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1e40af 100%)",gap:16}}>
<div style={{width:48,height:48,border:"4px solid rgba(255,255,255,.2)",borderTop:"4px solid #60a5fa",borderRadius:"50%",animation:"spin 1s linear infinite"}}></div>
<p style={{color:"rgba(255,255,255,.7)",fontSize:14}}>Memuat data...</p>
<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>;

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
      {T==="p"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2026:</span>
          <select value={BA} onChange={e=>setBA(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
            {BL26.map(b=><option key={b.l} value={b.l}>{b.l}</option>)}</select>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2025:</span>
          <select value={B25} onChange={e=>setB25(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
            {Object.keys(G25).map(b=><option key={b} value={b}>{b}</option>)}</select>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2024:</span>
          <select value={B24} onChange={e=>setB24(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
            {Object.keys(G24).map(b=><option key={b} value={b}>{b}</option>)}</select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
          <K label={"2026 "+BA} v={d26.ld?fr(d26.t):"..."} c="#f59e0b"/>
          <K label={"2025 "+B25} v={d25.ld?fr(d25.t):"..."} c="#3b82f6"/>
          <K label={"2024 "+B24} v={d24.ld?fr(d24.t):"..."} c="#10b981"/>
          <K label={"Total Hari"} v={""+(d26.cnt+(d24.cnt||0)+(d25.cnt||0))} c="#8b5cf6"/>
        </div>
      </div>}
      {T==="l"&&<div>
        {lp&&<div>
          <div style={{textAlign:"right",marginBottom:12}}><button onClick={()=>window.print()} style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"white",border:"none",padding:"8px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>Cetak</button></div>
          <div id="lp" style={{background:"white",padding:"10px",borderRadius:8}}>
            <div style={{textAlign:"center",marginBottom:6}}>
              <h2 style={{fontSize:12,fontWeight:"bold",margin:0}}>LAPORAN PENJUALAN HARIAN (LPH)</h2>
              <p style={{fontSize:9,margin:"1px 0"}}>APOTEK BALI BAGAS MEDIKA (BBM)</p>
              <p style={{fontSize:9,fontWeight:"bold",margin:"3px 0 0"}}>TANGGAL : {lp.tg}</p></div>
            <table style={{width:"100%",fontSize:8,borderCollapse:"collapse",border:"1px solid #000"}}>
              <thead><tr style={{background:"#e5e7eb"}}><th style={{border:"1px solid #000",padding:"2px 4px"}}>URAIAN</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>PAGI</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>SIANG</th><th style={{border:"1px solid #000",padding:"2px 4px"}}>TOTAL</th></tr></thead>
              <tbody>{lp.rr.map((r,i)=>(<tr key={i} style={{background:i%2===0?"white":"#f9fafb"}}><td style={{border:"1px solid #000",padding:"2px 4px"}}>{r.u}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.p}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.s}</td><td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.t}</td></tr>))}</tbody></table></div>
        </div>}
        {!lp&&<div style={{padding:32,textAlign:"center",color:"rgba(255,255,255,.5)"}}>Memuat LPH...</div>}
      </div>}
      {T==="f"&&<div>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{FM.map(m=><button key={m.l} onClick={()=>setFB(m.l)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:13,background:FB===m.l?"#3b82f6":"white",color:FB===m.l?"white":"#374151",borderColor:FB===m.l?"#3b82f6":"#d1d5db"}}>{m.l}</button>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
          <K label={"Faktur "+FB} v={fk.length+" faktur"} c="#3b82f6"/><K label="Lunas" v={fk.filter(d=>d.sb).length+" faktur"} c="#10b981"/>
          <K label="Belum" v={fk.filter(d=>!d.sb).length+" faktur"} c="#ef4444"/><K label="Nilai" v={fkld?fr(fk.reduce((s,d)=>s+d.jml,0)):"..."} c="#8b5cf6"/>
        </div>
      </div>}
    </div>
  </div>;
}

function K({label,v,color:c}){return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.08)",border:"1px solid rgba(255,255,255,.6)"}}>
<p style={{fontSize:11,color:"#9ca3af",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:.5}}>{label}</p>
<p style={{fontSize:22,fontWeight:"bold",margin:0,color:c||"#111827"}}>{v}</p></div>;}
