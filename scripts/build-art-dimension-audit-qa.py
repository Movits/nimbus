from __future__ import annotations

import csv
import shutil
import textwrap
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(r"C:\Users\rober\Nimbus")
AUDIT_DIR = ROOT / "nuvemshop" / "auditoria" / "2026-07-22-dimensoes-arte"
CSV_PATH = AUDIT_DIR / "auditoria-dimensoes-arte.csv"
CARDS_DIR = AUDIT_DIR / "cards"
LOGO_PATH = ROOT / "nuvemshop" / "assets" / "logo-nimbus.png"
OUT_DIR = AUDIT_DIR / "rendered-direct"
PDF_PATH = AUDIT_DIR / "auditoria-dimensoes-arte-nimbus-qa.pdf"

PAGE_W, PAGE_H = 1650, 1275
NAVY = "#10265e"
LIGHT_BLUE = "#d7ecff"
PALE_BLUE = "#edf6ff"
GOLD = "#e3b63f"
GREEN = "#20674f"
PALE_GREEN = "#e9f7f1"
RED = "#a91e22"
PALE_RED = "#fdeeee"
INK = "#18315b"
MUTED = "#476387"
WHITE = "#ffffff"

FONT = Path(r"C:\Windows\Fonts\calibri.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\calibrib.ttf")


def font(size: int, bold: bool = False):
    path = FONT_BOLD if bold else FONT
    return ImageFont.truetype(str(path), size=size)


def read_rows():
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def page(fill=WHITE):
    return Image.new("RGB", (PAGE_W, PAGE_H), fill)


def wrapped(draw, xy, text, *, width_chars, size, fill=INK, bold=False, spacing=7):
    lines = []
    for paragraph in text.split("\n"):
        lines.extend(textwrap.wrap(paragraph, width=width_chars) or [""])
    draw.multiline_text(xy, "\n".join(lines), font=font(size, bold), fill=fill, spacing=spacing)


def footer(image, page_num):
    draw = ImageDraw.Draw(image)
    draw.line((65, PAGE_H - 54, PAGE_W - 65, PAGE_H - 54), fill=LIGHT_BLUE, width=2)
    draw.text((65, PAGE_H - 43), "NIMBUS  |  Auditoria visual", font=font(18), fill=MUTED)
    label = str(page_num)
    bbox = draw.textbbox((0, 0), label, font=font(18, True))
    draw.text((PAGE_W - 65 - (bbox[2] - bbox[0]), PAGE_H - 43), label, font=font(18, True), fill=MUTED)


def save_page(image, number, pages):
    footer(image, number)
    path = OUT_DIR / f"page-{number:03d}.png"
    image.save(path, "PNG", optimize=True)
    pages.append(path)


def make_cover():
    im = page(PALE_BLUE)
    draw = ImageDraw.Draw(im)
    draw.rectangle((0, 0, 1080, PAGE_H), fill=LIGHT_BLUE)
    draw.rectangle((1080, 0, PAGE_W, PAGE_H), fill=NAVY)
    draw.rectangle((0, 0, 18, PAGE_H), fill=GOLD)
    draw.text((95, 105), "AUDITORIA VISUAL DE PRODUTOS", font=font(25, True), fill=MUTED)
    wrapped(draw, (95, 220), "Escala real\ndas estampas", width_chars=28, size=64, fill=NAVY, bold=True, spacing=4)
    wrapped(draw, (95, 480), "YouDraw × fotos de modelo\npublicadas na Nuvemshop", width_chars=48, size=34, fill=INK, spacing=8)
    wrapped(draw, (95, 690), "49 produtos  •  49 comparações lado a lado\nmedidas oficiais em centímetros", width_chars=54, size=26, fill=MUTED, spacing=8)
    if LOGO_PATH.exists():
        logo = Image.open(LOGO_PATH).convert("RGBA")
        logo.thumbnail((380, 260), Image.Resampling.LANCZOS)
        im.paste(logo, (1175, 365), logo)
    draw.text((1205, 730), "22 JUL 2026", font=font(24, True), fill=GOLD)
    wrapped(draw, (95, 955), "Objetivo: separar o que pode permanecer, o que exige revisão e o que precisa ser refeito antes de investir novos créditos.", width_chars=85, size=25, fill=INK, bold=True)
    return im


def make_summary(rows):
    im = page()
    draw = ImageDraw.Draw(im)
    draw.text((70, 55), "Resultado executivo", font=font(46, True), fill=NAVY)
    wrapped(draw, (70, 135), "A auditoria cruzou as dimensões oficiais da YouDraw com a proporção visual das estampas nas capas atuais. Nenhuma alteração está autorizada por este relatório: ele organiza o seu feedback.", width_chars=112, size=25, fill=INK)
    counts = Counter(r["verdict"] for r in rows)
    boxes = [("APROVAR", counts["APROVAR"], PALE_GREEN, GREEN), ("REVISAR", counts["REVISAR"], "#fff5d9", "#8c6500"), ("REFAZER", counts["REFAZER"], PALE_RED, RED)]
    for i, (label, value, bg, fg) in enumerate(boxes):
        x = 70 + i * 505
        draw.rounded_rectangle((x, 290, x + 465, 515), radius=24, fill=bg)
        draw.text((x + 185, 325), str(value), font=font(58, True), fill=fg)
        draw.text((x + 165, 430), label, font=font(26, True), fill=fg)
    draw.text((70, 600), "Leitura mais importante", font=font(32, True), fill=NAVY)
    bullets = [
        "YouDraw e as medidas em centímetros são a fonte de verdade.",
        "O risco maior é a inconsistência entre peças da mesma família.",
        "São Jorge Neobarroco, São Miguel Vitorioso, São Jorge Vintage e Anjo da Guarda concentram as correções mais visíveis.",
        "A foto permite estimar proporção, mas não provar centímetros devido a perspectiva, pose e caimento.",
    ]
    y = 675
    for item in bullets:
        draw.ellipse((78, y + 10, 92, y + 24), fill=GOLD)
        wrapped(draw, (110, y), item, width_chars=108, size=24, fill=INK)
        y += 108
    return im


def make_method():
    im = page()
    draw = ImageDraw.Draw(im)
    draw.text((70, 55), "Método e limites da auditoria", font=font(46, True), fill=NAVY)
    methods = [
        ("1. Fonte de verdade", "Medidas exatas de frente e costas coletadas dentro de cada produto na YouDraw."),
        ("2. Comparação visual", "Foto atual lado a lado com os mockups oficiais de todas as cores."),
        ("3. Escala", "Área ocupada pela arte em relação ao painel útil da frente ou das costas."),
        ("4. Identidade", "Composição, moldura, personagem, tipografia, microtexto e cores."),
        ("5. Consistência", "Mesma arte precisa manter escala estável entre cores e peças."),
    ]
    y = 155
    for i, (label, body) in enumerate(methods):
        bg = LIGHT_BLUE if i % 2 == 0 else PALE_BLUE
        draw.rounded_rectangle((70, y, PAGE_W - 70, y + 118), radius=12, fill=bg)
        draw.text((95, y + 28), label, font=font(25, True), fill=NAVY)
        wrapped(draw, (445, y + 23), body, width_chars=77, size=24, fill=INK)
        y += 135
    draw.text((70, 855), "Faixas de decisão", font=font(31, True), fill=NAVY)
    wrapped(draw, (70, 915), "APROVAR: coerente, geralmente dentro de ±8–10%.\nREVISAR: desvio limítrofe, microdetalhe ou modelagem incerta.\nREFAZER: diferença visível, normalmente acima de 15%, inconsistência ou arte regenerada.", width_chars=107, size=23, fill=INK, spacing=10)
    draw.rounded_rectangle((70, 1085, PAGE_W - 70, 1185), radius=12, fill="#fff7e1")
    wrapped(draw, (95, 1105), "Limite: a medida oficial é exata; a leitura fotográfica é estimada e recebe um nível de confiança.", width_chars=102, size=23, fill="#745500", bold=True)
    return im


def make_priority(rows, verdict, title, intro):
    im = page()
    draw = ImageDraw.Draw(im)
    draw.text((70, 55), title, font=font(44, True), fill=NAVY)
    wrapped(draw, (70, 125), intro, width_chars=114, size=23, fill=INK)
    subset = [r for r in rows if r["verdict"] == verdict]
    y = 230
    col_w = 730
    row_h = 145 if verdict == "REFAZER" else 125
    for idx, entry in enumerate(subset):
        col = idx % 2
        row = idx // 2
        x = 70 + col * 755
        yy = y + row * (row_h + 14)
        bg = PALE_RED if verdict == "REFAZER" else "#fff8e7"
        draw.rounded_rectangle((x, yy, x + col_w, yy + row_h), radius=11, fill=bg)
        name = entry["title"].replace(" | ", " — ")
        draw.text((x + 18, yy + 15), name, font=font(21, True), fill=NAVY)
        wrapped(draw, (x + 18, yy + 50), entry["recommendation"], width_chars=54, size=19, fill=INK, spacing=3)
    return im


def make_card_page(row, index, total):
    im = page()
    draw = ImageDraw.Draw(im)
    draw.text((75, 42), f"COMPARAÇÃO {index:02d}/{total:02d}  •  {row['collection']}  •  {row['verdict']}", font=font(23, True), fill=MUTED)
    card = Image.open(CARDS_DIR / f"{row['product_id']}.jpg").convert("RGB")
    card = card.resize((1500, 875), Image.Resampling.LANCZOS)
    im.paste(card, (75, 112))
    draw.rounded_rectangle((75, 1025, PAGE_W - 75, 1170), radius=12, fill=PALE_BLUE)
    draw.text((95, 1048), "Como ler", font=font(22, True), fill=NAVY)
    wrapped(draw, (260, 1042), "A medida em cm vem da YouDraw. O percentual é uma estimativa visual baseada no painel útil da peça e na perspectiva da foto.", width_chars=102, size=21, fill=INK)
    return im


def make_next_steps():
    im = page()
    draw = ImageDraw.Draw(im)
    draw.text((70, 55), "Próxima etapa após o seu feedback", font=font(44, True), fill=NAVY)
    wrapped(draw, (70, 130), "Nenhuma capa deve ser substituída antes da sua aprovação. Depois disso, a correção deve ocorrer em lotes pequenos e ser validada no site real.", width_chars=110, size=24, fill=INK)
    steps = [
        ("1", "Priorizar os 11 itens REFAZER", "Começar pelas diferenças visíveis e famílias inconsistentes."),
        ("2", "Arte original como camada rígida", "Gerar pessoa, cenário, luz e tecido sem redesenhar a estampa."),
        ("3", "Testar uma peça piloto", "Validar primeiro no Nano Banana/Gemini com um produto e uma cor."),
        ("4", "Aprovar escala e identidade", "Comparar de novo com a YouDraw e registrar o delta exato."),
        ("5", "Escalar só o método aprovado", "Usar Higgsfield depois que referência e escala estiverem comprovadas."),
        ("6", "Publicar preservando o acervo", "Manter todas as imagens oficiais e trocar apenas a capa reprovada."),
    ]
    y = 265
    for idx, (num, title, body) in enumerate(steps):
        bg = LIGHT_BLUE if idx % 2 == 0 else PALE_BLUE
        draw.rounded_rectangle((70, y, PAGE_W - 70, y + 120), radius=12, fill=bg)
        draw.text((98, y + 30), num, font=font(38, True), fill=NAVY)
        draw.text((175, y + 20), title, font=font(24, True), fill=NAVY)
        draw.text((620, y + 27), body, font=font(22), fill=INK)
        y += 135
    draw.rounded_rectangle((70, 1090, PAGE_W - 70, 1195), radius=12, fill=PALE_RED)
    wrapped(draw, (95, 1110), "Regra de parada: se duas tentativas repetirem o mesmo erro, parar de gastar créditos e mudar o método para máscara/camada rígida.", width_chars=108, size=22, fill=RED, bold=True)
    return im


def build():
    rows = read_rows()
    if len(rows) != 49:
        raise ValueError(len(rows))
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)
    pages = []
    save_page(make_cover(), 1, pages)
    save_page(make_summary(rows), 2, pages)
    save_page(make_method(), 3, pages)
    save_page(make_priority(rows, "REFAZER", "Prioridade 1 — refazer", "Diferença visível de escala, inconsistência entre cores ou risco de arte infiel."), 4, pages)
    save_page(make_priority(rows, "REVISAR", "Prioridade 2 — revisar", "Itens próximos do aceitável, mas que ainda exigem uma conferência dirigida."), 5, pages)
    for idx, row in enumerate(rows, 1):
        save_page(make_card_page(row, idx, len(rows)), idx + 5, pages)
    save_page(make_next_steps(), len(pages) + 1, pages)
    images = [Image.open(path).convert("RGB") for path in pages]
    images[0].save(PDF_PATH, "PDF", resolution=150, save_all=True, append_images=images[1:])
    for image in images:
        image.close()
    print({"pages": len(pages), "pdf": str(PDF_PATH), "out": str(OUT_DIR)})


if __name__ == "__main__":
    build()
