-- NIMBUS: exporta o estado editado (timeline em FCPXML + projeto .drp) de volta
-- para a rodada, fechando o ciclo de revisao (scripts/video/diff-timeline.mjs le
-- o FCPXML exportado). Menu Workspace > Scripts; interpretador interno (free ok).
-- Copia canonica: Nimbus/scripts/video/resolve/; executavel em
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
local proj = pm:GetCurrentProject()
if not proj then
  print("[NIMBUS] ERRO: nenhum projeto aberto")
  return
end
local tl = proj:GetCurrentTimeline()
if not tl then
  print("[NIMBUS] ERRO: nenhuma timeline aberta")
  return
end

local function constante(nome)
  local okc, v = pcall(function() return rv[nome] end)
  if okc then return v end
  return nil
end

local carimbo = os.date("%Y%m%d-%H%M")
local destinoXml = cfg.export_dir .. "/" .. tl:GetName() .. "-" .. carimbo .. ".fcpxml"
local tipo = constante("EXPORT_FCPXML_1_10") or constante("EXPORT_FCP_XML_1_10") or constante("EXPORT_FCPXML")
if tipo then
  local okX = tl:Export(destinoXml, tipo)
  if okX then
    print("[NIMBUS] timeline exportada: " .. destinoXml)
  else
    print("[NIMBUS] ERRO: Export FCPXML retornou falso")
  end
else
  print("[NIMBUS] ERRO: constante de export FCPXML nao encontrada na API; use File > Export > Timeline")
end

local destinoDrp = cfg.projeto_dir .. "/" .. cfg.projeto .. ".drp"
local okP = pm:ExportProject(proj:GetName(), destinoDrp)
if okP then
  print("[NIMBUS] projeto exportado: " .. destinoDrp)
else
  print("[NIMBUS] ERRO: ExportProject retornou falso")
end
