import { useState } from "react";
import { API_TYPES } from "../utils/constants";

export default function AddModelModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name:"", id:"", provider:"", color:"#6366f1", icon:"◆", apiType:"openai_compat", apiKey:"", baseUrl:"" });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fs={width:"100%",background:"#080811",border:"1px solid #2a2a3a",borderRadius:"6px",padding:"8px 10px",color:"#e2e8f0",fontSize:"12px",boxSizing:"border-box",outline:"none"};
  const lbl={fontSize:"11px",color:"#888",marginBottom:"4px",display:"block"};

  const handleAdd = () => {
    if (!form.name.trim()) return setError("Model Name is required");
    if (!form.id.trim())   return setError("Model ID is required");
    onAdd({ ...form });
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"#000000bb",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#0d0d1a",border:"1px solid #2a2a3a",borderRadius:"14px",padding:"24px",width:"360px",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <span style={{fontSize:"15px",fontWeight:700,color:"#e2e8f0"}}>➕ Add New Model</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:"20px"}}>×</button>
        </div>
        
        <div style={{display:"grid",gap:"12px"}}>
          <div><label style={lbl}>Model Name *</label><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. GPT-4o" style={fs}/></div>
          <div><label style={lbl}>Model ID *</label><input value={form.id} onChange={e=>set("id",e.target.value)} placeholder="e.g. gpt-4o" style={fs}/></div>
          <div><label style={lbl}>Provider</label><input value={form.provider} onChange={e=>set("provider",e.target.value)} placeholder="e.g. OpenAI" style={fs}/></div>
          
          <div><label style={lbl}>API Type</label>
            <select value={form.apiType} onChange={e=>set("apiType",e.target.value)} style={fs}>
              {API_TYPES.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          
          <div><label style={lbl}>API Key</label><input type="password" value={form.apiKey} onChange={e=>set("apiKey",e.target.value)} placeholder="sk-..." style={fs}/></div>
          
          {(form.apiType === "openai_compat" || form.apiType === "openai") && (
            <div><label style={lbl}>Base URL</label><input value={form.baseUrl} onChange={e=>set("baseUrl",e.target.value)} placeholder="https://api.example.com/v1" style={fs}/></div>
          )}
        </div>

        {error && <div style={{marginTop:"10px",color:"#f87171",fontSize:"11.5px",background:"#7f1d1d22",padding:"7px 10px",borderRadius:"6px"}}>⚠ {error}</div>}
        
        <div style={{display:"flex",gap:"8px",marginTop:"20px"}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",borderRadius:"8px",border:"1px solid #2a2a3a",background:"none",color:"#888",cursor:"pointer",fontSize:"12.5px"}}>Cancel</button>
          <button onClick={handleAdd} style={{flex:2,padding:"9px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,#7c3aed,#2563eb)",color:"white",cursor:"pointer",fontSize:"12.5px",fontWeight:600}}>Add Model</button>
        </div>
      </div>
    </div>
  );
}
