from PIL import Image
import pyautogui
import pytesseract
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