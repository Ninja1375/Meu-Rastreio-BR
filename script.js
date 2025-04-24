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
    const url = `https://www.siterastreio.com.br/api/track/${codigo}`;
    const apiKey = "SxAnwQWjQJCVZrr6KzB4KCN8Cnd4c-myPaK8YTXl9QM";

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) throw new Error('Erro na resposta da API');
            return response.json();
        })
        .then(data => {
            loading.style.display = 'none';
            trackingForm.style.display = 'block';

            if (data && data.eventos) {
                let eventos = data.eventos;

                resultDiv.innerHTML = `<h2 class="text-lg font-semibold mb-2">Código: ${codigo}</h2><div class="border-t border-gray-300 pt-4">`;

                eventos.forEach(evento => {
                    let icon = '';
                    const status = evento.status.toLowerCase();

                    if (status.includes('entregue')) icon = '<i class="fas fa-check-circle fa-4x"></i>';
                    else if (status.includes('saiu para entrega')) icon = '<i class="fas fa-truck fa-4x"></i>';
                    else if (status.includes('encaminhado')) icon = '<i class="fas fa-arrow-right fa-4x"></i>';
                    else if (status.includes('postado')) icon = '<i class="fas fa-box fa-4x"></i>';
                    else if (status.includes('recebido')) icon = '<i class="fas fa-receipt fa-4x"></i>';
                    else if (status.includes('fiscalização')) icon = '<i class="fas fa-shield-alt fa-4x"></i>';
                    else if (status.includes('pagamento')) icon = '<i class="fas fa-money-bill-alt fa-4x"></i>';
                    else if (status.includes('devolvido')) icon = '<i class="fas fa-undo-alt fa-4x"></i>';
                    else icon = '<i class="fas fa-question-circle fa-4x"></i>';

                    resultDiv.innerHTML += `
                        <div class="result-item">
                            <div>${icon}</div>
                            <hr class="dashed-line">
                            <div>
                                <p class="text-sm text-gray-500">${evento.data} ${evento.hora}</p>
                                <p class="text-md">${evento.status}</p>
                                <p class="text-sm text-gray-600">${evento.subStatus?.[0] || ''}</p>
                                <p class="text-sm text-gray-600">${evento.subStatus?.[1] || ''}</p>
                            </div>
                        </div>
                    `;
                });

                resultDiv.innerHTML += `</div>
                    <div class="share-container">
                        <div class="share-button-wrapper"><button class="share-button whatsapp" onclick="shareWhatsApp('${codigo}')"><i class="fab fa-whatsapp fa-2x"></i>WhatsApp</button></div>
                        <div class="share-button-wrapper"><button class="share-button sms" onclick="shareSMS('${codigo}')"><i class="fas fa-sms fa-2x"></i>SMS</button></div>
                        <div class="share-button-wrapper"><button class="share-button email" onclick="shareEmail('${codigo}')"><i class="fas fa-envelope fa-2x"></i>Email</button></div>
                        <div class="share-button-wrapper"><button class="share-button print" onclick="printPage()"><i class="fas fa-print fa-2x"></i>Imprimir</button></div>
                    </div>`;
            } else {
                resultDiv.innerHTML = '<p style="color: red;">Nenhum dado encontrado para este código.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar encomenda:', error);
            resultDiv.innerHTML = '<p style="color: red;">Erro ao buscar informações de rastreamento.</p>';
            loading.style.display = 'none';
            trackingForm.style.display = 'block';
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
    recentAccesses = recentAccesses.filter(item => item !== codigo);
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
    history = history.filter(item => item !== codigo);
    localStorage.setItem('trackingHistory', JSON.stringify(history));
    renderHistory();
}

function renderRecentAccesses() {
    let recentAccesses = JSON.parse(localStorage.getItem('recentAccesses')) || [];
    recentAccessesDiv.innerHTML = '';
    recentAccessesSection.style.display = recentAccesses.length ? 'block' : 'none';
    recentAccesses.forEach(codigo => {
        recentAccessesDiv.innerHTML += `
            <div class="history-item">
                <span onclick="buscarEncomenda('${codigo}')">${codigo}</span>
            </div>
        `;
    });
}

function renderHistory() {
    let history = JSON.parse(localStorage.getItem('trackingHistory')) || [];
    historyDiv.innerHTML = '';
    historySection.style.display = history.length ? 'block' : 'none';
    history.forEach(codigo => {
        historyDiv.innerHTML += `
            <div class="history-item">
                <span onclick="buscarEncomenda('${codigo}')">${codigo}</span>
                <button onclick="confirmRemoveFromHistory('${codigo}')">Remover</button>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderRecentAccesses();
    renderHistory();
});
