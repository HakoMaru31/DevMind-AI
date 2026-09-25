import { useState } from "react";
import { parseMarkdown } from "../utils/helpers";

export default function MessageBubble({ msg, modelIcon = "✦", modelColor = "#8b5cf6" }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(msg.content || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <article className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="avatar" style={{ "--avatar-color": modelColor }}>{isUser ? "U" : modelIcon}</div>
      <div className="message-content">
        {msg.images?.map((src, index) => <img key={index} className="attachment-image" src={src} alt={`Attachment ${index + 1}`} />)}
        {msg.fileName && <div className="file-badge">📎 {msg.fileName}</div>}
        {msg.content && <div className="message-bubble">{isUser ? <p className="plain-text">{msg.content}</p> : <div className="markdown">{parseMarkdown(msg.content)}</div>}{!isUser && <button className="copy-message" onClick={copyAll}>{copied ? "✓" : "Copy"}</button>}</div>}
      </div>
    </article>
  );
}
