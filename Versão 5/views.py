from PIL import Image, ImageDraw, ImageFont
import pyautogui
import pytesseract
from googletrans import Translator
from flask import render_template, request, jsonify
from main import app
import base64
import io 
import os

# Chama o popup
@app.route("/")
def popup():
    return render_template("popup.html")


# Iniciar código
@app.route("/", methods=["POST"])
def traduzir_imagem():
    dados = request.get_json()
    idioma_atual = dados.get('atual')
    idioma_novo = dados.get('novo')
    imagem_base64 = dados.get('imagem')

    # Verifica se a imagem foi enviada
    if not imagem_base64:
        return jsonify({"error": "Nenhuma imagem foi enviada.", "texto_traduzido": "Erro."}), 400


    # Alterações na imagem
    if "base64," in imagem_base64:
        imagem_base64 = imagem_base64.split("base64,")[1]
    try:
        imagem_bytes = base64.b64decode(imagem_base64)
        screenshot_pil = Image.open(io.BytesIO(imagem_bytes))
    except Exception as e:
        return jsonify({"error": f"Erro ao decodificar a imagem: {e}", "texto_traduzido": "Erro."}), 400

    traducao = capturar_traduzir(screenshot_pil, idioma_atual, idioma_novo) 
    
    # Retorna o resultado como JSON
    return jsonify(traducao)



# Codigo para print e tradução
def capturar_traduzir(imagem_pil, idioma_atual, idioma_novo):
    try:
        # Executar OCR com bounding boxes
        info = pytesseract.image_to_data(imagem_pil, lang=idioma_atual, output_type=pytesseract.Output.DICT)

        desenho = ImageDraw.Draw(imagem_pil)
        fonte = ImageFont.truetype("arial.ttf", 20)
        tradutor = Translator()

# Loop pelas caixas de texto

        for i in range(len(info['text'])):
            texto = info['text'][i].strip()
            if texto:
                x, y, w, h = info['left'][i], info['top'][i], info['width'][i], info['height'][i]

# Traduzir texto
                try:
                    texto_traduzido = tradutor.translate(texto, src=idioma_atual, dest=idioma_novo).text
                except Exception as e:
                    texto_traduzido = texto + " (erro trad.)"

                # Apaga texto original
                desenho.rectangle([(x, y), (x + w, y + h)], fill="white")
                # Desenha texto traduzido
                desenho.text((x, y), texto_traduzido, fill="black", font=fonte)

        # Converter imagem final para base64
        buffer = io.BytesIO()
        imagem_pil.save(buffer, format="PNG")
        imagem_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return {
            "imagem_modificada": f"data:image/png;base64,{imagem_base64}"
        }

    except Exception as e:
        return {"error": f"Erro ao processar imagem: {e}", "texto_traduzido": "Erro"}