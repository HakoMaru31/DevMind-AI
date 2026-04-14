import React from "react";
import { LANG_COLORS } from "../utils/constants";

export default function Sidebar({ 
  activeTab, setActiveTab, models, selectedModel, setSelectedModel, 
  updateModel, deleteModel, setShowAddModel, setInput, visibleTree, 
  openFolders, handleFileClick, onNewChat 
}) {
  
  const fs2 = { width: "100%", background: "#080811", border: "1px solid #2a2a3a", borderRadius: "5px", padding: "5px 8px", color: "#e2e8f0", fontSize: "10.5px", boxSizing: "border-box", outline: "none", marginTop: "4px" };

  const renderPanel = () => {
    if (activeTab === "Files") return (
      <div>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Project Files</div>
        {visibleTree.map((node, i) => (
          <div key={i} onClick={() => handleFileClick(node)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 6px", paddingLeft: `${6 + node.depth * 14}px`, borderRadius: "5px", cursor: "pointer", fontSize: "11.5px", color: node.type === "folder" ? "#94a3b8" : "#cbd5e1" }}>
            {node.type === "folder" ? <span>{openFolders[node.path] ? "▾" : "▸"}</span> : <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: LANG_COLORS[node.lang] || "#888" }} />}
            <span style={{ flex: 1 }}>{node.name}</span>
          </div>
        ))}
      </div>
    );

    if (activeTab === "Models") return (
      <div>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Models ({models.length})</div>
        {models.map(m => (
          <div key={m.id} style={{ marginBottom: "8px", borderRadius: "9px", border: selectedModel.id === m.id ? `1px solid ${m.color}55` : "1px solid #1e1e30", background: "#0d0d1a", padding: "8px" }} onClick={() => setSelectedModel(m)}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: m.color }}>{m.icon}</span>
              <div style={{ fontSize: "11.5px", color: "#e2e8f0" }}>{m.name}</div>
            </div>
            {m.apiType !== "anthropic" && <input type="password" placeholder="API Key..." value={m.apiKey || ""} onChange={e => updateModel(m.id, "apiKey", e.target.value)} style={fs2} />}
          </div>
        ))}
        <button onClick={() => setShowAddModel(true)} style={{ width: "100%", padding: "8px", color: "#7c3aed", background: "none", border: "1px dashed #333", cursor: "pointer", borderRadius: "8px" }}>+ Add Model</button>
      </div>
    );

    return (
      <div>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Quick Actions</div>
        {["Explain code", "Fix bug", "Review code"].map(q => (
          <button key={q} onClick={() => setInput(q)} style={{ width: "100%", textAlign: "left", padding: "6px 8px", background: "none", border: "1px solid #1e1e30", color: "#666", fontSize: "11px", marginBottom: "4px", cursor: "pointer" }}>{q}</button>
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: "232px", background: "#0d0d1a", borderRight: "1px solid #1e1e30", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 12px", borderBottom: "1px solid #1e1e30", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent:"center" }}>✦</div>
        <div style={{ fontSize: "13px", fontWeight: 700 }}>DevMind AI</div>
      </div>
      <div style={{ padding: "8px", borderBottom: "1px solid #1e1e30" }}>
        {["Chat", "Files", "Models", "Settings"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: activeTab === tab ? "#1e1b4b" : "none", color: activeTab === tab ? "#a78bfa" : "#666", border: "none", cursor: "pointer", fontSize: "12.5px" }}>{tab}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "10px 8px" }}>{renderPanel()}</div>
      <div style={{ padding: "10px 8px", borderTop: "1px solid #1e1e30" }}>
        <button onClick={onNewChat} style={{ width: "100%", padding: "8px", background: "none", border: "1px solid #2a2a3a", color: "#a78bfa", borderRadius: "6px", cursor: "pointer" }}>+ New Chat</button>
      </div>
    </div>
  );
}
