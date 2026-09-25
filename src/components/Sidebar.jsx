import { LANG_COLORS, QUICK_ACTIONS } from "../utils/constants";

export default function Sidebar({
  activeTab, setActiveTab, models, selectedModel, setSelectedModel,
  updateModel, deleteModel, setShowAddModel, setInput, projectFiles,
  openFolders, handleFileClick, onNewChat, onImportProject, onClearProject,
}) {
  const renderFiles = () => (
    <div>
      <div className="panel-heading">Project files</div>
      <div className="file-actions"><button onClick={onImportProject}>Import project</button>{projectFiles.length > 0 && <button onClick={onClearProject}>Clear</button>}</div>
      {projectFiles.length === 0 ? <p className="muted-copy">No project imported. Import a folder to inspect text files in this browser session.</p> : projectFiles.map((node) => (
        <button key={node.path} className="tree-row" style={{ paddingLeft: `${8 + node.depth * 14}px` }} onClick={() => handleFileClick(node)}>
          {node.type === "folder" ? <span>{openFolders[node.path] ? "▾" : "▸"}</span> : <span className="lang-dot" style={{ background: LANG_COLORS[node.lang] || "#64748b" }} />}
          <span>{node.name}</span>
        </button>
      ))}
    </div>
  );

  const renderModels = () => (
    <div>
      <div className="panel-heading">Models ({models.length})</div>
      {models.map((model) => (
        <div key={model.id} className={`model-card ${selectedModel.id === model.id ? "selected" : ""}`} style={{ "--model-color": model.color }} onClick={() => setSelectedModel(model)}>
          <div className="model-heading"><span>{model.icon}</span><span>{model.name}</span><button className="delete-model" onClick={(event) => { event.stopPropagation(); deleteModel(model.id); }} aria-label={`Delete ${model.name}`}>×</button></div>
          <div className="model-provider">{model.provider} · {model.id}</div>
          <input type="password" autoComplete="off" placeholder="API key (session only)" value={model.apiKey || ""} onChange={(event) => updateModel(model.id, "apiKey", event.target.value)} onClick={(event) => event.stopPropagation()} />
          {model.apiType !== "anthropic" && <input placeholder="Base URL" value={model.baseUrl || ""} onChange={(event) => updateModel(model.id, "baseUrl", event.target.value)} onClick={(event) => event.stopPropagation()} />}
        </div>
      ))}
      <button className="add-model-button" onClick={() => setShowAddModel(true)}>+ Add model</button>
      <p className="security-note">API keys are never saved to localStorage by this app.</p>
    </div>
  );

  if (activeTab === "Files") return <SidebarShell {...{ activeTab, setActiveTab, onNewChat }}><div className="panel-scroll">{renderFiles()}</div></SidebarShell>;
  if (activeTab === "Models") return <SidebarShell {...{ activeTab, setActiveTab, onNewChat }}><div className="panel-scroll">{renderModels()}</div></SidebarShell>;
  if (activeTab === "Settings") return <SidebarShell {...{ activeTab, setActiveTab, onNewChat }}><div className="panel-scroll"><div className="panel-heading">Settings</div><div className="settings-card"><strong>Privacy</strong><p>Chat messages, imported files, and API keys stay in this browser session unless a provider receives them through a request you initiate.</p></div><div className="settings-card"><strong>Production note</strong><p>Direct browser API calls expose your key to the browser. Use a server-side gateway before deploying this as a shared service.</p></div></div></SidebarShell>;

  return <SidebarShell {...{ activeTab, setActiveTab, onNewChat }}><div className="panel-scroll"><div className="panel-heading">Quick actions</div>{QUICK_ACTIONS.map((action) => <button className="quick-action" key={action} onClick={() => setInput(action)}>{action}</button>)}<div className="settings-card"><strong>Current model</strong><p>{selectedModel.name}</p></div></div></SidebarShell>;
}

function SidebarShell({ activeTab, setActiveTab, onNewChat, children }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark">✦</div><div><strong>DevMind AI</strong><span>Open-source coding workspace</span></div></div>
    <nav className="tabs" aria-label="Workspace navigation">{["Chat", "Files", "Models", "Settings"].map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
    {children}
    <div className="sidebar-footer"><button className="new-chat" onClick={onNewChat}>+ New chat</button></div>
  </aside>;
}
