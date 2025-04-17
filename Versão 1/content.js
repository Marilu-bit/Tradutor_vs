chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureScreenshot') {
      chrome.tabs.captureVisibleTab((screenshotUrl) => {
        sendResponse({ screenshotUrl: screenshotUrl });
      });
      return true;
    }
  });

  const Tesseract = require('tesseract.js');

function processImage(imageUrl) {
  Tesseract.recognize(imageUrl, 'eng', {
    logger: (m) => console.log(m),
  }).then(({ data: { text } }) => {
    console.log('Texto extraído:', text);
    // Enviar o texto para tradução aqui
  });
}

function translateText(text, targetLanguage) {
    fetch(`https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Texto traduzido:', data.data.translations[0].translatedText);
        // Exibir o texto traduzido na página
      })
      .catch(error => console.error('Erro ao traduzir:', error));
  }
  
  function replaceTextOnPage(translatedText) {
    document.body.innerHTML = document.body.innerHTML.replace(/Texto original/g, translatedText);
  }
  