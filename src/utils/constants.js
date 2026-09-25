export const MODELS = [
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    color: "#f97316",
    icon: "✦",
    apiType: "anthropic",
    apiKey: "",
  },
  {
    id: "gpt-4o",
    name: "OpenAI Compatible",
    provider: "OpenAI",
    color: "#10b981",
    icon: "◉",
    apiType: "openai",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Groq Llama",
    provider: "Groq",
    color: "#f59e0b",
    icon: "⚡",
    apiType: "groq",
    apiKey: "",
  },
];

export const API_TYPES = [
  { value: "anthropic", label: "Anthropic" },
  { value: "groq", label: "Groq" },
  { value: "openai_compat", label: "OpenAI-Compatible" },
  { value: "openai", label: "OpenAI" },
];

export const LANG_COLORS = {
  jsx: "#61dafb",
  css: "#264de4",
  js: "#f7df1e",
  html: "#e34f26",
  json: "#5b8dd9",
  ts: "#3178c6",
  md: "#94a3b8",
  py: "#3776ab",
  java: "#f89820",
  c: "#555",
  cpp: "#00599c",
  sh: "#89e051",
};

export const SYSTEM_PROMPT = `You are DevMind AI, an expert software-engineering assistant.
Be precise, practical, and security-conscious. Prefer maintainable solutions.
When reviewing code, identify concrete bugs and risks before suggesting changes.
When generating code, provide complete, runnable snippets and mention important assumptions.
Never claim to have executed code, inspected files, or accessed tools unless the application actually provided that information.`;

export const QUICK_ACTIONS = [
  "Explain this code",
  "Find and fix bugs",
  "Review this code for security issues",
  "Refactor this for maintainability",
];

export const TEXT_EXTENSIONS = new Set([
  "js", "jsx", "ts", "tsx", "css", "scss", "sass", "less", "html", "htm",
  "json", "md", "mdx", "txt", "xml", "svg", "yml", "yaml", "toml", "ini",
  "env", "gitignore", "py", "java", "kt", "kts", "go", "rs", "c", "h", "cpp",
  "hpp", "cs", "php", "rb", "swift", "dart", "sh", "bash", "zsh", "sql",
]);
