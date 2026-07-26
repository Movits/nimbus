import { loadKey, API } from "./_env.mjs";

const key = loadKey();

async function main() {
  // 1. valida a chave listando modelos (chamada barata/grátis)
  const r = await fetch(`${API}/models?key=${encodeURIComponent(key)}&pageSize=200`, {
    headers: { "x-goog-api-key": key },
  });
  const status = r.status;
  const body = await r.text();
  if (status !== 200) {
    console.log("FALHA_AUTH status=" + status);
    console.log(body.slice(0, 800));
    return;
  }
  const j = JSON.parse(body);
  const models = (j.models || []).map((m) => ({
    name: m.name.replace("models/", ""),
    methods: m.supportedGenerationMethods || [],
  }));
  const imageModels = models.filter((m) =>
    /image/i.test(m.name) || m.methods.includes("predict") || /nano|imagen/i.test(m.name),
  );
  console.log("OK total_modelos=" + models.length);
  console.log("--- modelos de imagem candidatos ---");
  for (const m of imageModels) console.log(m.name, "| métodos:", m.methods.join(","));
  console.log("--- todos que suportam generateContent (amostra) ---");
  for (const m of models.filter((x) => x.methods.includes("generateContent")).slice(0, 40)) {
    console.log(m.name);
  }
}

main().catch((e) => console.log("ERRO " + String(e).slice(0, 300)));
