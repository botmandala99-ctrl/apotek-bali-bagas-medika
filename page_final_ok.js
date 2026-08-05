"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

/* ============ KONFIGURASI SHEET ============ */
const S26 = "12ifCX85urqUxt67Ad5xr26ffzGxvGNz5FFZT38oKZM8"; // Admin Penjualan 2026
const S25 = "1hf-QOppWoC4oxzVIfluS82y8ZIRLv5AMP7ghpLRHeeE";
const S24 = "1X8sU5TbwIFrfva-Hv3lJwKmNWBAXlF4wKWLq4TUkXkY";
const FSID = "1f0xEiBz5Mzu79zxks1Ew0lfAdwQu-7VKvKxaUcz3VzU"; // Faktur
const LAID = "1KiBThvKts3dOCLkRH2kdcyoI6seyP2AmMFi_ADh76Wc"; // LPH Agustus (FIX: huruf T besar — sebelumnya t kecil -> 404)

/* gid per bulan 2026 (Admin Penjualan) */
const M26 = {
  Jan:0, Feb:1981407338, Mar:1445967367, Apr:1565950911,
  Mei:2013738206, Jun:163552086, Jul:1190948522,
  // Agu: <gid Agustus harian — belum dikonfirmasi>
  // Sep, Okt: kosong
};
/* gid per bulan 2024 & 2025 (untuk diagram 3 tahun) */
const G24 = { Jan:0,Feb:1462383099,Mar:907772167,Apr:232891112,Mei:282938849,Jun:731458776,Jul:1406355561,Agu:1803306864,Sep:1496176196,Okt:1600880255,Nov:139141189,Des:1094972947 };
const G25 = { Jan:0,Feb:200361189,Mar:948223844,Apr:1168220512,Mei:1057815698,Jun:278075545,Jul:10910240,Agu:1341963010,Sep:2067058499,Okt:null,Nop:126222887,Des:1387254622 };
/* Faktur per bulan (urut Jan-Des) */
const FM = [{g:0,l:"Jan"},{g:914339812,l:"Feb"},{g:1942627049,l:"Mar"},{g:85697732,l:"Apr"},{g:452486501,l:"Mei"}];
const WT = {2024:"#10b981",2025:"#3b82f6",2026:"#f59e0b"};
const ORDER = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

/* ============ HELPERS ============ */
const NL = "\n"; // newline asli (KRITIS: jangan String.fromCharCode)
const DR = /^\d{2}\/\d{2}\/\d{4}$/;
const DN = /^\d+$/;
function p(v){ const n=parseInt(String(v||"0").replace(/[Rp\s,."]/g,""),10); return isNaN(n)?0:n; }
function fr(n){ return typeof n==="number"?("Rp "+n.toLocaleString("id-ID")):"-"; }
function fmtRibuan(n){ return typeof n==="number"?n.toLocaleString("id-ID"):String(n); }
async function fetchCSV(sid,gid){
  try{
    const key="gsc_"+sid+"_"+gid;
    const url="/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+sid+"/export?format=csv&gid="+gid);
    // cache lokal 5 menit biar buka ulang cepet
    try{
      const c=localStorage.getItem(key);
      if(c){ const j=JSON.parse(c); if(Date.now()-j.t<5*60*1000) return j.v; }
    }catch(e){}
    const r=await fetch(url,{cache:"no-store"});
    if(!r.ok) return "";
    const t=await r.text();
    try{ localStorage.setItem(key,JSON.stringify({v:t,t:Date.now()})); }catch(e){}
    return t;
  }catch(e){ return ""; }
}
/* Parse penjualan harian — auto-detect posisi kolom TOTAL & KUNJUNGAN dari header.
   Robust buat format 4/5/11/14 kolom (2024 beda-beda, 2025/2026 konsisten 11). */
function parseHarian(csv){
  const out=[];
  const ll=csv.split(NL).filter(l=>l.trim());
  // cari baris header yg mulai 'TANGGAL' -> posisi kolom TOTAL & KUNJUNGAN
  let hi=-1, totI=9, kunI=10;
  for(let i=0;i<ll.length&&i<10;i++){
    if(ll[i].trim().toUpperCase().startsWith("TANGGAL")){ hi=i; break; }
  }
  if(hi>=0){
    const H=ll[hi].split(",").map(x=>x.replace(/"/g,"").trim().toUpperCase());
    const trov=H.indexOf("TOTAL"); if(trov>=0) totI=trov;
    const krov=H.indexOf("KUNJUNGAN"); if(krov>=0) kunI=krov;
  }
  const dataRows=ll.slice(hi+1);
  for(const l of dataRows){
    const c=l.split(",").map(x=>x.replace(/"/g,"").trim());
    const tgl=c[0];
    if(!DR.test(tgl)) continue;
    const tt=p(c[totI]); const kj=p(c[kunI]);
    if(tt>0||kj>0) out.push({t:tgl,tt,kj,c});
  }
  return out;
}
/* Parse LPH: tanggal + baris uraian (format konsisten antar bulan) */
function parseLPH(csv){
  const ll=csv.split(NL).filter(l=>l.trim());
  const tg=(ll[2]||"").split(",")[3]?.replace(/"/g,"")?.trim();
  if(!tg) return null;
  let d=tg; if(d.indexOf(".")>=0) d=d.split(".").join("/");
  const rr=[];
  const LU=["TARGET SHIFT","OMZET","% PENCAPAIN","% PENCAPAIAN","GAP VS TARGET","CASH","DEBIT MANDIRI","DEBIT QRIS","GRAB MERC","NOTA","FAKTUR","SETORAN","KUNJUNGAN"];
  for(const l of ll){
    const c=l.split(",").map(x=>x.replace(/"/g,"").trim());
    const u=c[0]?.toUpperCase().trim()||"";
    if(LU.some(v=>u===v||u.startsWith(v))) rr.push({u:c[0],p:c[1]||"-",s:c[2]||"-",t:c[3]||"-"});
  }
  return {tg:d,rr};
}

export default function Home(){
  const [L,setL]=useState(true);
  const [P,setP]=useState({});      // 2026
  const [D,setD]=useState({2024:{},2025:{},2026:{}}); // utk diagram (total per bulan)
  const [F,setF]=useState({});
  const [LP,setLP]=useState({});    // LPH
  const [T,setT]=useState("p");
  const [BA,setBA]=useState("");
  const [FB,setFB]=useState("Jan");
  const [LD,setLD]=useState("");
  const [E,setE]=useState("");

  useEffect(()=>{ (async()=>{
    try{
      /* LPH: Agustus doang (LAID) — scan gid umum, tiap gid = 1 tanggal */
      const allLP={};
      await Promise.all([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,100000000,200000000,300000000,400000000,500000000].map(async gid=>{
        const csv=await fetchCSV(LAID,gid); const r=parseLPH(csv);
        if(r && !allLP[r.tg]) allLP[r.tg]=r;
      }));
      setLP(allLP);

      /* 2026 penjualan harian (bulan yang ada gid-nya) */
      const a26={};
      await Promise.all(Object.entries(M26).filter(([,gid])=>gid!=null).map(async ([bln,gid])=>{
        const ps=parseHarian(await fetchCSV(S26,gid));
        if(ps.length>0) a26[bln]=ps;
      }));
      setP(a26);

      /* 2024 & 2025 — total omzet+kunjungan per bulan utk diagram */
      const d={2024:{},2025:{},2026:{}};
      await Promise.all([
        ...Object.entries(G24).filter(([,g])=>g!=null).map(async ([bln,gid])=>{
          const ps=parseHarian(await fetchCSV(S24,gid));
          if(ps.length>0){ d[2024][bln]=ps.reduce((s,x)=>s+x.tt,0) }
        }),
        ...Object.entries(G25).filter(([,g])=>g!=null).map(async ([bln,gid])=>{
          const ps=parseHarian(await fetchCSV(S25,gid));
          if(ps.length>0){ d[2025][bln]=ps.reduce((s,x)=>s+x.tt,0) }
        }),
      ]);
      for(const [bln,rows] of Object.entries(a26)) d[2026][bln]=rows.reduce((s,x)=>s+x.tt,0);
      // simpan juga kunjungan utk diagram
      const kj={2024:{},2025:{},2026:{}};
      await Promise.all([
        ...Object.entries(G24).filter(([,g])=>g!=null).map(async ([bln,gid])=>{
          const ps=parseHarian(await fetchCSV(S24,gid));
          if(ps.length>0) kj[2024][bln]=ps.reduce((s,x)=>s+x.kj,0);
        }),
        ...Object.entries(G25).filter(([,g])=>g!=null).map(async ([bln,gid])=>{
          const ps=parseHarian(await fetchCSV(S25,gid));
          if(ps.length>0) kj[2025][bln]=ps.reduce((s,x)=>s+x.kj,0);
        }),
      ]);
      for(const [bln,rows] of Object.entries(a26)) kj[2026][bln]=rows.reduce((s,x)=>s+x.kj,0);
      setD({om:d,kj});

      /* Faktur */
      const sf={};
      await Promise.all(FM.map(async m=>{
        const csv=await fetchCSV(FSID,m.g);
        const ll=csv.split(NL).filter(l=>l.trim()).slice(4);
        const ps=ll.filter(r=>{const c=r.split(",");return c[0]&&DN.test(c[0].replace(/"/g,""));})
          .map(r=>{const c=r.split(",");return{no:c[0].replace(/"/g,""),pbf:(c[1]||"").replace(/"/g,""),jml:p(c[2]),sb:(c[5]||"").replace(/"/g,"").trim().toUpperCase()==="TRUE"};});
        if(ps.length>0) sf[m.l]=ps;
      }));
      setF(sf);

      const kb=ORDER.filter(b=>a26[b]); if(kb.length) setBA(kb[kb.length-1]);
      const ds=Object.keys(allLP).sort((a,b)=>{const[d1,m1,y1]=a.split("/");const[d2,m2,y2]=b.split("/");return new Date(y1,m1-1,d1)-new Date(y2,m2-1,d2);});
      if(ds.length) setLD(ds[ds.length-1]);
    }catch(e){ setE("Err: "+(e.message||e)); }
    setL(false);
  })();},[]);

  /* tab penjualan 2026 */
  const pj=BA?(P[BA]||[]):[]; const ttP=pj.reduce((s,d)=>s+d.tt,0); const tkP=pj.reduce((s,d)=>s+d.kj,0);
  const smt=Object.values(P).flat().reduce((s,d)=>s+d.tt,0);
  const fkl=Object.keys(F); const fk=FB?(F[FB]||[]):[];
  const lds=Object.keys(LP).sort((a,b)=>{const[d1,m1,y1]=a.split("/");const[d2,m2,y2]=b.split("/");return new Date(y1,m1-1,d1)-new Date(y2,m2-1,d2);});
  const lp=LD?LP[LD]:null;

  /* data line chart 3 tahun */
  const lineData=ORDER.map(b=>({b, 2024:D.om?.[2024]?.[b]||0, 2025:D.om?.[2025]?.[b]||0, 2026:D.om?.[2026]?.[b]||0}));
  const lineDataKj=ORDER.map(b=>({b, 2024:D.kj?.[2024]?.[b]||0, 2025:D.kj?.[2025]?.[b]||0, 2026:D.kj?.[2026]?.[b]||0}));

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
      <style>{"@media print{body *{visibility:hidden!important}#lp,#lp *{visibility:visible!important}#lp{position:absolute;left:0;top:0;width:100%;padding:8px 12px;font-size:8px;box-sizing:border-box}@page{margin:10mm;size:A4 portrait}}"}</style>
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

      {/* ============ PENJUALAN (2026, kolom detail) ============ */}
      {T==="p"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:500}}>Bulan 2026:</span>
          <select value={BA} onChange={e=>setBA(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
            {ORDER.filter(b=>P[b]).map(b=><option key={b} value={b}>{b} 2026</option>)}
          </select>
          <span style={{color:"rgba(255,255,255,.6)",fontSize:11}}>Total 2026: {fr(smt)}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
          <K label={"Omzet "+BA} v={fr(ttP)} c="#f59e0b"/>
          <K label="Kunjungan" v={fmtRibuan(tkP)} c="#8b5cf6"/>
          <K label="Total 2026" v={fr(smt)} c="#3b82f6"/>
        </div>
        {/* tabel detail: 11 kolom */}
        <TabelDetail rows={pj}/>
      </div>}

      {/* ============ DIAGRAM LINE 3 TAHUN ============ */}
      {T==="d"&&<div>
        <div style={{background:"white",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Omzet Bulanan — 2024 vs 2025 vs 2026</div>
          <div style={{padding:16}}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={lineData} margin={{top:8,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="b" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}} tickFormatter={(v)=>(v/1e6).toFixed(0)+"jt"}/>
                <Tooltip formatter={(v,n)=>["Rp "+Number(v).toLocaleString("id-ID"),n]}/>
                <Legend/>
                <Line type="monotone" dataKey="2024" stroke={WT[2024]} strokeWidth={2.5} dot={{r:3}} name="2024"/>
                <Line type="monotone" dataKey="2025" stroke={WT[2025]} strokeWidth={2.5} dot={{r:3}} name="2025"/>
                <Line type="monotone" dataKey="2026" stroke={WT[2026]} strokeWidth={3} dot={{r:4}} name="2026"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {[2024,2025,2026].map(y=>{const tot=Object.values(D.om?.[y]||{}).reduce((s,v)=>s+(v||0),0);return <K key={y} label={"Total Omzet "+y} v={fr(tot)} c={WT[y]}/>;})}
        </div>

        {/* CHART KUNJUNGAN */}
        <div style={{background:"white",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",marginTop:20}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Kunjungan Bulanan — 2024 vs 2025 vs 2026</div>
          <div style={{padding:16}}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineDataKj} margin={{top:8,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="b" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip formatter={(v,n)=>[String(v)+" kunjungan",n]}/>
                <Legend/>
                <Line type="monotone" dataKey="2024" stroke={WT[2024]} strokeWidth={2.5} dot={{r:3}} name="2024"/>
                <Line type="monotone" dataKey="2025" stroke={WT[2025]} strokeWidth={2.5} dot={{r:3}} name="2025"/>
                <Line type="monotone" dataKey="2026" stroke={WT[2026]} strokeWidth={3} dot={{r:4}} name="2026"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>}

      {/* ============ LPH (Agustus) ============ */}
      {T==="l"&&<div>
        {lds.length>0&&<div style={{marginBottom:16}}>
          <label style={{fontSize:12,color:"rgba(255,255,255,.7)",display:"block",marginBottom:6}}>Pilih Tanggal:</label>
          <select value={LD} onChange={e=>setLD(e.target.value)} style={{padding:"10px 16px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,maxWidth:300,background:"white",cursor:"pointer"}}>
            {lds.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>}
        {lp&&<div>
          <div style={{textAlign:"right",marginBottom:12}}><button onClick={()=>window.print()} style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"white",border:"none",padding:"8px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>🖨 Cetak</button></div>
          <div id="lp" style={{background:"white",padding:"12px",borderRadius:8}}>
            <div style={{textAlign:"center",marginBottom:6}}>
              <h2 style={{fontSize:12,fontWeight:"bold",margin:0}}>LAPORAN PENJUALAN HARIAN (LPH)</h2>
              <p style={{fontSize:9,margin:"1px 0"}}>APOTEK BALI BAGAS MEDIKA (BBM)</p>
              <p style={{fontSize:9,fontWeight:"bold",margin:"3px 0 0"}}>TANGGAL : {lp.tg}</p>
            </div>
            <table style={{width:"100%",fontSize:9,borderCollapse:"collapse",border:"1px solid #000"}}>
              <thead><tr style={{background:"#e5e7eb"}}>
                <th style={{border:"1px solid #000",padding:"4px 6px",textAlign:"left"}}>URAIAN</th>
                <th style={{border:"1px solid #000",padding:"4px 6px"}}>PAGI</th>
                <th style={{border:"1px solid #000",padding:"4px 6px"}}>SIANG</th>
                <th style={{border:"1px solid #000",padding:"4px 6px"}}>TOTAL</th>
              </tr></thead>
              <tbody>{lp.rr.map((r,i)=>{
                const u=r.u.toUpperCase();
                const isPct=utfric(u,"PENCAPAIAN","%");
                return (
                <tr key={i} style={{background:i%2===0?"white":"#f9fafb"}}>
                  <td style={{border:"1px solid #000",padding:"3px 6px",fontWeight:(u.includes("TARGET")||u.includes("GAP"))?700:400}}>{r.u}</td>
                  <td style={{border:"1px solid #000",padding:"3px 6px",textAlign:"right"}}>{formatCell(r.p,isPct)}</td>
                  <td style={{border:"1px solid #000",padding:"3px 6px",textAlign:"right"}}>{formatCell(r.s,isPct)}</td>
                  <td style={{border:"1px solid #000",padding:"3px 6px",textAlign:"right",fontWeight:"bold"}}>{formatCell(r.t,isPct)}</td>
                </tr>);})}</tbody>
            </table>
          </div>
        </div>}
        {!lp&&<div style={{padding:32,textAlign:"center",background:"rgba(220,38,38,.12)",border:"1px solid #fca5a5",borderRadius:10}}><p style={{color:"#fecaca",margin:0,fontWeight:600}}>Data LPH Agustus belum muncul</p><p style={{color:"rgba(254,202,202,.7)",fontSize:13,margin:"6px 0 0"}}>Spreadsheet LPH Agustus belum bisa diakses: masih private, URL-nya salah, atau belum diisi.<br/>Tolong pastikan spreadsheet LPH Agustus di-share publik (Share → “Anyone with link” → Viewer) lalu kasih link yang benar ke admin.</p></div>}
      </div>}

      {/* ============ FAKTUR (urut Jan-Des) ============ */}
      {T==="f"&&<div>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {fkl.sort((a,b)=>ORDER.indexOf(a)-ORDER.indexOf(b)).map(b=><button key={b} onClick={()=>setFB(b)} style={bs(FB,b)}>{b}</button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
          <K label={"Faktur "+FB} v={fk.length+" faktur"} c="#3b82f6"/>
          <K label="Lunas" v={fk.filter(d=>d.sb).length+" faktur"} c="#10b981"/>
          <K label="Belum" v={fk.filter(d=>!d.sb).length+" faktur"} c="#ef4444"/>
          <K label="Nilai" v={fr(fk.reduce((s,d)=>s+d.jml,0))} c="#8b5cf6"/>
        </div>
        <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,border:"1px solid rgba(255,255,255,.6)",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.08)"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Faktur {FB}</div>
          <div style={{maxHeight:420,overflow:"auto"}}>
            <table style={{width:"100%",fontSize:13,borderCollapse:"collapse"}}>
              <thead style={{background:"#f1f5f9",position:"sticky",top:0}}><tr>
                <th style={{textAlign:"left",padding:"10px 12px",fontSize:12,color:"#475569"}}>No</th>
                <th style={{textAlign:"left",padding:"10px 12px",fontSize:12,color:"#475569"}}>PBF</th>
                <th style={{textAlign:"right",padding:"10px 12px",fontSize:12,color:"#475569"}}>Jumlah</th>
                <th style={{textAlign:"center",padding:"10px 12px",fontSize:12,color:"#475569"}}>Status</th>
              </tr></thead>
              <tbody>{fk.slice(0,80).map((d,i)=>(
                <tr key={i} style={{background:d.sb?"#f0fdf4":"#fef2f2"}}>
                  <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9"}}>{d.no}</td>
                  <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9"}}>{d.pbf}</td>
                  <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9",textAlign:"right"}}>{fr(d.jml)}</td>
                  <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9",textAlign:"center"}}><span style={{padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:500,background:d.sb?"#dcfce7":"#fee2e2",color:d.sb?"#16a34a":"#dc2626"}}>{d.sb?"LUNAS":"BELUM"}</span></td>
                </tr>))}</tbody>
            </table>
          </div>
        </div>
      </div>}

      </div>
    </div>
  );
}

function utfric(s,...kws){return kws.some(k=>s.includes(k));}
function formatCell(v,isPct){
  if(isPct){
    // ambil angka pertama, tambah %
    const m=String(v).match(/(\d+[.,]?\d*)/);
    return m ? (m[1].replace(",",".")+"%") : v;
  }
  // angka rupiah -> format
  const n=p(v);
  return n>0 ? "Rp "+n.toLocaleString("id-ID") : v;
}

function K({label,v,color:c}){return <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.08)",border:"1px solid rgba(255,255,255,.6)"}}><p style={{fontSize:11,color:"#9ca3af",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:.5}}>{label}</p><p style={{fontSize:22,fontWeight:"bold",margin:0,color:c||"#111827"}}>{v}</p></div>;}

/* Tabel detail penjualan 2026: Cash/Debit/Qris Pagi-Sore + Total + K */
function TabelDetail({rows}){
  const H=["Tanggal","Cash Pagi","Debit Pagi","Qris Pagi","Jml Pagi","Cash Sore","Debit Sore","Qris Sore","Jml Sore","Total","Kunj"];
  return (
  <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(10px)",borderRadius:12,border:"1px solid rgba(255,255,255,.6)",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.08)",marginBottom:20}}>
    <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontSize:14,fontWeight:600,color:"#374151"}}>Penjualan Harian (Detail)</div>
    <div style={{maxHeight:460,overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,border:"1px solid #e5e7eb"}}>
        <thead style={{background:"#f1f5f9",position:"sticky",top:0}}><tr>
          {H.map((h,i)=><th key={i} style={{textAlign:i>0&&i<H.length-1?"right":(i===H.length-1?"center":"left"),padding:"8px 10px",border:"1px solid #d1d5db",borderBottom:"1px solid #cbd5e1",fontSize:11,color:"#475569",whiteSpace:"nowrap"}}>{h}</th>)}
        </tr></thead>
        <tbody>{[...rows].reverse().map((d,i)=>(
          <tr key={i} style={{background:i%2===0?"white":"#f8fafc"}}>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",whiteSpace:"nowrap"}}>{d.t}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right"}}>{frVal(d.c[1])}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right"}}>{frVal(d.c[2])}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right"}}>{frVal(d.c[3])}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right",fontWeight:600}}>{frVal(d.c[4])}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right"}}>{frVal(d.c[5])}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right"}}>{frVal(d.c[6])}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right"}}>{frVal(d.c[7])}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right",fontWeight:600}}>{frVal(d.c[8])}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"right",fontWeight:700}}>{frVal(d.tt)}</td>
            <td style={{padding:"6px 10px",border:"1px solid #e5e7eb",textAlign:"center"}}>{fmtRibuan(d.kj)}</td>
          </tr>))}</tbody>
      </table>
    </div>
  </div>);
}
function frVal(v){ const n=p(v); return n>0?("Rp "+n.toLocaleString("id-ID")):"-"; }
