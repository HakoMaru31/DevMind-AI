import { useState } from "react";
import { API_TYPES } from "../utils/constants";

export default function AddModelModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: "", id: "", provider: "", color: "#6366f1", icon: "◆", apiType: "openai_compat", apiKey: "", baseUrl: "" });
  const [error, setError] = useState("");
  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleAdd = () => {
    if (!form.name.trim() || !form.id.trim()) return setError("Model name and model ID are required.");
    if (["openai", "openai_compat"].includes(form.apiType) && !form.baseUrl.trim()) return setError("Base URL is required for this API type.");
    onAdd({ ...form, name: form.name.trim(), id: form.id.trim(), provider: form.provider.trim() || "Custom" });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-model-title">
        <div className="modal-title-row"><h2 id="add-model-title">Add model</h2><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
        <div className="form-grid">
          <label>Model name<input autoFocus value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. My Coding Model" /></label>
          <label>Model ID<input value={form.id} onChange={(e) => set("id", e.target.value)} placeholder="e.g. model-id" /></label>
          <label>Provider<input value={form.provider} onChange={(e) => set("provider", e.target.value)} placeholder="e.g. My Provider" /></label>
          <label>API type<select value={form.apiType} onChange={(e) => set("apiType", e.target.value)}>{API_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label>API key (session only)<input type="password" autoComplete="off" value={form.apiKey} onChange={(e) => set("apiKey", e.target.value)} placeholder="Enter only your own key" /></label>
          {form.apiType !== "anthropic" && <label>Base URL<input value={form.baseUrl} onChange={(e) => set("baseUrl", e.target.value)} placeholder="https://api.example.com/v1" /></label>}
        </div>
        <p className="security-note">Keys stay in browser memory and are not persisted by DevMind AI. For production, use a server-side gateway.</p>
        {error && <div className="error-banner">⚠ {error}</div>}
        <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={handleAdd}>Add model</button></div>
      </div>
    </div>
  );
}
