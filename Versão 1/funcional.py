from PIL import Image
import pyautogui
import pytesseract


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