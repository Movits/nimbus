-- NIMBUS: importa a rodada corrente no Resolve (menu Workspace > Scripts).
-- Roda com o interpretador INTERNO, permitido na edicao gratuita.
-- Le o ponteiro _rodada-atual.txt e o rodada-config.lua gerado por
-- scripts/video/monta-timeline.mjs (repo publico). Copia canonica deste arquivo:
-- Nimbus/scripts/video/resolve/; a copia executavel vive em
-- %APPDATA%/Blackmagic Design/DaVinci Resolve/Support/Fusion/Scripts/Edit/.
local PONTEIRO = "C:/Users/rober/nimbus-assets/marketing/_rodada-atual.txt"

local function falha(msg)
  print("[NIMBUS] ERRO: " .. msg)
end

local f = io.open(PONTEIRO, "r")
if not f then
  falha("ponteiro nao encontrado: " .. PONTEIRO)
  return
end
local dirRodada = f:read("*l") or ""
f:close()
dirRodada = dirRodada:gsub("%s+$", ""):gsub("\\", "/")

local ok, cfg = pcall(dofile, dirRodada .. "/projeto/rodada-config.lua")
if not ok or type(cfg) ~= "table" then
  falha("nao consegui ler " .. dirRodada .. "/projeto/rodada-config.lua (rode npm run video:timeline)")
  return
end

local rv = resolve or Resolve()
if not rv then
  falha("objeto resolve indisponivel neste contexto")
  return
end
local pm = rv:GetProjectManager()
local proj = pm:LoadProject(cfg.projeto)
if not proj then
  proj = pm:CreateProject(cfg.projeto)
end
if not proj then
  falha("nao consegui criar nem abrir o projeto " .. cfg.projeto)
  return
end

proj:SetSetting("timelineResolutionWidth", tostring(cfg.largura))
proj:SetSetting("timelineResolutionHeight", tostring(cfg.altura))
proj:SetSetting("timelineFrameRate", tostring(cfg.fps))

local mp = proj:GetMediaPool()

local jaExiste = false
for i = 1, proj:GetTimelineCount() do
  local tl = proj:GetTimelineByIndex(i)
  if tl and tl:GetName() == cfg.timeline then
    jaExiste = true
    break
  end
end

if jaExiste then
  print("[NIMBUS] timeline '" .. cfg.timeline .. "' ja existe; nada reimportado (apague-a ou renomeie antes).")
else
  local okTl, tl = pcall(function()
    return mp:ImportTimelineFromFile(cfg.fcpxml, { timelineName = cfg.timeline })
  end)
  if okTl and tl then
    -- o proprio FCPXML traz a midia; importar de novo duplicaria o media pool
    print("[NIMBUS] timeline importada: " .. tl:GetName())
  else
    print("[NIMBUS] ImportTimelineFromFile falhou nesta edicao.")
    print("[NIMBUS] fallback: File > Import > Timeline (Ctrl+Shift+I) em " .. cfg.fcpxml)
    local itens = mp:ImportMedia(cfg.midias)
    print(string.format("[NIMBUS] midia importada avulsa para o fallback: %d item(ns)", itens and #itens or 0))
  end
end

local fs = io.open(cfg.srt, "r")
if fs then
  fs:close()
  pcall(function() mp:ImportMedia({ cfg.srt }) end)
  print("[NIMBUS] SRT no media pool; se nao entrar na timeline: Timeline > Import > Subtitle em " .. cfg.srt)
end

print("[NIMBUS] pronto: projeto " .. cfg.projeto)
