# Recorte de chroma verde com despill, para as artes NIMBUS.
#
# O que o Canva nao faz: alem de remover o fundo, e preciso tirar o VERDE que
# vazou para dentro da arte (sombras, bordas e rachaduras da textura). Regra:
# num pixel mantido, o canal G nunca pode dominar R e B — se domina, e spill.
from PIL import Image
import numpy as np, sys, os

def recortar(entrada, saida):
    im = Image.open(entrada).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]

    # dominancia do verde: positivo = pixel puxado para o fundo
    dom = G - np.maximum(R, B)

    # alfa suave: opaco quando dom<=8, transparente quando dom>=28. Rampa curta
    # de proposito: o fundo tem salpicos de spray com dom menor que o verde puro,
    # e rampa longa deixava alfa residual neles (fundo fantasma na composicao).
    alpha = np.clip(1.0 - (dom - 8.0) / (28.0 - 8.0), 0.0, 1.0)

    # despill: no que fica, G nao passa do maior entre R e B (+2 de folga)
    teto = np.maximum(R, B) + 2.0
    Gd = np.minimum(G, teto)

    # unpremultiply contra o verde do fundo SO onde ha opacidade relevante;
    # dividir por alfa minusculo estoura os canais (foi o bug do fundo roxo)
    fundo = np.array([9.0, 166.0, 79.0])
    al = np.maximum(alpha, 0.35)
    Ru = np.clip((R - (1 - al) * fundo[0]) / al, 0, 255)
    Gu = np.clip((Gd - (1 - al) * fundo[1]) / al, 0, 255)
    Bu = np.clip((B - (1 - al) * fundo[2]) / al, 0, 255)
    # reforca o despill depois do unpremultiply
    Gu = np.minimum(Gu, np.maximum(Ru, Bu) + 2.0)

    # o unpremultiply injeta vermelho nos pixels de rachadura; nesta paleta
    # (creme/preto/ouro) vermelho forte nao existe: neutraliza para a luminancia
    lum = 0.299 * Ru + 0.587 * Gu + 0.114 * Bu
    magenta = Ru > Gu * 1.5
    for C in (Ru, Gu, Bu):
        C[magenta] = lum[magenta]

    rgba = np.dstack([Ru, Gu, Bu, alpha * 255]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(saida)

    # metricas de controle
    kept = alpha > 0.5
    spill = (np.asarray(Image.open(saida).convert("RGB")).astype(int))
    g_dom = (spill[:, :, 1] > np.maximum(spill[:, :, 0], spill[:, :, 2]) + 6) & kept
    print(f"{os.path.basename(saida)}: {rgba.shape[1]}x{rgba.shape[0]} | pixels com verde dominante restantes: {g_dom.sum()}")

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
