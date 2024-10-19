let loading = document.getElementById('loading');
let trackingForm = document.getElementById('tracking-form');
let resultDiv = document.getElementById('result');
let codigoInput = document.getElementById('codigo');
let buscarEncomendaBtn = document.getElementById('buscar-encomenda');
let recentAccessesSection = document.getElementById('recent-accesses-section');
let recentAccessesDiv = document.getElementById('recent-accesses');
let historySection = document.getElementById('history-section');
let historyDiv = document.getElementById('history');
let confirmationDialog = document.getElementById('confirmation-dialog');
let confirmYesBtn = document.getElementById('confirm-yes');
let confirmNoBtn = document.getElementById('confirm-no');
let codigoToRemove = null;

buscarEncomendaBtn.addEventListener('click', () => {
    let codigo = codigoInput.value;
    if (isValidTrackingCode(codigo)) {
        loading.style.display = 'flex';
        trackingForm.style.display = 'none';
        resultDiv.innerHTML = '';

        buscarEncomenda(codigo);
        addToRecentAccesses(codigo);
        addToHistory(codigo);
    } else {
        resultDiv.innerHTML = '<p style="color: red;">Por favor, digite um código de rastreio válido. Exemplo: AB123456789BR</p>';
    }
});

confirmYesBtn.addEventListener('click', () => {
    if (codigoToRemove) {
        removeFromHistory(codigoToRemove);
        codigoToRemove = null;
    }
    confirmationDialog.style.visibility = 'hidden';
});

confirmNoBtn.addEventListener('click', () => {
    codigoToRemove = null;
    confirmationDialog.style.visibility = 'hidden';
});

function isValidTrackingCode(codigo) {
    let regex = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
    return regex.test(codigo);
}

function buscarEncomenda(codigo) {
    let user = 'teste';
    let token = '1abcd00b2731640e886fb41a8a9671ad1434c599dbaa0a0de9a5aa619f29a83f';

    let url = `https://api.linketrack.com/track/json?user=${user}&token=${token}&codigo=${codigo}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            trackingForm.style.display = 'block';

            if (data) {
                let eventos = data.eventos;
                let codigo = data.codigo;

                resultDiv.innerHTML = `
                    <h2 class="text-lg font-semibold mb-2">Código: ${codigo}</h2>
                    <div class="border-t border-gray-300 pt-4">
                `;

                eventos.forEach(evento => {
                    let icon = '';
                    switch (true) {
                        case evento.status.includes('Objeto entregue ao destinatário'):
                            icon = '<i class="fas fa-check-circle fa-4x"></i>';
                            break;
                        case evento.status.includes('Objeto saiu para entrega ao destinatário'):
                            icon = '<i class="fas fa-truck fa-4x"></i>';
                            break;
                        case evento.status.includes('Objeto encaminhado'):
                            icon = '<i class="fas fa-arrow-right fa-4x"></i>';
                            break;
                        case evento.status.includes('Objeto postado'):
                            icon = '<i class="fas fa-box fa-4x"></i>';
                            break;
                        case evento.status.includes('Objeto recebido pelos Correios'):
                            icon = '<i class="fas fa-receipt fa-4x"></i>';
                            break;
                        case evento.status.includes('Encaminhado para fiscalização aduaneira'):
                            icon = '<i class="fas fa-shield-alt fa-4x"></i>';
                            break;
                        case evento.status.includes('Fiscalização aduaneira finalizada'):
                            icon = '<i class="fas fa-check-double fa-4x"></i>';
                            break;
                        case evento.status.includes('Aguardando pagamento'):
                            icon = '<i class="fas fa-money-bill-alt fa-4x"></i>';
                            break;
                        case evento.status.includes('Pagamento confirmado'):
                            icon = '<i class="fas fa-money-check-alt fa-4x"></i>';
                            break;
                        case evento.status.includes('Objeto recebido na unidade de exportação no país de origem'):
                            icon = '<i class="fas fa-plane-departure fa-4x"></i>';
                            break;
                        case evento.status.includes('A importação do objeto/conteúdo não foi autorizada pelos órgãos fiscalizadores'):
                            icon = '<i class="fas fa-ban fa-4x"></i>';
                            break;
                        case evento.status.includes('Objeto devolvido ao país de origem'):
                            icon = '<i class="fas fa-undo-alt fa-4x"></i>';
                            break;
                        default:
                            icon = '<i class="fas fa-question-circle fa-4x"></i>';
                            break;
                    }

                    resultDiv.innerHTML += `
                        <div class="result-item">
                            <div>${icon}</div>
                            <hr class="dashed-line">
                            <div>
                                <p class="text-sm text-gray-500">${evento.data} ${evento.hora}</p>
                                <p class="text-md">${evento.status}</p>
                                <p class="text-sm text-gray-600">${evento.subStatus[0] ? evento.subStatus[0] : ''}</p>
                                <p class="text-sm text-gray-600">${evento.subStatus[1] ? evento.subStatus[1] : ''}</p>
                            </div>
                        </div>
                    `;
                });

                // Adicionar opções de compartilhar e imprimir
                resultDiv.innerHTML += `
                    </div>
                    <div class="share-container">
                        <div class="share-button-wrapper">
                            <button class="share-button whatsapp" onclick="shareWhatsApp('${codigo}')">
                                <i class="fab fa-whatsapp fa-2x"></i>
                                WhatsApp
                            </button>
                        </div>
                        <div class="share-button-wrapper">
                            <button class="share-button sms" onclick="shareSMS('${codigo}')">
                                <i class="fas fa-sms fa-2x"></i>
                                SMS
                            </button>
                        </div>
                        <div class="share-button-wrapper">
                            <button class="share-button email" onclick="shareEmail('${codigo}')">
                                <i class="fas fa-envelope fa-2x"></i>
                                Email
                            </button>
                        </div>
                        <div class="share-button-wrapper">
                            <button class="share-button print" onclick="printPage()">
                                <i class="fas fa-print fa-2x"></i>
                                Imprimir
                            </button>
                        </div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = 'Erro ao decodificar a resposta JSON.';
            }
        })
        .catch(error => {
            console.error(error);
            buscarEncomenda(codigo);
        });
}

function shareWhatsApp(codigo) {
    let url = `https://api.whatsapp.com/send?text=Rastreamento do objeto ${codigo}: ${window.location.href}`;
    window.open(url, '_blank');
}

function shareSMS(codigo) {
    let url = `sms:?body=Rastreamento do objeto ${codigo}: ${window.location.href}`;
    window.open(url, '_blank');
}

function shareEmail(codigo) {
    let subject = 'Rastreamento de Encomenda';
    let body = `Rastreamento do objeto ${codigo}: ${window.location.href}`;
    let url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
}

function printPage() {
    window.print();
}

function addToRecentAccesses(codigo) {
    let recentAccesses = JSON.parse(localStorage.getItem('recentAccesses')) || [];
    recentAccesses = recentAccesses.filter(item => item !== codigo); // Remove o código se já existir
    recentAccesses.unshift(codigo); // Adiciona o novo código no início
    if (recentAccesses.length > 8) {
        recentAccesses.pop(); // Remove o código mais antigo se houver mais de 8
    }
    localStorage.setItem('recentAccesses', JSON.stringify(recentAccesses));
    renderRecentAccesses();
}

function addToHistory(codigo) {
    let history = JSON.parse(localStorage.getItem('trackingHistory')) || [];
    if (!history.includes(codigo)) {
        history.push(codigo);
        localStorage.setItem('trackingHistory', JSON.stringify(history));
        renderHistory();
    }
}

function confirmRemoveFromHistory(codigo) {
    codigoToRemove = codigo;
    confirmationDialog.style.visibility = 'visible';
}

function removeFromHistory(codigo) {
    let history = JSON.parse(localStorage.getItem('trackingHistory')) || [];
    history = history.filter(item => item !== codigo);
    localStorage.setItem('trackingHistory', JSON.stringify(history));
    renderHistory();
}

function renderRecentAccesses() {
    let recentAccesses = JSON.parse(localStorage.getItem('recentAccesses')) || [];
    recentAccessesDiv.innerHTML = '';
    if (recentAccesses.length === 0) {
        recentAccessesSection.style.display = 'none';
    } else {
        recentAccessesSection.style.display = 'block';
        recentAccesses.forEach(codigo => {
            recentAccessesDiv.innerHTML += `
                <div class="history-item">
                    <span onclick="buscarEncomenda('${codigo}')">${codigo}</span>
                </div>
            `;
        });
    }
}

function renderHistory() {
    let history = JSON.parse(localStorage.getItem('trackingHistory')) || [];
    historyDiv.innerHTML = '';
    if (history.length === 0) {
        historySection.style.display = 'none';
    } else {
        historySection.style.display = 'block';
        history.forEach(codigo => {
            historyDiv.innerHTML += `
                <div class="history-item">
                    <span onclick="buscarEncomenda('${codigo}')">${codigo}</span>
                    <button onclick="confirmRemoveFromHistory('${codigo}')">Remover</button>
                </div>
            `;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderRecentAccesses();
    renderHistory();
});
