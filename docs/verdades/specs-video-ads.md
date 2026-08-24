---
status: vigente
atualizado: 2026-08-23
---
# Specs de vídeo para ads (números estáveis)

## Entrega

| O quê | Valor |
|---|---|
| Formato máster | 1080x1920 (9:16), 30 fps CFR, H.264 8-bit, áudio AAC 48 kHz |
| Safe area (Stories/Reels) | UI cobre ~250 px no topo e ~340 px no rodapé; conteúdo essencial na faixa y≈300-1480 |
| Crop 4:5 do mesmo máster | sujeito principal dentro da faixa central ~1080x1180 |
| Loudness | -14 LUFS integrado, true peak -1,5 dBTP (prática de mercado; plataforma nenhuma publica spec) |
| Legenda | Reels/TikTok: queimada no Deliver ("Burn into video"); SRT sidecar fica no git |
| Mezanine de edição | 1080x1920, 30 fps CFR, H.264 all-intra (`-g 1`) CRF 16 |
| Intercâmbio | FCPXML **1.10** (teto do export via API do Resolve 21; a UI vai além, mas o pipeline usa 1.10 nas duas pontas) |

## Custo de geração (Higgsfield, referência de 08/2026)

- Vídeo Seedance 2.0: **10 s a 720p ≈ 45 créditos** (≈ 4,5 créditos/segundo).
- Teste em 720p; só o vencedor re-renderiza em 1080p.
- Durações-alvo por formato de ad: **a preencher pela pesquisa P2**.

## DaVinci Resolve 21: gratuito × Studio (verificado em 23/08)

O que a edição GRATUITA tem e que basta para os ads:

- Timeline vertical 1080x1920 e export até UHD 3840x2160 60 fps, sem watermark.
- Text+ e MultiText; página Fusion (nodes, keying, tracking 2D, partículas).
- Fairlight quase completo, incluindo noise reduction de ÁUDIO.
- Import E export de FCPXML/XML/EDL/AAF; import de SRT.
- Scripts Lua/Python pelo menu Workspace > Scripts e pelo Console interno.

O que é Studio (na free, efeito aplicado renderiza com watermark grande):

- Magic Mask, Speed Warp, Super Scale, noise reduction de VÍDEO.
- H.264/H.265 10-bit e encode acelerado por GPU (free = 8-bit, encode por
  software — indiferente para clipes de 6-30 s).
- Transcrição automática de áudio ("Create Subtitles from Audio").
- Scripting EXTERNO (de fora do app) e UIManager em script.

Fontes primárias: <https://www.blackmagicdesign.com/products/davinciresolve> ·
<https://www.blackmagicdesign.com/products/davinciresolve/studio> · README da
API em `C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\README.txt`
(21.0.4) · comparativo independente
<https://www.cined.com/davinci-resolve-an-in-depth-comparison-between-the-free-and-studio-version/>.
