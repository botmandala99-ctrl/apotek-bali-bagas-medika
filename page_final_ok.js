"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

/* ============ KONFIGURASI SHEET ============ */
const S26 = "12ifCX85urqUxt67Ad5xr26ffzGxvGNz5FFZT38oKZM8"; // Admin Penjualan (2026 harian)
const S25 = "1hf-QOppWoC4oxzVIfluS82y8ZIRLv5AMP7ghpLRHeeE";
const S24 = "1X8sU5TbwIFrfva-Hv3lJwKmNWBAXlF4wKWLq4TUkXkY";
const FSID = "1f0xEiBz5Mzu79zxks1Ew0lfAdwQu-7VKvKxaUcz3VzU"; // Faktur (Jan-Mei)
const LSID = "1Pl9uQvDSq4qWVT6MzqWCiZoI4Oga0wMhVu7wFwMoW4I"; // LPH lama (Jan-Jul)
const LAID = "1KiBthvKts3dOCLkRH2kdcyoI6seyP2AmMFi_ADh76Wc"; // LPH Agustus

/* gid per bulan 2026 (Admin Penjualan) — urutan Jan-Des */
const M26 = {
  Jan: 0, Feb: 1981407338, Mar: 1445967367, Apr: 1565950911,
  Mei: 2013738206, Jun: 163552086, Jul: 1190948522,
  // Agu: 471302708, // HARIAN AGUSTUS — gid belum dikonfirmasi (471302708 itu rekap), disable dulu
  // Sep, Okt: gid belum diketahui (kosong)
};
/* gid per bulan 2024 & 2025 */
const G24 = { Jan:0,Feb:1462383099,Mar:907772167,Apr:232891112,Mei:282938849,Jun:731458776,Jul:1406355561,Agu:1803306864,Sep:1496176196,Okt:1600880255,Nov:139141189,Des:1094972947 };
const G25 = { Jan:0,Feb:200361189,Mar:948223844,Apr:1168220512,Mei:1057815698,Jun:278075545,Jul:10910240,Agu:126222887,Sep:1341963010,Okt:1387254622,Nop:2067058499,Des:889768507 };
/* gid LPH lama (LSID) — tiap gid = 1 tanggal */
const LG = [0,76269533,1004144241,1047687838,1049487848,1269180586,1269826655,1375079069,1508503184,1668129507,1704465439,2057032683,2092131821,2106161542,2142536146,226069595,233866909,246287253,256317823,338679084,443409010,456439832,456923066,527597092,543521900,556096497,742200864,762801297,867905108,936206001,993453517];
const LU = ["TARGET SHIFT","OMZET","% PENCAPAIN","GAP VS TARGET","CASH","DEBIT MANDIRI","DEBIT QRIS","NOTA","FAKTUR","SETORAN"];
/* Faktur per bulan */
const FM = [{g:0,l:"Jan"},{g:914339812,l:"Feb"},{g:1942627049,l:"Mar"},{g:85697732,l:"Apr"},{g:452486501,l:"Mei"}];
const WT = {2024:"#10b981",2025:"#3b82f6",2026:"#f59e0b"};
const ORDER = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

/* ============ HELPERS ============ */
const NL = String.fromCharCode(92,110);
const DR = /^\d{2}\/\d{2}\/\d{4}$/;
const DN = /^\d+$/;
function p(v){return parseInt(String(v||"0").replace(/[Rp\s,."]/g,""),10)||0;}
function fr(n){return typeof n==="number"?("Rp "+n.toLocaleString("id-ID")):"-";}
async function fetchCSV(sid,gid){
  try{
    const r=await fetch("/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+sid+"/export?format=csv&gid="+gid));
    if(!r.ok) return "";
    return await r.text();
  }catch(e){ return ""; }
}
/* parse baris penjualan harian: c1..c8 = kategori, tt=total, kj=kunjungan */
function parseHarian(csv, is5col){
  const out=[]; const ll=csv.split(NL).filter(l=>l.trim()).slice(4);
  for(const l of ll){
    const c=l.split(","); const tgl=(c[0]||"").replace(/"/g,"");
    if(!DR.test(tgl)) continue;
    const tt = is5col ? p(c[3]) : p(c[9]);
    const kj = is5col ? p(c[4]) : p(c[10]);
    if(tt>0 || kj>0) out.push({t:tgl, tt, kj});
  }
  return out;
}
/* parse LPH dari satu sheet (gid): ambil tanggal + baris uraian */
function parseLPH(csv){
  const ll=csv.split(NL).filter(l=>l.trim());
  const tg=(ll[2]||"").split(",")[3]?.replace(/"/g,"")?.trim();
  if(!tg) return null;
  // normalis tanggal: dd.mm.yyyy / dd/mm/yyyy -> dd/mm/yyyy
  let d=tg; if(d.indexOf(".")>=0) d=d.split(".").join("/");
  const rr=[];
  for(const l of ll){
    const c=l.split(",").map(x=>x.replace(/"/g,"").trim());
    const u=c[0]?.toUpperCase().trim()||"";
    if(LU.some(v=>u===v||u.startsWith(v))) rr.push({u:c[0],p:c[1]||"-",s:c[2]||"-",t:c[3]||"-"});
  }
  return {tg:d, rr};
}

export default function Home(){
  const [L,setL]=useState(true);
  const [P,setP]=useState({});      // 2026: {bulan:[{t,tt,kj}]}
  const [P24,setP24]=useState({});
  const [P25,setP25]=useState({});
  const [F,setF]=useState({});
  const [LP,setLP]=useState({});    // LPH: {tanggal:{tg,rr}}
  const [T,setT]=useState("p");
  const [BA,setBA]=useState("");    // bulan 2026 aktif
  const [B24,setB24]=useState("");
  const [B25,setB25]=useState("");
  const [FB,setFB]=useState("Jan");
  const [LD,setLD]=useState("");
  const [E,setE]=useState("");

  useEffect(()=>{ (async()=>{
    try{
      /* ===== LPH (gabung LSID lama + LAID Agustus) — loop semua gid, PARALLEL ===== */
      const allLP={};
      await Promise.all([...LG.map(async gid=>{
        const csv=await fetchCSV(LSID,gid); const r=parseLPH(csv);
        if(r && !allLP[r.tg]) allLP[r.tg]=r;
      }), (async()=>{
        // LPH Agustus: scan beberapa gid (0 = 01.08; mungkin tambah tab 02.08 dst)
        for(const gid of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,100000000,200000000,300000000,400000000,500000000]){
          const csv=await fetchCSV(LAID,gid); const r=parseLPH(csv);
          if(r && !allLP[r.tg]) allLP[r.tg]=r;
        }
      })()]);
      setLP(allLP);

      /* ===== 2026 penjualan harian (semua bulan yang ada gid-nya) — PARALLEL ===== */
      const a26={};
      await Promise.all(Object.entries(M26).map(async ([bln,gid])=>{
        const csv=await fetchCSV(S26,gid); const ps=parseHarian(csv,false);
        if(ps.length>0) a26[bln]=ps;
      }));
      setP(a26);

      /* ===== 2024 & 2025 (bulan Des utk total setahun; + semua bulan utk line chart) — PARALLEL ===== */
      const a24={}, a25={};
      await Promise.all([
        ...Object.entries(G24).map(async ([bln,gid])=>{
          const csv=await fetchCSV(S24,gid); const ps=parseHarian(csv,true);
          if(ps.length>0) a24[bln]=ps;
        }),
        ...Object.entries(G25).map(async ([bln,gid])=>{
          const csv=await fetchCSV(S25,gid); const ps=parseHarian(csv,false);
          if(ps.length>0) a25[bln]=ps;
        }),
      ]);
      setP24(a24); setP25(a25);

      /* ===== Faktur ===== */
      const sf={};
      await Promise.all(FM.map(async m=>{
        const csv=await fetchCSV(FSID,m.g);
        const ll=csv.split(NL).filter(l=>l.trim()).slice(4);
        const ps=ll.filter(r=>{const c=r.split(",");return c[0]&&DN.test(c[0].replace(/"/g,""));})
          .map(r=>{const c=r.split(",");return{no:c[0].replace(/"/g,""),pbf:(c[1]||"").replace(/"/g,""),jml:p(c[2]),sb:(c[5]||"").replace(/"/g,"").trim().toUpperCase()==="TRUE"};});
        if(ps.length>0) sf[m.l]=ps;
      }));
      setF(sf);

      /* ===== Set default ===== */
      const kb=Object.keys(a26); if(kb.length) setBA(kb[kb.length-1]);
      const k24=Object.keys(a24); if(k24.length) setB24(k24[k24.length-1]);
      const k25=Object.keys(a25); if(k25.length) setB25(k25[k25.length-1]);
      const ds=Object.keys(allLP).sort(); if(ds.length) setLD(ds[ds.length-1]);
    }catch(e){ setE("Err: "+(e.message||e)); }
    setL(false);
  })();},[]);

  /* kartu & tabel */
  const pj=BA?(P[BA]||[]):[]; const ttP=pj.reduce((s,d)=>s+d.tt,0); const tkP=pj.reduce((s,d)=>s+d.kj,0);
  const p24=B24?(P24[B24]||[]):[]; const tt24=p24.reduce((s,d)=>s+d.tt,0); const tk24=p24.reduce((s,d)=>s+d.kj,0);
  const p25=B25?(P25[B25]||[]):[]; const tt25=p25.reduce((s,d)=>s+d.tt,0); const tk25=p25.reduce((s,d)=>s+d.kj,0);
  const fkl=Object.keys(F); const fk=FB?(F[FB]||[]):[];
  const lds=Object.keys(LP).sort((a,b)=>{const[d1,m1,y1]=a.split("/");const[d2,m2,y2]=b.split("/");return new Date(y1,m1-1,d1)-new Date(y2,m2-1,d2);});
  const lp=LD?LP[LD]:null;

  /* data line chart: gabung per bulan untuk 2024/2025/2026 */
  function bulanTotal(obj,yr){ const m={}; for(const [b,rows] of Object.entries(obj)){ m[b]=rows.reduce((s,d)=>s+d.tt,0);} return m; }
  const T24=bulanTotal(P24), T25=bulanTotal(P25), T26=bulanTotal(P);
  const lineData=ORDER.map(b=>({b, 2024:T24[b]||0, 2025:T25[b]||0, 2026:T26[b]||0}));
  const lineKunj=ORDER.map(b=>({
    b,
    2024:(P24[b]||[]).reduce((s,d)=>s+d.kj,0),
    2025:(P25[b]||[]).reduce((s,d)=>s+d.kj,0),
    2026:(P[b]||[]).reduce((s,d)=>s+d.kj,0),
  }));

  if(L) return (
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1e40af 100%)",gap:16}}>
      <div style={{width:48,height:48,border:"4px solid rgba(255,255,255,.2)",borderTop:"4px solid #60a5fa",borderRadius:"50%",animation:"spin 1s linear infinite"}}></div>
      <p style={{color:"rgba(255,255,255,.7)",fontSize:14}}>Memuat data...</p>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
  if(E) return <div style={{padding:32,color:"#dc2626",fontFamily:"sans-serif"}}>{E}</div>;

  const bs=(a,k)=>({padding:"6px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:13,background:a===k?"#3b82f6":"white",color:a===k?"white":"#374151",borderColor:a===k?"#3b82f6":"#d1d5db",outline:"none",fontWeight:a===k?600:400});

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#1e40af 60%,#2563eb 100%)",fontFamily:"system-ui,sans-serif"}}>
      <style>{"@media print{body *{visibility:hidden!important}#lp,#lp *{visibility:visible!important}#lp{position:absolute;left:0;top:0;width:100%;padding:8px 12px;font-size:7px;max-width:210mm;box-sizing:border-box}@page{margin:6mm 8mm;size:A4 landscape}}"}</style>
      <div style={{background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",color:"white",padding:"20px 24px"}}>
        <h1 style={{fontSize:22,fontWeight:"bold",margin:0}}>Apotek Bali Bagas Medika</h1>
        <p style={{fontSize:13,opacity:.7,margin:"4px 0 0"}}>Dashboard Monitoring</p>
      </div>
      <div style={{display:"flex",background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid #e5e7eb",paddingLeft:16,flexWrap:"wrap"}}>
        {[{k:"p",l:"Penjualan"},{k:"d",l:"Diagram"},{k:"l",l:"LPH"},{k:"f",l:"Faktur"}].map(t=>(
          <button key={t.k} onClick={()=>setT(t.k)} style={{padding:"12px 20px",border:"none",background:"transparent",cursor:"pointer",borderBottom:T===t.k?"2px solid #2563eb":"2px solid transparent",color:T===t.k?"#2563eb":"#6b7280",fontWeight:T===t.k?600:400,fontSize:14,outline:"none"}}>{t.l}</button>
        ))}
      </div>

      <div style={{padding:16,maxWidth:1200,margin:"0 auto"}}>

      {/* ============ PENJUALAN ============ */}
      {T==="p"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2026:</span>
          <select value={BA} onChange={e=>setBA(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
            {Object.keys(P).map(b=><option key={b} value={b}>{b+" 2026"}</option>)}
          </select>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2025:</span>
          <select value={B25} onChange={e=>setB25(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
            {Object.keys(P25).map(b=><option key={b} value={b}>{b+" 2025"}</option>)}
          </select>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>2024:</span>
          <select value={B24} onChange={e=>setB24(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
            {Object.keys(P24).map(b=><option key={b} value={b}>{b+" 2024"}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
          <K label={"2026 "+BA} v={fr(ttP)} c="#f59e0b"/>
          <K label={"2025 "+B25} v={fr(tt25)} c="#3b82f6"/>
          <K label={"2024 "+B24} v={fr(tt24)} c="#10b981"/>
          <K label="Kunjungan 2026" v={tkP.toLocaleString("id-ID")} c="#8b5cf6"/>
        </div>
        <Tabel title={"Penjualan Harian 2026 - "+BA} data={[...pj].reverse()} cols={["t","tt","kj"]} fmt={(k,v)=>k==="tt"?fr(v):String(v)}/>
        {B24&&<Tabel title={"Penjualan Harian 2024 - "+B24} data={[...p24].reverse()} cols={["t","tt","kj"]} fmt={(k,v)=>k==="tt"?fr(v):String(v)}/>}
        {B25&&<Tabel title={"Penjualan Harian 2025 - "+B25} data={[...p25].reverse()} cols={["t","tt","kj"]} fmt={(k,v)=>k==="tt"?fr(v):String(v)}/>}
      </div>}

      {/* ============ DIAGRAM LINE ============ */}
      {T==="d"&&<div>
        <div style={{background:"white",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Omzet Bulanan (Line) — 2024 vs 2025 vs 2026</div>
          <div style={{padding:16}}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={lineData} margin={{top:8,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="b" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}} tickFormatter={(v)=>(v/1e6).toFixed(0)+"jt"}/>
                <Tooltip formatter={(v,n)=>["Rp "+v.toLocaleString("id-ID"),n]}/>
                <Legend/>
                <Line type="monotone" dataKey="2024" stroke={WT[2024]} strokeWidth={2.5} dot={{r:3}} name="2024"/>
                <Line type="monotone" dataKey="2025" stroke={WT[2025]} strokeWidth={2.5} dot={{r:3}} name="2025"/>
                <Line type="monotone" dataKey="2026" stroke={WT[2026]} strokeWidth={3} dot={{r:4}} name="2026"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{background:"white",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Kunjungan Bulanan (Line) — 2024 vs 2025 vs 2026</div>
          <div style={{padding:16}}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineKunj} margin={{top:8,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="b" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="2024" stroke={WT[2024]} strokeWidth={2.5} dot={{r:3}} name="2024"/>
                <Line type="monotone" dataKey="2025" stroke={WT[2025]} strokeWidth={2.5} dot={{r:3}} name="2025"/>
                <Line type="monotone" dataKey="2026" stroke={WT[2026]} strokeWidth={3} dot={{r:4}} name="2026"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {[2024,2025,2026].map(y=>{const tot=Object.values(y===2024?P24:y===2025?P25:P).flat().reduce((s,d)=>s+d.tt,0);return <K key={y} label={"Total "+y} v={fr(tot)} c={WT[y]}/>;})}
        </div>
      </div>}

      {/* ============ LPH ============ */}
      {T==="l"&&<div>
        {lds.length>0&&<div style={{marginBottom:16}}>
          <label style={{fontSize:12,color:"rgba(255,255,255,.7)",display:"block",marginBottom:6}}>Pilih Tanggal:</label>
          <select value={LD} onChange={e=>setLD(e.target.value)} style={{padding:"10px 16px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,maxWidth:300,background:"white",cursor:"pointer"}}>
            {lds.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>}
        {lp&&<div>
          <div style={{textAlign:"right",marginBottom:12}}><button onClick={()=>window.print()} style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"white",border:"none",padding:"8px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>🖨 Cetak</button></div>
          <div id="lp" style={{background:"white",padding:"10px",borderRadius:8}}>
            <div style={{textAlign:"center",marginBottom:6}}>
              <h2 style={{fontSize:12,fontWeight:"bold",margin:0}}>LAPORAN PENJUALAN HARIAN (LPH)</h2>
              <p style={{fontSize:9,margin:"1px 0"}}>APOTEK BALI BAGAS MEDIKA (BBM)</p>
              <p style={{fontSize:9,fontWeight:"bold",margin:"3px 0 0"}}>TANGGAL : {lp.tg}</p>
            </div>
            <table style={{width:"100%",fontSize:8,borderCollapse:"collapse",border:"1px solid #000"}}>
              <thead><tr style={{background:"#e5e7eb"}}>
                <th style={{border:"1px solid #000",padding:"2px 4px"}}>URAIAN</th>
                <th style={{border:"1px solid #000",padding:"2px 4px"}}>PAGI</th>
                <th style={{border:"1px solid #000",padding:"2px 4px"}}>SIANG</th>
                <th style={{border:"1px solid #000",padding:"2px 4px"}}>TOTAL</th>
              </tr></thead>
              <tbody>{lp.rr.map((r,i)=>(
                <tr key={i} style={{background:i%2===0?"white":"#f9fafb"}}>
                  <td style={{border:"1px solid #000",padding:"2px 4px"}}>{r.u}</td>
                  <td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.p}</td>
                  <td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right"}}>{r.s}</td>
                  <td style={{border:"1px solid #000",padding:"2px 4px",textAlign:"right",fontWeight:"bold"}}>{r.t}</td>
                </tr>))}</tbody>
            </table>
          </div>
        </div>}
        {!lp&&<div style={{padding:32,textAlign:"center",color:"rgba(255,255,255,.5)"}}>Pilih tanggal</div>}
      </div>}

      {/* ============ FAKTUR ============ */}
      {T==="f"&&<div>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {fkl.map(b=><button key={b} onClick={()=>setFB(b)} style={bs(FB,b)}>{b}</button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
          <K label={"Faktur "+FB} v={fk.length+" faktur"} c="#3b82f6"/>
          <K label="Lunas" v={fk.filter(d=>d.sb).length+" faktur"} c="#10b981"/>
          <K label="Belum" v={fk.filter(d=>!d.sb).length+" faktur"} c="#ef4444"/>
          <K label="Nilai" v={fr(fk.reduce((s,d)=>s+d.jml,0))} c="#8b5cf6"/>
        </div>
        <Tabel title={"Faktur "+FB} data={fk.slice(0,60)} cols={["no","pbf","jml"]} fmt={(k,v)=>k==="jml"?fr(v):String(v)}
          rowBg={(d)=>d.sb?"#f0fdf4":"#fef2f2"}
          extraCol={(d)=><td style={{padding:"8px 12px",textAlign:"center"}}><span style={{padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:500,background:d.sb?"#dcfce7":"#fee2e2",color:d.sb?"#16a34a":"#dc2626"}}>{d.sb?"LUNAS":"BELUM"}</span></td>}/>
      </div>}

      </div>
    </div>
  );
}

/* ============ KOMPONEN ============ */
function K({label,v,color:c}){return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.08)",border:"1px solid rgba(255,255,255,.6)"}}><p style={{fontSize:11,color:"#9ca3af",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:.5}}>{label}</p><p style={{fontSize:22,fontWeight:"bold",margin:0,color:c||"#111827"}}>{v}</p></div>;}

function Tabel({title,data,cols,rowBg,fmt,extraCol:xc}){
  return(
  <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,border:"1px solid rgba(255,255,255,.6)",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.08)",marginBottom:20}}>
    <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>{title}</div>
    <div style={{maxHeight:420,overflow:"auto"}}>
      <table style={{width:"100%",fontSize:13,borderCollapse:"collapse"}}>
        <thead style={{background:"#f1f5f9",position:"sticky",top:0}}><tr>
          {cols.map(c=><th key={c} style={{textAlign:"left",padding:"10px 12px",borderBottom:"1px solid #e5e7eb",fontSize:12,color:"#475569"}}>{c==="t"?"Tanggal":c==="tt"?"Omzet":c==="kj"?"Kunj":c==="jml"?"Jumlah":c}</th>)}
          {xc&&<th style={{textAlign:"center",padding:"10px 12px",borderBottom:"1px solid #e5e7eb",fontSize:12,color:"#475569"}}>Status</th>}
        </tr></thead>
        <tbody>{data.map((d,i)=>{const bg=rowBg?rowBg(d):i%2===0?"white":"#f8fafc";return(
          <tr key={i} style={{background:bg}}>
            {cols.map(c=><td key={c} style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9",textAlign:c==="tt"||c==="jml"?"right":"left"}}>{fmt?fmt(c,d[c]):d[c]}</td>)}
            {xc&&xc(d)}
          </tr>);})}</tbody>
      </table>
    </div>
  </div>);
}
