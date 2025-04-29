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

async function buscarEncomenda(codigo) {
    const apiKey = 'sxaf_bauhc_7ltUUSrdUbLo93cekXHjIgfdk3Ozit7A';
    const apiUrl = `https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track?codigo=${codigo}&apikey=${apiKey}`;

    try {
        console.log('[DEBUG] Buscando encomenda...');
        loading.style.display = 'flex';
        trackingForm.style.display = 'none';
        resultDiv.innerHTML = '';

        console.log('[DEBUG] URL requisitada:', apiUrl);
        const response = await fetch(apiUrl);
        console.log('[DEBUG] Resposta recebida:', response);

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();
        console.log('[DEBUG] JSON:', data);

        loading.style.display = 'none';
        trackingForm.style.display = 'block';

        if (data && data.itens && data.itens.length > 0) {
            renderResultados(data.itens[0], codigo);
        } else if (data && data.mensagem) {
            resultDiv.innerHTML = `<p class="text-red-500">${data.mensagem}</p>`;
        } else {
            resultDiv.innerHTML = '<p>Erro ao obter informações de rastreio.</p>';
        }
    } catch (error) {
        loading.style.display = 'none';
        trackingForm.style.display = 'block';
        console.error('[ERRO] buscarEncomenda:', error);
        resultDiv.innerHTML = `
            <p class="text-red-500">Erro ao rastrear. Tente mais tarde.</p>
            <pre>${error.message}</pre>
        `;
    }
}

function renderResultados(item, codigoRastreio) {
    resultDiv.innerHTML = `
        <h2 class="text-lg font-semibold mb-2">Código: ${codigoRastreio}</h2>
        <div class="border-t border-gray-300 pt-4">
    `;

    if (item.eventos && item.eventos.length > 0) {
        item.eventos.forEach(evento => {
            let status = evento.status.toLowerCase();
            let icon = '<i class="fas fa-question-circle fa-4x"></i>';
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
        resultDiv.innerHTML += '<p>Nenhum evento encontrado.</p>';
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
}

function shareWhatsApp(codigo) {
    try {
        const url = `https://api.whatsapp.com/send?text=Rastreamento do objeto ${codigo}: ${window.location.href}`;
        console.log('[DEBUG] WhatsApp URL:', url);
        window.open(url, '_blank');
    } catch (error) {
        console.error('[ERRO] shareWhatsApp:', error);
        alert('Erro ao compartilhar via WhatsApp.');
    }
}

function shareSMS(codigo) {
    try {
        const url = `sms:?body=Rastreamento do objeto ${codigo}: ${window.location.href}`;
        console.log('[DEBUG] SMS URL:', url);
        window.open(url, '_blank');
    } catch (error) {
        console.error('[ERRO] shareSMS:', error);
        alert('Erro ao compartilhar via SMS.');
    }
}

function shareEmail(codigo) {
    try {
        const subject = 'Rastreamento de Encomenda';
        const body = `Rastreamento do objeto ${codigo}: ${window.location.href}`;
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        console.log('[DEBUG] Email URL:', url);
        window.open(url, '_blank');
    } catch (error) {
        console.error('[ERRO] shareEmail:', error);
        alert('Erro ao compartilhar via Email.');
    }
}

function printPage() {
    try {
        console.log('[DEBUG] Imprimindo página');
        window.print();
    } catch (error) {
        console.error('[ERRO] printPage:', error);
        alert('Erro ao imprimir.');
    }
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
