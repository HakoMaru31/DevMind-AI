import { useState, useRef, useEffect, useCallback } from "react";
import { MODELS, API_TYPES, LANG_COLORS, TREE_ORDER } from "./utils/constants";
import { callAPI } from "./utils/api";

// --- Components Helpers ---
function CodeBlock({ lang, code }) {
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1500);};
  return (
    <div style={{margin:"12px 0",borderRadius:"8px",overflow:"hidden",border:"1px solid #2a2a3a"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 12px",background:"#1a1a2e",borderBottom:"1px solid #2a2a3a"}}>
        <span style={{fontSize:"11px",color:"#888",fontFamily:"monospace"}}>{lang||"code"}</span>
        <button onClick={copy} style={{fontSize:"10px",color:copied?"#10b981":"#888",background:"none",border:"none",cursor:"pointer",padding:"2px 8px",borderRadius:"4px"}}>
          {copied?"✓ copied":"copy"}
        </button>
      </div>
      <pre style={{margin:0,padding:"14px",background:"#0d0d1a",color:"#e2e8f0",fontSize:"12.5px",fontFamily:"'JetBrains Mono','Fira Code',monospace",overflowX:"auto",lineHeight:1.6}}>
        {code}
      </pre>
    </div>
  );
}

function parseMarkdown(text) {
  const lines=text.split("\n"); const result=[]; let inCode=false,codeLang="",codeLines=[],key=0;
  for(const line of lines){
    if(line.startsWith("```")){
      if(!inCode){inCode=true;codeLang=line.slice(3).trim();codeLines=[];}
      else{result.push(<CodeBlock key={key++} lang={codeLang} code={codeLines.join("\n")}/>);inCode=false;codeLang="";codeLines=[];}
    } else if(inCode){codeLines.push(line);}
    else if(line.startsWith("### ")) result.push(<h3 key={key++} style={{color:"#a78bfa",fontSize:"14px",margin:"12px 0 4px"}}>{line.slice(4)}</h3>);
    else if(line.startsWith("## "))  result.push(<h2 key={key++} style={{color:"#c4b5fd",fontSize:"15px",margin:"14px 0 6px"}}>{line.slice(3)}</h2>);
    else if(line.startsWith("# "))   result.push(<h1 key={key++} style={{color:"#ddd6fe",fontSize:"17px",margin:"16px 0 8px"}}>{line.slice(2)}</h1>);
    else if(line.startsWith("- ")||line.startsWith("* ")) result.push(<div key={key++} style={{display:"flex",gap:"8px",marginBottom:"3px",color:"#cbd5e1",fontSize:"13.5px"}}><span style={{color:"#7c3aed"}}>▸</span><span>{line.slice(2)}</span></div>);
    else if(line.trim()){
      const parts=line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      result.push(<p key={key++} style={{margin:"4px 0",color:"#cbd5e1",fontSize:"13.5px",lineHeight:1.7}}>
        {parts.map((p,j)=>{
          if(p.startsWith("**")&&p.endsWith("**")) return <strong key={j} style={{color:"#e2e8f0"}}>{p.slice(2,-2)}</strong>;
          if(p.startsWith("`")&&p.endsWith("`"))   return <code key={j} style={{background:"#1e1b4b",color:"#a78bfa",padding:"1px 5px",borderRadius:"3px",fontFamily:"monospace",fontSize:"12.5px"}}>{p.slice(1,-1)}</code>;
          return p;
        })}
      </p>);
    } else result.push(<div key={key++} style={{height:"6px"}}/>);
  }
  return result;
}

function MessageBubble({ msg, modelIcon, modelColor }) {
  const [copied,setCopied]=useState(false);
  const isUser=msg.role==="user";
  const copyAll=()=>{navigator.clipboard.writeText(msg.content);setCopied(true);setTimeout(()=>setCopied(false),1500);};
  return (
    <div style={{display:"flex",gap:"12px",marginBottom:"24px",alignItems:"flex-start",flexDirection:isUser?"row-reverse":"row"}}>
      <div style={{width:"30px",height:"30px",borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",
        background:isUser?"linear-gradient(135deg,#7c3aed,#2563eb)":`${modelColor}22`,
        border:!isUser?`1px solid ${modelColor}44`:"none",color:!isUser?modelColor:"white"}}>
        {isUser?"U":modelIcon}
      </div>
      <div style={{maxWidth:"76%",position:"relative"}}>
        {msg.images?.map((src,i)=>(
          <img key={i} src={src} alt="attachment" style={{maxWidth:"260px",maxHeight:"180px",borderRadius:"8px",marginBottom:"6px",display:"block",border:"1px solid #2a2a3a",objectFit:"cover"}}/>
        ))}
        {msg.fileName&&(
          <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 10px",background:"#1e1b4b",border:"1px solid #312e81",borderRadius:"6px",marginBottom:"6px",fontSize:"11.5px",color:"#a78bfa"}}>
            📎 {msg.fileName}
          </div>
        )}
        {msg.content&&(
          <div style={{background:isUser?"#1e1b4b":"#0f0f1e",border:`1px solid ${isUser?"#312e81":"#1e1e30"}`,
            borderRadius:isUser?"16px 4px 16px 16px":"4px 16px 16px 16px",padding:"12px 16px",position:"relative"}}>
            {isUser?<p style={{margin:0,fontSize:"13.5px",color:"#e2e8f0",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{msg.content}</p>:<>{parseMarkdown(msg.content)}</>}
            {!isUser&&(
              <button onClick={copyAll} style={{position:"absolute",top:"8px",right:"10px",background:"none",border:"1px solid #2a2a3a",color:copied?"#10b981":"#555",fontSize:"10px",cursor:"pointer",borderRadius:"4px",padding:"2px 7px"}}>
                {copied?"✓":"⎘"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AddModelModal({ onAdd, onClose }) {
  const [form,setForm]=useState({name:"",id:"",provider:"",color:"#6366f1",icon:"◆",apiType:"openai_compat",apiKey:"",baseUrl:""});
  const [error,setError]=useState("");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const fs={width:"100%",background:"#080811",border:"1px solid #2a2a3a",borderRadius:"6px",padding:"8px 10px",color:"#e2e8f0",fontSize:"12px",boxSizing:"border-box",outline:"none"};
  const lbl={fontSize:"11px",color:"#888",marginBottom:"4px",display:"block"};
  
  const handleAdd=()=>{
    if(!form.name.trim()) return setError("Model Name required");
    if(!form.id.trim())   return setError("Model ID required");
    onAdd({...form});
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"#000000bb",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#0d0d1a",border:"1px solid #2a2a3a",borderRadius:"14px",padding:"24px",width:"360px",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <span style={{fontSize:"15px",fontWeight:700,color:"#e2e8f0"}}>➕ Add New Model</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:"20px"}}>×</button>
        </div>
        <div style={{display:"grid",gap:"12px"}}>
          {[["Model Name *","name","e.g. GPT-4o","text"],["Model ID *","id","e.g. gpt-4o","text"],["Provider","provider","e.g. OpenAI","text"]].map(([label,key,ph,type])=>(
            <div key={key}><label style={lbl}>{label}</label><input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph} style={fs}/></div>
          ))}
          <div><label style={lbl}>API Type</label>
            <select value={form.apiType} onChange={e=>set("apiType",e.target.value)} style={fs}>
              {API_TYPES.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div><label style={lbl}>API Key</label><input type="password" value={form.apiKey} onChange={e=>set("apiKey",e.target.value)} placeholder="sk-..." style={fs}/></div>
          {(form.apiType==="openai_compat"||form.apiType==="openai")&&(
            <div><label style={lbl}>Base URL</label><input value={form.baseUrl} onChange={e=>set("baseUrl",e.target.value)} placeholder="https://api.example.com/v1" style={fs}/></div>
          )}
        </div>
        {error&&<div style={{marginTop:"10px",color:"#f87171",fontSize:"11.5px",background:"#7f1d1d22",padding:"7px 10px",borderRadius:"6px"}}>⚠ {error}</div>}
        <div style={{display:"flex",gap:"8px",marginTop:"20px"}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",borderRadius:"8px",border:"1px solid #2a2a3a",background:"none",color:"#888",cursor:"pointer",fontSize:"12.5px"}}>Cancel</button>
          <button onClick={handleAdd} style={{flex:2,padding:"9px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,#7c3aed,#2563eb)",color:"white",cursor:"pointer",fontSize:"12.5px",fontWeight:600}}>Add Model</button>
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [activeTab,setActiveTab]=useState("Chat");
  const [messages,setMessages]=useState([
    {role:"assistant",content:"Mrhba! Ana **DevMind AI** — free w bla 9oyod 🚀\n\nYmknek:\n- Tkteb code w n3awnek\n- Trsl **image** (screenshot, diagram, error...)\n- Trsl **file** w nqra w nhlel fiha\n- Tbdel l model mn sidebar\n\nAsh bgha daba?"}
  ]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [models,setModels]=useState(MODELS);
  const [selectedModel,setSelectedModel]=useState(MODELS[0]);
  const [showAddModel,setShowAddModel]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [attachments,setAttachments]=useState([]);
  
  const messagesEndRef=useRef(null);
  const fileInputRef=useRef(null);

  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const handleFileAttach=(e)=>{
    Array.from(e.target.files).forEach(file=>{
      const reader=new FileReader();
      if(file.type.startsWith("image/")){
        reader.onload=ev=>setAttachments(p=>[...p,{type:"image",src:ev.target.result,name:file.name}]);
        reader.readAsDataURL(file);
      } else {
        reader.onload=ev=>{
          const text=ev.target.result;
          setInput(p=>`${p}${p?"\n":""}\`\`\`\n${text.slice(0,3000)}\n\`\`\`\``);
          setAttachments(p=>[...p,{type:"file",src:null,name:file.name}]);
        };
        reader.readAsText(file);
      }
    });
    e.target.value="";
  };

  const sendMessage=useCallback(async()=>{
    if((!input.trim()&&attachments.length===0)||loading) return;
    const images=attachments.filter(a=>a.type==="image").map(a=>a.src);
    const fileNames=attachments.filter(a=>a.type==="file").map(a=>a.name);
    const userMsg={role:"user",content:input.trim()||(fileNames.length?`[File: ${fileNames.join(", ")}]`:""),images:images.length?images:undefined,fileName:fileNames.length?fileNames.join(", "):undefined};
    const newHistory=[...messages,userMsg];
    
    setMessages(newHistory);setInput("");setAttachments([]);setLoading(true);
    try{
      const reply=await callAPI(selectedModel,newHistory.filter(m=>m.role!=="system"));
      setMessages(p=>[...p,{role:"assistant",content:reply}]);
    }catch(e){
      setMessages(p=>[...p,{role:"assistant",content:`❌ **Error:** ${e.message}`}]);
    }
    setLoading(false);
  },[input,attachments,loading,messages,selectedModel]);

  const handleKey=(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}};
  
  return (
    <div style={{display:"flex",height:"100vh",background:"#080811",color:"#e2e8f0",fontFamily:"'DM Sans','Segoe UI',sans-serif",overflow:"hidden"}}>
      
      {/* Sidebar */}
      {sidebarOpen&&(
        <div style={{width:"232px",background:"#0d0d1a",borderRight:"1px solid #1e1e30",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"14px 12px",borderBottom:"1px solid #1e1e30",display:"flex",alignItems:"center",gap:"8px"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"8px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0}}>✦</div>
            <div><div style={{fontSize:"13px",fontWeight:700}}>DevMind AI</div><div style={{fontSize:"10px",color:"#555"}}>Free · Unlimited</div></div>
          </div>
          
          <div style={{flex:1,overflow:"auto",padding:"10px 8px"}}>
             {/* Quick Actions Example */}
             <div style={{fontSize:"10px",color:"#555",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Quick Actions</div>
              {["Explain this code","Fix the bug","Optimize performance"].map(q=>(
                <button key={q} onClick={()=>setInput(q)} style={{width:"100%",textAlign:"left",padding:"6px 8px",borderRadius:"5px",border:"1px solid #1e1e30",background:"none",color:"#666",fontSize:"11px",cursor:"pointer",marginBottom:"4px"}}>
                  {q}
                </button>
              ))}
          </div>
          <div style={{padding:"10px 8px",borderTop:"1px solid #1e1e30"}}>
            <button onClick={()=>{setMessages([{role:"assistant",content:"Chat jadid! Kif n9der n3awnek? 🚀"}]);}} style={{width:"100%",padding:"8px",borderRadius:"6px",border:"1px solid #2a2a3a",background:"none",color:"#a78bfa",cursor:"pointer",fontSize:"12px"}}>+ New Chat</button>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        
        {/* Top Bar */}
        <div style={{height:"48px",background:"#0d0d1a",borderBottom:"1px solid #1e1e30",display:"flex",alignItems:"center",padding:"0 16px",gap:"12px",flexShrink:0}}>
          <button onClick={()=>setSidebarOpen(p=>!p)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:"16px",padding:"4px"}}>☰</button>
          <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"5px 14px",borderRadius:"20px",background:`${selectedModel.color}15`,border:`1px solid ${selectedModel.color}30`}}>
            <span style={{color:selectedModel.color,fontSize:"13px"}}>{selectedModel.icon}</span>
            <span style={{fontSize:"12px",color:selectedModel.color,fontWeight:500}}>{selectedModel.name}</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflow:"auto",padding:"20px 24px"}}>
          {messages.map((msg,i)=><MessageBubble key={i} msg={msg} modelIcon={selectedModel.icon} modelColor={selectedModel.color}/>)}
          {loading&&(
            <div style={{display:"flex",gap:"12px",marginBottom:"24px",alignItems:"flex-start"}}>
              <div style={{width:"30px",height:"30px",borderRadius:"50%",background:`${selectedModel.color}22`,border:`1px solid ${selectedModel.color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:selectedModel.color,fontSize:"13px"}}>{selectedModel.icon}</div>
              <div style={{background:"#0f0f1e",border:"1px solid #1e1e30",borderRadius:"4px 16px 16px 16px",padding:"14px 18px",display:"flex",gap:"5px",alignItems:"center"}}>
                {.map(j=><div key={j} style={{width:"6px",height:"6px",borderRadius:"50%",background:selectedModel.color,animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${j*0.2}s`,opacity:0.7}}/>)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input Area */}
        <div style={{padding:"12px 20px 18px",background:"#0a0a15",borderTop:"1px solid #1e1e30"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"flex-end",background:"#0d0d1a",borderRadius:"12px",border:"1px solid #2a2a3a",padding:"8px 12px"}}>
            <button onClick={()=>fileInputRef.current?.click()} style={{width:"32px",height:"32px",background:"none",border:"1px solid #2a2a3a",borderRadius:"7px",color:"#666",cursor:"pointer",fontSize:"15px"}}>📎</button>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileAttach} style={{display:"none"}}/>
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} placeholder={`Ask ${selectedModel.name}… (Shift+Enter = newline)`} style={{flex:1,background:"none",border:"none",color:"#e2e8f0",fontSize:"13.5px",resize:"none",outline:"none",fontFamily:"inherit",maxHeight:"160px"}} />
            <button onClick={sendMessage} disabled={loading} style={{width:"34px",height:"34px",borderRadius:"8px",border:"none",background:loading?"#1e1e30":`linear-gradient(135deg,${selectedModel.color},${selectedModel.color}bb)`,color:"white",cursor:"pointer"}}>↑</button>
          </div>
        </div>

      </div>
    </div>
  );
}
