import { useState } from "react";

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
  const lines  = text.split("\n");
  const result = [];
  let inCode = false, codeLang = "", codeLines = [], key = 0;
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!inCode) { inCode = true; codeLang = line.slice(3).trim(); codeLines = []; }
      else { result.push(<CodeBlock key={key++} lang={codeLang} code={codeLines.join("\n")} />); inCode = false; }
    } else if (inCode) { codeLines.push(line); }
    else if (line.startsWith("# "))   result.push(<h1 key={key++} style={{margin:"16px 0 8px"}}>{line.slice(2)}</h1>);
    else if (line.startsWith("## "))  result.push(<h2 key={key++} style={{margin:"14px 0 6px"}}>{line.slice(3)}</h2>);
    else if (line.startsWith("### ")) result.push(<h3 key={key++} style={{margin:"12px 0 4px"}}>{line.slice(4)}</h3>);
    else if (line.startsWith("- ") || line.startsWith("* ")) result.push(<li key={key++}>{line.slice(2)}</li>);
    else if (line.trim()) result.push(<p key={key++} style={{margin:"4px 0", lineHeight:1.7}}>{line}</p>);
  }
  return result;
}
