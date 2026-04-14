import { SYSTEM_PROMPT } from "./constants";

export async function callAPI(model, history) {
  const { apiType, apiKey, id, baseUrl } = model;
  
  if (apiType === "anthropic") {
    const msgs = history.map(m => {
      if (m.images?.length) {
        const content = [];
        m.images.forEach(src => {
          const b64=src.split(",")[1], mt=src.split(";")[0].split(":")[1];
          content.push({type:"image",source:{type:"base64",media_type:mt,data:b64}});
        });
        if (m.content) content.push({type:"text",text:m.content});
        return {role:m.role,content};
      }
      return {role:m.role,content:m.content};
    });
    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:msgs})
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.content?.[0]?.text ?? "No response";
  }
  
  if(["groq","openai","openai_compat"].includes(apiType)){
    if(!apiKey) throw new Error(`API key missing for ${model.name}. Add it in the Models tab.`);
    const endpoint = apiType === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : `${baseUrl||"https://api.openai.com/v1"}/chat/completions`;
    const msgs = [{role:"system",content:SYSTEM_PROMPT}, ...history.map(m=>({role:m.role,content:m.content}))];
    
    const res = await fetch(endpoint, {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},
        body:JSON.stringify({model:id,messages:msgs,max_tokens:1000})
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content ?? "No response";
  }
  throw new Error(`Unknown API type: ${apiType}`);
}
