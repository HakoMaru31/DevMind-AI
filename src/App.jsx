import { useState, useRef, useEffect, useCallback } from "react";
import { MODELS, API_TYPES } from "./utils/constants";
import { callAPI } from "./utils/api";
import MessageBubble from "./components/MessageBubble";
import AddModelModal from "./components/AddModelModal";

export default function App() {
  const [activeTab, setActiveTab]       = useState("Chat");
  const [messages, setMessages]         = useState([{ role: "assistant", content: "Mrhba! Ana **DevMind AI** — free w bla 9oyod 🚀\n\nYmknek:\n- Tkteb code w n3awnek\n- Trsl **image** (screenshot, diagram, error...)\n- Trsl **file** w nqra w nhlel fiha\n- Tbdel l model mn sidebar\n\nAsh bgha daba?" }]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [models, setModels]             = useState(MODELS);
  const [selectedModel, setSelectedModel] = useState(MODELS);
  const [showAddModel, setShowAddModel] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [attachments, setAttachments]   = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileAttach = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      if (file.type.startsWith("image/")) {
        reader.onload = ev => setAttachments(p => [...p, { type: "image", src: ev.target.result, name: file.name }]);
        reader.readAsDataURL(file);
      } else {
        reader.onload = ev => {
          const text = ev.target.result;
          setInput(p => `${p}${p ? "\n" : ""}\`\`\`\n${text.slice(0, 3000)}\n\`\`\`\``);
          setAttachments(p => [...p, { type: "file", src: null, name: file.name }]);
        };
        reader.readAsText(file);
      }
    });
    e.target.value = "";
  };

  const sendMessage = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;
    const images   = attachments.filter(a => a.type === "image").map(a => a.src);
    const fileNames = attachments.filter(a => a.type === "file").map(a => a.name);
    const userMsg  = { role: "user", content: input.trim() || (fileNames.length ? `[File: ${fileNames.join(", ")}]` : ""), images: images.length ? images : undefined, fileName: fileNames.length ? fileNames.join(", ") : undefined };
    
    const newHistory  = [...messages, userMsg];
    setMessages(newHistory);
    setInput(""); setAttachments([]); setLoading(true);

    try {
      const reply = await callAPI(selectedModel, newHistory.filter(m => m.role !== "system"));
      setMessages(p => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: `❌ **Error:** ${e.message}` }]);
    }
    setLoading(false);
  }, [input, attachments, loading, messages, selectedModel]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div style={{ display:"flex", height:"100vh", background:"#080811", color:"#e2e8f0", fontFamily:"'DM Sans','Segoe UI',sans-serif", overflow:"hidden" }}>
      
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width:"232px", background:"#0d0d1a", borderRight:"1px solid #1e1e30", display:"flex", flexDirection:"column", flexShrink:0 }}>
          <div style={{ padding:"14px 12px", borderBottom:"1px solid #1e1e30", display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 }}>✦</div>
            <div><div style={{ fontSize:"13px", fontWeight:700 }}>DevMind AI</div><div style={{ fontSize:"10px", color:"#555" }}>Free · Unlimited</div></div>
          </div>
          
          <div style={{ flex:1, overflow:"auto", padding:"10px 8px" }}>
             <div style={{ fontSize:"10px", color:"#555", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"1px" }}>Quick Actions</div>
              {["Explain this code", "Fix the bug", "Optimize performance"].map(q => (
                <button key={q} onClick={() => setInput(q)} style={{ width:"100%", textAlign:"left", padding:"6px 8px", borderRadius:"5px", border:"1px solid #1e1e30", background:"none", color:"#666", fontSize:"11px", cursor:"pointer", marginBottom:"4px" }}>
                  {q}
                </button>
              ))}
          </div>
          <div style={{ padding:"10px 8px", borderTop:"1px solid #1e1e30" }}>
            <button onClick={() => { setMessages([{ role:"assistant", content:"Chat jadid! Kif n9der n3awnek? 🚀" }]); }} style={{ width:"100%", padding:"8px", borderRadius:"6px", border:"1px solid #2a2a3a", background:"none", color:"#a78bfa", cursor:"pointer", fontSize:"12px" }}>+ New Chat</button>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        
        {/* Top Bar */}
        <div style={{ height:"48px", background:"#0d0d1a", borderBottom:"1px solid #1e1e30", display:"flex", alignItems:"center", padding:"0 16px", gap:"12px", flexShrink:0 }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:"16px", padding:"4px" }}>☰</button>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"5px 14px", borderRadius:"20px", background:`${selectedModel.color}15`, border:`1px solid ${selectedModel.color}30` }}>
            <span style={{ color:selectedModel.color, fontSize:"13px" }}>{selectedModel.icon}</span>
            <span style={{ fontSize:"12px", color:selectedModel.color, fontWeight:500 }}>{selectedModel.name}</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflow:"auto", padding:"20px 24px" }}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} modelIcon={selectedModel.icon} modelColor={selectedModel.color} />)}
          {loading && (
            <div style={{ display:"flex", gap:"12px", marginBottom:"24px", alignItems:"flex-start" }}>
              <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:`${selectedModel.color}22`, border:`1px solid ${selectedModel.color}44`, display:"flex", alignItems:"center", justifyContent:"center", color:selectedModel.color, fontSize:"13px" }}>{selectedModel.icon}</div>
              <div style={{ background:"#0f0f1e", border:"1px solid #1e1e30", borderRadius:"4px 16px 16px 16px", padding:"14px 18px", display:"flex", gap:"5px", alignItems:"center" }}>
                {[0, 1, 2].map(j => <div key={j} style={{ width:"6px", height:"6px", borderRadius:"50%", background:selectedModel.color, animation:"pulse 1.2s ease-in-out infinite", animationDelay:`${j*0.2}s`, opacity:0.7 }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding:"12px 20px 18px", background:"#0a0a15", borderTop:"1px solid #1e1e30" }}>
          <div style={{ display:"flex", gap:"8px", alignItems:"flex-end", background:"#0d0d1a", borderRadius:"12px", border:"1px solid #2a2a3a", padding:"8px 12px" }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ width:"32px", height:"32px", background:"none", border:"1px solid #2a2a3a", borderRadius:"7px", color:"#666", cursor:"pointer", fontSize:"15px" }}>📎</button>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileAttach} style={{ display:"none" }} />
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder={`Ask ${selectedModel.name}… (Shift+Enter = newline)`} style={{ flex:1, background:"none", border:"none", color:"#e2e8f0", fontSize:"13.5px", resize:"none", outline:"none", fontFamily:"inherit", maxHeight:"160px" }} />
            <button onClick={sendMessage} disabled={loading} style={{ width:"34px", height:"34px", borderRadius:"8px", border:"none", background:loading ? "#1e1e30" : `linear-gradient(135deg,${selectedModel.color},${selectedModel.color}bb)`, color:"white", cursor:"pointer" }}>↑</button>
          </div>
        </div>

      </div>
      {showAddModel && <AddModelModal onAdd={(m) => { setModels([...models, m]); setShowAddModel(false); }} onClose={() => setShowAddModel(false)} />}
    </div>
  );
}
