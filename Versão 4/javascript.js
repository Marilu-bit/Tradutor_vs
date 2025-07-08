document.addEventListener('DOMContentLoaded', function() {
    const Traduzir = document.getElementById('Traduzir');
    const statusDiv = document.getElementById('status');
    const textoTraducaoDiv = document.getElementById('textoTraducao');
    const imagemTraducao = document.getElementById('imagemTraducao');

    // Deveria garantir  que o Tesseract esteja disponível.
    if (typeof Tesseract === 'undefined' || typeof Tesseract.createWorker !== 'function') {
        statusDiv.textContent = 'Erro: Tesseract.js não foi carregado corretamente. Verifique os arquivos na pasta "extensoes".';
        console.error('Objeto global Tesseract.js não encontrado ou função createWorker faltando.');
        Traduzir.disabled = true; // Desabilita o botão se Tesseract não estiver pronto
        return; 
    }

    Traduzir.addEventListener('click', async () => {
        statusDiv.textContent = 'Capturando tela...';
        textoTraducaoDiv.textContent = 'Aguardando tradução...';
        imagemTraducao.innerHTML = ''; 
        Traduzir.disabled = true; 

        try {
            const dataUrl = await chrome.tabs.captureVisibleTab();

            
            const img = document.createElement('img');
            img.src = dataUrl;
            imagemTraducao.innerHTML = '';
            imagemTraducao.appendChild(img);

            statusDiv.textContent = 'Iniciando OCR...';

            // FORÇA o Tesseract a usar os arquivos LOCAIS da extensão
            const worker = await Tesseract.createWorker('eng+por', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        statusDiv.textContent = `OCR: ${Math.round(m.progress * 100)}%`;
                    } else if (m.status) {
                        statusDiv.textContent = `OCR: ${m.status}`;
                    }
                },
                workerPath: chrome.runtime.getURL('extensoes/worker.min.js'),
                corePath: chrome.runtime.getURL('extensoes/tesseract-core.wasm.js')
            });

            const { data: { text } } = await worker.recognize(dataUrl);
            await worker.terminate();

            if (!text || text.trim() === '') {
                statusDiv.textContent = 'Nenhum texto encontrado na imagem.';
                textoTraducaoDiv.textContent = 'Nenhum texto para traduzir.';
                return;
            }

            statusDiv.textContent = 'Texto reconhecido: ' + text.substring(0, Math.min(text.length, 50)) + '...';
            statusDiv.textContent = 'Traduzindo texto...';

            // Traduçaõ por LibreTranslate
            const libreTranslateApiUrl = 'https://translate.argosopentech.com/translate';

            const response = await fetch(libreTranslateApiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: 'auto', // Detecta automaticamente o idioma de origem
                    target: 'pt',   // Traduz para português
                    format: 'text'
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro na tradução: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            const textoTraducao = data.textoTraducao;

            statusDiv.textContent = 'Tradução concluída!';
            textoTraducaoDiv.textContent = textoTraducao;

        } catch (error) {
            statusDiv.textContent = 'Erro: ' + error.message;
            textoTraducaoDiv.textContent = 'Não foi possível traduzir.';
            console.error('Erro na extensão:', error);
        } finally {
            Traduzir.disabled = false; // Reabilita o botão de traduzir
        }
    });
});