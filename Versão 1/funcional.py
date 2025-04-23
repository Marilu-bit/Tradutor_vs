from PIL import Image
import pyautogui
import pytesseract

import pytesseract

# Caminho absoluto para o executável do Tesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# Tirar print
screenshot = pyautogui.screenshot()

# Salvar imagem
screenshot.save("screenshot.png")

# Identificar texto na imagem
texto = pytesseract.image_to_string(screenshot, lang="por")  # Português

# Apresentar o texto original e traduzido
print("Texto Original:")
print(texto)

# Exibir a imagem
screenshot.show()