import { useState } from "react";

export function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span>{lang || "code"}</span>
        <button onClick={copy}>{copied ? "✓ copied" : "copy"}</button>
      </div>
      <pre>{code}</pre>
    </div>
  );
}

function renderInline(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return <span key={index}>{part}</span>;
  });
}

export function parseMarkdown(text = "") {
  const lines = text.split("\n");
  const result = [];
  let inCode = false;
  let codeLang = "";
  let codeLines = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (!listItems.length) return;
    result.push(<ul key={key++}>{listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}</ul>);
    listItems = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushList();
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        result.push(<CodeBlock key={key++} lang={codeLang} code={codeLines.join("\n")} />);
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (/^[-*] /.test(line)) {
      listItems.push(line.slice(2));
      continue;
    }
    flushList();

    if (line.startsWith("### ")) result.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>);
    else if (line.startsWith("## ")) result.push(<h2 key={key++}>{renderInline(line.slice(3))}</h2>);
    else if (line.startsWith("# ")) result.push(<h1 key={key++}>{renderInline(line.slice(2))}</h1>);
    else if (line.trim()) result.push(<p key={key++}>{renderInline(line)}</p>);
    else result.push(<div key={key++} className="message-spacer" />);
  }

  flushList();
  if (inCode && codeLines.length) result.push(<CodeBlock key={key++} lang={codeLang} code={codeLines.join("\n")} />);
  return result;
}

export function fileExtension(name = "") {
  const clean = name.split("?")[0];
  const base = clean.split("/").pop() || "";
  if (base.startsWith(".") && !base.includes(".", 1)) return base.slice(1).toLowerCase();
  return base.split(".").pop()?.toLowerCase() || "";
}

export function isProbablyTextFile(file) {
  return file?.type?.startsWith("text/") || ["js", "jsx", "ts", "tsx", "css", "html", "json", "md", "txt", "xml", "svg", "yml", "yaml", "py", "java", "go", "rs", "c", "h", "cpp", "php", "rb", "swift", "dart", "sh", "sql"].includes(fileExtension(file?.name));
}
