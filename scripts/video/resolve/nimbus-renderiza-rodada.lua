-- NIMBUS: enfileira e dispara o render de review (H.264) de todas as timelines
-- da rodada corrente para <rodada>/_render/review/. Menu Workspace > Scripts;
-- interpretador interno (edicao gratuita ok). Copia canonica:
-- Nimbus/scripts/video/resolve/; executavel em
-- %APPDATA%/Blackmagic Design/DaVinci Resolve/Support/Fusion/Scripts/Edit/.
local PONTEIRO = "C:/Users/rober/nimbus-assets/marketing/_rodada-atual.txt"

local f = io.open(PONTEIRO, "r")
if not f then
  print("[NIMBUS] ERRO: ponteiro nao encontrado: " .. PONTEIRO)
  return
end
local dirRodada = f:read("*l") or ""
f:close()
dirRodada = dirRodada:gsub("%s+$", ""):gsub("\\", "/")

local ok, cfg = pcall(dofile, dirRodada .. "/projeto/rodada-config.lua")
if not ok or type(cfg) ~= "table" then
  print("[NIMBUS] ERRO: rodada-config.lua ilegivel em " .. dirRodada)
  return
end

local rv = resolve or Resolve()
local pm = rv:GetProjectManager()
local proj = pm:LoadProject(cfg.projeto) or pm:GetCurrentProject()
if not proj then
  print("[NIMBUS] ERRO: projeto nao encontrado: " .. tostring(cfg.projeto))
  return
end

local destino = dirRodada .. "/_render/review"

-- indice de timelines por nome
local porNome = {}
for i = 1, proj:GetTimelineCount() do
  local tl = proj:GetTimelineByIndex(i)
  if tl then porNome[tl:GetName()] = tl end
end

proj:DeleteAllRenderJobs()
pcall(function() proj:LoadRenderPreset("H.264 Master") end)

local lista = cfg.timelines or { { nome = cfg.timeline } }
local enfileiradas = 0
for _, item in ipairs(lista) do
  local tl = porNome[item.nome]
  if not tl then
    print("[NIMBUS] timeline nao encontrada no projeto: " .. item.nome)
  else
    proj:SetCurrentTimeline(tl)
    proj:SetRenderSettings({
      SelectAllFrames = true,
      TargetDir = destino,
      CustomName = item.nome,
      ExportVideo = true,
      ExportAudio = true,
    })
    local job = proj:AddRenderJob()
    if job then
      enfileiradas = enfileiradas + 1
      print("[NIMBUS] na fila: " .. item.nome)
    else
      print("[NIMBUS] FALHOU enfileirar: " .. item.nome)
    end
  end
end

if enfileiradas > 0 then
  proj:StartRendering()
  print(string.format("[NIMBUS] renderizando %d timeline(s) para %s ...", enfileiradas, destino))
else
  print("[NIMBUS] nada na fila.")
end