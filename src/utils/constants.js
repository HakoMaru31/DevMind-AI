export const MODELS = [
  { id:"claude-sonnet-4-20250514", name:"Claude Sonnet 4", provider:"Anthropic", color:"#f97316", icon:"✦", apiType:"anthropic",    apiKey:"" },
  { id:"minimax-2.7",              name:"Minimax 2.7",     provider:"Minimax",   color:"#8b5cf6", icon:"⬡", apiType:"openai_compat",apiKey:"", baseUrl:"https://api.minimax.chat/v1" },
  { id:"qwen-3.6",                 name:"Qwen 3.6",        provider:"Alibaba",   color:"#06b6d4", icon:"◈", apiType:"openai_compat",apiKey:"", baseUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1" },
  { id:"glm-5.1",                  name:"GLM 5.1",         provider:"Zhipu AI",  color:"#10b981", icon:"◎", apiType:"openai_compat",apiKey:"", baseUrl:"https://open.bigmodel.cn/api/paas/v4" },
  { id:"llama3-70b-8192",          name:"Groq LLaMA3",     provider:"Groq",      color:"#f59e0b", icon:"⚡", apiType:"groq",         apiKey:"" },
  { id:"mixtral-8x7b-32768",       name:"Groq Mixtral",    provider:"Groq",      color:"#ec4899", icon:"⚡", apiType:"groq",         apiKey:"" },
];

export const API_TYPES = [
  {value:"anthropic",label:"Anthropic"},
  {value:"groq",label:"Groq"},
  {value:"openai_compat",label:"OpenAI-Compatible"},
  {value:"openai",label:"OpenAI"},
];

export const SYSTEM_PROMPT = `You are an expert AI coding assistant — like Cursor but smarter and completely free.
Rules:
- Always respond with clean, working code when asked
- Use markdown code blocks with language name
- Explain briefly
- Be direct and concise
- Support all languages
- When debugging, find the exact problem and fix it
- If image/file shared, analyze carefully`;

export const LANG_COLORS = { jsx:"#61dafb", css:"#264de4", js:"#f7df1e", html:"#e34f26", json:"#5b8dd9", ts:"#3178c6" };

export const TREE_ORDER = [
  { path:"package.json",             name:"package.json",         type:"file",   depth:0, lang:"json" },
  { path:"src/",                     name:"src/",                 type:"folder", depth:0 },
  { path:"src/App.jsx",             name:"App.jsx",              type:"file",   depth:1, lang:"jsx"  },
  { path:"src/index.css",           name:"index.css",            type:"file",   depth:1, lang:"css"  },
  { path:"src/components/",         name:"components/",          type:"folder", depth:1 },
  { path:"src/utils/",              name:"utils/",               type:"folder", depth:1 }
];
