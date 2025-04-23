from PIL import Image
import pyautogui
import pytesseract

# Caminho absoluto para o executável do Tesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

from googletrans import Translator  # Necessário instalar a biblioteca googletrans

# Tirar print
screenshot = pyautogui.screenshot()

# Salvar imagem
screenshot.save("screenshot.png")

# Identificar texto na imagem
texto = pytesseract.image_to_string(screenshot, lang="por")  # Português

# Traduzir o texto da imagem
translator = Translator()
texto_traduzido = translator.translate(texto, src='pt', dest='en').text  # Traduzir de português para inglês

# Apresentar o texto original e traduzido
print("Texto Original:")
print(texto)
print("\nTexto Traduzido:")
print(texto_traduzido)

# Exibir a imagem
screenshot.show()