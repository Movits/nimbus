import fs from "node:fs";

const targets = [
  ["landing", "https://nimbuswear.com.br/"],
  ["store", "https://loja.nimbuswear.com.br/"],
];
const output = "C:/Users/rober/Nimbus/nuvemshop/auditoria/2026-07-21/implementacao/pagespeed-public.json";

const results = [];
for (const [name, url] of targets) {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  for (const category of ["performance", "accessibility", "seo", "best-practices"]) {
    endpoint.searchParams.append("category", category);
  }
  const response = await fetch(endpoint, { headers: { accept: "application/json" } });
  if (!response.ok) {
    results.push({ name, url, error: `${response.status} ${response.statusText}`, body: (await response.text()).slice(0, 500) });
    continue;
  }
  const json = await response.json();
  const lighthouse = json.lighthouseResult;
  const audits = lighthouse?.audits || {};
  results.push({
    name,
    url,
    fetchedAt: lighthouse?.fetchTime,
    finalUrl: lighthouse?.finalUrl,
    categories: Object.fromEntries(
      Object.entries(lighthouse?.categories || {}).map(([key, value]) => [key, Math.round((value.score || 0) * 100)]),
    ),
    metrics: {
      fcp: audits["first-contentful-paint"]?.displayValue,
      lcp: audits["largest-contentful-paint"]?.displayValue,
      tbt: audits["total-blocking-time"]?.displayValue,
      cls: audits["cumulative-layout-shift"]?.displayValue,
      speedIndex: audits["speed-index"]?.displayValue,
      inpFieldP75: json.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentile ?? null,
    },
    failedAudits: Object.values(audits)
      .filter((audit) => audit.scoreDisplayMode !== "notApplicable" && typeof audit.score === "number" && audit.score < 0.9)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 20)
      .map((audit) => ({ id: audit.id, score: audit.score, title: audit.title, displayValue: audit.displayValue || "" })),
  });
}

fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), strategy: "mobile", results }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.error)) process.exitCode = 1;
