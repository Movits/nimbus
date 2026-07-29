# Recorte de chroma com despill, para as artes NIMBUS.
#
# O que o Canva nao faz: alem de remover o fundo, e preciso tirar a cor de
# chroma que vazou para dentro da arte (sombras, bordas e rachaduras).
# O fundo e MEDIDO na borda da imagem e o modo sai dele:
#   VERDE   (G domina R e B)      — estampas classicas e wordmark
#   MAGENTA (R e B dominam G)     — artes com azul/verde demais para o verde,
#                                    como o azulejo (S*)
# Azul das artes nao dispara o modo magenta: no azul R e baixo, e o detector
# usa min(R,B).
from PIL import Image
import numpy as np, sys, os

def recortar(entrada, saida):
    im = Image.open(entrada).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]

    # cor do fundo pela borda
    borda = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).astype(np.float32)
    bd_verde = borda[:, 1] - np.maximum(borda[:, 0], borda[:, 2])
    bd_mag = np.minimum(borda[:, 0], borda[:, 2]) - borda[:, 1]
    modo = "verde" if np.median(bd_verde) > np.median(bd_mag) else "magenta"
    sel = borda[(bd_verde if modo == "verde" else bd_mag) > 25]
    fundo = np.median(sel, axis=0)[:3] if len(sel) else (
        np.array([9.0, 166.0, 79.0]) if modo == "verde" else np.array([251.0, 2.0, 250.0]))

    # dominancia do fundo: positivo = pixel puxado para o chroma
    dom = (G - np.maximum(R, B)) if modo == "verde" else (np.minimum(R, B) - G)

    # alfa suave: opaco quando dom<=8, transparente quando dom>=28. Rampa curta
    # de proposito: salpicos do fundo tem dom menor que o chroma puro, e rampa
    # longa deixava alfa residual neles (fundo fantasma na composicao).
    alpha = np.clip(1.0 - (dom - 8.0) / (28.0 - 8.0), 0.0, 1.0)

    # despill no que fica
    if modo == "verde":
        # G nao passa do maior entre R e B (+2 de folga)
        G = np.minimum(G, np.maximum(R, B) + 2.0)
    else:
        # o excesso conjunto de R e B sobre G e vazamento magenta
        excesso = np.minimum(R, B) - (G + 2.0)
        excesso = np.maximum(excesso, 0.0)
        R = R - excesso
        B = B - excesso

    # unpremultiply contra o fundo medido SO onde ha opacidade relevante;
    # dividir por alfa minusculo estoura os canais (foi o bug do fundo roxo)
    al = np.maximum(alpha, 0.35)
    Ru = np.clip((R - (1 - al) * fundo[0]) / al, 0, 255)
    Gu = np.clip((G - (1 - al) * fundo[1]) / al, 0, 255)
    Bu = np.clip((B - (1 - al) * fundo[2]) / al, 0, 255)

    if modo == "verde":
        # reforca o despill e neutraliza o residuo avermelhado do unpremultiply
        # (na paleta creme/preto/ouro vermelho forte nao existe)
        Gu = np.minimum(Gu, np.maximum(Ru, Bu) + 2.0)
        lum = 0.299 * Ru + 0.587 * Gu + 0.114 * Bu
        residuo = Ru > Gu * 1.5
        for C in (Ru, Gu, Bu):
            C[residuo] = lum[residuo]
    else:
        excesso = np.maximum(np.minimum(Ru, Bu) - (Gu + 2.0), 0.0)
        Ru = Ru - excesso
        Bu = Bu - excesso

    rgba = np.dstack([Ru, Gu, Bu, alpha * 255]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(saida, dpi=(300, 300))

    # metricas de controle: sobrou pixel dominado pela cor do chroma?
    kept = alpha > 0.5
    s = np.asarray(Image.open(saida).convert("RGB")).astype(int)
    if modo == "verde":
        ruim = (s[:, :, 1] > np.maximum(s[:, :, 0], s[:, :, 2]) + 6) & kept
    else:
        ruim = (np.minimum(s[:, :, 0], s[:, :, 2]) > s[:, :, 1] + 6) & kept
    print(f"{os.path.basename(saida)}: {rgba.shape[1]}x{rgba.shape[0]} | modo {modo} | pixels com chroma dominante restantes: {ruim.sum()}")

def compor(png, fundo_rgb, saida):
    fg = Image.open(png).convert("RGBA")
    bg = Image.new("RGBA", fg.size, fundo_rgb + (255,))
    Image.alpha_composite(bg, fg).convert("RGB").save(saida)

if __name__ == "__main__":
    recortar(sys.argv[1], sys.argv[2])
    if len(sys.argv) > 3 and sys.argv[3] == "--previews":
        base = sys.argv[2].rsplit(".", 1)[0]
        compor(sys.argv[2], (16, 16, 16), base + "-preview-preta.png")
        compor(sys.argv[2], (247, 251, 255), base + "-preview-branca.png")
