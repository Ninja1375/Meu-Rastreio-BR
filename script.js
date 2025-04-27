const loading = document.getElementById('loading');
const trackingForm = document.getElementById('tracking-form');
const resultDiv = document.getElementById('result');
const codigoInput = document.getElementById('codigo');
const buscarEncomendaBtn = document.getElementById('buscar-encomenda');
const recentAccessesSection = document.getElementById('recent-accesses-section');
const recentAccessesDiv = document.getElementById('recent-accesses');
const historySection = document.getElementById('history-section');
const historyDiv = document.getElementById('history');
const confirmationDialog = document.getElementById('confirmation-dialog');
const confirmYesBtn = document.getElementById('confirm-yes');
const confirmNoBtn = document.getElementById('confirm-no');
let codigoToRemove = null;

buscarEncomendaBtn.addEventListener('click', async () => {
  const codigo = codigoInput.value.trim();
  
  if (!isValidTrackingCode(codigo)) {
    resultDiv.innerHTML = `<p class="text-red-500">Por favor, digite um código de rastreio válido. Exemplo: AB123456789BR</p>`;
    return;
  }

  loading.style.display = 'flex';
  trackingForm.style.display = 'none';
  resultDiv.innerHTML = '';

  await buscarEncomenda(codigo);
  addToRecentAccesses(codigo);
  addToHistory(codigo);
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
  const regex = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
  return regex.test(codigo);
}

async function buscarEncomenda(codigo) {
  const apiKey = 'sxaf_bauhc_7ltUUSrdUbLo93cekXHjIgfdk3Ozit7A';
  const url = 'https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Apikey ${apiKey}`
      },
      body: JSON.stringify({ code: codigo })
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const data = await response.json();

    loading.style.display = 'none';
    trackingForm.style.display = 'block';
    resultDiv.innerHTML = '';

    if (data && data.events && data.events.length > 0) {
      renderTrackingInfo(codigo, data.events);
    } else if (data && data.message) {
      resultDiv.innerHTML = `<p class="text-red-500">${data.message}</p>`;
    } else {
      resultDiv.innerHTML = '<p>Informações de rastreamento não encontradas.</p>';
    }
  } catch (error) {
    console.error('Erro:', error);
    loading.style.display = 'none';
    trackingForm.style.display = 'block';
    resultDiv.innerHTML = '<p class="text-red-500">Erro ao buscar encomenda. Tente novamente mais tarde.</p>';
  }
}

function renderTrackingInfo(codigo, eventos) {
  resultDiv.innerHTML = `
    <h2 class="text-lg font-semibold mb-2">Código: ${codigo}</h2>
    <div class="border-t border-gray-300 pt-4">
      ${eventos.map(evento => `
        <div class="result-item">
          <div>${getStatusIcon(evento.status)}</div>
          <hr class="dashed-line">
          <div>
            <p class="text-sm text-gray-500">${evento.date} ${evento.hour}</p>
            <p class="text-md">${evento.status}</p>
            <p class="text-sm text-gray-600">${evento.subStatus ? evento.subStatus.join(', ') : ''}</p>
            <p class="text-sm text-gray-600">${evento.location || ''}</p>
            <p class="text-sm text-gray-600">${evento.destination || ''}</p>
          </div>
        </div>
      `).join('')}
    </div>
    ${renderShareButtons(codigo)}
  `;
}

function getStatusIcon(status) {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('entregue')) return '<i class="fas fa-check-circle fa-4x"></i>';
  if (lowerStatus.includes('saiu para entrega')) return '<i class="fas fa-truck fa-4x"></i>';
  if (lowerStatus.includes('encaminhado')) return '<i class="fas fa-arrow-right fa-4x"></i>';
  if (lowerStatus.includes('postado')) return '<i class="fas fa-box fa-4x"></i>';
  if (lowerStatus.includes('recebido')) return '<i class="fas fa-receipt fa-4x"></i>';
  if (lowerStatus.includes('fiscalização')) return '<i class="fas fa-shield-alt fa-4x"></i>';
  if (lowerStatus.includes('aguardando pagamento')) return '<i class="fas fa-money-bill-alt fa-4x"></i>';
  if (lowerStatus.includes('pagamento confirmado')) return '<i class="fas fa-money-check-alt fa-4x"></i>';
  if (lowerStatus.includes('exportação')) return '<i class="fas fa-plane-departure fa-4x"></i>';
  if (lowerStatus.includes('não autorizado')) return '<i class="fas fa-ban fa-4x"></i>';
  if (lowerStatus.includes('devolvido')) return '<i class="fas fa-undo-alt fa-4x"></i>';
  return '<i class="fas fa-question-circle fa-4x"></i>';
}

function renderShareButtons(codigo) {
  return `
    <div class="share-container">
      ${['WhatsApp', 'SMS', 'Email', 'Imprimir'].map(method => `
        <div class="share-button-wrapper">
          <button class="share-button ${method.toLowerCase()}" onclick="share${method}('${codigo}')">
            <i class="${getShareIcon(method)} fa-2x"></i> ${method}
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function getShareIcon(method) {
  switch (method) {
    case 'WhatsApp': return 'fab fa-whatsapp';
    case 'SMS': return 'fas fa-sms';
    case 'Email': return 'fas fa-envelope';
    case 'Imprimir': return 'fas fa-print';
    default: return 'fas fa-share';
  }
}

function shareWhatsApp(codigo) {
  const url = `https://api.whatsapp.com/send?text=Rastreamento do objeto ${codigo}: ${window.location.href}`;
  window.open(url, '_blank');
}

function shareSMS(codigo) {
  const url = `sms:?body=Rastreamento do objeto ${codigo}: ${window.location.href}`;
  window.open(url, '_blank');
}

function shareEmail(codigo) {
  const subject = 'Rastreamento de Encomenda';
  const body = `Rastreamento do objeto ${codigo}: ${window.location.href}`;
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
}

function shareImprimir() {
  window.print();
}

function addToRecentAccesses(codigo) {
  let recentAccesses = JSON.parse(localStorage.getItem('recentAccesses')) || [];
  recentAccesses = [codigo, ...recentAccesses.filter(c => c !== codigo)].slice(0, 8);
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
  const recentAccesses = JSON.parse(localStorage.getItem('recentAccesses')) || [];
  recentAccessesDiv.innerHTML = recentAccesses.length ? 
    recentAccesses.map(codigo => `
      <div class="history-item">
        <span onclick="buscarEncomenda('${codigo}')">${codigo}</span>
      </div>
    `).join('') : '';

  recentAccessesSection.style.display = recentAccesses.length ? 'block' : 'none';
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('trackingHistory')) || [];
  historyDiv.innerHTML = history.length ?
    history.map(codigo => `
      <div class="history-item">
        <span onclick="buscarEncomenda('${codigo}')">${codigo}</span>
        <button onclick="confirmRemoveFromHistory('${codigo}')">Remover</button>
      </div>
    `).join('') : '';

  historySection.style.display = history.length ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  renderRecentAccesses();
  renderHistory();
});
