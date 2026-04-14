export const MODELS = [
  { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet", provider: "anthropic", type: "Claude 4 Unlimited" },
  { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B", provider: "groq", type: "Fast Groq" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", type: "OpenAI" }
];

export const API_TYPE_OPTIONS = ["Groq", "Anthropic", "OpenAI"];

export const SYSTEM_PROMPT = "You are DevMind AI, an elite coding assistant. Be concise, professional, and provide top-tier solutions.";
