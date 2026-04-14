import { useState, useRef, useEffect, useCallback } from "react";
import { MODELS, TREE_ORDER, LANG_COLORS } from "./utils/constants";
import { callAPI } from "./utils/api";
import Sidebar from "./components/Sidebar";
import MessageBubble from "./components/MessageBubble";
import AddModelModal from "./components/AddModelModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("Chat");
  const [messages, setMessages] = useState([{ role: "assistant", content: "Mrhba! Ana **DevMind AI** — free w bla 9oyod 🚀\n\nYmknek:\n- Tkteb code w n3awnek\n- Trsl **image** (screenshot, diagram, error...)\n- Trsl **file** w nqra w nhlel fiha\n- Cli f **Files** tab bach tchouf l code dyal had l project\n- Tbdel l model mn sidebar\n\nAsh bgha daba?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState(MODELS);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showAddModel, setShowAddModel] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [openedFile, setOpenedFile] = useState(null);
  const [openFolders, setOpenFolders] = useState({ "src/": true });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleFileClick = (node) => {
    if (node.type === "folder") setOpenFolders(p => ({ ...p, [node.path]: !p[node.path] }));
    else setOpenedFile(node);
  };

  const sendMessage = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory); setInput(""); setLoading(true);
    try {
      const reply = await callAPI(selectedModel, newHistory);
      setMessages(p => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: `❌ Error: ${e.message}` }]);
    }
    setLoading(false);
  }, [input, attachments, loading, messages, selectedModel]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080811", color: "#e2e8f0", overflow: "hidden" }}>
      {sidebarOpen && <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} models={models} 
        selectedModel={selectedModel} setSelectedModel={setSelectedModel}
        updateModel={(id, k, v) => setModels(p => p.map(m => m.id === id ? { ...m, [k]: v } : m))}
        deleteModel={id => setModels(p => p.filter(m => m.id !== id))}
        setShowAddModel={setShowAddModel} setInput={setInput}
        visibleTree={TREE_ORDER} openFolders={openFolders} handleFileClick={handleFileClick}
        onNewChat={() => setMessages([{role:"assistant", content:"Chat jadid!"}])}
      />}
      
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ height: "48px", background: "#0d0d1a", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid #1e1e30" }}>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>☰</button>
           <div style={{ marginLeft: "12px", fontSize: "12px", color: selectedModel.color }}>{selectedModel.name}</div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
          {openedFile ? (
            <div style={{ background: "#0d0d1a", padding: "20px", borderRadius: "10px" }}>
              <h3>{openedFile.name}</h3>
              <button onClick={() => setOpenedFile(null)}>Close</button>
              <pre>{`// Content of ${openedFile.name} would go here`}</pre>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} msg={msg} modelIcon={selectedModel.icon} modelColor={selectedModel.color} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", gap: "10px", background: "#0d0d1a", padding: "10px", borderRadius: "10px", border: "1px solid #2a2a3a" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1, background: "none", border: "none", color: "white", outline: "none" }} placeholder="Ask AI..." />
            <button onClick={sendMessage} style={{ background: selectedModel.color, border: "none", borderRadius: "5px", color: "white", padding: "5px 15px" }}>Send</button>
          </div>
        </div>
      </main>
      {showAddModel && <AddModelModal onAdd={m => setModels([...models, m])} onClose={() => setShowAddModel(false)} />}
    </div>
  );
}
