import { useState } from "react";
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
      <div style={{width:"30px",height:"30px",borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",
        background:isUser?"linear-gradient(135deg,#7c3aed,#2563eb)":`${modelColor}22`,
        border:!isUser?`1px solid ${modelColor}44`:"none",color:!isUser?modelColor:"white"}}>
        {isUser?"U":modelIcon}
      </div>

      {/* Content */}
      <div style={{ maxWidth:"76%", position:"relative" }}>
        {/* Image previews */}
        {msg.images?.map((src, i) => (
          <img key={i} src={src} alt="attachment" style={{ maxWidth:"260px", borderRadius:"8px", marginBottom:"6px", display:"block" }} />
        ))}
        {/* File badge */}
        {msg.fileName && (
           <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 10px",background:"#1e1b4b",border:"1px solid #312e81",borderRadius:"6px",marginBottom:"6px",fontSize:"11.5px",color:"#a78bfa"}}>
             📎 {msg.fileName}
           </div>
        )}
        {/* Text bubble */}
        {msg.content && (
          <div style={{ background: isUser ? "#1e1b4b" : "#0f0f1e", borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding:"12px 16px", position:"relative", border:`1px solid ${isUser?"#312e81":"#1e1e30"}` }}>
            {isUser ? <p style={{ margin:0, whiteSpace:"pre-wrap" }}>{msg.content}</p> : <>{parseMarkdown(msg.content)}</>}
            {!isUser && (
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
