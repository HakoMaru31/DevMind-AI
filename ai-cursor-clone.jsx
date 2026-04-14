import { useState, useRef, useEffect, useCallback } from "react";

// ── Real project file contents ────────────────────────────────────────────────
const PROJECT_FILES = {
  "package.json": {
    lang: "json",
    content: `{
  "name": "devmind-ai",
  "version": "1.0.0",
  "description": "Free AI Coding Assistant — like Cursor but unlimited",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}`
  },
  "src/App.jsx": {
    lang: "jsx",
    content: `import { useState, useRef, useEffect, useCallback } from "react";
import { MODELS, API_TYPE_OPTIONS, SYSTEM_PROMPT } from "./utils/constants";
import { callAPI } from "./utils/api";
import Sidebar from "./components/Sidebar";
import MessageBubble from "./components/MessageBubble";
import AddModelModal from "./components/AddModelModal";

export default function App() {
  const [activeTab, setActiveTab]       = useState("Chat");
  const [messages, setMessages]         = useState([{ role: "assistant", content: "Mrhba! 🚀" }]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [models, setModels]             = useState(MODELS);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showAddModel, setShowAddModel] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [attachments, setAttachments]   = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;
    const images   = attachments.filter(a => a.type === "image").map(a => a.src);
    const fileNames = attachments.filter(a => a.type === "file").map(a => a.name);
    const userMsg  = { role: "user", content: input.trim(), images, fileName: fileNames.join(", ") };
    const history  = [...messages, userMsg];
    setMessages(history);
    setInput(""); setAttachments([]); setLoading(true);
    try {
      const reply = await callAPI(selectedModel, history);
      setMessages(p => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: \`❌ **Error:** \${e.message}\` }]);
    }
    setLoading(false);
  }, [input, attachments, loading, messages, selectedModel]);

  return (
    <div style={{ display:"flex", height:"100vh", background:"#080811" }}>
      {sidebarOpen && <Sidebar ... />}
      <main style={{ flex:1, display:"flex", flexDirection:"column" }}>
        {/* top bar, messages, input */}
      </main>
      {showAddModel && <AddModelModal onAdd={addModel} onClose={() => setShowAddModel(false)} />}
    </div>
  );
}`
  },
  "src/index.css": {
    lang: "css",
    content: `/* DevMind AI — Global Styles */
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  background: #080811;
  color: #e2e8f0;
  height: 100vh;
  overflow: hidden;
}

/* Custom scrollbar */
::-webkit-scrollbar        { width: 4px; height: 4px; }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  { background: #2a2a3a; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #3a3a4a; }

input::placeholder,
textarea::placeholder { color: #3a3a55; }

/* Typing animation */
@keyframes pulse {
  0%, 100% { transform: scale(0.8); opacity: 0.4; }
  50%       { transform: scale(1.1); opacity: 1; }
}`
  },
  "src/components/Sidebar.jsx": {
    lang: "jsx",
    content: `import { useState } from "react";
import { FILE_TREE, LANG_COLORS } from "../utils/constants";

export default function Sidebar({
  activeTab, setActiveTab,
  models, selectedModel, setSelectedModel,
  updateModel, deleteModel, setShowAddModel,
  onNewChat
}) {
  return (
    <aside style={{ width:"232px", background:"#0d0d1a", borderRight:"1px solid #1e1e30", display:"flex", flexDirection:"column" }}>
      {/* Logo */}
      <Logo />

      {/* Tab nav */}
      <nav style={{ padding:"8px", borderBottom:"1px solid #1e1e30" }}>
        {["Chat","Files","Models","Settings"].map(tab => (
          <TabButton key={tab} tab={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </nav>

      {/* Panel content */}
      <div style={{ flex:1, overflow:"auto", padding:"10px 8px" }}>
        {activeTab === "Chat"     && <QuickActions />}
        {activeTab === "Files"    && <FileTreePanel />}
        {activeTab === "Models"   && <ModelsPanel models={models} selectedModel={selectedModel} setSelectedModel={setSelectedModel} updateModel={updateModel} deleteModel={deleteModel} setShowAddModel={setShowAddModel} />}
        {activeTab === "Settings" && <SettingsPanel />}
      </div>

      {/* New chat button */}
      <div style={{ padding:"10px 8px", borderTop:"1px solid #1e1e30" }}>
        <button onClick={onNewChat} style={{ width:"100%", padding:"8px", borderRadius:"6px", border:"1px solid #2a2a3a", background:"none", color:"#a78bfa", cursor:"pointer" }}>
          + New Chat
        </button>
      </div>
    </aside>
  );
}`
  },
  "src/components/MessageBubble.jsx": {
    lang: "jsx",
    content: `import { useState } from "react";
import { parseMarkdown } from "../utils/helpers";

export default function MessageBubble({ msg, modelIcon, modelColor }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copyAll = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display:"flex", gap:"12px", marginBottom:"24px", flexDirection: isUser ? "row-reverse" : "row" }}>
      {/* Avatar */}
      <Avatar isUser={isUser} modelIcon={modelIcon} modelColor={modelColor} />

      {/* Content */}
      <div style={{ maxWidth:"76%", position:"relative" }}>
        {/* Image previews */}
        {msg.images?.map((src, i) => (
          <img key={i} src={src} style={{ maxWidth:"260px", borderRadius:"8px", marginBottom:"6px", display:"block" }} />
        ))}
        {/* File badge */}
        {msg.fileName && <FileBadge name={msg.fileName} />}
        {/* Text bubble */}
        {msg.content && (
          <div style={{ background: isUser ? "#1e1b4b" : "#0f0f1e", borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding:"12px 16px", position:"relative" }}>
            {isUser ? <p style={{ margin:0 }}>{msg.content}</p> : parseMarkdown(msg.content)}
            {!isUser && <CopyBtn copied={copied} onClick={copyAll} />}
          </div>
        )}
      </div>
    </div>
  );
}`
  },
  "src/components/AddModelModal.jsx": {
    lang: "jsx",
    content: `import { useState } from "react";
import { API_TYPE_OPTIONS } from "../utils/constants";

const INITIAL = { name:"", id:"", provider:"", color:"#6366f1", icon:"◆", apiType:"openai_compat", apiKey:"", baseUrl:"" };

export default function AddModelModal({ onAdd, onClose }) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.name.trim()) return setError("Model Name is required");
    if (!form.id.trim())   return setError("Model ID is required");
    onAdd({ ...form });
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader title="➕ Add New Model" onClose={onClose} />
        <Field label="Model Name *"  value={form.name}     onChange={v => set("name", v)}     placeholder="e.g. GPT-4o" />
        <Field label="Model ID *"    value={form.id}       onChange={v => set("id", v)}       placeholder="e.g. gpt-4o" />
        <Field label="Provider"      value={form.provider} onChange={v => set("provider", v)} placeholder="e.g. OpenAI" />
        <SelectField label="API Type" value={form.apiType} onChange={v => set("apiType", v)} options={API_TYPE_OPTIONS} />
        <Field label="API Key" type="password" value={form.apiKey} onChange={v => set("apiKey", v)} placeholder="sk-..." />
        {(form.apiType === "openai_compat" || form.apiType === "openai") && (
          <Field label="Base URL" value={form.baseUrl} onChange={v => set("baseUrl", v)} placeholder="https://api.example.com/v1" />
        )}
        <ColorIconRow form={form} set={set} />
        {error && <ErrorBox msg={error} />}
        <ModalFooter onClose={onClose} onAdd={handleAdd} />
      </ModalBox>
    </Overlay>
  );
}`
  },
  "src/utils/api.js": {
    lang: "js",
    content: `import { SYSTEM_PROMPT } from "./constants";

/**
 * Unified API caller — routes to the right provider
 * based on model.apiType
 */
export async function callAPI(model, history) {
  const { apiType, apiKey, id, baseUrl } = model;

  // ── Anthropic (built-in, no key needed) ─────────────────────────
  if (apiType === "anthropic") {
    const msgs = history.map(m => {
      if (m.images?.length) {
        const content = [];
        m.images.forEach(src => {
          const b64 = src.split(",")[1];
          const mt  = src.split(";")[0].split(":")[1];
          content.push({ type:"image", source:{ type:"base64", media_type:mt, data:b64 } });
        });
        if (m.content) content.push({ type:"text", text:m.content });
        return { role:m.role, content };
      }
      return { role:m.role, content:m.content };
    });

    const res  = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM_PROMPT, messages:msgs })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content?.[0]?.text ?? "No response";
  }

  // ── Groq / OpenAI / OpenAI-compatible ───────────────────────────
  if (["groq","openai","openai_compat"].includes(apiType)) {
    if (!apiKey) throw new Error(\`API key missing for \${model.name}. Add it in the Models tab.\`);

    const endpoint = apiType === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : \`\${baseUrl || "https://api.openai.com/v1"}/chat/completions\`;

    const msgs = [
      { role:"system", content:SYSTEM_PROMPT },
      ...history.map(m => ({ role:m.role, content:m.content }))
    ];

    const res  = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization":\`Bearer \${apiKey}\` },
      body: JSON.stringify({ model:id, messages:msgs, max_tokens:1000 })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content ?? "No response";
  }

  throw new Error(\`Unknown API type: \${apiType}\`);
}`
  },
  "src/utils/helpers.js": {
    lang: "js",
    content: `import { useState } from "react";

/**
 * CodeBlock — renders a fenced code block with copy button
 */
export function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ margin:"12px 0", borderRadius:"8px", overflow:"hidden", border:"1px solid #2a2a3a" }}>
      <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 12px", background:"#1a1a2e" }}>
        <span style={{ fontSize:"11px", color:"#888", fontFamily:"monospace" }}>{lang || "code"}</span>
        <button onClick={copy} style={{ fontSize:"10px", color: copied ? "#10b981" : "#888", background:"none", border:"none", cursor:"pointer" }}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{ margin:0, padding:"14px", background:"#0d0d1a", color:"#e2e8f0", fontSize:"13px", fontFamily:"monospace", overflowX:"auto" }}>
        {code}
      </pre>
    </div>
  );
}

/**
 * parseMarkdown — converts markdown text to React elements
 * Supports: headings, bold, inline code, code blocks, lists
 */
export function parseMarkdown(text) {
  const lines  = text.split("\\n");
  const result = [];
  let inCode = false, codeLang = "", codeLines = [], key = 0;

  for (const line of lines) {
    if (line.startsWith("\`\`\`")) {
      if (!inCode) { inCode = true; codeLang = line.slice(3).trim(); codeLines = []; }
      else { result.push(<CodeBlock key={key++} lang={codeLang} code={codeLines.join("\\n")} />); inCode = false; }
    } else if (inCode) { codeLines.push(line); }
    else if (line.startsWith("# "))   result.push(<h1 key={key++}>{line.slice(2)}</h1>);
    else if (line.startsWith("## "))  result.push(<h2 key={key++}>{line.slice(3)}</h2>);
    else if (line.startsWith("### ")) result.push(<h3 key={key++}>{line.slice(4)}</h3>);
    else if (line.startsWith("- ") || line.startsWith("* ")) result.push(<li key={key++}>{line.slice(2)}</li>);
    else if (line.trim()) result.push(<p key={key++}>{line}</p>);
  }
  return result;
}`
  },
  "src/utils/constants.js": {
    lang: "js",
    content: `/**
 * All app-wide constants — models, prompts, file tree, colors
 */

export const MODELS = [
  { id:"claude-sonnet-4-20250514", name:"Claude Sonnet 4", provider:"Anthropic", color:"#f97316", icon:"✦", apiType:"anthropic",      apiKey:"" },
  { id:"minimax-2.7",              name:"Minimax 2.7",      provider:"Minimax",   color:"#8b5cf6", icon:"⬡", apiType:"openai_compat",   apiKey:"", baseUrl:"https://api.minimax.chat/v1" },
  { id:"qwen-3.6",                 name:"Qwen 3.6",         provider:"Alibaba",   color:"#06b6d4", icon:"◈", apiType:"openai_compat",   apiKey:"", baseUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1" },
  { id:"glm-5.1",                  name:"GLM 5.1",          provider:"Zhipu AI",  color:"#10b981", icon:"◎", apiType:"openai_compat",   apiKey:"", baseUrl:"https://open.bigmodel.cn/api/paas/v4" },
  { id:"llama3-70b-8192",          name:"Groq LLaMA3",      provider:"Groq",      color:"#f59e0b", icon:"⚡", apiType:"groq",            apiKey:"" },
  { id:"mixtral-8x7b-32768",       name:"Groq Mixtral",     provider:"Groq",      color:"#ec4899", icon:"⚡", apiType:"groq",            apiKey:"" },
];

export const API_TYPE_OPTIONS = [
  { value:"anthropic",    label:"Anthropic" },
  { value:"groq",         label:"Groq" },
  { value:"openai_compat",label:"OpenAI-Compatible" },
  { value:"openai",       label:"OpenAI" },
];

export const SYSTEM_PROMPT = \`You are an expert AI coding assistant — like Cursor but smarter and completely free.
Rules:
- Always respond with clean, working code when asked
- Use markdown code blocks with the language name
- Explain briefly what the code does
- Be direct and concise
- Support all programming languages
- When debugging, identify the exact problem and fix it
- If an image or file is shared, analyze it carefully\`;

export const LANG_COLORS = {
  jsx: "#61dafb", css: "#264de4", js: "#f7df1e",
  html: "#e34f26", json: "#5b8dd9", ts: "#3178c6",
};

export const FILE_TREE = [
  { path:"package.json",              name:"package.json",   type:"file",   depth:0, lang:"json" },
  { path:"src/",                       name:"src/",           type:"folder", depth:0 },
  { path:"src/App.jsx",               name:"App.jsx",        type:"file",   depth:1, lang:"jsx"  },
  { path:"src/index.css",             name:"index.css",      type:"file",   depth:1, lang:"css"  },
  { path:"src/components/",           name:"components/",    type:"folder", depth:1 },
  { path:"src/components/Sidebar.jsx",         name:"Sidebar.jsx",         type:"file", depth:2, lang:"jsx" },
  { path:"src/components/MessageBubble.jsx",   name:"MessageBubble.jsx",   type:"file", depth:2, lang:"jsx" },
  { path:"src/components/AddModelModal.jsx",   name:"AddModelModal.jsx",   type:"file", depth:2, lang:"jsx" },
  { path:"src/utils/",               name:"utils/",          type:"folder", depth:1 },
  { path:"src/utils/api.js",         name:"api.js",          type:"file",   depth:2, lang:"js"  },
  { path:"src/utils/helpers.js",     name:"helpers.js",      type:"file",   depth:2, lang:"js"  },
  { path:"src/utils/constants.js",   name:"constants.js",    type:"file",   depth:2, lang:"js"  },
];`
  }
};

// ── tree shape (order for display) ───────────────────────────────────────────
const TREE_ORDER = [
  { path:"package.json",             name:"package.json",         type:"file",   depth:0, lang:"json" },
  { path:"src/",                     name:"src/",                 type:"folder", depth:0 },
  { path:"src/App.jsx",             name:"App.jsx",              type:"file",   depth:1, lang:"jsx"  },
  { path:"src/index.css",           name:"index.css",            type:"file",   depth:1, lang:"css"  },
  { path:"src/components/",         name:"components/",          type:"folder", depth:1 },
  { path:"src/components/Sidebar.jsx",       name:"Sidebar.jsx",        type:"file", depth:2, lang:"jsx" },
  { path:"src/components/MessageBubble.jsx", name:"MessageBubble.jsx",  type:"file", depth:2, lang:"jsx" },
  { path:"src/components/AddModelModal.jsx", name:"AddModelModal.jsx",  type:"file", depth:2, lang:"jsx" },
  { path:"src/utils/",              name:"utils/",               type:"folder", depth:1 },
  { path:"src/utils/api.js",        name:"api.js",               type:"file",   depth:2, lang:"js"  },
  { path:"src/utils/helpers.js",    name:"helpers.js",           type:"file",   depth:2, lang:"js"  },
  { path:"src/utils/constants.js",  name:"constants.js",         type:"file",   depth:2, lang:"js"  },
];

// ── Models & API ──────────────────────────────────────────────────────────────
const MODELS = [
  { id:"claude-sonnet-4-20250514", name:"Claude Sonnet 4", provider:"Anthropic", color:"#f97316", icon:"✦", apiType:"anthropic",    apiKey:"" },
  { id:"minimax-2.7",              name:"Minimax 2.7",     provider:"Minimax",   color:"#8b5cf6", icon:"⬡", apiType:"openai_compat",apiKey:"", baseUrl:"https://api.minimax.chat/v1" },
  { id:"qwen-3.6",                 name:"Qwen 3.6",        provider:"Alibaba",   color:"#06b6d4", icon:"◈", apiType:"openai_compat",apiKey:"", baseUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1" },
  { id:"glm-5.1",                  name:"GLM 5.1",         provider:"Zhipu AI",  color:"#10b981", icon:"◎", apiType:"openai_compat",apiKey:"", baseUrl:"https://open.bigmodel.cn/api/paas/v4" },
  { id:"llama3-70b-8192",          name:"Groq LLaMA3",     provider:"Groq",      color:"#f59e0b", icon:"⚡", apiType:"groq",         apiKey:"" },
  { id:"mixtral-8x7b-32768",       name:"Groq Mixtral",    provider:"Groq",      color:"#ec4899", icon:"⚡", apiType:"groq",         apiKey:"" },
];
const API_TYPES = [
  {value:"anthropic",label:"Anthropic"},
  {value:"groq",label:"Groq"},
  {value:"openai_compat",label:"OpenAI-Compatible"},
  {value:"openai",label:"OpenAI"},
];
const SYSTEM_PROMPT = `You are an expert AI coding assistant — like Cursor but smarter and completely free.
Rules:
- Always respond with clean, working code when asked
- Use markdown code blocks with language name
- Explain briefly
- Be direct and concise
- Support all languages
- When debugging, find the exact problem and fix it
- If image/file shared, analyze carefully`;

const LANG_COLORS = { jsx:"#61dafb", css:"#264de4", js:"#f7df1e", html:"#e34f26", json:"#5b8dd9", ts:"#3178c6" };

async function callAPI(model, history) {
  const { apiType, apiKey, id, baseUrl } = model;
  if (apiType === "anthropic") {
    const msgs = history.map(m => {
      if (m.images?.length) {
        const content = [];
        m.images.forEach(src => {
          const b64=src.split(",")[1], mt=src.split(";")[0].split(":")[1];
          content.push({type:"image",source:{type:"base64",media_type:mt,data:b64}});
        });
        if (m.content) content.push({type:"text",text:m.content});
        return {role:m.role,content};
      }
      return {role:m.role,content:m.content};
    });
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:msgs})});
    const data=await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.content?.[0]?.text??"No response";
  }
  if(["groq","openai","openai_compat"].includes(apiType)){
    if(!apiKey) throw new Error(`API key missing for ${model.name}. Add it in the Models tab.`);
    const endpoint=apiType==="groq"?"https://api.groq.com/openai/v1/chat/completions":`${baseUrl||"https://api.openai.com/v1"}/chat/completions`;
    const msgs=[{role:"system",content:SYSTEM_PROMPT},...history.map(m=>({role:m.role,content:m.content}))];
    const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({model:id,messages:msgs,max_tokens:1000})});
    const data=await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content??"No response";
  }
  throw new Error(`Unknown API type: ${apiType}`);
}

// ── UI helpers ────────────────────────────────────────────────────────────────
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
          <div style={{display:"flex",gap:"12px",alignItems:"flex-end"}}>
            <div><label style={lbl}>Color</label><div style={{display:"flex",gap:"6px",alignItems:"center"}}><input type="color" value={form.color} onChange={e=>set("color",e.target.value)} style={{width:"36px",height:"32px",border:"none",background:"none",cursor:"pointer"}}/><span style={{fontSize:"10px",color:"#666"}}>{form.color}</span></div></div>
            <div><label style={lbl}>Icon</label><input value={form.icon} onChange={e=>set("icon",e.target.value)} maxLength={2} style={{...fs,width:"54px",textAlign:"center",fontSize:"18px",padding:"4px"}}/></div>
          </div>
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

// ── File viewer panel ─────────────────────────────────────────────────────────
function FileViewer({ file, onClose }) {
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(file.content);setCopied(true);setTimeout(()=>setCopied(false),1500);};
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Viewer header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",background:"#0d0d1a",borderBottom:"1px solid #1e1e30",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <span style={{width:"8px",height:"8px",borderRadius:"2px",background:LANG_COLORS[file.lang]||"#888",display:"inline-block",flexShrink:0}}/>
          <span style={{fontSize:"11.5px",color:"#e2e8f0",fontWeight:500}}>{file.name}</span>
        </div>
        <div style={{display:"flex",gap:"6px"}}>
          <button onClick={copy} style={{fontSize:"10px",color:copied?"#10b981":"#888",background:"none",border:"1px solid #2a2a3a",cursor:"pointer",padding:"3px 8px",borderRadius:"4px"}}>
            {copied?"✓ copied":"copy all"}
          </button>
          <button onClick={onClose} style={{fontSize:"12px",color:"#666",background:"none",border:"none",cursor:"pointer",padding:"3px 6px"}}>×</button>
        </div>
      </div>
      {/* Code */}
      <div style={{flex:1,overflow:"auto"}}>
        <pre style={{margin:0,padding:"14px 16px",background:"#08080f",color:"#e2e8f0",fontSize:"12px",fontFamily:"'JetBrains Mono','Fira Code',monospace",lineHeight:1.7,minHeight:"100%"}}>
          {file.content.split("\n").map((line,i)=>(
            <div key={i} style={{display:"flex",gap:"0"}}>
              <span style={{userSelect:"none",color:"#3a3a55",fontSize:"11px",width:"32px",flexShrink:0,textAlign:"right",paddingRight:"12px"}}>{i+1}</span>
              <span>{line||" "}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab,setActiveTab]=useState("Chat");
  const [messages,setMessages]=useState([
    {role:"assistant",content:"Mrhba! Ana **DevMind AI** — free w bla 9oyod 🚀\n\nYmknek:\n- Tkteb code w n3awnek\n- Trsl **image** (screenshot, diagram, error...)\n- Trsl **file** w nqra w nhlel fiha\n- Cli f **Files** tab bach tchouf l code dyal had l project\n- Tbdel l model mn sidebar\n\nAsh bgha daba?"}
  ]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [models,setModels]=useState(MODELS);
  const [selectedModel,setSelectedModel]=useState(MODELS[0]);
  const [showAddModel,setShowAddModel]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [attachments,setAttachments]=useState([]);
  const [openedFile,setOpenedFile]=useState(null);   // { name, lang, content }
  const [openFolders,setOpenFolders]=useState({"src/":true,"src/components/":false,"src/utils/":false});
  const messagesEndRef=useRef(null);
  const fileInputRef=useRef(null);

  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  useEffect(()=>{const updated=models.find(m=>m.id===selectedModel.id);if(updated) setSelectedModel(updated);},[models]);

  const toggleFolder=(path)=>setOpenFolders(p=>({...p,[path]:!p[path]}));

  const handleFileClick=(node)=>{
    if(node.type==="folder"){toggleFolder(node.path);return;}
    const content=PROJECT_FILES[node.path];
    if(content) setOpenedFile({name:node.name,lang:node.lang,...content});
  };

  // build visible tree (respect open/closed folders)
  const visibleTree=TREE_ORDER.filter(node=>{
    if(node.depth===0) return true;
    if(node.depth===1) return openFolders["src/"];
    if(node.depth===2){
      const parentFolder=node.path.startsWith("src/components/")?"src/components/":"src/utils/";
      return openFolders["src/"]&&openFolders[parentFolder];
    }
    return false;
  });

  const handleFileAttach=(e)=>{
    Array.from(e.target.files).forEach(file=>{
      const reader=new FileReader();
      if(file.type.startsWith("image/")){
        reader.onload=ev=>setAttachments(p=>[...p,{type:"image",src:ev.target.result,name:file.name}]);
        reader.readAsDataURL(file);
      } else {
        reader.onload=ev=>{
          const text=ev.target.result;
          setInput(p=>`${p}${p?"\n":""}\`\`\`\n${text.slice(0,3000)}\n\`\`\``);
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
  const addModel=(m)=>{setModels(p=>[...p,m]);setShowAddModel(false);};
  const updateModel=(id,k,v)=>setModels(p=>p.map(m=>m.id===id?{...m,[k]:v}:m));
  const deleteModel=(id)=>{setModels(p=>p.filter(m=>m.id!==id));if(selectedModel.id===id)setSelectedModel(MODELS[0]);};

  const fs2={width:"100%",background:"#080811",border:"1px solid #2a2a3a",borderRadius:"5px",padding:"5px 8px",color:"#e2e8f0",fontSize:"10.5px",boxSizing:"border-box",outline:"none",marginTop:"4px"};

  const renderPanel=()=>{
    if(activeTab==="Files") return (
      <div>
        <div style={{fontSize:"10px",color:"#555",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Project Files</div>
        {visibleTree.map((node,i)=>{
          const isFolder=node.type==="folder";
          const isOpen=openFolders[node.path];
          const hasFile=!!PROJECT_FILES[node.path];
          const isActive=openedFile?.name===node.name&&!isFolder;
          return (
            <div key={i} onClick={()=>handleFileClick(node)}
              style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 6px",paddingLeft:`${6+node.depth*14}px`,borderRadius:"5px",cursor:"pointer",fontSize:"11.5px",
                color:isFolder?"#94a3b8":isActive?"#a78bfa":"#cbd5e1",marginBottom:"1px",
                background:isActive?"#1e1b4b":"none",transition:"background 0.1s"}}
              onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="#1e1e30";}}
              onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="none";}}>
              {isFolder
                ? <span style={{color:"#6366f1",fontSize:"10px",width:"10px"}}>{isOpen?"▾":"▸"}</span>
                : <span style={{width:"8px",height:"8px",borderRadius:"2px",flexShrink:0,
                    background:hasFile?(LANG_COLORS[node.lang]||"#888"):"#333",
                    display:"inline-block",opacity:hasFile?1:0.4}}/>
              }
              <span style={{flex:1}}>{node.name}</span>
              {!isFolder&&hasFile&&<span style={{fontSize:"9px",color:"#444"}}>view</span>}
            </div>
          );
        })}
      </div>
    );

    if(activeTab==="Models") return (
      <div>
        <div style={{fontSize:"10px",color:"#555",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Models ({models.length})</div>
        {models.map(m=>{
          const isBuiltin=MODELS.find(x=>x.id===m.id);
          return (
            <div key={m.id} style={{marginBottom:"8px",borderRadius:"9px",border:selectedModel.id===m.id?`1px solid ${m.color}55`:"1px solid #1e1e30",background:selectedModel.id===m.id?`${m.color}0d`:"#0d0d1a",overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",cursor:"pointer"}} onClick={()=>setSelectedModel(m)}>
                <span style={{fontSize:"15px",color:m.color}}>{m.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"11.5px",color:"#e2e8f0",fontWeight:500}}>{m.name}</div>
                  <div style={{fontSize:"10px",color:"#555"}}>{m.provider}</div>
                </div>
                {selectedModel.id===m.id&&<span style={{fontSize:"10px",color:m.color}}>●</span>}
              </div>
              <div style={{padding:"0 10px 10px"}}>
                {m.apiType==="anthropic"
                  ?<div style={{fontSize:"10px",color:"#10b981",padding:"4px 6px",background:"#10b98112",borderRadius:"5px"}}>✓ Built-in — no key needed</div>
                  :<>
                    <div style={{fontSize:"10px",color:"#888",marginBottom:"2px"}}>API Key</div>
                    <input type="password" placeholder="Paste API key…" value={m.apiKey||""} onChange={e=>updateModel(m.id,"apiKey",e.target.value)} style={{...fs2,color:m.apiKey?"#10b981":"#e2e8f0"}}/>
                    {m.apiType==="openai_compat"&&<>
                      <div style={{fontSize:"10px",color:"#888",marginTop:"6px",marginBottom:"2px"}}>Base URL</div>
                      <input placeholder="https://api.example.com/v1" value={m.baseUrl||""} onChange={e=>updateModel(m.id,"baseUrl",e.target.value)} style={fs2}/>
                    </>}
                  </>
                }
                {!isBuiltin&&<button onClick={()=>deleteModel(m.id)} style={{marginTop:"6px",fontSize:"10px",color:"#ef4444",background:"none",border:"none",cursor:"pointer",padding:0}}>🗑 Remove</button>}
              </div>
            </div>
          );
        })}
        <button onClick={()=>setShowAddModel(true)} style={{width:"100%",padding:"9px",borderRadius:"8px",border:"1px dashed #333",background:"none",color:"#7c3aed",cursor:"pointer",fontSize:"12px",fontWeight:600,marginTop:"4px"}}>+ Add Model</button>
      </div>
    );

    if(activeTab==="Settings") return (
      <div>
        <div style={{padding:"10px",background:"#0d0d1a",borderRadius:"8px",border:"1px solid #10b98130",marginBottom:"12px"}}>
          <div style={{fontSize:"10px",color:"#10b981",marginBottom:"3px"}}>✓ Claude Sonnet 4 — Always Free</div>
          <div style={{fontSize:"10px",color:"#555"}}>Built-in. No API key needed.</div>
        </div>
        <div style={{fontSize:"10px",color:"#666",marginBottom:"10px"}}>For other models, go to the Models tab and paste the API key directly under each model.</div>
        <button onClick={()=>setActiveTab("Models")} style={{width:"100%",padding:"8px",borderRadius:"7px",border:"1px solid #2a2a3a",background:"none",color:"#a78bfa",cursor:"pointer",fontSize:"12px"}}>→ Open Models Tab</button>
      </div>
    );

    return (
      <div>
        <div style={{fontSize:"10px",color:"#555",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Quick Actions</div>
        {["Explain this code","Fix the bug","Write unit tests","Optimize performance","Add comments","Convert to TypeScript","Review my code","Generate README"].map(q=>(
          <button key={q} onClick={()=>setInput(q)} style={{width:"100%",textAlign:"left",padding:"6px 8px",borderRadius:"5px",border:"1px solid #1e1e30",background:"none",color:"#666",fontSize:"11px",cursor:"pointer",marginBottom:"4px"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#1e1e30";e.currentTarget.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="#666";}}>
            {q}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={{display:"flex",height:"100vh",background:"#080811",color:"#e2e8f0",fontFamily:"'DM Sans','Segoe UI',sans-serif",overflow:"hidden"}}>

      {/* ── Sidebar ── */}
      {sidebarOpen&&(
        <div style={{width:"232px",background:"#0d0d1a",borderRight:"1px solid #1e1e30",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"14px 12px",borderBottom:"1px solid #1e1e30",display:"flex",alignItems:"center",gap:"8px"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"8px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0}}>✦</div>
            <div><div style={{fontSize:"13px",fontWeight:700}}>DevMind AI</div><div style={{fontSize:"10px",color:"#555"}}>Free · Unlimited</div></div>
          </div>
          <div style={{padding:"8px",borderBottom:"1px solid #1e1e30"}}>
            {["Chat","Files","Models","Settings"].map(tab=>(
              <button key={tab} onClick={()=>{setActiveTab(tab);if(tab!=="Files") setOpenedFile(null);}} style={{width:"100%",textAlign:"left",padding:"7px 10px",borderRadius:"6px",border:"none",background:activeTab===tab?"#1e1b4b":"none",color:activeTab===tab?"#a78bfa":"#666",cursor:"pointer",fontSize:"12.5px",marginBottom:"2px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span>{tab==="Chat"?"💬":tab==="Files"?"📁":tab==="Models"?"🤖":"⚙️"}</span>{tab}
              </button>
            ))}
          </div>
          <div style={{flex:1,overflow:"auto",padding:"10px 8px"}}>{renderPanel()}</div>
          <div style={{padding:"10px 8px",borderTop:"1px solid #1e1e30"}}>
            <button onClick={()=>{setMessages([{role:"assistant",content:"Chat jadid! Kif n9der n3awnek? 🚀"}]);setOpenedFile(null);}} style={{width:"100%",padding:"8px",borderRadius:"6px",border:"1px solid #2a2a3a",background:"none",color:"#a78bfa",cursor:"pointer",fontSize:"12px"}}>+ New Chat</button>
          </div>
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top bar */}
        <div style={{height:"48px",background:"#0d0d1a",borderBottom:"1px solid #1e1e30",display:"flex",alignItems:"center",padding:"0 16px",gap:"12px",flexShrink:0}}>
          <button onClick={()=>setSidebarOpen(p=>!p)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:"16px",padding:"4px"}}>☰</button>
          {/* Breadcrumb / file name when file open */}
          {openedFile
            ? <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12.5px",color:"#94a3b8"}}>
                <span style={{cursor:"pointer",color:"#666"}} onClick={()=>setOpenedFile(null)}>Files</span>
                <span style={{color:"#444"}}>/</span>
                <span style={{color:"#e2e8f0",display:"flex",alignItems:"center",gap:"5px"}}>
                  <span style={{width:"8px",height:"8px",borderRadius:"2px",background:LANG_COLORS[openedFile.lang]||"#888",display:"inline-block"}}/>
                  {openedFile.name}
                </span>
              </div>
            : <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"5px 14px",borderRadius:"20px",background:`${selectedModel.color}15`,border:`1px solid ${selectedModel.color}30`,cursor:"pointer"}}
                onClick={()=>{setActiveTab("Models");setSidebarOpen(true);}}>
                <span style={{color:selectedModel.color,fontSize:"13px"}}>{selectedModel.icon}</span>
                <span style={{fontSize:"12px",color:selectedModel.color,fontWeight:500}}>{selectedModel.name}</span>
                <span style={{fontSize:"10px",color:"#555"}}>▾</span>
              </div>
          }
          <div style={{marginLeft:"auto"}}>
            <span style={{fontSize:"11px",color:"#10b981",background:"#10b98115",padding:"3px 10px",borderRadius:"10px",border:"1px solid #10b98130"}}>● Free</span>
          </div>
        </div>

        {/* Content area — file viewer OR chat */}
        {openedFile
          ? <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <FileViewer file={openedFile} onClose={()=>setOpenedFile(null)}/>
            </div>
          : <>
              {/* Messages */}
              <div style={{flex:1,overflow:"auto",padding:"20px 24px"}}>
                {messages.map((msg,i)=><MessageBubble key={i} msg={msg} modelIcon={selectedModel.icon} modelColor={selectedModel.color}/>)}
                {loading&&(
                  <div style={{display:"flex",gap:"12px",marginBottom:"24px",alignItems:"flex-start"}}>
                    <div style={{width:"30px",height:"30px",borderRadius:"50%",background:`${selectedModel.color}22`,border:`1px solid ${selectedModel.color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:selectedModel.color,fontSize:"13px"}}>{selectedModel.icon}</div>
                    <div style={{background:"#0f0f1e",border:"1px solid #1e1e30",borderRadius:"4px 16px 16px 16px",padding:"14px 18px",display:"flex",gap:"5px",alignItems:"center"}}>
                      {[0,1,2].map(j=><div key={j} style={{width:"6px",height:"6px",borderRadius:"50%",background:selectedModel.color,animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${j*0.2}s`,opacity:0.7}}/>)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}/>
              </div>
              {/* Input */}
              <div style={{padding:"12px 20px 18px",background:"#0a0a15",borderTop:"1px solid #1e1e30"}}>
                {attachments.length>0&&(
                  <div style={{display:"flex",gap:"8px",marginBottom:"10px",flexWrap:"wrap"}}>
                    {attachments.map((a,i)=>(
                      <div key={i} style={{position:"relative"}}>
                        {a.type==="image"?<img src={a.src} alt={a.name} style={{width:"60px",height:"60px",borderRadius:"8px",objectFit:"cover",border:"1px solid #2a2a3a"}}/>:<div style={{padding:"8px 10px",background:"#1e1b4b",borderRadius:"8px",border:"1px solid #312e81",fontSize:"11px",color:"#a78bfa"}}>📎 {a.name}</div>}
                        <button onClick={()=>setAttachments(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:"-5px",right:"-5px",width:"16px",height:"16px",borderRadius:"50%",background:"#ef4444",border:"none",color:"white",cursor:"pointer",fontSize:"10px",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",gap:"8px",alignItems:"flex-end",background:"#0d0d1a",borderRadius:"12px",border:"1px solid #2a2a3a",padding:"8px 12px",boxShadow:`0 0 0 1px ${selectedModel.color}1a`}}>
                  <button onClick={()=>fileInputRef.current?.click()} title="Attach image or file"
                    style={{width:"32px",height:"32px",flexShrink:0,background:"none",border:"1px solid #2a2a3a",borderRadius:"7px",color:"#666",cursor:"pointer",fontSize:"15px",display:"flex",alignItems:"center",justifyContent:"center"}}
                    onMouseEnter={e=>e.currentTarget.style.color="#a78bfa"} onMouseLeave={e=>e.currentTarget.style.color="#666"}>📎</button>
                  <input ref={fileInputRef} type="file" accept="image/*,.txt,.js,.jsx,.ts,.tsx,.py,.json,.md,.css,.html,.csv" multiple onChange={handleFileAttach} style={{display:"none"}}/>
                  <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                    placeholder={`Ask ${selectedModel.name}… (Shift+Enter = newline)`}
                    rows={1} style={{flex:1,background:"none",border:"none",color:"#e2e8f0",fontSize:"13.5px",resize:"none",outline:"none",lineHeight:1.6,fontFamily:"inherit",maxHeight:"160px",overflowY:"auto"}}
                    onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,160)+"px";}}/>
                  <button onClick={sendMessage} disabled={loading||(!input.trim()&&attachments.length===0)} style={{width:"34px",height:"34px",borderRadius:"8px",border:"none",flexShrink:0,background:loading||(!input.trim()&&attachments.length===0)?"#1e1e30":`linear-gradient(135deg,${selectedModel.color},${selectedModel.color}bb)`,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>
                    {loading?"…":"↑"}
                  </button>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"7px"}}>
                  <div style={{display:"flex",gap:"5px"}}>
                    {["js","py","ts","sql","bash","json"].map(l=>(
                      <button key={l} onClick={()=>setInput(p=>`${p}${p?"\n":""}\`\`\`${l}\n// code here\n\`\`\``)} style={{padding:"3px 7px",borderRadius:"4px",border:"1px solid #2a2a3a",background:"none",color:"#555",fontSize:"10px",cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                  <span style={{fontSize:"10px",color:"#3a3a50"}}>Enter ↵ send · 📎 attach</span>
                </div>
              </div>
            </>
        }
      </div>

      {showAddModel&&<AddModelModal onAdd={addModel} onClose={()=>setShowAddModel(false)}/>}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:2px;}
        @keyframes pulse{0%,100%{transform:scale(0.8);opacity:0.4}50%{transform:scale(1.1);opacity:1}}
        input::placeholder,textarea::placeholder{color:#3a3a55;}
      `}</style>
    </div>
  );
}
