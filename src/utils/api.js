import { SYSTEM_PROMPT } from "./constants";

function normalizeBaseUrl(url) {
  return (url || "").trim().replace(/\/+$/, "");
}

function toOpenAIMessage(message) {
  const parts = [];
  if (message.content) parts.push({ type: "text", text: message.content });
  for (const image of message.images || []) {
    parts.push({ type: "image_url", image_url: { url: image } });
  }
  return parts.length > 1 ? { role: message.role, content: parts } : { role: message.role, content: message.content || "" };
}

function parseError(data, status) {
  return data?.error?.message || data?.message || `Provider request failed (${status})`;
}

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || `Request failed (${response.status})` };
  }
}

async function callOpenAICompatible(model, history) {
  if (!model.apiKey) throw new Error(`API key missing for ${model.name}. Add it in Models.`);
  const baseUrl = normalizeBaseUrl(model.baseUrl || "https://api.openai.com/v1");
  const endpoint = `${baseUrl}/chat/completions`;
  const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...history.map(toOpenAIMessage)];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${model.apiKey}` },
    body: JSON.stringify({ model: model.id, messages, max_tokens: 2048 }),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(parseError(data, response.status));
  return data.choices?.[0]?.message?.content || "No response returned by the provider.";
}

async function callAnthropic(model, history) {
  if (!model.apiKey) throw new Error(`API key missing for ${model.name}. Add it in Models.`);
  const messages = history.map((message) => {
    const content = [];
    for (const image of message.images || []) {
      const [header, data] = image.split(",");
      const mediaType = header?.match(/^data:(.*?);base64$/)?.[1] || "image/jpeg";
      if (data) content.push({ type: "image", source: { type: "base64", media_type: mediaType, data } });
    }
    if (message.content) content.push({ type: "text", text: message.content });
    return { role: message.role === "assistant" ? "assistant" : "user", content: content.length === 1 && content[0].type === "text" ? message.content : content };
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": model.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model: model.id, max_tokens: 2048, system: SYSTEM_PROMPT, messages }),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(parseError(data, response.status));
  return data.content?.filter((part) => part.type === "text").map((part) => part.text).join("\n") || "No response returned by Anthropic.";
}

export async function callAPI(model, history) {
  if (!model) throw new Error("Select a model first.");
  if (model.apiType === "anthropic") return callAnthropic(model, history);
  if (["groq", "openai", "openai_compat"].includes(model.apiType)) return callOpenAICompatible(model, history);
  throw new Error(`Unsupported API type: ${model.apiType}`);
}
