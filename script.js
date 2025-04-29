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
    let codigo = codigoInput.value.trim().toUpperCase();
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
    return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(codigo);
}

function buscarEncomenda(codigo) {
    fetch('https://kitdevs.com/rastrear.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigo })
    })
    .then(res => res.json())
    .then(data => {
        loading.style.display = 'none';
        trackingForm.style.display = 'block';
        resultDiv.innerHTML = '';

        if (data && data.itens && data.itens.length > 0) {
            const item = data.itens[0];
            const codigoRastreio = item.codigo;

            resultDiv.innerHTML += `
                <h2 class="text-lg font-semibold mb-2">Código: ${codigoRastreio}</h2>
                <div class="border-t border-gray-300 pt-4">
            `;

            if (item.eventos && item.eventos.length > 0) {
                item.eventos.forEach(evento => {
                    let icon = '';
                    const status = evento.status.toLowerCase();
                    if (status.includes('entregue')) icon = '<i class="fas fa-check-circle fa-4x"></i>';
                    else if (status.includes('saiu para entrega')) icon = '<i class="fas fa-truck fa-4x"></i>';
                    else if (status.includes('encaminhado')) icon = '<i class="fas fa-arrow-right fa-4x"></i>';
                    else if (status.includes('postado')) icon = '<i class="fas fa-box fa-4x"></i>';
                    else if (status.includes('recebido')) icon = '<i class="fas fa-receipt fa-4x"></i>';
                    else if (status.includes('fiscalização')) icon = '<i class="fas fa-shield-alt fa-4x"></i>';
                    else if (status.includes('aguardando pagamento')) icon = '<i class="fas fa-money-bill-alt fa-4x"></i>';
                    else if (status.includes('pagamento confirmado')) icon = '<i class="fas fa-money-check-alt fa-4x"></i>';
                    else if (status.includes('exportação')) icon = '<i class="fas fa-plane-departure fa-4x"></i>';
                    else if (status.includes('não autorizado')) icon = '<i class="fas fa-ban fa-4x"></i>';
                    else if (status.includes('devolvido')) icon = '<i class="fas fa-undo-alt fa-4x"></i>';
                    else icon = '<i class="fas fa-question-circle fa-4x"></i>';

                    resultDiv.innerHTML += `
                        <div class="result-item">
                            <div>${icon}</div>
                            <hr class="dashed-line">
                            <div>
                                <p class="text-sm text-gray-500">${evento.data} ${evento.hora}</p>
                                <p class="text-md">${evento.status}</p>
                                <p class="text-sm text-gray-600">${evento.subStatus?.join(', ') || ''}</p>
                                <p class="text-sm text-gray-600">${evento.local || ''}</p>
                                <p class="text-sm text-gray-600">${evento.destino || ''}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                resultDiv.innerHTML += '<p>Nenhum evento de rastreio encontrado para este código.</p>';
            }

            resultDiv.innerHTML += `
                    </div>
                    <div class="share-container">
                        <div class="share-button-wrapper">
                            <button class="share-button whatsapp" onclick="shareWhatsApp('${codigoRastreio}')">
                                <i class="fab fa-whatsapp fa-2x"></i> WhatsApp
                            </button>
                        </div>
                        <div class="share-button-wrapper">
                            <button class="share-button sms" onclick="shareSMS('${codigoRastreio}')">
                                <i class="fas fa-sms fa-2x"></i> SMS
                            </button>
                        </div>
                        <div class="share-button-wrapper">
                            <button class="share-button email" onclick="shareEmail('${codigoRastreio}')">
                                <i class="fas fa-envelope fa-2x"></i> Email
                            </button>
                        </div>
                        <div class="share-button-wrapper">
                            <button class="share-button print" onclick="printPage()">
                                <i class="fas fa-print fa-2x"></i> Imprimir
                            </button>
                        </div>
                    </div>
                `;
        } else {
            resultDiv.innerHTML = `<p class="text-red-500">${data?.mensagem || 'Erro ao obter informações de rastreio.'}</p>`;
        }
    })
    .catch(error => {
        console.error('Erro ao rastrear:', error);
        loading.style.display = 'none';
        trackingForm.style.display = 'block';
        resultDiv.innerHTML = '<p class="text-red-500">Erro ao rastrear. Tente mais tarde.</p>';
    });
}

function shareWhatsApp(codigo) {
    window.open(`https://api.whatsapp.com/send?text=Rastreamento do objeto ${codigo}: ${window.location.href}`, '_blank');
}

function shareSMS(codigo) {
    window.open(`sms:?body=Rastreamento do objeto ${codigo}: ${window.location.href}`, '_blank');
}

function shareEmail(codigo) {
    let subject = 'Rastreamento de Encomenda';
    let body = `Rastreamento do objeto ${codigo}: ${window.location.href}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
}

function printPage() {
    window.print();
}

function addToRecentAccesses(codigo) {
    let recentAccesses = JSON.parse(localStorage.getItem('recentAccesses')) || [];
    recentAccesses = recentAccesses.filter(c => c !== codigo);
    recentAccesses.unshift(codigo);
    if (recentAccesses.length > 8) recentAccesses.pop();
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
    history = history.filter(c => c !== codigo);
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
