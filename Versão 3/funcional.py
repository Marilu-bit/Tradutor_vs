from PIL import Image
import pyautogui
import pytesseract

# Caminho absoluto para o executável do Tesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

from googletrans import Translator 
from flask import Flask, request, jsonify
from flask_cors import CORS  # Permitir requisições do navegador

# Inicia o Flask
app = Flask(__name__)
CORS(app)

# Função que faz captura, OCR e tradução
def capturar_traduzir(idioma_de, idioma_para):
    # Tirar print da tela
    screenshot = pyautogui.screenshot()
    screenshot.save("screenshot.png")

    # OCR: reconhecer texto
    texto = pytesseract.image_to_string(screenshot, lang=idioma_de)

    # Traduzir texto
    translator = Translator()
    texto_traduzido = translator.translate(texto, src=idioma_de, dest=idioma_para).text

    return {
        "texto_original": texto,
        "texto_traduzido": texto_traduzido
    }

# Rota chamada pelo popup
@app.route('/traduzir', methods=['POST'])
def traduzir():
    dados = request.get_json()
    idioma_de = dados.get('de')
    idioma_para = dados.get('para')

    # Traduzir com base nos idiomas recebidos
    resultado = capturar_traduzir(idioma_de, idioma_para)

    return jsonify(resultado)

# Iniciar o servidor
if __name__ == '__main__':
    app.run(debug=True)
