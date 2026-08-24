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
pcall(function() pm:SaveProject() end)
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

-- v2: a rodada pode ter varias timelines; importa cada uma que ainda nao existir.
local existentes = {}
for i = 1, proj:GetTimelineCount() do
  local tl = proj:GetTimelineByIndex(i)
  if tl then existentes[tl:GetName()] = true end
end

local lista = cfg.timelines or { { nome = cfg.timeline, fcpxml = cfg.fcpxml, srt = cfg.srt } }
local importadas = 0
for _, item in ipairs(lista) do
  if existentes[item.nome] then
    print("[NIMBUS] timeline '" .. item.nome .. "' ja existe; pulada.")
  else
    local okTl, tl = pcall(function()
      return mp:ImportTimelineFromFile(item.fcpxml, { timelineName = item.nome })
    end)
    if okTl and tl then
      importadas = importadas + 1
      print("[NIMBUS] timeline importada: " .. tl:GetName())
    else
      print("[NIMBUS] FALHOU importar '" .. item.nome .. "'; fallback Ctrl+Shift+I em " .. item.fcpxml)
    end
  end
end

print(string.format("[NIMBUS] pronto: projeto %s, %d timeline(s) importada(s) de %d.", cfg.projeto, importadas, #lista))
