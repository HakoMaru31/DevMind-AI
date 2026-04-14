import React from 'react';

export default function Sidebar({ models, activeModel, onSelect, onAdd, activeTab, onTabChange }) {
  return (
    <div style={{width:"260px",background:"#0a0a0f",borderRight:"1px solid #1a1a2a",display:\"flex\",flexDirection:\"column\"}}>
      <div style={{padding:\"20px\",borderBottom:\"1px solid #1a1a2a\"}}>
        <div style={{display:\"flex\",alignItems:\"center\",gap:\"10px\",marginBottom:\"20px\"}}>
          <div style={{width:\"32px\",height:\"32px\",background:\"linear-gradient(135deg,#6366f1,#a855f7)\",borderRadius:\"8px\",display:\"flex\",alignItems:\"center\",justifyContent:\"center\",fontWeight:\"bold\",color:\"white\"}}>D</div>
          <span style={{fontWeight:\"700\",fontSize:\"18px\",letterSpacing:\"-0.5px\",color:\"#fff\"}}>DevMind AI</span>
        </div>
      </div>
      {/* ... كمل باقي الـ HTML تاع الـ Sidebar من ملفك الأصلي ... */}
    </div>
  );
}
