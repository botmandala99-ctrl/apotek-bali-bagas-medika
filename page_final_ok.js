"use client";
import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

/* ================= KONFIGURASI ================= */
const S26 = "12ifCX85urqUxt67Ad5xr26ffzGxvGNz5FFZT38oKZM8"; // Admin Penjualan 2026 (utama)
const REKAP_GID = 471302708;                                  // tab Rekap = sumber 2024/2025/2026
const FSID = "1f0xEiBz5Mzu79zxks1Ew0lfAdwQu-7VKvKxaUcz3VzU"; // Faktur
const LPH_DEFAULT = "1KiBThvKts3dOCLkRH2kdcyoI6seyP2AmMFi_ADh76Wc"; // LPH

/* gid tab harian 2026 (Jan-Jul). Agustus & seterusnya bisa ditambah, atau pakai Rekap. */
const HARIAN = {
  Jan:0, Feb:1981407338, Mar:1445967367, Apr:1565950911,
  Mei:2013738206, Jun:163552086, Jul:1190948522
};
/* Faktur per bulan (gid diketahui). Jun-Agu bisa ditambah via SETUP. */
const FAKTUR = [
  {g:0,l:"Jan"},{g:914339812,l:"Feb"},{g:1942627049,l:"Mar"},
  {g:85697732,l:"Apr"},{g:452486501,l:"Mei"},{g:1375533550,l:"Jun"},
  {g:919014436,l:"Jul"},{g:1534171558,l:"Agu"}
];
const ORDER = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const WT = {2024:"#10b981",2025:"#3b82f6",2026:"#f59e0b"};

/* ================= HELPERS ================= */
const NL = "\n"; // newline asli — JANGAN diubah
const DR = /^\d{2}\/\d{2}\/\d{4}$/;
function p(v){ const n=parseInt(String(v||"0").replace(/[Rp\s,."]/g,""),10); return isNaN(n)?0:n; }
function rp(n){ return typeof n==="number" ? ("Rp "+n.toLocaleString("id-ID")) : "-"; }
function rb(n){ return typeof n==="number" ? n.toLocaleString("id-ID") : String(n||0); }
function fblk(s){ // standarisasi nama bulan -> kode
  const m={"JAN":"Jan","FEB":"Feb","MAR":"Mar","APR":"Apr","MEI":"Mei","MAY":"Mei","JUN":"Jun","JUL":"Jul","AUG":"Agu","AGU":"Agu","SEP":"Sep","OKT":"Okt","OCT":"Okt","NOV":"Nov","NOP":"Nop","DES":"Des"};
  return m[(s||"").trim().toUpperCase()];
}

/* fetch + cache localStorage 2 menit; force=bypass (tombol refresh) */
async function getCSV(sid,gid,force){
  const key="apk_"+sid+"_"+gid;
  try{ if(!force){ const c=localStorage.getItem(key); if(c){ const j=JSON.parse(c); if(Date.now()-j.t<120000) return j.v; } } }catch(e){}
  const url="/api/gsheet?url="+encodeURIComponent("https://docs.google.com/spreadsheets/d/"+sid+"/export?format=csv&gid="+gid);
  const r=await fetch(url,{cache:"no-store"});
  if(!r.ok) return "";
  const t=await r.text();
  try{ localStorage.setItem(key,JSON.stringify({v:t,t:Date.now()})); }catch(e){}
  return t;
}

/* Parse satu baris CSV dengan benar (handle tanda kutip yang berisi koma) */
function csvLine(s){
  const out=[]; let cur="",inq=false;
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(inq){ if(ch==='"'){ if(s[i+1]==='"'){cur+='"';i++;} else inq=false; } else cur+=ch; }
    else { if(ch==='"') inq=true; else if(ch===','){ out.push(cur); cur=''; } else cur+=ch; }
  }
  out.push(cur); return out;
}

/* Parse tab Rekap: blok per tahun. Header "Bulan,Total Penjualan,Target,Bar,Kunjungan,...; kolom8=lbl tahun.
   0=Bulan 1=Total 4=Kunjungan. Blok pertama (kolom8 kosong) = 2026. */
function parseRekap(csv){
  const rows=csv.split(NL).filter(l=>l.trim()).map(csvLine);
  const H={2024:{om:{},kj:{}},2025:{om:{},kj:{}},2026:{om:{},kj:{}}};
  let y=null, first=true;
  for(const c of rows){
    const c0=String(c[0]||"").trim().toUpperCase();
    if(c0==="BULAN"){
      const lab=String(c[8]||"").trim();
      if(/202[4-6]/.test(lab)) y=/2026/.test(lab)?2026:(/2025/.test(lab)?2025:2024);
      else if(first){ y=2026; }      // blok pertama tanpa label = 2026
      else { y=null; }
      first=false;
      continue;
    }
    if(c0==="TOT"||!y) continue;
    const b=fblk(c0);
    if(b){ H[y].om[b]=p(c[1]); H[y].kj[b]=p(c[4]); }
  }
  return H;
}

/* Parse tab harian (per tanggal) — auto cari header TANGGAL */
function parseHarian(csv){
  const out=[]; const ll=csv.split(NL).filter(l=>l.trim());
  let hi=-1,totI=9,kunI=10;
  for(let i=0;i<ll.length&&i<14;i++){ if(ll[i].trim().toUpperCase().startsWith("TANGGAL")){hi=i;break;} }
  if(hi<0) return out;
  const H=csvLine(ll[hi]).map(x=>x.replace(/"/g,"").trim().toUpperCase());
  const a=H.indexOf("TOTAL"); if(a>=0)totI=a;
  const b=H.indexOf("KUNJUNGAN"); if(b>=0)kunI=b;
  for(const l of ll.slice(hi+1)){
    const c=csvLine(l).map(x=>x.replace(/"/g,"").trim());
    if(!DR.test(c[0])) continue;
    out.push({t:c[0],tt:p(c[totI]),kj:p(c[kunI]),c});
  }
  return out;
}

/* Parse LPH */
function parseLPH(csv){
  const ll=csv.split(NL).filter(l=>l.trim());
  const tg=csvLine(ll[2]||"")[3]?.replace(/"/g,"")?.trim();
  if(!tg) return null;
  let d=tg; if(d.indexOf(".")>=0) d=d.split(".").join("/");
  const rr=[];
  for(const l of ll.slice(4)){
    const c=csvLine(l).map(x=>x.replace(/"/g,"").trim());
    if(!c[0]) continue;
    rr.push({u:c[0],p:c[1]||"-",s:c[2]||"-",t:c[3]||"-"});
  }
  return {tg:d,rr};
}

/* ================= KOMPONEN ================= */
export default function Home(){
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("P");
  const [D,setD]=useState(null);      // rekap
  const [harian,setHarian]=useState({});
  const [lpAll,setLpAll]=useState({});  // {tanggal: {tg,rr}}
  const [lpDate,setLpDate]=useState("");
  const [faktur,setFaktur]=useState({});
  const [bln,setBln]=useState("Jan");
  const [fbln,setFbln]=useState("Jan");
  const [err,setErr]=useState("");
  const [lphUrl,setLphUrl]=useState("");
  const [up,setUp]=useState(false);

  const load=async (force=false)=>{
    setUp(true);
    try{
      const rk=parseRekap(await getCSV(S26,REKAP_GID,force));
      setD(rk);
      const hh={};
      await Promise.all(Object.entries(HARIAN).filter(([,g])=>g!=null).map(async([b,g])=>{
        const rows=parseHarian(await getCSV(S26,g,force));
        if(rows.length) hh[b]=rows;
      }));
      // Agustus: generate tabel tgl 01-31 (isi Total dari Rekap, sel lain 0) biar ada tanggalnya
      const aguOm=rk?.[2026]?.om?.Agu||0;
      const aguDays=new Date(2026,8,0).getDate();
      const aguArr=[];
      for(let dd=1;dd<=aguDays;dd++){
        const tg="0"+dd; const tgl=(dd<10?"0"+dd:dd)+"/08/2026";
        aguArr.push({t:tgl,tt:0,kj:0,c:[tgl,"","","","","","","","","",""]});
      }
      // taruh total rekap di baris terakhir sebagai penanda (atau biarkan perbaris 0)
      aguArr[aguArr.length-1].tt=aguOm;
      hh.Agu=aguArr;
      setHarian(hh);
      // LPH: scan gid 0-31 utk kumpulin semua tanggal (tiap gid = 1 tanggal)
      let lid=LPH_DEFAULT;
      if(lphUrl && lphUrl.trim()){ const m=String(lphUrl).match(/[-\w]{25,}/); if(m) lid=m[0]; }
      const lpObj={};
      const gids=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
      await Promise.all(gids.map(async g=>{
        const rp=parseLPH(await getCSV(lid,g,force));
        if(rp && !lpObj[rp.tg]) lpObj[rp.tg]=rp;
      }));
      setLpAll(lpObj);
      const dates=Object.keys(lpObj).sort((a,b)=>new Date(a.split("/").reverse().join("-"))-new Date(b.split("/").reverse().join("-")));
      setLpDate(dates.length?dates[dates.length-1]:"");
      // Faktur
      const ff={};
      await Promise.all(FAKTUR.map(async m=>{
        const t=await getCSV(FSID,m.g,force);
        const ll=t.split(NL).filter(l=>l.trim()).slice(4);
        const ps=ll.filter(r=>/^\d+/.test(r)).map(r=>{
          const c=csvLine(r).map(x=>x.replace(/"/g,"").trim());
          return {no:c[0],pbf:c[1]||"-",jml:p(c[2]),sb:(c[5]||"").toUpperCase()==="TRUE"};
        });
        if(ps.length) ff[m.l]=ps;
      }));
      setFaktur(ff);
      setErr("");
    }catch(e){ setErr("Err: "+(e.message||e)); }
    setLoading(false); setUp(false);
  };
  useEffect(()=>{ load(); },[]); // eslint-disable-line

  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e3a5f)",gap:14}}>
      <div style={{width:44,height:44,border:"4px solid rgba(255,255,255,.2)",borderTop:"4px solid #60a5fa",borderRadius:"50%",animation:"sp 1s linear infinite"}}></div>
      <p style={{color:"rgba(255,255,255,.7)",fontSize:13}}>Memuat data...</p>
      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
  if(err) return <div style={{padding:32,color:"#dc2626",fontFamily:"sans-serif"}}>{err}</div>;

  const totalY=(y)=>Object.values(D?.[y]?.om||{}).reduce((s,v)=>s+(v||0),0);
  const lineOm=ORDER.map(b=>({b,2024:D?.[2024]?.om?.[b]||0,2025:D?.[2025]?.om?.[b]||0,2026:D?.[2026]?.om?.[b]||0}));
  const lineKj=ORDER.map(b=>({b,2024:D?.[2024]?.kj?.[b]||0,2025:D?.[2025]?.kj?.[b]||0,2026:D?.[2026]?.kj?.[b]||0}));
  const blns=ORDER.filter(b=>harian[b]);
  const curBln=blns.includes(bln)?bln:(blns[0]||"Jan");
  const curRows=harian[curBln]||[];
  const fblns=ORDER.filter(b=>faktur[b]);
  const curF=fblns.includes(fbln)?fbln:(fblns[0]||"Jan");
  const curFk=faktur[curF]||[];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e3a5f 40%,#1d4ed8 70%,#2563eb)",fontFamily:"system-ui,sans-serif"}}>
      <style>{"@media print{#lph,#lph *{visibility:visible!important}body *{visibility:hidden!important}#lph{position:absolute;left:0;top:0;width:100%}@page{size:A4 portrait;margin:8mm}}"}</style>
      {/* Header + tombol Refresh */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",color:"white",padding:"16px 24px",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontSize:20,margin:0,fontWeight:700}}>Apotek Bali Bagas Medika</h1>
          <p style={{fontSize:12,opacity:.7,margin:"3px 0 0"}}>Dashboard Monitoring Penjualan</p>
        </div>
        <button onClick={()=>load(true)} disabled={up} style={{padding:"9px 18px",borderRadius:8,border:"none",background:up?"#93c5fd":"#f59e0b",color:"#111827",fontWeight:600,cursor:"pointer",fontSize:13}}>{up?"Memperbarui...":"⟳ Refresh"}</button>
      </div>
      {/* Nav */}
      <div style={{display:"flex",background:"rgba(255,255,255,.95)",borderBottom:"1px solid #e5e7eb",paddingLeft:16,flexWrap:"wrap",gap:4}}>
        {[{k:"P",l:"Penjualan"},{k:"D",l:"Diagram"},{k:"L",l:"LPH"},{k:"F",l:"Faktur"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"12px 18px",border:"none",background:"transparent",cursor:"pointer",borderBottom:tab===t.k?"2px solid #2563eb":"2px solid transparent",color:tab===t.k?"#2563eb":"#6b7280",fontWeight:tab===t.k?600:400,fontSize:14,outline:"none"}}>{t.l}</button>
        ))}
      </div>

      <div style={{padding:16,maxWidth:1180,margin:"0 auto"}}>

        {/* ===== PENJUALAN (2026 Jan-Agu) ===== */}
        {tab==="P"&&<div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:16}}>
            <select value={curBln} onChange={e=>setBln(e.target.value)} style={{padding:"7px 12px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white"}}>
              {blns.map(b=><option key={b} value={b}>{b} 2026</option>)}
            </select>
            <span style={{color:"rgba(255,255,255,.75)",fontSize:12}}>Total 2026 (Jan-Agu): <b style={{color:"#fff"}}>{rp(totalY(2026))}</b></span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
            <K label={"Omzet "+curBln} v={rp(curRows.reduce((s,x)=>s+x.tt,0))} c="#f59e0b"/>
            <K label="Kunjungan" v={rb(curRows.reduce((s,x)=>s+x.kj,0))} c="#8b5cf6"/>
            <K label="Total 2026 (Jalan)" v={rp(totalY(2026))} c="#3b82f6"/>
          </div>
          <TB rows={curRows}/>
        </div>}

        {/* ===== DIAGRAM (3 tahun omzet + kunjungan) ===== */}
        {tab==="D"&&<div>
          <Kartu title="Omzet Bulanan — 2024 vs 2025 vs 2026">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={lineOm} margin={{top:8,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="b" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}} tickFormatter={(v)=>(v/1e6).toFixed(0)+"jt"}/>
                <Tooltip formatter={(v,n)=>[rp(Number(v)),n]}/>
                <Legend/>
                <Line type="monotone" dataKey="2024" stroke={WT[2024]} strokeWidth={2.5} dot={{r:3}} name="2024"/>
                <Line type="monotone" dataKey="2025" stroke={WT[2025]} strokeWidth={2.5} dot={{r:3}} name="2025"/>
                <Line type="monotone" dataKey="2026" stroke={WT[2026]} strokeWidth={3} dot={{r:4}} name="2026"/>
              </LineChart>
            </ResponsiveContainer>
          </Kartu>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginTop:16}}>
            {[2024,2025,2026].map(y=><K key={y} label={"Total Omzet "+y+(y===2026?" (berjalan)":"")} v={rp(totalY(y))} c={WT[y]}/>)}
          </div>
          <Kartu title="Kunjungan Bulanan — 2024 vs 2025 vs 2026">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineKj} margin={{top:8,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="b" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip formatter={(v,n)=>[String(v)+" kunj",n]}/>
                <Legend/>
                <Line type="monotone" dataKey="2024" stroke={WT[2024]} strokeWidth={2.5} dot={{r:3}} name="2024"/>
                <Line type="monotone" dataKey="2025" stroke={WT[2025]} strokeWidth={2.5} dot={{r:3}} name="2025"/>
                <Line type="monotone" dataKey="2026" stroke={WT[2026]} strokeWidth={3} dot={{r:4}} name="2026"/>
              </LineChart>
            </ResponsiveContainer>
          </Kartu>
        </div>}

        {/* ===== LPH (link + print) ===== */}
        {tab==="L"&&<div>
          <div style={{background:"white",borderRadius:10,padding:14,marginBottom:16,border:"1px solid #e5e7eb"}}>
            <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>Link spreadsheet LPH bulan ini</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input placeholder="tempel URL / ID spreadsheet LPH bulan ini" value={lphUrl} onChange={e=>setLphUrl(e.target.value)} style={{flex:1,minWidth:260,padding:"8px 12px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13}}/>
              <button onClick={()=>load(true)} style={{padding:"8px 18px",background:"#2563eb",color:"white",border:"none",borderRadius:6,fontSize:13,cursor:"pointer"}}>Muat LPH</button>
            </div>
            <p style={{fontSize:11,color:"#9ca3af",margin:"6px 0 0"}}>Tempel URL / ID spreadsheet LPH bulan ini. Format: URAIAN, PAGI, SIANG, TOTAL. Tiap ganti bulan tinggal ganti link & tekan Muat.</p>
          </div>
          {(()=>{
            const dates=Object.keys(lpAll).sort((a,b)=>new Date(a.split("/").reverse().join("-"))-new Date(b.split("/").reverse().join("-")));
            const cur=dates.includes(lpDate)?lpDate:(dates[dates.length-1]||"");
            const lp=cur?lpAll[cur]:null;
            return (
          <>
          {lp?<div>
            {dates.length>0&&<div style={{marginBottom:12}}>
              <label style={{fontSize:12,color:"#6b7280",display:"block",marginBottom:5}}>Pilih tanggal:</label>
              <select value={cur} onChange={e=>setLpDate(e.target.value)} style={{padding:"8px 14px",borderRadius:6,border:"1px solid #d1d5db",fontSize:13,background:"white",cursor:"pointer"}}>
                {dates.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>}
            <div style={{textAlign:"right",marginBottom:10}}>
              <button onClick={()=>window.print()} style={{padding:"8px 20px",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>🖨 Cetak LPH (A4)</button>
            </div>
            <div id="lph" style={{background:"white",padding:"10px 12px",borderRadius:6}}>
              <div style={{textAlign:"center",marginBottom:5}}>
                <h2 style={{fontSize:12,fontWeight:"bold",margin:0}}>LAPORAN PENJUALAN HARIAN (LPH)</h2>
                <p style={{fontSize:9,margin:"1px 0"}}>APOTEK BALI BAGAS MEDIKA (BBM)</p>
                <p style={{fontSize:9,fontWeight:"bold",margin:"3px 0 0"}}>TANGGAL : {lp.tg}</p>
              </div>
              <table style={{width:"100%",fontSize:9,borderCollapse:"collapse",border:"1px solid #000"}}>
                <thead><tr style={{background:"#e5e7eb"}}>
                  {["URAIAN","PAGI","SIANG","TOTAL"].map(h=><th key={h} style={{border:"1px solid #000",padding:"4px 6px",textAlign:h==="URAIAN"?"left":"right"}}>{h}</th>)}
                </tr></thead>
                <tbody>{lp.rr.filter(r=>!/kunjungan/i.test(r.u)).map((r,i)=>{
                  const u=r.u.toUpperCase();
                  const isPct=/PENCA/.test(u)||r.u.includes("%");
                  return (
                  <tr key={i} style={{background:i%2?"#f9fafb":"white"}}>
                    <td style={{border:"1px solid #000",padding:"3px 6px",fontWeight:/TARGET|GAP/.test(u)?700:400}}>{r.u}</td>
                    <td style={{border:"1px solid #000",padding:"3px 6px",textAlign:"right"}}>{cLPH(r.p,isPct)}</td>
                    <td style={{border:"1px solid #000",padding:"3px 6px",textAlign:"right"}}>{cLPH(r.s,isPct)}</td>
                    <td style={{border:"1px solid #000",padding:"3px 6px",textAlign:"right",fontWeight:"bold"}}>{cLPH(r.t,isPct)}</td>
                  </tr>);})}
                </tbody>
              </table>
            </div>
          </div>:<div style={{padding:28,textAlign:"center",background:"rgba(220,38,38,.12)",border:"1px solid #fca5a5",borderRadius:10}}>
            <p style={{color:"#fecaca",margin:0,fontWeight:600}}>LPH belum dimuat</p>
            <p style={{color:"rgba(254,202,202,.75)",fontSize:12,margin:"6px 0 0"}}>Spreadsheet LPH (default) belum kebaca. Pastikan di-share publik, atau tempel link di kolom di atas.</p>
          </div>}
          </>
          );
          })()}
        </div>}

        {/* ===== FAKTUR ===== */}
        {tab==="F"&&<div>
          <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            {fblns.map(b=><button key={b} onClick={()=>setFbln(b)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:13,background:fbln===b?"#3b82f6":"white",color:fbln===b?"white":"#374151",borderColor:fbln===b?"#3b82f6":"#d1d5db"}}>{b}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:16}}>
            <K label={"Faktur "+curF} v={curFk.length+" faktur"} c="#3b82f6"/>
            <K label="Lunas" v={curFk.filter(x=>x.sb).length} c="#10b981"/>
            <K label="Belum" v={curFk.filter(x=>!x.sb).length} c="#ef4444"/>
            <K label="Nilai" v={rp(curFk.reduce((s,x)=>s+x.jml,0))} c="#8b5cf6"/>
          </div>
          <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontWeight:600,color:"#374151",fontSize:14}}>Faktur {curF}</div>
            <div style={{maxHeight:420,overflow:"auto"}}>
              <table style={{width:"100%",fontSize:13,borderCollapse:"collapse"}}>
                <thead style={{background:"#f1f5f9"}}><tr>
                  <th style={{textAlign:"left",padding:"9px 12px",fontSize:12,color:"#475569"}}>No</th>
                  <th style={{textAlign:"left",padding:"9px 12px",fontSize:12,color:"#475569"}}>PBF</th>
                  <th style={{textAlign:"right",padding:"9px 12px",fontSize:12,color:"#475569"}}>Jumlah</th>
                  <th style={{textAlign:"center",padding:"9px 12px",fontSize:12,color:"#475569"}}>Status</th>
                </tr></thead>
                <tbody>{curFk.map((x,i)=>(
                  <tr key={i} style={{background:x.sb?"#f0fdf4":"#fef2f2"}}>
                    <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9"}}>{x.no}</td>
                    <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9"}}>{x.pbf}</td>
                    <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9",textAlign:"right"}}>{rp(x.jml)}</td>
                    <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9",textAlign:"center"}}><span style={{padding:"2px 10px",borderRadius:999,fontSize:11,background:x.sb?"#dcfce7":"#fee2e2",color:x.sb?"#16a34a":"#dc2626"}}>{x.sb?"LUNAS":"BELUM"}</span></td>
                  </tr>))}</tbody>
              </table>
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}

/* ================= KOMPONEN BANTU ================= */
function K({label,v,color:c}){return <div style={{background:"rgba(255,255,255,.96)",borderRadius:12,padding:"13px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.08)",border:"1px solid rgba(255,255,255,.7)"}}><p style={{fontSize:11,color:"#9ca3af",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:.5}}>{label}</p><p style={{fontSize:21,fontWeight:"bold",margin:0,color:c||"#111827"}}>{v}</p></div>;}
function Kartu({title,children}){return <div style={{background:"white",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:16}}><div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontWeight:600,color:"#374151",fontSize:14}}>{title}</div><div style={{padding:16}}>{children}</div></div>;}
function cLPH(v,isPct){
  if(isPct){ const m=String(v).match(/(\d+[.,]?\d*)/); return m?(m[1].replace(",",".").replace(/\.0$/,"")+"%"):v; }
  const n=p(v); return n>0?("Rp "+n.toLocaleString("id-ID")):v;
}
function TB({rows}){
  const H=["Tanggal","Cash Pagi","Debit Pagi","Qris Pagi","Jml Pagi","Cash Sore","Debit Sore","Qris Sore","Jml Sore","Total","Kunj"];
  if(!rows.length) return <div style={{padding:24,textAlign:"center",color:"#9ca3af"}}>Belum ada data untuk bulan ini.</div>;
  return (
    <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",overflow:"hidden"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid #e5e7eb",fontWeight:600,color:"#374151",fontSize:14}}>Penjualan Harian (Detail)</div>
      <div style={{maxHeight:480,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead style={{background:"#f1f5f9",position:"sticky",top:0}}><tr>
            {H.map((h,i)=><th key={h} style={{textAlign:i===0||i===H.length-1?"center":"right",padding:"8px 11px",border:"1px solid #d1d5db",fontSize:11,color:"#475569",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>{[...rows].reverse().map((x,i)=>(
            <tr key={i} style={{background:i%2?"#f8fafc":"white"}}>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",whiteSpace:"nowrap"}}>{x.t}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right"}}>{x.c[1]?rp(p(x.c[1])):"-"}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right"}}>{x.c[2]?rp(p(x.c[2])):"-"}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right"}}>{x.c[3]?rp(p(x.c[3])):"-"}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right",fontWeight:600}}>{rp(p(x.c[4]))}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right"}}>{x.c[5]?rp(p(x.c[5])):"-"}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right"}}>{x.c[6]?rp(p(x.c[6])):"-"}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right"}}>{x.c[7]?rp(p(x.c[7])):"-"}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right",fontWeight:600}}>{rp(p(x.c[8]))}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"right",fontWeight:700}}>{rp(x.tt)}</td>
              <td style={{padding:"6px 11px",border:"1px solid #e5e7eb",textAlign:"center"}}>{x.kj}</td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
