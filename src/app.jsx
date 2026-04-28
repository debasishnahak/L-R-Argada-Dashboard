import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 YOUR GOOGLE SHEET PUBLISHED ID (already connected!)
// ─────────────────────────────────────────────────────────────────────────────
const PUB_ID = "2PACX-1vTpMWkq6AnKS7pIo-FxBaZk0Rmlf6ISWdWD97NALqGXOIGDrJeDGm6ATl28ywzvrafLMIon30ob4J9F";
// ─────────────────────────────────────────────────────────────────────────────

const SHEETS = ["mines","acquisition","upcoming_acquisition","possession","eoffice","house","rti","legal","events"];

const csvUrl = (sheet) =>
  `https://docs.google.com/spreadsheets/d/e/${PUB_ID}/pub?output=csv&sheet=${sheet}`;

const parseCSV = (text) => {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.replace(/"/g,"").trim());
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = "", inQ = false;
    for (let ch of line) {
      if (ch==='"') inQ=!inQ;
      else if (ch===',' && !inQ) { vals.push(cur.trim()); cur=""; }
      else cur+=ch;
    }
    vals.push(cur.trim());
    return Object.fromEntries(headers.map((h,i)=>[h, vals[i]||""]));
  }).filter(r => Object.values(r).some(v=>v!==""));
};

// ── THEMES ────────────────────────────────────────────────────────────────────
const DARK = {
  pageBg:    "#080c14",
  headerBg:  "#0a0f1a",
  headerBdr: "#111a27",
  panelBg:   "#0f1623",
  panelBdr:  "#1e2d45",
  circleBg1: "#0f1623",
  circleBg2: "#080c14",
  kpiBg:     "#080c14",
  kpiBdr:    "#1a2535",
  tableBdr:  "#111a27",
  tableHdr:  "#1a2535",
  tableHov:  "rgba(30,60,100,0.25)",
  thColor:   "#3a5a7a",
  tdColor:   "#c8d8e8",
  labelColor:"#8aa0bc",
  subColor:  "#4a6080",
  titleColor:"#e2eaf4",
  accentBlue:"#2d5a8e",
  dividerBg: "#1e3a5f",
  scrollThumb:"#1e3a5f",
  btnBdr:    "#1e2d45",
  btnColor:  "#4a6080",
  toggleBg:  "#0f1623",
  toggleBdr: "#1e2d45",
  toggleIcon:"🌙",
  toggleLabel:"Light Mode",
};
const LIGHT = {
  pageBg:    "#f0f4f8",
  headerBg:  "#ffffff",
  headerBdr: "#dde6f0",
  panelBg:   "#ffffff",
  panelBdr:  "#ccd8e8",
  circleBg1: "#ffffff",
  circleBg2: "#f0f4f8",
  kpiBg:     "#f8fafc",
  kpiBdr:    "#dde6f0",
  tableBdr:  "#e8eef4",
  tableHdr:  "#eef3f8",
  tableHov:  "rgba(59,130,246,0.06)",
  thColor:   "#6b8aaa",
  tdColor:   "#1e3a5f",
  labelColor:"#4a6a8a",
  subColor:  "#7a9ab8",
  titleColor:"#0f2a4a",
  accentBlue:"#2563eb",
  dividerBg: "#bcd4ea",
  scrollThumb:"#93c5fd",
  btnBdr:    "#ccd8e8",
  btnColor:  "#4a6a8a",
  toggleBg:  "#ffffff",
  toggleBdr: "#ccd8e8",
  toggleIcon:"☀️",
  toggleLabel:"Dark Mode",
};

const G = ({t}) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${t.pageBg};}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:50;display:flex;align-items:center;justify-content:center;padding:24px;}
    .panel{background:${t.panelBg};border:1px solid ${t.panelBdr};border-radius:16px;width:860px;max-width:96vw;max-height:90vh;overflow-y:auto;padding:28px;}
    .panel::-webkit-scrollbar{width:4px;}
    .panel::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:2px;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    th{padding:7px 12px;text-align:left;font-size:9px;color:${t.thColor};letter-spacing:0.09em;text-transform:uppercase;border-bottom:1px solid ${t.tableHdr};font-weight:600;}
    td{padding:9px 12px;color:${t.tdColor};border-bottom:1px solid ${t.tableBdr};font-size:12px;}
    tr:last-child td{border-bottom:none;}
    tr:hover td{background:${t.tableHov};}
    .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;}
    .cc{cursor:pointer;transition:transform 0.18s;}
    .cc:hover{transform:scale(1.06);}
    .back-btn{background:transparent;border:1px solid ${t.btnBdr};color:${t.btnColor};padding:5px 14px;border-radius:8px;cursor:pointer;font-family:Inter,sans-serif;font-size:11px;transition:all 0.15s;}
    .back-btn:hover{border-color:#3b82f6;color:#3b82f6;}
    .kpi{background:${t.kpiBg};border:1px solid ${t.kpiBdr};border-radius:10px;padding:12px;text-align:center;}
    .toggle-btn{position:fixed;bottom:24px;left:24px;z-index:200;display:flex;align-items:center;gap:8px;padding:9px 16px;background:${t.toggleBg};border:1px solid ${t.toggleBdr};border-radius:50px;cursor:pointer;font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:${t.btnColor};box-shadow:0 4px 16px rgba(0,0,0,0.15);transition:all 0.2s;}
    .toggle-btn:hover{border-color:#3b82f6;color:#3b82f6;transform:translateY(-1px);box-shadow:0 6px 20px rgba(59,130,246,0.2);}
  `}</style>
);

// ── HELPERS ───────────────────────────────────────────────────────────────────
const StatusBadge = ({s=""}) => {
  const map = {Overdue:["#3d0f0f","#f87171"],Urgent:["#3d0f0f","#f87171"],"Due Soon":["#3d1f0f","#fb923c"],
    Pending:["#0f1f3d","#60a5fa"],Paid:["#0f3d1f","#4ade80"],Done:["#0f3d1f","#4ade80"],
    Low:["#0f3d1f","#4ade80"],High:["#3d1f0f","#fb923c"],Critical:["#3d0f0f","#f87171"],Medium:["#2d2d0f","#facc15"]};
  const [bg,fg] = map[s]||["#1e2535","#94a3b8"];
  return <span className="badge" style={{background:bg,color:fg}}>{s||"—"}</span>;
};

const KPI = ({l,v,c="#e2eaf4",t}) => (
  <div className="kpi">
    <div style={{fontSize:9,color:t.subColor,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em",lineHeight:1.3}}>{l}</div>
    <div style={{fontSize:18,fontWeight:700,color:c,lineHeight:1.2}}>{v}</div>
  </div>
);

// ── CIRCLE ────────────────────────────────────────────────────────────────────
const Circle = ({icon,label,value,sub,color="#22c55e",alert,onClick,size=168,t}) => (
  <div className="cc" onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
    <div style={{position:"relative",width:size,height:size,borderRadius:"50%",
      background:`conic-gradient(${color} 0deg,${color}22 360deg)`,padding:4,
      boxShadow:`0 0 28px ${color}28,0 0 6px ${color}18`}}>
      <div style={{width:"100%",height:"100%",borderRadius:"50%",
        background:`linear-gradient(145deg,${t.circleBg1},${t.circleBg2})`,
        border:`1.5px solid ${color}40`,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
        {icon && <div style={{fontSize:Math.round(size*0.15),lineHeight:1}}>{icon}</div>}
        <div style={{fontSize:Math.round(size*0.17),fontWeight:800,color,lineHeight:1.1,textAlign:"center",padding:"0 8px"}}>{value}</div>
        {sub && <div style={{fontSize:9,color:t.subColor,textAlign:"center",padding:"0 10px",lineHeight:1.3}}>{sub}</div>}
        {alert && <div style={{fontSize:9,color:"#f87171",fontWeight:700,marginTop:1}}>{alert}</div>}
      </div>
    </div>
    <div style={{marginTop:10,fontSize:12,fontWeight:600,color:t.labelColor,textAlign:"center"}}>{label}</div>
    <div style={{fontSize:9,color:`${color}80`,marginTop:2}}>tap for details</div>
  </div>
);

// ── PANEL WRAPPER ─────────────────────────────────────────────────────────────
const Panel = ({title,icon,color,onClose,children,t}) => (
  <div className="overlay" onClick={onClose}>
    <div className="panel" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:4,height:26,background:color,borderRadius:2}}/>
          <span style={{fontSize:20}}>{icon}</span>
          <span style={{fontSize:18,fontWeight:700,color:t.titleColor,fontFamily:"Inter"}}>{title}</span>
        </div>
        <button className="back-btn" onClick={onClose}>✕ Close</button>
      </div>
      {children}
    </div>
  </div>
);

// ── LOADING ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:16}}>
    <div style={{width:48,height:48,border:"3px solid #1e2d45",borderTop:"3px solid #3b82f6",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    <div style={{color:"#3a5a7a",fontSize:13}}>Loading dashboard data...</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const ErrBox = ({msg}) => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:12}}>
    <div style={{color:"#f87171",fontSize:16,fontWeight:700}}>⚠️ Could not load data</div>
    <div style={{color:"#4a6080",fontSize:12,maxWidth:400,textAlign:"center"}}>{msg}</div>
    <div style={{color:"#3a5a7a",fontSize:11}}>Make sure your Google Sheet is published to the web (File → Share → Publish to web)</div>
  </div>
);

// ── LIVE CLOCK ────────────────────────────────────────────────────────────────
const LiveClock = ({t}) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(id); },[]);
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  return (
    <div style={{textAlign:"right"}}>
      <div style={{fontSize:28,fontWeight:800,color:"#3b82f6",fontFamily:"Inter",letterSpacing:"0.04em",lineHeight:1}}>
        {hh}<span style={{opacity:0.5,animation:"blink 1s step-end infinite"}}>:</span>{mm}
        <span style={{fontSize:16,color:t.subColor,marginLeft:4}}>{ss}s</span>
      </div>
      <div style={{fontSize:11,color:t.subColor,marginTop:3}}>
        {days[now.getDay()]} · {now.getDate()} {months[now.getMonth()]} {now.getFullYear()}
      </div>
      <div style={{fontSize:9,color:"#22c55e",marginTop:1}}>● Live from Google Sheets · FY 2025–26</div>
      <style>{`@keyframes blink{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
    </div>
  );
};

// ── CALENDAR WIDGET ────────────────────────────────────────────────────────────
const CAT_COLORS = {
  Meeting:    "#3b82f6",
  Inspection: "#22c55e",
  Deadline:   "#ef4444",
  Court:      "#f97316",
  Other:      "#a855f7",
};

const CalendarWidget = ({t, sheetEvents}) => {
  const today      = new Date();
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [curYear,  setCurYear]  = useState(today.getFullYear());
  const [open,     setOpen]     = useState(false);
  const [popupDay, setPopupDay] = useState(null);

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const firstDay    = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth+1, 0).getDate();
  const todayStr    = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const dateStr = (d) => `${curYear}-${String(curMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  // Build events map from sheet: { "YYYY-MM-DD": [{title,note,category},...] }
  const eventsMap = {};
  (sheetEvents||[]).forEach(r => {
    const key = (r.date||"").trim();
    if (!key) return;
    if (!eventsMap[key]) eventsMap[key] = [];
    eventsMap[key].push({ title: r.title||"", note: r.note||"", category: r.category||"Other" });
  });

  const todayEvents = eventsMap[todayStr] || [];
  const totalEvents = Object.keys(eventsMap).length;

  const prevMonth = () => { if(curMonth===0){setCurMonth(11);setCurYear(y=>y-1);}else setCurMonth(m=>m-1); };
  const nextMonth = () => { if(curMonth===11){setCurMonth(0);setCurYear(y=>y+1);}else setCurMonth(m=>m+1); };

  const CalBtn = () => (
    <div onClick={()=>setOpen(o=>!o)} style={{
      position:"fixed", bottom:24, right:24, zIndex:200,
      width:52, height:52, borderRadius:"50%",
      background:t.toggleBg, border:`1px solid ${t.toggleBdr}`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      cursor:"pointer", boxShadow:"0 4px 16px rgba(0,0,0,0.18)", transition:"all 0.2s",
    }}>
      <div style={{fontSize:22}}>📅</div>
      {totalEvents>0 && (
        <div style={{position:"absolute",top:4,right:4,width:10,height:10,
          borderRadius:"50%",background:"#3b82f6",border:`2px solid ${t.pageBg}`}}/>
      )}
      {todayEvents.length>0 && (
        <div style={{position:"absolute",top:-2,left:-2,width:16,height:16,borderRadius:"50%",
          background:"#ef4444",border:`2px solid ${t.pageBg}`,fontSize:9,color:"#fff",
          display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>
          {todayEvents.length}
        </div>
      )}
    </div>
  );

  if (!open) return (
    <>
      <CalBtn/>
      {todayEvents.length>0 && (
        <div style={{position:"fixed",bottom:90,right:24,zIndex:190,
          background:t.panelBg,border:"1px solid #3b82f6",borderRadius:12,
          padding:"14px 18px",boxShadow:"0 8px 32px rgba(59,130,246,0.2)",
          maxWidth:280,animation:"slideUp 0.3s ease"}}>
          <div style={{fontSize:10,color:"#3b82f6",letterSpacing:"0.12em",
            textTransform:"uppercase",marginBottom:8,fontWeight:600}}>📅 Today's Events</div>
          {todayEvents.map((e,i)=>(
            <div key={i} style={{padding:"6px 0",borderBottom:i<todayEvents.length-1?`1px solid ${t.tableBdr}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:CAT_COLORS[e.category]||"#3b82f6",flexShrink:0}}/>
                <div style={{fontSize:12,fontWeight:600,color:t.titleColor}}>{e.title}</div>
              </div>
              {e.note && <div style={{fontSize:11,color:t.subColor,paddingLeft:13}}>{e.note}</div>}
              <div style={{fontSize:10,color:CAT_COLORS[e.category]||"#3b82f6",paddingLeft:13,marginTop:2}}>{e.category}</div>
            </div>
          ))}
          <div style={{marginTop:10,fontSize:9,color:t.subColor,borderTop:`1px solid ${t.tableBdr}`,paddingTop:8}}>
            To add/edit events → update <span style={{color:"#3b82f6",fontWeight:600}}>events</span> sheet in Google Sheets
          </div>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}
    </>
  );

  return (
    <>
      <CalBtn/>
      <div style={{position:"fixed",bottom:88,right:24,zIndex:190,
        background:t.panelBg,border:`1px solid ${t.panelBdr}`,borderRadius:16,
        padding:20,width:310,boxShadow:"0 12px 48px rgba(0,0,0,0.3)",animation:"slideUp 0.25s ease"}}>

        {/* Month nav */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <button onClick={prevMonth} style={{background:"transparent",border:"none",color:t.subColor,cursor:"pointer",fontSize:18,padding:"2px 8px"}}>‹</button>
          <div style={{fontWeight:700,fontSize:14,color:t.titleColor}}>{months[curMonth]} {curYear}</div>
          <button onClick={nextMonth} style={{background:"transparent",border:"none",color:t.subColor,cursor:"pointer",fontSize:18,padding:"2px 8px"}}>›</button>
        </div>

        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
          {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:9,color:t.subColor,fontWeight:600,padding:"2px 0"}}>{d}</div>)}
        </div>

        {/* Date grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const d      = i+1;
            const ds     = dateStr(d);
            const isToday= ds===todayStr;
            const dayEvs = eventsMap[ds]||[];
            const hasEv  = dayEvs.length>0;
            const dotCol = hasEv ? (CAT_COLORS[dayEvs[0].category]||"#3b82f6") : null;
            return (
              <div key={d} onClick={()=>setPopupDay(ds===popupDay?null:ds)}
                style={{position:"relative",textAlign:"center",padding:"6px 2px",borderRadius:6,
                  cursor:hasEv?"pointer":"default",fontSize:11,fontWeight:isToday?800:400,
                  color:isToday?"#fff":hasEv?"#3b82f6":t.tdColor,
                  background:isToday?"#3b82f6":hasEv?`${dotCol}18`:"transparent",
                  border:hasEv&&!isToday?`1px solid ${dotCol}50`:"1px solid transparent",
                  transition:"all 0.15s"}}>
                {d}
                {hasEv && (
                  <div style={{display:"flex",justifyContent:"center",gap:2,marginTop:2}}>
                    {dayEvs.slice(0,3).map((e,ei)=>(
                      <div key={ei} style={{width:4,height:4,borderRadius:"50%",
                        background:isToday?"#fff":(CAT_COLORS[e.category]||"#3b82f6")}}/>
                    ))}
                  </div>
                )}

                {/* Event popup */}
                {popupDay===ds && hasEv && (
                  <div onClick={e=>e.stopPropagation()} style={{
                    position:"absolute",bottom:"110%",
                    left:d>21?"auto":d<7?"0":"50%",
                    right:d>21?"0":"auto",
                    transform:d>21||d<7?"none":"translateX(-50%)",
                    background:t.panelBg,border:"1px solid #3b82f6",
                    borderRadius:12,padding:"12px 14px",zIndex:300,
                    width:220,boxShadow:"0 8px 28px rgba(0,0,0,0.3)",textAlign:"left",
                  }}>
                    <div style={{fontSize:9,color:"#3b82f6",textTransform:"uppercase",
                      letterSpacing:"0.1em",marginBottom:8,fontWeight:600}}>
                      {d} {months[curMonth]} · {dayEvs.length} event{dayEvs.length>1?"s":""}
                    </div>
                    {dayEvs.map((e,idx)=>(
                      <div key={idx} style={{padding:"6px 0",
                        borderBottom:idx<dayEvs.length-1?`1px solid ${t.tableBdr}`:"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <div style={{width:7,height:7,borderRadius:"50%",
                            background:CAT_COLORS[e.category]||"#3b82f6",flexShrink:0}}/>
                          <div style={{fontSize:11,fontWeight:600,color:t.titleColor}}>{e.title}</div>
                        </div>
                        {e.note && <div style={{fontSize:10,color:t.subColor,paddingLeft:13,lineHeight:1.4}}>{e.note}</div>}
                        <div style={{fontSize:9,color:CAT_COLORS[e.category]||"#3b82f6",paddingLeft:13,marginTop:2,fontWeight:600}}>{e.category}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${t.tableBdr}`,display:"flex",flexWrap:"wrap",gap:6}}>
          {Object.entries(CAT_COLORS).map(([cat,col])=>(
            <div key={cat} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:col}}/>
              <span style={{fontSize:9,color:t.subColor}}>{cat}</span>
            </div>
          ))}
        </div>

        {/* Google Sheets hint */}
        <div style={{marginTop:10,padding:"8px 10px",background:t.kpiBg,
          border:`1px solid ${t.kpiBdr}`,borderRadius:8,fontSize:10,color:t.subColor,textAlign:"center"}}>
          Add events in <span style={{color:"#3b82f6",fontWeight:600}}>Google Sheets → events tab</span>
          <br/>Dashboard updates automatically
        </div>
      </div>
    </>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [data,   setData]   = useState(null);
  const [err,    setErr]    = useState(null);
  const [open,   setOpen]   = useState(null);
  const [dark,   setDark]   = useState(true);
  const t = dark ? DARK : LIGHT;

  useEffect(() => {
    Promise.all(SHEETS.map(s => fetch(csvUrl(s)).then(r=>r.text()).then(t=>({[s]:parseCSV(t)}))))
      .then(results => setData(Object.assign({},...results)))
      .catch(e => setErr(e.message));
  }, []);

  if (err)   return <><G t={DARK}/><ErrBox msg={err}/></>;
  if (!data) return <><G t={DARK}/><Spinner/></>;

  const mines    = data.mines    || [];
  const acqRows  = data.acquisition || [];
  const upRows   = data.upcoming_acquisition || [];
  const posRows  = data.possession || [];
  const eofRows  = data.eoffice  || [];
  const houseRows= data.house    || [];
  const rtiRows  = data.rti      || [];
  const legalRows= data.legal    || [];

  const mineColor = id => mines.find(m=>m.mineId===id)?.color || "#3b82f6";
  const mineName  = id => mines.find(m=>m.mineId===id)?.mineName || id;

  // ── ACQUISITION PANEL ──────────────────────────────────────────────────────
  const AcqPanel = () => {
    const [catView, setCatView] = useState(null);
    const [upOpen,  setUpOpen]  = useState(false);
    const [upMine,  setUpMine]  = useState(null);

    const acts = [...new Set(acqRows.map(r=>r.act).filter(Boolean))];
    const upMines = [...new Set(upRows.map(r=>r.mineId))];
    const totalAcq = acqRows.filter(r=>r.status==="Done").reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);
    const upTotal  = upRows.reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);

    if (catView) {
      const rows = acqRows.filter(r=>r.act===catView);
      const mineIds = [...new Set(rows.map(r=>r.mineId))];
      return (
        <Panel title="Land Acquisition" icon="📋" color="#22c55e" onClose={()=>setOpen(null)}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button className="back-btn" onClick={()=>setCatView(null)}>← Back</button>
            <span style={{fontSize:14,fontWeight:700,color:"#22c55e"}}>{catView}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            <KPI l="Total Plots" v={rows.length} c="#22c55e" t={t}/>
            <KPI l="Area (Ha)" v={rows.reduce((s,r)=>s+parseFloat(r.area_Ha||0),0).toFixed(1)} c="#e2eaf4" t={t}/>
            <KPI l="Pending" v={rows.filter(r=>r.status==="Pending").length} c="#ef4444" t={t}/>
          </div>
          <table>
            <thead><tr>{["Mine","Plot","Village","Area","Status","Reason","Owner"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((r,i)=><tr key={i}>
              <td style={{color:"#22c55e",fontWeight:500}}>{mineName(r.mineId)}</td>
              <td style={{color:"#94a3b8"}}>{r.plotNo}</td>
              <td>{r.village}</td>
              <td>{r.area_Ha} Ha</td>
              <td><StatusBadge s={r.status}/></td>
              <td style={{color:"#fb923c",fontSize:11}}>{r.reason}</td>
              <td style={{color:"#94a3b8"}}>{r.owner}</td>
            </tr>)}</tbody>
          </table>
        </Panel>
      );
    }

    if (upOpen) {
      if (upMine) {
        const rows = upRows.filter(r=>r.mineId===upMine);
        return (
          <Panel title="Upcoming Acquisition" icon="🔜" color="#f97316" onClose={()=>setOpen(null)}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <button className="back-btn" onClick={()=>setUpMine(null)}>← All Upcoming</button>
              <span style={{fontSize:14,fontWeight:700,color:"#f97316"}}>{mineName(upMine)}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              <KPI l="Total Area" v={`${rows.reduce((s,r)=>s+parseFloat(r.area_Ha||0),0).toFixed(1)} Ha`} c="#f97316" t={t}/>
              <KPI l="Plots/Blocks" v={rows.length} c="#e2eaf4" t={t}/>
              <KPI l="Expected Start" v={rows[0]?.expectedStart||"—"} c="#a78bfa" t={t}/>
            </div>
            <table>
              <thead><tr>{["Village/Block","Area (Ha)","Owners","Act","Est. Start","Remarks"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>{rows.map((r,i)=><tr key={i}>
                <td style={{color:"#e2eaf4",fontWeight:500}}>{r.village}</td>
                <td style={{color:"#f97316",fontWeight:600}}>{r.area_Ha} Ha</td>
                <td style={{textAlign:"center"}}>{r.noOfOwners}</td>
                <td><span className="badge" style={{background:"#1a1000",color:"#f59e0b"}}>{r.act}</span></td>
                <td style={{color:"#a78bfa"}}>{r.expectedStart}</td>
                <td style={{color:"#fb923c",fontSize:11}}>{r.remarks}</td>
              </tr>)}</tbody>
            </table>
          </Panel>
        );
      }
      return (
        <Panel title="Upcoming Acquisition" icon="🔜" color="#f97316" onClose={()=>setOpen(null)}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button className="back-btn" onClick={()=>setUpOpen(false)}>← Back</button>
            <span style={{fontSize:14,fontWeight:700,color:"#f97316"}}>Upcoming Land to be Acquired</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
            <KPI l="Total Area" v={`${upTotal.toFixed(1)} Ha`} c="#f97316" t={t}/>
            <KPI l="Mines" v={upMines.length} c="#e2eaf4" t={t}/>
            <KPI l="Total Plots/Blocks" v={upRows.length} c="#a78bfa" t={t}/>
          </div>
          <div style={{fontSize:10,color:"#4a6080",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:20,textAlign:"center",fontWeight:600}}>Select a mine</div>
          <div style={{display:"flex",gap:32,justifyContent:"center",flexWrap:"wrap"}}>
            {upMines.map((mid,i) => {
              const mrows = upRows.filter(r=>r.mineId===mid);
              const area  = mrows.reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);
              const col   = mineColor(mid);
              return (
                <Circle key={i} icon="🔜" label={mineName(mid)} value={`${area.toFixed(0)}`}
                  sub="Ha to acquire" color={col} onClick={()=>setUpMine(mid)} size={130} t={t}/>
              );
            })}
          </div>
        </Panel>
      );
    }

    return (
      <Panel title="Land Acquisition" icon="📋" color="#22c55e" onClose={()=>setOpen(null)}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
          <KPI l="Total Acquired (Ha)" v={totalAcq.toFixed(1)} c="#22c55e" t={t}/>
          <KPI l="Pending Plots" v={acqRows.filter(r=>r.status==="Pending").length} c="#ef4444" t={t}/>
          <KPI l="Upcoming (Ha)" v={upTotal.toFixed(1)} c="#f97316" t={t}/>
        </div>
        <div style={{fontSize:10,color:"#4a6080",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:16,textAlign:"center",fontWeight:600}}>Acquired land — by mode (tap to view plots)</div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(acts.length,5)},1fr)`,gap:12,justifyItems:"center",marginBottom:0}}>
          {acts.map((act,i) => {
            const rows  = acqRows.filter(r=>r.act===act);
            const area  = rows.filter(r=>r.status==="Done").reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);
            const colors= ["#22c55e","#3b82f6","#a855f7","#f59e0b","#64748b","#e879f9","#f97316"];
            return <Circle key={i} label={act} value={area.toFixed(0)} sub={`Ha · ${rows.length} plots`}
              color={colors[i%colors.length]} onClick={()=>setCatView(act)} size={120} t={t}/>;
          })}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,margin:"24px 0"}}>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,#1e3a5f,transparent)"}}/>
          <span style={{fontSize:9,color:"#2d5a8e",letterSpacing:"0.15em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Upcoming Land to be Acquired</span>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,#1e3a5f,transparent)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"center"}}>
          <Circle icon="🔜" label="Upcoming Acquisition" value={upTotal.toFixed(0)}
            sub={`Ha · ${upMines.length} mines`} color="#f97316" onClick={()=>setUpOpen(true)} size={130} t={t}/>
        </div>
      </Panel>
    );
  };

  // ── POSSESSION PANEL ───────────────────────────────────────────────────────
  const PosPanel = () => {
    const mineIds = [...new Set(posRows.map(r=>r.mineId))];
    const total   = posRows.reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);
    const done    = posRows.filter(r=>r.status==="Done").reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);
    return (
      <Panel title="Possession" icon="🏗️" color="#a855f7" onClose={()=>setOpen(null)} t={t}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
          <KPI l="Total (Ha)" v={total.toFixed(1)} c="#e2eaf4" t={t}/>
          <KPI l="Possessed (Ha)" v={done.toFixed(1)} c="#a855f7" t={t}/>
          <KPI l="Pending (Ha)" v={(total-done).toFixed(1)} c="#ef4444" t={t}/>
        </div>
        <table style={{marginBottom:16}}>
          <thead><tr>{["Mine","Plot","Village","Area","Status","Reason","Handover Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>{posRows.map((r,i)=><tr key={i}>
            <td style={{color:"#a855f7",fontWeight:500}}>{mineName(r.mineId)}</td>
            <td style={{color:"#94a3b8"}}>{r.plotNo}</td>
            <td>{r.village}</td>
            <td>{r.area_Ha} Ha</td>
            <td><StatusBadge s={r.status}/></td>
            <td style={{color:"#fb923c",fontSize:11}}>{r.reason}</td>
            <td style={{color:"#4ade80"}}>{r.handoverDate||"—"}</td>
          </tr>)}</tbody>
        </table>
      </Panel>
    );
  };

  // ── RTI PANEL ──────────────────────────────────────────────────────────────
  const RtiPanel = () => {
    const overdue = rtiRows.filter(r=>r.status==="Overdue").length;
    return (
      <Panel title="RTI Pending" icon="📜" color="#ef4444" onClose={()=>setOpen(null)} t={t}>
        {overdue>0 && <div style={{background:"#1a0808",border:"1px solid #ef444440",borderLeft:"3px solid #ef4444",borderRadius:8,padding:"10px 16px",marginBottom:16,fontSize:12,color:"#f87171"}}>
          ⚠️ {overdue} RTI overdue — penalty ₹250/day applies under RTI Act 2005
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
          <KPI l="Total Pending" v={rtiRows.length} c="#ef4444" t={t}/>
          <KPI l="Overdue" v={overdue} c="#f87171" t={t}/>
          <KPI l="Due Within 7 Days" v={rtiRows.filter(r=>parseInt(r.daysLeft||0)>=0&&parseInt(r.daysLeft||0)<=7).length} c="#fb923c" t={t}/>
        </div>
        <table>
          <thead><tr>{["RTI No.","Applicant","Subject","Mine","Deadline","Days Left","Status","Action"].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>{[...rtiRows].sort((a,b)=>parseInt(a.daysLeft||0)-parseInt(b.daysLeft||0)).map((r,i)=>{
            const dl = parseInt(r.daysLeft||0);
            return <tr key={i}>
              <td style={{color:"#ef4444",fontWeight:600,whiteSpace:"nowrap"}}>{r.id}</td>
              <td>{r.applicant}</td>
              <td style={{fontSize:11}}>{r.subject}</td>
              <td style={{color:"#94a3b8",fontSize:11}}>{mineName(r.mineId)}</td>
              <td style={{color:"#fb923c",whiteSpace:"nowrap"}}>{r.deadline}</td>
              <td style={{fontWeight:700,color:dl<0?"#f87171":dl<=7?"#fb923c":"#60a5fa",whiteSpace:"nowrap"}}>
                {dl<0?`${Math.abs(dl)}d overdue`:`${dl}d left`}
              </td>
              <td><StatusBadge s={r.status}/></td>
              <td style={{fontSize:11,color:"#94a3b8"}}>{r.actionRequired}</td>
            </tr>;
          })}</tbody>
        </table>
      </Panel>
    );
  };

  // ── HOUSE PANEL ────────────────────────────────────────────────────────────
  const HousePanel = () => {
    const [selMine, setSelMine] = useState(null);
    const mineIds = [...new Set(houseRows.map(r=>r.mineId))];
    const allPend = houseRows.filter(r=>r.fileStatus==="Pending");

    if (selMine) {
      const rows    = houseRows.filter(r=>r.mineId===selMine);
      const pending = rows.filter(r=>r.fileStatus==="Pending");
      const paid    = rows.filter(r=>r.fileStatus==="Paid");
      const prodDate= rows[0]?.productionReachDate||"—";
      const bottleneck = [...new Set(rows.filter(r=>r.bottleneck&&r.bottleneck!=="—").map(r=>r.bottleneck))].join(". ");
      return (
        <Panel title="House Compensation" icon="🏠" color="#f59e0b" onClose={()=>setOpen(null)} t={t}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button className="back-btn" onClick={()=>setSelMine(null)}>← All Mines</button>
            <span style={{fontSize:14,fontWeight:700,color:"#f59e0b"}}>{mineName(selMine)}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
            <KPI l="Surveyed" v={rows.length} c="#f59e0b" t={t}/>
            <KPI l="Total Valuation" v={`₹${rows.reduce((s,r)=>s+parseFloat(r.valuation_Lakhs||0),0).toFixed(1)}L`} c="#e2eaf4" t={t}/>
            <KPI l="Pending" v={pending.length} c="#ef4444" t={t}/>
            <KPI l="Production Reaches" v={prodDate} c="#a78bfa" t={t}/>
          </div>
          {bottleneck && <div style={{background:"#0f0a00",border:"1px solid #f59e0b40",borderLeft:"3px solid #f59e0b",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
            <div style={{fontSize:9,color:"#f59e0b",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6,fontWeight:600}}>🚧 Bottleneck for Dismantling</div>
            <div style={{fontSize:12,color:"#fbbf24",lineHeight:1.7}}>{bottleneck}</div>
          </div>}
          {pending.length>0 && <>
            <div style={{fontSize:10,color:"#ef4444",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8,fontWeight:600}}>⏳ Pending ({pending.length})</div>
            <table style={{marginBottom:16}}>
              <thead><tr>{["Owner","Type","Rooms","Valuation","File Status","Dismantle","Bottleneck"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>{pending.map((r,i)=><tr key={i}>
                <td style={{color:"#e2eaf4",fontWeight:500}}>{r.owner}</td>
                <td style={{color:"#94a3b8"}}>{r.type}</td>
                <td style={{textAlign:"center",color:"#f59e0b",fontWeight:600}}>{r.rooms}</td>
                <td style={{color:"#ef4444",fontWeight:600}}>₹{r.valuation_Lakhs}L</td>
                <td><StatusBadge s={r.fileStatus}/></td>
                <td><span className="badge" style={{background:"#2d1a0f",color:"#fb923c"}}>{r.dismantleStatus}</span></td>
                <td style={{color:"#fb923c",fontSize:11}}>{r.bottleneck}</td>
              </tr>)}</tbody>
            </table>
          </>}
          {paid.length>0 && <>
            <div style={{fontSize:10,color:"#22c55e",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8,fontWeight:600}}>✅ Paid ({paid.length})</div>
            <table>
              <thead><tr>{["Owner","Type","Rooms","Amount","Dismantle Status"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>{paid.map((r,i)=><tr key={i}>
                <td style={{color:"#e2eaf4",fontWeight:500}}>{r.owner}</td>
                <td style={{color:"#94a3b8"}}>{r.type}</td>
                <td style={{textAlign:"center",color:"#f59e0b"}}>{r.rooms}</td>
                <td style={{color:"#22c55e",fontWeight:600}}>₹{r.valuation_Lakhs}L</td>
                <td><span className="badge" style={{background:"#0f3d1f",color:"#4ade80"}}>{r.dismantleStatus}</span></td>
              </tr>)}</tbody>
            </table>
          </>}
        </Panel>
      );
    }

    return (
      <Panel title="House Compensation" icon="🏠" color="#f59e0b" onClose={()=>setOpen(null)} t={t}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:28}}>
          <KPI l="Total Surveyed" v={houseRows.length} c="#f59e0b" t={t}/>
          <KPI l="Total Valuation" v={`₹${houseRows.reduce((s,r)=>s+parseFloat(r.valuation_Lakhs||0),0).toFixed(1)}L`} c="#e2eaf4" t={t}/>
          <KPI l="Pending" v={allPend.length} c="#ef4444" t={t}/>
          <KPI l="Pending Amount" v={`₹${allPend.reduce((s,r)=>s+parseFloat(r.valuation_Lakhs||0),0).toFixed(1)}L`} c="#f87171" t={t}/>
        </div>
        <div style={{fontSize:10,color:"#4a6080",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:20,textAlign:"center",fontWeight:600}}>Select a mine</div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(mineIds.length,4)},1fr)`,gap:16,justifyItems:"center"}}>
          {mineIds.map((mid,i)=>{
            const rows   = houseRows.filter(r=>r.mineId===mid);
            const pend   = rows.filter(r=>r.fileStatus==="Pending").length;
            const paid   = rows.filter(r=>r.fileStatus==="Paid").length;
            const color  = pend>0?"#f59e0b":"#22c55e";
            return <Circle key={i} label={mineName(mid)} value={pend}
              sub={`pending · ✅${paid} paid`} color={color}
              onClick={()=>setSelMine(mid)} size={120} t={t}/>;
          })}
        </div>
      </Panel>
    );
  };

  // ── EOFFICE PANEL ──────────────────────────────────────────────────────────
  const EofficePanel = () => (
    <Panel title="eOffice Files" icon="📂" color="#3b82f6" onClose={()=>setOpen(null)} t={t}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        <KPI l="Total Files" v={eofRows.length} c="#3b82f6" t={t}/>
        <KPI l="Critical" v={eofRows.filter(e=>e.priority==="Critical").length} c="#f87171" t={t}/>
        <KPI l="Avg Days Open" v={eofRows.length?Math.round(eofRows.reduce((s,e)=>s+parseInt(e.daysOpen||0),0)/eofRows.length)+"d":"—"} c="#f59e0b" t={t}/>
      </div>
      <table>
        <thead><tr>{["eOffice No.","Subject","Current Desk","Stage","Bottleneck","Days","Priority"].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{eofRows.map((e,i)=><tr key={i}>
          <td style={{color:"#3b82f6",fontWeight:600,whiteSpace:"nowrap"}}>{e.id}</td>
          <td>{e.subject}</td>
          <td style={{color:"#94a3b8",fontSize:11}}>{e.currentDesk}</td>
          <td style={{color:"#60a5fa",fontSize:11}}>{e.stage}</td>
          <td style={{color:"#fb923c",fontSize:11}}>{e.bottleneck}</td>
          <td style={{color:parseInt(e.daysOpen||0)>30?"#f87171":parseInt(e.daysOpen||0)>14?"#fb923c":"#4ade80",fontWeight:700}}>{e.daysOpen}d</td>
          <td><StatusBadge s={e.priority}/></td>
        </tr>)}</tbody>
      </table>
    </Panel>
  );

  // ── LEGAL PANEL ────────────────────────────────────────────────────────────
  const LegalPanel = () => {
    const urgent = legalRows.filter(l=>l.status==="Urgent"||l.status==="Due Soon").length;
    return (
      <Panel title="Legal Cases" icon="⚖️" color="#e879f9" onClose={()=>setOpen(null)} t={t}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
          <KPI l="Total Cases" v={legalRows.length} c="#e879f9" t={t}/>
          <KPI l="Urgent / Due Soon" v={urgent} c="#f87171" t={t}/>
          <KPI l="Total Disputed" v={`₹${legalRows.filter(l=>l.amount&&l.amount!=="N/A").length} cases`} c="#fb923c" t={t}/>
        </div>
        <table>
          <thead><tr>{["Case No.","Court","Subject","Mine","Amount","Next Date","Status"].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>{legalRows.map((l,i)=><tr key={i}>
            <td style={{color:"#e879f9",fontWeight:600,whiteSpace:"nowrap"}}>{l.id}</td>
            <td style={{color:"#94a3b8",fontSize:11}}>{l.court}</td>
            <td>{l.subject}</td>
            <td style={{color:"#a78bfa"}}>{mineName(l.mineId)}</td>
            <td style={{color:"#fb923c",fontWeight:600,whiteSpace:"nowrap"}}>{l.amount}</td>
            <td style={{color:"#60a5fa",whiteSpace:"nowrap"}}>{l.nextDate}</td>
            <td><StatusBadge s={l.status}/></td>
          </tr>)}</tbody>
        </table>
      </Panel>
    );
  };

  // ── DASHBOARD CIRCLES ──────────────────────────────────────────────────────
  const overdueRTI = rtiRows.filter(r=>r.status==="Overdue").length;
  const pendHouse  = houseRows.filter(r=>r.fileStatus==="Pending").length;
  const critEof    = eofRows.filter(e=>e.priority==="Critical").length;
  const urgLegal   = legalRows.filter(l=>l.status==="Urgent"||l.status==="Due Soon").length;
  const acqDone    = acqRows.filter(r=>r.status==="Done").reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);
  const acqTotal   = acqRows.reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);
  const posTotal   = posRows.reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);
  const posDone    = posRows.filter(r=>r.status==="Done").reduce((s,r)=>s+parseFloat(r.area_Ha||0),0);

  const CARDS = [
    {key:"acq",   icon:"📋", label:"Acquisition",  value:`${acqTotal?Math.round((acqDone/acqTotal)*100):0}%`, sub:`${(acqTotal-acqDone).toFixed(0)} Ha pending`,  color:"#22c55e"},
    {key:"pos",   icon:"🏗️", label:"Possession",   value:`${posTotal?Math.round((posDone/posTotal)*100):0}%`, sub:`${(posTotal-posDone).toFixed(0)} Ha pending`,  color:"#a855f7"},
    {key:"rti",   icon:"📜", label:"RTI Pending",  value:rtiRows.length,   sub:`${overdueRTI} overdue`,  color:"#ef4444", alert:overdueRTI>0?`⚠️ ${overdueRTI} OVERDUE`:null},
    {key:"house", icon:"🏠", label:"House Comp.",  value:pendHouse,        sub:"structures pending",     color:"#f59e0b"},
    {key:"eof",   icon:"📂", label:"eOffice",      value:eofRows.length,   sub:`${critEof} critical`,    color:"#3b82f6"},
    {key:"legal", icon:"⚖️", label:"Legal Cases", value:legalRows.length, sub:`${urgLegal} urgent`,     color:"#e879f9"},
  ];

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:t.pageBg,minHeight:"100vh",display:"flex",flexDirection:"column",transition:"background 0.3s"}}>
      <G t={t}/>

      {/* HEADER */}
      <div style={{padding:"14px 32px",borderBottom:`1px solid ${t.headerBdr}`,background:t.headerBg,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background 0.3s"}}>
        <div>
          <div style={{fontSize:9,color:t.accentBlue,letterSpacing:"0.22em",textTransform:"uppercase",marginBottom:3}}>Central Coalfields Limited · Argada Sub-Area</div>
          <div style={{fontSize:20,fontWeight:800,color:t.titleColor,letterSpacing:"-0.02em"}}>
            L&R <span style={{color:"#3b82f6"}}>Argada Area</span>
            <span style={{color:t.subColor,fontWeight:400,fontSize:13,marginLeft:10}}>Intelligence Dashboard</span>
          </div>
        </div>
        {/* LIVE CLOCK */}
        <LiveClock t={t}/>
      </div>

      {/* CIRCLES */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"28px",width:"100%",maxWidth:1140}}>
          {CARDS.map(c=>(
            <Circle key={c.key} icon={c.icon} label={c.label} value={c.value}
              sub={c.sub} color={c.color} alert={c.alert} onClick={()=>setOpen(c.key)} t={t}/>
          ))}
        </div>
      </div>

      {/* PANELS */}
      {open==="acq"   && <AcqPanel/>}
      {open==="pos"   && <PosPanel/>}
      {open==="rti"   && <RtiPanel/>}
      {open==="house" && <HousePanel/>}
      {open==="eof"   && <EofficePanel/>}
      {open==="legal" && <LegalPanel/>}

      {/* 🌙 DARK / LIGHT TOGGLE */}
      <button className="toggle-btn" onClick={()=>setDark(d=>!d)}>
        <span style={{fontSize:16}}>{t.toggleIcon}</span>
        <span>{t.toggleLabel}</span>
      </button>

      {/* 📅 CALENDAR */}
      <CalendarWidget t={t} sheetEvents={data?.events||[]}/>
    </div>
  );
}
