document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o botão de buscar e o campo de código de rastreamento
    const buscarButton = document.getElementById('buscar-encomenda');
    const codigoInput = document.getElementById('codigo');
    const loadingIndicator = document.getElementById('loading');
    const resultContainer = document.getElementById('result');

    // Evento para o clique no botão de busca
    buscarButton.addEventListener('click', async () => {
        const codigo = codigoInput.value.trim(); // Pega o código do input e remove espaços extras
        
        // Valida se o código não está vazio
        if (!codigo) {
            alert('Por favor, insira um código de rastreamento!');
            return;
        }

        // Exibe o indicador de carregamento
        loadingIndicator.style.display = 'block';
        resultContainer.innerHTML = ''; // Limpa resultados anteriores

        try {
            // Envia a requisição para o PHP
            const response = await fetch('/rastrear.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: codigo })
            });

            // Converte a resposta para texto
            const text = await response.text();
            console.log('Resposta do servidor (texto bruto):', text);

            // Tenta converter a resposta para JSON
            try {
                const data = JSON.parse(text);
                console.log('Resposta do servidor (JSON):', data);

                if (data.erro) {
                    // Exibe erro se a API retornar um erro
                    resultContainer.innerHTML = `<p>Erro: ${data.erro}</p>`;
                } else {
                    // Caso a resposta seja válida, processa os dados
                    // Aqui você pode customizar a exibição do rastreamento, conforme necessário
                    resultContainer.innerHTML = `
                        <h2>Informações do Rastreamento:</h2>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    `;
                }
            } catch (jsonError) {
                console.error('Erro ao processar a resposta JSON:', jsonError);
                resultContainer.innerHTML = `<p>Erro ao processar a resposta do servidor. Tente novamente mais tarde.</p>`;
            }
        } catch (fetchError) {
            console.error('Erro na requisição Fetch:', fetchError);
            resultContainer.innerHTML = `<p>Erro na conexão com o servidor. Tente novamente mais tarde.</p>`;
        } finally {
            // Esconde o indicador de carregamento após a resposta
            loadingIndicator.style.display = 'none';
        }
    });
});
