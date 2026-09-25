import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MODELS } from "./utils/constants";
import { callAPI } from "./utils/api";
import { fileExtension, isProbablyTextFile } from "./utils/helpers";
import Sidebar from "./components/Sidebar";
import MessageBubble from "./components/MessageBubble";
import AddModelModal from "./components/AddModelModal";

const MODEL_STORAGE_KEY = "devmind-ai-model-config-v1";
const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const welcome = {
  role: "assistant",
  content: "# Welcome to DevMind AI 🚀\n\nA multi-provider AI coding workspace for experimenting with models and project context.\n\n- Choose a model in **Models** and add your own API key.\n- Import a project from **Files** to inspect text files in this browser session.\n- Attach screenshots or text files to your prompt.\n- Use the quick actions for explanations, debugging, reviews, and refactoring.\n\n**Security:** API keys are kept in memory only. For production deployments, use a server-side provider gateway.",
};

function loadModelConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(MODEL_STORAGE_KEY) || "null");
    if (!Array.isArray(saved)) return MODELS;
    return MODELS.map((model) => ({ ...model, ...(saved.find((item) => item.id === model.id) || {}), apiKey: "" }));
  } catch {
    return MODELS;
  }
}

function buildTree(files) {
  const paths = new Set();
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    for (let i = 1; i < parts.length; i += 1) paths.add(parts.slice(0, i).join("/") + "/");
    paths.add(file.path);
  }

  return [...paths].sort((a, b) => {
    const aDepth = a.split("/").length;
    const bDepth = b.split("/").length;
    return aDepth - bDepth || a.localeCompare(b);
  }).map((path) => {
    const isFolder = path.endsWith("/");
    const clean = path.replace(/\/$/, "");
    const name = clean.split("/").pop() || clean;
    const depth = path.split("/").filter(Boolean).length - (isFolder ? 0 : 1);
    return { path, name: isFolder ? `${name}/` : name, type: isFolder ? "folder" : "file", depth, lang: isFolder ? undefined : fileExtension(name) };
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Chat");
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState(loadModelConfig);
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [showAddModel, setShowAddModel] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [openedFile, setOpenedFile] = useState(null);
  const [openFolders, setOpenFolders] = useState({});
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const projectInputRef = useRef(null);

  const selectedModel = useMemo(() => models.find((model) => model.id === selectedModelId) || models[0], [models, selectedModelId]);
  const projectTree = useMemo(() => buildTree(projectFiles), [projectFiles]);
  const visibleProjectTree = useMemo(() => {
    const visible = [];
    for (const node of projectTree) {
      const parts = node.path.split("/").filter(Boolean);
      let hidden = false;
      for (let i = 1; i < parts.length; i += 1) {
        const parent = parts.slice(0, i).join("/") + "/";
        if (openFolders[parent] === false) { hidden = true; break; }
      }
      if (!hidden) visible.push(node);
    }
    return visible;
  }, [projectTree, openFolders]);

  useEffect(() => {
    const safeConfig = models.map(({ apiKey, ...model }) => model);
    localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(safeConfig));
  }, [models]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const handleFileClick = useCallback((node) => {
    if (node.type === "folder") {
      setOpenFolders((previous) => ({ ...previous, [node.path]: !previous[node.path] }));
      return;
    }
    setOpenedFile(projectFiles.find((file) => file.path === node.path) || null);
  }, [projectFiles]);

  const handleImportProject = async (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    const imported = [];
    for (const file of files) {
      const relativePath = file.webkitRelativePath || file.name;
      if (file.size > MAX_IMPORT_BYTES || !isProbablyTextFile(file)) continue;
      try {
        imported.push({ path: relativePath, name: file.name, type: "file", content: await file.text(), size: file.size, depth: relativePath.split("/").length - 2, lang: fileExtension(file.name) });
      } catch {}
    }
    setProjectFiles(imported.sort((a, b) => a.path.localeCompare(b.path)));
    setOpenFolders({});
    setOpenedFile(null);
    setError(files.length !== imported.length ? "Some files were skipped because they were binary, unsupported, or larger than 2 MB." : "");
    event.target.value = "";
  };

  const handleAttachments = async (event) => {
    const files = [...(event.target.files || [])];
    const next = [];
    for (const file of files) {
      if (file.type.startsWith("image/") && file.size <= MAX_IMAGE_BYTES) {
        next.push({ name: file.name, type: "image", preview: await readAsDataURL(file) });
      } else if (isProbablyTextFile(file) && file.size <= MAX_IMPORT_BYTES) {
        next.push({ name: file.name, type: "text", content: await file.text() });
      }
    }
    setAttachments((previous) => [...previous, ...next].slice(0, 6));
    event.target.value = "";
  };

  const sendMessage = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || loading || !selectedModel) return;
    setError("");
    const contentParts = [input.trim()];
    const images = attachments.filter((item) => item.type === "image").map((item) => item.preview);
    const textFiles = attachments.filter((item) => item.type === "text");
    for (const file of textFiles) contentParts.push(`\n\n--- ${file.name} ---\n${file.content}`);
    const userMsg = { role: "user", content: contentParts.filter(Boolean).join("\n"), images, fileName: textFiles.length === 1 ? textFiles[0].name : undefined };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setAttachments([]);
    setLoading(true);
    try {
      const reply = await callAPI(selectedModel, newHistory);
      setMessages((previous) => [...previous, { role: "assistant", content: reply }]);
    } catch (requestError) {
      setMessages((previous) => [...previous, { role: "assistant", content: `**Request failed**\n\n${requestError.message}` }]);
    } finally {
      setLoading(false);
    }
  }, [attachments, input, loading, messages, selectedModel]);

  const updateModel = (id, key, value) => setModels((previous) => previous.map((model) => model.id === id ? { ...model, [key]: value } : model));
  const deleteModel = (id) => {
    setModels((previous) => {
      if (previous.length <= 1) return previous;
      const next = previous.filter((model) => model.id !== id);
      if (selectedModelId === id) setSelectedModelId(next[0].id);
      return next;
    });
  };
  const addModel = (model) => {
    setModels((previous) => [...previous, model]);
    setSelectedModelId(model.id);
    setShowAddModel(false);
  };
  const newChat = () => {
    setOpenedFile(null);
    setMessages([welcome]);
    setAttachments([]);
    setInput("");
    setActiveTab("Chat");
  };

  return (
    <div className="app-shell">
      {sidebarOpen && <Sidebar
        activeTab={activeTab} setActiveTab={setActiveTab} models={models} selectedModel={selectedModel}
        setSelectedModel={(model) => setSelectedModelId(model.id)} updateModel={updateModel} deleteModel={deleteModel}
        setShowAddModel={setShowAddModel} setInput={setInput} projectFiles={visibleProjectTree} openFolders={openFolders}
        handleFileClick={handleFileClick} onNewChat={newChat} onImportProject={() => projectInputRef.current?.click()}
        onClearProject={() => { setProjectFiles([]); setOpenedFile(null); }}
      />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle sidebar">☰</button>
          <div className="topbar-model"><span className="status-dot" />{selectedModel?.name || "No model"}</div>
          <div className="topbar-spacer" />
          <button className="header-action" onClick={() => setActiveTab("Models")}>Models</button>
        </header>

        <section className="workspace">
          {openedFile ? <FileViewer file={openedFile} onClose={() => setOpenedFile(null)} /> : <>
            <div className="messages">
              {messages.map((message, index) => <MessageBubble key={`${message.role}-${index}`} msg={message} modelIcon={selectedModel?.icon} modelColor={selectedModel?.color} />)}
              {loading && <div className="typing"><span /> <span /> <span /> DevMind is thinking…</div>}
              <div ref={messagesEndRef} />
            </div>
          </>}
        </section>

        {!openedFile && <footer className="composer-wrap">
          {error && <div className="error-banner">⚠ {error}</div>}
          {attachments.length > 0 && <div className="attachment-strip">{attachments.map((item, index) => <div className="attachment-chip" key={`${item.name}-${index}`}>{item.type === "image" ? "🖼" : "📄"} {item.name}<button onClick={() => setAttachments((previous) => previous.filter((_, i) => i !== index))}>×</button></div>)}</div>}
          <div className="composer">
            <button className="attach-button" onClick={() => attachmentInputRef.current?.click()} aria-label="Attach files">＋</button>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder={`Ask ${selectedModel?.name || "DevMind AI"}… (Enter to send, Shift+Enter for newline)`} rows={1} />
            <button className="send-button" disabled={loading || (!input.trim() && !attachments.length)} onClick={sendMessage}>{loading ? "…" : "Send"}</button>
          </div>
          <div className="composer-note">Direct provider mode sends your prompt and selected attachments to the provider you choose. Never paste secrets into chat.</div>
        </footer>}
      </main>

      <input ref={attachmentInputRef} hidden type="file" multiple accept="image/*,.txt,.md,.json,.js,.jsx,.ts,.tsx,.css,.html,.xml,.yaml,.yml,.py,.java,.go,.rs,.sql,.sh" onChange={handleAttachments} />
      <input ref={projectInputRef} hidden type="file" multiple webkitdirectory="true" directory="" onChange={handleImportProject} />
      {showAddModel && <AddModelModal onAdd={addModel} onClose={() => setShowAddModel(false)} />}
    </div>
  );
}

function FileViewer({ file, onClose }) {
  return <div className="file-viewer">
    <div className="file-viewer-header"><div><strong>{file.name}</strong><span>{file.path} · {file.size.toLocaleString()} bytes</span></div><button className="secondary-button" onClick={onClose}>Close</button></div>
    <pre>{file.content}</pre>
  </div>;
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
