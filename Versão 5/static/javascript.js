document.addEventListener('DOMContentLoaded', function() {
    const botao = document.getElementById('botaoTraduzir');
    if (botao) {
        botao.addEventListener('click', BotaoTraduzir);
    }
});

function BotaoTraduzir(){
    let idioma_atual = document.getElementById("idioma_atual").value;
    let idioma_novo = document.getElementById("idioma_novo").value;

    document.getElementById("status").textContent = "Traduzindo... Por favor, aguarde.";
    document.getElementById("TextoTraduzido").textContent = "Aguardando tradução...";
    document.getElementById("PrintTraduzido").innerHTML = "";

    // Captura a aba visível
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(screenshotUrl) {
        if (chrome.runtime.lastError) {
            console.error("Erro ao capturar a tela:", chrome.runtime.lastError.message);
            document.getElementById("status").textContent = "Erro: Não foi possível capturar a tela.";
            document.getElementById("TextoTraduzido").textContent = "Verifique as permissões da extensão.";
            return;
        }

        fetch("http://127.0.0.1:5000", { 
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                atual: idioma_atual,
                novo: idioma_novo,
                imagem: screenshotUrl 
            })
        })
        .then(response => {
            if (!response.ok) { // Verifica se a resposta foi bem-sucedida
                throw new Error('Erro na rede ou no servidor: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("TextoTraduzido").textContent = "";

            if (data.error) {
                document.getElementById("TextoTraduzido").textContent = "Erro: " + data.error;
                document.getElementById("status").textContent = "Erro na tradução.";
            } else if (data.imagem_modificada) { // Verifica se recebeu a imagem
                document.getElementById("status").textContent = "Tradução concluída!";

                // Cria um elemento <img>
                const imgElement = document.createElement('img');
                imgElement.src = data.imagem_modificada;
                // Adiciona um estilo básico para garantir que a imagem se ajuste ao contêiner
                imgElement.style.maxWidth = '100%';
                imgElement.style.height = 'auto';
                imgElement.style.border = '1px solid #ccc';

                // Limpa o conteúdo anterior de PrintTraduzido e adiciona a nova imagem
                document.getElementById("PrintTraduzido").innerHTML = "";
                document.getElementById("PrintTraduzido").appendChild(imgElement);

                // TExto traduzido
                if (data.texto_traduzido) {
                    document.getElementById("TextoTraduzido").textContent = data.texto_traduzido;
                }

            } else if (data.texto_traduzido) { // Apenas Texto
                document.getElementById("TextoTraduzido").textContent = data.texto_traduzido;
                document.getElementById("status").textContent = "Tradução concluída!";
            }
            else { // Se tudo deu erraso
                document.getElementById("TextoTraduzido").textContent = "Resposta inesperada do servidor.";
                document.getElementById("status").textContent = "Erro.";
            }
        })
        .catch(error => {
            console.error("Erro ao traduzir:", error);
            document.getElementById("status").textContent = "Erro ao conectar com o servidor: " + error.message;
            document.getElementById("TextoTraduzido").textContent = "Não foi possível traduzir.";
        });
    });
}