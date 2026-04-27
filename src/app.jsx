import { useState } from "react";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:3px;height:3px;}
    ::-webkit-scrollbar-thumb{background:#334155;border-radius:2px;}
    .card{background:#0d0d1a;border:1px solid #1e1e30;border-radius:6px;}
    .cl:hover{border-color:#3b82f6!important;cursor:pointer;box-shadow:0 0 0 1px #3b82f620;}
    .rh:hover{background:rgba(255,255,255,0.03)!important;cursor:pointer;}
    .badge{display:inline-block;padding:2px 8px;border-radius:2px;font-size:10px;font-weight:600;letter-spacing:0.04em;}
    .sec-title{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
    .sec-title::after{content:'';flex:1;height:1px;background:currentColor;opacity:0.15;}
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}
    .modal{background:#0d0d1a;border:1px solid #334155;border-radius:8px;padding:28px;width:560px;max-width:100%;max-height:90vh;overflow-y:auto;}
    th{padding:7px 10px;text-align:left;font-size:8px;color:#475569;letter-spacing:0.09em;text-transform:uppercase;font-weight:500;}
    td{padding:9px 10px;border-bottom:1px solid #111120;font-size:11px;}
    tr:last-child td{border-bottom:none;}
  `}</style>
);

// ── DATA ──────────────────────────────────────────────────────────────────────

const MINES = [
  { id:"ARG-01", name:"Argada Main OCP" },
  { id:"ARG-02", name:"Argada East UG" },
  { id:"ARG-03", name:"Argada North Extension" },
  { id:"ARG-04", name:"Argada South OCP" },
];

const ACQ = [
  { mineId:"ARG-01", total:248.6, done:189.2, plots:[
    {no:"PLT-101",village:"Argada Village",area:12.4,status:"Pending",reason:"Court Stay",owner:"Ramesh Mahato"},
    {no:"PLT-102",village:"Argada Village",area:8.7,status:"Pending",reason:"Compensation Dispute",owner:"Sunita Devi"},
    {no:"PLT-103",village:"Sirka Tola",area:15.2,status:"Pending",reason:"Survey Pending",owner:"Govt. Land"},
    {no:"PLT-104",village:"Sirka Tola",area:22.9,status:"Done",reason:"—",owner:"CCL"},
    {no:"PLT-105",village:"Bhurkunda",area:0.2,status:"Pending",reason:"Legal Notice Stage",owner:"Binod Singh"},
  ]},
  { mineId:"ARG-02", total:94.3, done:94.3, plots:[
    {no:"PLT-201",village:"Kuju",area:18.1,status:"Done",reason:"—",owner:"CCL"},
    {no:"PLT-202",village:"Kuju",area:11.4,status:"Done",reason:"—",owner:"CCL"},
  ]},
  { mineId:"ARG-03", total:176.0, done:88.5, plots:[
    {no:"PLT-301",village:"Ramgarh Tola",area:30.2,status:"Pending",reason:"Tribal Land — Forest Clearance",owner:"Tribal Community"},
    {no:"PLT-302",village:"Ramgarh Tola",area:19.8,status:"Pending",reason:"Compensation Dispute",owner:"Lakhan Oraon"},
    {no:"PLT-303",village:"Chadwa",area:17.5,status:"Done",reason:"—",owner:"CCL"},
    {no:"PLT-304",village:"Chadwa",area:20.0,status:"Pending",reason:"Court Stay",owner:"Mangra Devi"},
  ]},
  { mineId:"ARG-04", total:132.4, done:101.9, plots:[
    {no:"PLT-401",village:"Hesla",area:14.2,status:"Pending",reason:"Survey Pending",owner:"Suresh Yadav"},
    {no:"PLT-402",village:"Hesla",area:16.3,status:"Done",reason:"—",owner:"CCL"},
    {no:"PLT-403",village:"Bero",area:0.0,status:"Pending",reason:"Compensation Dispute",owner:"Geeta Kumari"},
  ]},
];

const POS = [
  { mineId:"ARG-01", total:248.6, done:142.8, plots:[
    {no:"PLT-101",village:"Argada Village",area:12.4,status:"Pending",reason:"Crop Compensation Due",date:"—"},
    {no:"PLT-104",village:"Sirka Tola",area:22.9,status:"Done",reason:"—",date:"12 Jan 2025"},
    {no:"PLT-106",village:"Bhurkunda",area:31.5,status:"Pending",reason:"Encroachment",date:"—"},
  ]},
  { mineId:"ARG-02", total:94.3, done:74.1, plots:[
    {no:"PLT-201",village:"Kuju",area:18.1,status:"Done",reason:"—",date:"03 Mar 2024"},
    {no:"PLT-202",village:"Kuju",area:11.4,status:"Pending",reason:"Structure Demolition Pending",date:"—"},
  ]},
  { mineId:"ARG-03", total:176.0, done:60.0, plots:[
    {no:"PLT-303",village:"Chadwa",area:17.5,status:"Done",reason:"—",date:"19 Sep 2024"},
    {no:"PLT-305",village:"Ramgarh Tola",area:28.0,status:"Pending",reason:"Village Resistance",date:"—"},
  ]},
  { mineId:"ARG-04", total:132.4, done:101.9, plots:[
    {no:"PLT-402",village:"Hesla",area:16.3,status:"Done",reason:"—",date:"07 Jun 2024"},
    {no:"PLT-401",village:"Hesla",area:14.2,status:"Pending",reason:"Key Handover Pending",date:"—"},
  ]},
];

const EOFFICE = [
  {id:"EOF-2024-1142",subject:"Award Declaration — Argada Village Plot 101-105",desk:"DGM (L&R) — Pending Signature",stage:"Awaiting DGM Approval",bottleneck:"DGM on leave — delayed 12 days",mineId:"ARG-01",priority:"High",days:34,by:"Sr. Manager L&R",next:"Follow up with DGM office"},
  {id:"EOF-2024-0987",subject:"Forest Land Clearance — Ramgarh Tola Block",desk:"MoEF Liaison Officer",stage:"State Forest Dept Review",bottleneck:"State Forest Dept response awaited since 45 days",mineId:"ARG-03",priority:"Critical",days:62,by:"Manager (Env)",next:"Send reminder to PCCF Jharkhand"},
  {id:"EOF-2024-1201",subject:"Compensation Payment Auth — Hesla Village",desk:"Finance Dept — Accounts Section",stage:"Fund Release Pending",bottleneck:"Budget head mismatch — returned for correction",mineId:"ARG-04",priority:"Medium",days:18,by:"Sr. Manager L&R",next:"Re-submit with correct budget head"},
  {id:"EOF-2025-0023",subject:"SIA Report Submission — Argada North Extension",desk:"CMD Secretariat",stage:"CMD Review",bottleneck:"CMD review scheduled for next board meeting",mineId:"ARG-03",priority:"High",days:9,by:"GM (L&R)",next:"Confirm board meeting date"},
  {id:"EOF-2024-1098",subject:"R&R Plan Approval — Bhurkunda Displacement",desk:"Dist. Collector Office",stage:"DC Review & NOC",bottleneck:"DC requested additional survey data",mineId:"ARG-01",priority:"Critical",days:51,by:"Manager L&R",next:"Submit additional survey by 30 Apr"},
  {id:"EOF-2025-0041",subject:"Possession Notice — Kuju Plots 201-202",desk:"Tehsildar Office",stage:"Section 11 Notice Issued",bottleneck:"None — on track",mineId:"ARG-02",priority:"Low",days:5,by:"Sr. Manager L&R",next:"Await 30-day notice period"},
  {id:"EOF-2024-1315",subject:"Tribal Land Acquisition — Ramgarh Tola",desk:"Tribal Welfare Dept",stage:"FPIC Process Ongoing",bottleneck:"Gram Sabha consent pending — 2nd meeting scheduled",mineId:"ARG-03",priority:"Critical",days:78,by:"GM (L&R)",next:"Coordinate Gram Sabha on 05 May 2025"},
];

const HOUSE = [
  {mineId:"ARG-01",mineName:"Argada Main OCP",structures:[
    {id:"STR-001",owner:"Ramesh Mahato",village:"Argada Village",type:"Pucca House",rooms:4,area:820,amount:18.4,status:"Pending",due:"15 May 2025",reason:"Valuation Dispute"},
    {id:"STR-002",owner:"Sunita Devi",village:"Argada Village",type:"Semi-Pucca",rooms:2,area:420,amount:7.2,status:"Pending",due:"15 May 2025",reason:"Document Incomplete"},
    {id:"STR-003",owner:"Birsa Munda",village:"Sirka Tola",type:"Kuccha House",rooms:3,area:310,amount:3.8,status:"Paid",due:"Paid 12 Jan 2025",reason:"—"},
    {id:"STR-004",owner:"Govt. Structure",village:"Sirka Tola",type:"Community Hall",rooms:1,area:1200,amount:42.0,status:"Pending",due:"30 Jun 2025",reason:"Inter-dept Approval"},
  ]},
  {mineId:"ARG-02",mineName:"Argada East UG",structures:[
    {id:"STR-101",owner:"Laxman Singh",village:"Kuju",type:"Pucca House",rooms:3,area:640,amount:14.1,status:"Paid",due:"Paid 03 Mar 2024",reason:"—"},
    {id:"STR-102",owner:"Meena Devi",village:"Kuju",type:"Semi-Pucca",rooms:2,area:380,amount:6.5,status:"Pending",due:"30 Apr 2025",reason:"Structure Demolition Pending"},
  ]},
  {mineId:"ARG-03",mineName:"Argada North Extension",structures:[
    {id:"STR-201",owner:"Lakhan Oraon",village:"Ramgarh Tola",type:"Pucca House",rooms:5,area:940,amount:21.8,status:"Pending",due:"01 Jun 2025",reason:"Tribal Land — Legal Hold"},
    {id:"STR-202",owner:"Tribal Community",village:"Ramgarh Tola",type:"Community Hut",rooms:1,area:280,amount:2.4,status:"Pending",due:"01 Jun 2025",reason:"Gram Sabha Consent Pending"},
    {id:"STR-203",owner:"Mangra Devi",village:"Chadwa",type:"Kuccha House",rooms:2,area:250,amount:2.9,status:"Pending",due:"30 Apr 2025",reason:"Court Stay"},
  ]},
  {mineId:"ARG-04",mineName:"Argada South OCP",structures:[
    {id:"STR-301",owner:"Suresh Yadav",village:"Hesla",type:"Pucca House",rooms:4,area:720,amount:16.2,status:"Pending",due:"30 Apr 2025",reason:"Survey Pending"},
    {id:"STR-302",owner:"Geeta Kumari",village:"Bero",type:"Semi-Pucca",rooms:2,area:390,amount:7.0,status:"Paid",due:"Paid 07 Jun 2024",reason:"—"},
  ]},
];

const RTI = [
  {id:"RTI-2024-0341",applicant:"Suresh Kumar Mahato",subject:"Land acquisition compensation details — Argada Village",mineId:"ARG-01",received:"28 Feb 2025",deadline:"28 Mar 2025",status:"Overdue",daysLeft:-30,action:"Draft reply immediately — overdue by 30 days"},
  {id:"RTI-2024-0378",applicant:"Tribal Welfare Society",subject:"Status of Forest Clearance — Ramgarh Tola",mineId:"ARG-03",received:"10 Mar 2025",deadline:"09 Apr 2025",status:"Overdue",daysLeft:-18,action:"Coordinate with MoEF — reply pending"},
  {id:"RTI-2025-0012",applicant:"Lakhan Oraon",subject:"R&R entitlement details for Ramgarh displaced families",mineId:"ARG-03",received:"01 Apr 2025",deadline:"30 Apr 2025",status:"Due Soon",daysLeft:3,action:"Compile R&R data — reply by 30 Apr"},
  {id:"RTI-2025-0019",applicant:"Ramgarh Jan Kalyan",subject:"House compensation amounts paid and pending",mineId:"ARG-01",received:"05 Apr 2025",deadline:"04 May 2025",status:"Pending",daysLeft:7,action:"Prepare compensation statement"},
  {id:"RTI-2025-0024",applicant:"Meena Devi",subject:"Possession notice status — Kuju Plot 202",mineId:"ARG-02",received:"12 Apr 2025",deadline:"11 May 2025",status:"Pending",daysLeft:14,action:"Reply with current status"},
  {id:"RTI-2025-0031",applicant:"Advocate S.K. Sinha",subject:"eOffice file status — award declaration",mineId:"ARG-01",received:"18 Apr 2025",deadline:"17 May 2025",status:"Pending",daysLeft:20,action:"Share file movement details"},
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

const pct = (a,b) => b ? Math.round((a/b)*100) : 0;

const Bar = ({done,total,color,h=5}) => (
  <div style={{height:h,background:"#1e1e2e",borderRadius:2,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${pct(done,total)}%`,background:color,borderRadius:2,transition:"width 0.8s"}}/>
  </div>
);

const Ring = ({done,total,size=80,stroke=8,color}) => {
  const r=(size-stroke)/2, c=2*Math.PI*r, f=total?(done/total)*c:0;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${f} ${c}`} strokeLinecap="round"/>
    </svg>
  );
};

const priC = {Critical:["#2d0f0f","#f87171"],High:["#2d1a0f","#fb923c"],Medium:["#1a1a0f","#facc15"],Low:["#0f2d1a","#4ade80"]};
const rtiC = {Overdue:["#2d0f0f","#f87171"],"Due Soon":["#2d1a0f","#fb923c"],Pending:["#0f1a2d","#60a5fa"]};

const Divider = ({label,color="#94a3b8",icon}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,margin:"28px 0 18px"}}>
    <div style={{width:3,height:22,background:color,borderRadius:2}}/>
    <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:"#fff"}}>{icon} {label}</span>
    <div style={{flex:1,height:1,background:"#1e1e30"}}/>
  </div>
);

const KPI = ({label,value,color,sub}) => (
  <div className="card" style={{padding:"14px 16px",textAlign:"center"}}>
    <div style={{fontSize:8,color:"#64748b",letterSpacing:"0.1em",marginBottom:4}}>{label}</div>
    <div style={{fontSize:22,fontWeight:700,color,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{value}</div>
    {sub && <div style={{fontSize:9,color:"#475569",marginTop:4}}>{sub}</div>}
  </div>
);

// ── MODALS ────────────────────────────────────────────────────────────────────

const AcqModal = ({mine, data, onClose}) => {
  const pending = data.plots.filter(p=>p.status==="Pending");
  const done = data.plots.filter(p=>p.status==="Done");
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Acquisition Detail</div>
            <div style={{fontSize:18,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#fff"}}>{mine.name}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #2d2d3d",color:"#94a3b8",padding:"4px 12px",borderRadius:3,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>✕ Close</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[{l:"Total",v:`${data.total.toFixed(1)} Ha`,c:"#e2e8f0"},{l:"Acquired",v:`${data.done.toFixed(1)} Ha`,c:"#22c55e"},{l:"Pending",v:`${(data.total-data.done).toFixed(1)} Ha`,c:"#ef4444"}].map((s,i)=>(
            <div key={i} style={{background:"#060610",border:"1px solid #1e1e30",borderRadius:4,padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:8,color:"#64748b",marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
            </div>
          ))}
        </div>
        {pending.length > 0 && <>
          <div style={{fontSize:9,color:"#ef4444",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,marginTop:16}}>⏳ Pending Plots ({pending.length})</div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
            <thead><tr style={{borderBottom:"1px solid #1e1e30"}}>{["Plot","Village","Area","Reason","Owner"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{pending.map((p,i)=><tr key={i}>
              <td style={{color:"#ef4444",fontWeight:700}}>{p.no}</td>
              <td style={{color:"#e2e8f0"}}>{p.village}</td>
              <td style={{color:"#94a3b8"}}>{p.area} Ha</td>
              <td><span className="badge" style={{background:"#2d1010",color:"#f87171"}}>{p.reason}</span></td>
              <td style={{color:"#94a3b8"}}>{p.owner}</td>
            </tr>)}</tbody>
          </table>
        </>}
        {done.length > 0 && <>
          <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>✅ Acquired ({done.length})</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:"1px solid #1e1e30"}}>{["Plot","Village","Area","Owner"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{done.map((p,i)=><tr key={i}>
              <td style={{color:"#22c55e",fontWeight:700}}>{p.no}</td>
              <td style={{color:"#e2e8f0"}}>{p.village}</td>
              <td style={{color:"#94a3b8"}}>{p.area} Ha</td>
              <td style={{color:"#94a3b8"}}>{p.owner}</td>
            </tr>)}</tbody>
          </table>
        </>}
      </div>
    </div>
  );
};

const PosModal = ({mine, data, onClose}) => {
  const pending = data.plots.filter(p=>p.status==="Pending");
  const done = data.plots.filter(p=>p.status==="Done");
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:9,color:"#a855f7",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Possession Detail</div>
            <div style={{fontSize:18,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#fff"}}>{mine.name}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #2d2d3d",color:"#94a3b8",padding:"4px 12px",borderRadius:3,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>✕ Close</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[{l:"Total",v:`${data.total.toFixed(1)} Ha`,c:"#e2e8f0"},{l:"Possessed",v:`${data.done.toFixed(1)} Ha`,c:"#a855f7"},{l:"Pending",v:`${(data.total-data.done).toFixed(1)} Ha`,c:"#ef4444"}].map((s,i)=>(
            <div key={i} style={{background:"#060610",border:"1px solid #1e1e30",borderRadius:4,padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:8,color:"#64748b",marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
            </div>
          ))}
        </div>
        {pending.length>0 && <>
          <div style={{fontSize:9,color:"#ef4444",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,marginTop:16}}>⏳ Pending ({pending.length})</div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
            <thead><tr style={{borderBottom:"1px solid #1e1e30"}}>{["Plot","Village","Area","Reason"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{pending.map((p,i)=><tr key={i}>
              <td style={{color:"#ef4444",fontWeight:700}}>{p.no}</td>
              <td style={{color:"#e2e8f0"}}>{p.village}</td>
              <td style={{color:"#94a3b8"}}>{p.area} Ha</td>
              <td><span className="badge" style={{background:"#2d1010",color:"#f87171"}}>{p.reason}</span></td>
            </tr>)}</tbody>
          </table>
        </>}
        {done.length>0 && <>
          <div style={{fontSize:9,color:"#a855f7",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>✅ Possessed ({done.length})</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:"1px solid #1e1e30"}}>{["Plot","Village","Area","Handover Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{done.map((p,i)=><tr key={i}>
              <td style={{color:"#a855f7",fontWeight:700}}>{p.no}</td>
              <td style={{color:"#e2e8f0"}}>{p.village}</td>
              <td style={{color:"#94a3b8"}}>{p.area} Ha</td>
              <td style={{color:"#22c55e"}}>{p.date}</td>
            </tr>)}</tbody>
          </table>
        </>}
      </div>
    </div>
  );
};

const EofficeModal = ({file, onClose}) => {
  const [bg,fg] = priC[file.priority]||["#1e1e30","#94a3b8"];
  const mine = MINES.find(m=>m.id===file.mineId);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:9,color:"#3b82f6",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>eOffice Detail</div>
            <div style={{fontSize:16,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#fff"}}>{file.id}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span className="badge" style={{background:bg,color:fg,fontSize:11,padding:"3px 10px"}}>{file.priority}</span>
            <button onClick={onClose} style={{background:"transparent",border:"1px solid #2d2d3d",color:"#94a3b8",padding:"4px 12px",borderRadius:3,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>✕</button>
          </div>
        </div>
        {[["Subject",file.subject],["Mine",mine?.name],["Sent By",file.by],["Days Open",`${file.days} days`],["Current Stage",file.stage]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #1e1e30"}}>
            <span style={{fontSize:10,color:"#64748b"}}>{l}</span>
            <span style={{fontSize:11,color:"#e2e8f0",fontWeight:500,textAlign:"right",maxWidth:"58%"}}>{v}</span>
          </div>
        ))}
        <div style={{marginTop:14,padding:"14px",background:"#060610",border:"1px solid #3b82f640",borderRadius:4}}>
          <div style={{fontSize:9,color:"#3b82f6",letterSpacing:"0.12em",marginBottom:6}}>📍 CURRENT LOCATION</div>
          <div style={{fontSize:13,color:"#93c5fd",fontWeight:600}}>{file.desk}</div>
        </div>
        <div style={{marginTop:10,padding:"14px",background:"#060610",border:"1px solid #ef444440",borderRadius:4}}>
          <div style={{fontSize:9,color:"#ef4444",letterSpacing:"0.12em",marginBottom:6}}>🚧 BOTTLENECK</div>
          <div style={{fontSize:12,color:"#f87171",lineHeight:1.6}}>{file.bottleneck}</div>
        </div>
        <div style={{marginTop:10,padding:"14px",background:"#060610",border:"1px solid #22c55e40",borderRadius:4}}>
          <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.12em",marginBottom:6}}>✅ NEXT ACTION</div>
          <div style={{fontSize:12,color:"#4ade80",lineHeight:1.6}}>{file.next}</div>
        </div>
      </div>
    </div>
  );
};

const HouseModal = ({data, onClose}) => {
  const pending = data.structures.filter(s=>s.status==="Pending");
  const paid = data.structures.filter(s=>s.status==="Paid");
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:9,color:"#f59e0b",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>House Compensation</div>
            <div style={{fontSize:18,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#fff"}}>{data.mineName}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #2d2d3d",color:"#94a3b8",padding:"4px 12px",borderRadius:3,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>✕ Close</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[
            {l:"Total Structures",v:data.structures.length,c:"#f59e0b"},
            {l:"Pending",v:pending.length,c:"#ef4444"},
            {l:"Pending Amount",v:`₹${pending.reduce((s,x)=>s+x.amount,0).toFixed(1)}L`,c:"#f87171"},
          ].map((s,i)=>(
            <div key={i} style={{background:"#060610",border:"1px solid #1e1e30",borderRadius:4,padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:8,color:"#64748b",marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
            </div>
          ))}
        </div>
        {pending.length>0 && <>
          <div style={{fontSize:9,color:"#ef4444",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,marginTop:12}}>⏳ Pending ({pending.length})</div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
            <thead><tr style={{borderBottom:"1px solid #1e1e30"}}>{["Owner","Type","Rooms","Amount","Due","Reason"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{pending.map((s,i)=><tr key={i}>
              <td style={{color:"#e2e8f0"}}>{s.owner}</td>
              <td style={{color:"#94a3b8"}}>{s.type}</td>
              <td style={{color:"#f59e0b",fontWeight:700}}>{s.rooms}</td>
              <td style={{color:"#ef4444",fontWeight:700}}>₹{s.amount}L</td>
              <td style={{color:"#fb923c"}}>{s.due}</td>
              <td><span className="badge" style={{background:"#2d1010",color:"#f87171"}}>{s.reason}</span></td>
            </tr>)}</tbody>
          </table>
        </>}
        {paid.length>0 && <>
          <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>✅ Paid ({paid.length})</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:"1px solid #1e1e30"}}>{["Owner","Type","Rooms","Amount","Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{paid.map((s,i)=><tr key={i}>
              <td style={{color:"#e2e8f0"}}>{s.owner}</td>
              <td style={{color:"#94a3b8"}}>{s.type}</td>
              <td style={{color:"#f59e0b"}}>{s.rooms}</td>
              <td style={{color:"#22c55e",fontWeight:700}}>₹{s.amount}L</td>
              <td style={{color:"#4ade80"}}>{s.due}</td>
            </tr>)}</tbody>
          </table>
        </>}
      </div>
    </div>
  );
};

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [acqModal, setAcqModal] = useState(null);
  const [posModal, setPosModal] = useState(null);
  const [eofModal, setEofModal]  = useState(null);
  const [houseModal, setHouseModal] = useState(null);

  const totalAcq  = ACQ.reduce((s,m)=>s+m.total,0);
  const doneAcq   = ACQ.reduce((s,m)=>s+m.done,0);
  const totalPos  = POS.reduce((s,m)=>s+m.total,0);
  const donePos   = POS.reduce((s,m)=>s+m.done,0);
  const allStr    = HOUSE.flatMap(m=>m.structures);
  const pendStr   = allStr.filter(s=>s.status==="Pending");

  return (
    <div style={{fontFamily:"'DM Mono',monospace",background:"#060610",minHeight:"100vh",color:"#e2e8f0"}}>
      <G/>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(135deg,#0d0d1a,#060610)",borderBottom:"1px solid #1e1e30",padding:"18px 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:9,color:"#3b82f6",letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:5}}>Central Coalfields Limited · Argada Sub-Area</div>
            <div style={{fontSize:26,fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#fff",letterSpacing:"-0.02em"}}>
              L&R <span style={{color:"#3b82f6"}}>Argada Area</span>
            </div>
            <div style={{fontSize:10,color:"#475569",marginTop:3}}>Land & Rehabilitation Intelligence Dashboard · FY 2025–26</div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[
              {l:"TOTAL MINES",v:MINES.length,c:"#e2e8f0"},
              {l:"EOFFICE FILES",v:EOFFICE.length,c:"#3b82f6"},
              {l:"RTI OVERDUE",v:RTI.filter(r=>r.status==="Overdue").length,c:"#f87171"},
              {l:"HOUSE PENDING",v:pendStr.length,c:"#f59e0b"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",padding:"8px 14px",background:"#0d0d1a",border:"1px solid #1e1e30",borderRadius:4}}>
                <div style={{fontSize:8,color:"#475569",letterSpacing:"0.1em"}}>{s.l}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"24px 28px"}}>

        {/* ══ 1. ACQUISITION ══ */}
        <Divider label="Land Acquisition" color="#22c55e" icon="📋"/>
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14,marginBottom:6}}>
          {/* Big ring */}
          <div className="card" style={{padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <div style={{position:"relative"}}>
              <Ring done={doneAcq} total={totalAcq} size={110} stroke={11} color="#22c55e"/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{pct(doneAcq,totalAcq)}%</span>
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:"#22c55e",fontWeight:600}}>{doneAcq.toFixed(1)} Ha Acquired</div>
              <div style={{fontSize:11,color:"#ef4444",fontWeight:600}}>{(totalAcq-doneAcq).toFixed(1)} Ha Pending</div>
              <div style={{fontSize:10,color:"#475569",marginTop:2}}>of {totalAcq.toFixed(1)} Ha total</div>
            </div>
          </div>
          {/* Mine rows */}
          <div className="card" style={{padding:18}}>
            <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>Mine-wise Status — Click any row for plot details</div>
            {ACQ.map((m,i)=>{
              const mine = MINES.find(x=>x.id===m.mineId);
              const pend = m.total - m.done;
              const complete = pend === 0;
              return (
                <div key={i} className="rh" onClick={()=>setAcqModal({mine,data:m})}
                  style={{padding:"10px 8px",borderRadius:4,marginBottom:4,display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,alignItems:"center",transition:"background 0.15s"}}>
                  <div>
                    <div style={{fontSize:12,color:"#e2e8f0",marginBottom:5}}>{mine?.name}</div>
                    <Bar done={m.done} total={m.total} color="#22c55e"/>
                  </div>
                  <div style={{textAlign:"right",minWidth:80}}>
                    <div style={{fontSize:10,color:"#64748b"}}>Pending</div>
                    <div style={{fontSize:14,fontWeight:700,color:complete?"#22c55e":"#ef4444",fontFamily:"'Syne',sans-serif"}}>{complete?"✅ Done":`${pend.toFixed(1)} Ha`}</div>
                  </div>
                  <div style={{fontSize:11,color:"#22c55e",opacity:0.6}}>→</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ 2. POSSESSION ══ */}
        <Divider label="Possession" color="#a855f7" icon="🏗️"/>
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14,marginBottom:6}}>
          <div className="card" style={{padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <div style={{position:"relative"}}>
              <Ring done={donePos} total={totalPos} size={110} stroke={11} color="#a855f7"/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{pct(donePos,totalPos)}%</span>
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:"#a855f7",fontWeight:600}}>{donePos.toFixed(1)} Ha Possessed</div>
              <div style={{fontSize:11,color:"#ef4444",fontWeight:600}}>{(totalPos-donePos).toFixed(1)} Ha Pending</div>
              <div style={{fontSize:10,color:"#475569",marginTop:2}}>of {totalPos.toFixed(1)} Ha total</div>
            </div>
          </div>
          <div className="card" style={{padding:18}}>
            <div style={{fontSize:9,color:"#a855f7",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>Mine-wise Status — Click any row for plot details</div>
            {POS.map((m,i)=>{
              const mine = MINES.find(x=>x.id===m.mineId);
              const pend = m.total - m.done;
              const complete = pend===0;
              return (
                <div key={i} className="rh" onClick={()=>setPosModal({mine,data:m})}
                  style={{padding:"10px 8px",borderRadius:4,marginBottom:4,display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,alignItems:"center",transition:"background 0.15s"}}>
                  <div>
                    <div style={{fontSize:12,color:"#e2e8f0",marginBottom:5}}>{mine?.name}</div>
                    <Bar done={m.done} total={m.total} color="#a855f7"/>
                  </div>
                  <div style={{textAlign:"right",minWidth:80}}>
                    <div style={{fontSize:10,color:"#64748b"}}>Pending</div>
                    <div style={{fontSize:14,fontWeight:700,color:complete?"#a855f7":"#ef4444",fontFamily:"'Syne',sans-serif"}}>{complete?"✅ Done":`${pend.toFixed(1)} Ha`}</div>
                  </div>
                  <div style={{fontSize:11,color:"#a855f7",opacity:0.6}}>→</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ 3. EOFFICE ══ */}
        <Divider label="eOffice Status" color="#3b82f6" icon="📂"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
          <KPI label="Total Files" value={EOFFICE.length} color="#3b82f6"/>
          <KPI label="Critical" value={EOFFICE.filter(e=>e.priority==="Critical").length} color="#f87171"/>
          <KPI label="High Priority" value={EOFFICE.filter(e=>e.priority==="High").length} color="#fb923c"/>
          <KPI label="Avg Days Open" value={Math.round(EOFFICE.reduce((s,e)=>s+e.days,0)/EOFFICE.length)+"d"} color="#f59e0b"/>
        </div>
        <div className="card" style={{padding:18}}>
          <div style={{fontSize:9,color:"#3b82f6",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>All eOffice Files — Click any row for location & bottleneck</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:"1px solid #1e1e30"}}>
                {["eOffice No.","Subject","Current Desk","Stage","Days","Priority"].map(h=><th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {EOFFICE.map((e,i)=>{
                  const [bg,fg]=priC[e.priority]||["#1e1e30","#94a3b8"];
                  return <tr key={i} className="rh" style={{transition:"background 0.15s"}} onClick={()=>setEofModal(e)}>
                    <td style={{color:"#3b82f6",fontWeight:700}}>{e.id}</td>
                    <td style={{color:"#e2e8f0",maxWidth:180,fontSize:10}}>{e.subject}</td>
                    <td style={{color:"#94a3b8",fontSize:10}}>{e.desk}</td>
                    <td style={{color:"#64748b",fontSize:10}}>{e.stage}</td>
                    <td style={{color:e.days>30?"#ef4444":e.days>14?"#f59e0b":"#22c55e",fontWeight:700}}>{e.days}d</td>
                    <td><span className="badge" style={{background:bg,color:fg}}>{e.priority}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ 4. HOUSE COMPENSATION ══ */}
        <Divider label="House / Structure Compensation" color="#f59e0b" icon="🏠"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
          <KPI label="Total Structures" value={allStr.length} color="#f59e0b"/>
          <KPI label="Pending" value={pendStr.length} color="#ef4444"/>
          <KPI label="Pending Amount" value={`₹${pendStr.reduce((s,x)=>s+x.amount,0).toFixed(1)}L`} color="#f87171"/>
          <KPI label="Paid" value={allStr.filter(s=>s.status==="Paid").length} color="#22c55e"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {HOUSE.map((m,i)=>{
            const pending = m.structures.filter(s=>s.status==="Pending");
            const paid = m.structures.filter(s=>s.status==="Paid");
            const pendAmt = pending.reduce((s,x)=>s+x.amount,0);
            return (
              <div key={i} className="card cl" style={{padding:18}} onClick={()=>setHouseModal(m)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:9,color:"#f59e0b",letterSpacing:"0.1em",marginBottom:4}}>{m.mineId}</div>
                    <div style={{fontSize:14,fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#fff"}}>{m.mineName}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:9,color:"#64748b"}}>PENDING AMT</div>
                    <div style={{fontSize:18,fontWeight:700,color:"#ef4444",fontFamily:"'Syne',sans-serif"}}>₹{pendAmt.toFixed(1)}L</div>
                  </div>
                </div>
                <Bar done={paid.length} total={m.structures.length} color="#f59e0b"/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                  <div style={{display:"flex",gap:14}}>
                    <span style={{fontSize:10,color:"#22c55e"}}>✅ Paid: {paid.length}</span>
                    <span style={{fontSize:10,color:"#ef4444"}}>⏳ Pending: {pending.length}</span>
                    <span style={{fontSize:10,color:"#f59e0b"}}>🏠 Rooms: {pending.reduce((s,x)=>s+x.rooms,0)} pending</span>
                  </div>
                  <span style={{fontSize:10,color:"#f59e0b"}}>Details →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ══ 5. RTI ══ */}
        <Divider label="RTI Pending" color="#ef4444" icon="📜"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
          <KPI label="Total RTI Pending" value={RTI.length} color="#ef4444"/>
          <KPI label="Overdue" value={RTI.filter(r=>r.status==="Overdue").length} color="#f87171" sub="Immediate action needed"/>
          <KPI label="Due Within 7 Days" value={RTI.filter(r=>r.daysLeft>=0&&r.daysLeft<=7).length} color="#fb923c"/>
        </div>

        {RTI.some(r=>r.status==="Overdue") && (
          <div style={{marginBottom:14,padding:"12px 16px",background:"#1a0808",border:"1px solid #ef444450",borderLeft:"4px solid #ef4444",borderRadius:4}}>
            <span style={{fontSize:11,color:"#f87171",fontWeight:700}}>⚠️ OVERDUE ALERT: </span>
            <span style={{fontSize:11,color:"#f87171"}}>{RTI.filter(r=>r.status==="Overdue").length} RTI applications overdue. Under RTI Act 2005, penalty of ₹250/day applies. Immediate action required.</span>
          </div>
        )}

        <div className="card" style={{padding:18}}>
          <div style={{fontSize:9,color:"#ef4444",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>RTI Register — Sorted by Urgency</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:"1px solid #1e1e30"}}>
                {["RTI No.","Applicant","Subject","Mine","Deadline","Days Left","Status","Action Required"].map(h=><th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[...RTI].sort((a,b)=>a.daysLeft-b.daysLeft).map((r,i)=>{
                  const [bg,fg]=rtiC[r.status]||["#1e1e30","#94a3b8"];
                  const mine = MINES.find(m=>m.id===r.mineId);
                  return <tr key={i} style={{transition:"background 0.15s"}}>
                    <td style={{color:"#ef4444",fontWeight:700}}>{r.id}</td>
                    <td style={{color:"#e2e8f0"}}>{r.applicant}</td>
                    <td style={{color:"#94a3b8",fontSize:10,maxWidth:150}}>{r.subject}</td>
                    <td style={{color:"#64748b",fontSize:10}}>{mine?.name}</td>
                    <td style={{color:"#fb923c",fontWeight:600}}>{r.deadline}</td>
                    <td style={{fontWeight:700,color:r.daysLeft<0?"#f87171":r.daysLeft<=7?"#fb923c":"#60a5fa"}}>
                      {r.daysLeft<0?`${Math.abs(r.daysLeft)}d overdue`:`${r.daysLeft}d left`}
                    </td>
                    <td><span className="badge" style={{background:bg,color:fg}}>{r.status}</span></td>
                    <td style={{color:"#94a3b8",fontSize:10}}>{r.action}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{height:32}}/>
      </div>

      {/* ── MODALS ── */}
      {acqModal   && <AcqModal   mine={acqModal.mine}  data={acqModal.data}  onClose={()=>setAcqModal(null)}/>}
      {posModal   && <PosModal   mine={posModal.mine}  data={posModal.data}  onClose={()=>setPosModal(null)}/>}
      {eofModal   && <EofficeModal file={eofModal}                           onClose={()=>setEofModal(null)}/>}
      {houseModal && <HouseModal  data={houseModal}                          onClose={()=>setHouseModal(null)}/>}
    </div>
  );
}
