document.addEventListener("DOMContentLoaded", () => {
    const buscarBtn = document.getElementById("buscar-encomenda");
    const codigoInput = document.getElementById("codigo");
    const loadingDiv = document.getElementById("loading");
    const resultDiv = document.getElementById("result");
    const historyDiv = document.getElementById("history");
    const recentAccessesDiv = document.getElementById("recent-accesses");
    const historySection = document.getElementById("history-section");
    const recentAccessesSection = document.getElementById("recent-accesses-section");

    const confirmationDialog = document.getElementById("confirmation-dialog");
    const confirmYes = document.getElementById("confirm-yes");
    const confirmNo = document.getElementById("confirm-no");

    let codeToDelete = null;

    const showLoading = () => loadingDiv.style.display = "block";
    const hideLoading = () => loadingDiv.style.display = "none";
    const showResult = () => resultDiv.style.display = "block";
    const hideResult = () => resultDiv.style.display = "none";

    const getTrackingData = async (code) => {
        try {
            showLoading();
            hideResult();
            resultDiv.innerHTML = "";

            const response = await fetch("rastrear.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });

            const text = await response.text();
            console.log("Resposta bruta do servidor:", text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error("Resposta inválida do servidor.");
            }

            if (data.erro) {
                throw new Error(data.erro);
            }

            displayResult(data);
            saveToHistory(code, data);
        } catch (error) {
            console.error("Erro no rastreamento:", error);
            resultDiv.innerHTML = `<p class="error">Erro ao processar a resposta do servidor. Tente novamente mais tarde.</p>`;
            showResult();
        } finally {
            hideLoading();
        }
    };

    const displayResult = (data) => {
        const eventos = data.events || [];
        if (!eventos.length) {
            resultDiv.innerHTML = "<p class='info'>Nenhum evento encontrado para esse código.</p>";
        } else {
            const content = eventos.map(evento => `
                <div class="evento">
                    <p><strong>Data:</strong> ${evento.date}</p>
                    <p><strong>Local:</strong> ${evento.location}</p>
                    <p><strong>Status:</strong> ${evento.status}</p>
                </div>
            `).join("");
            resultDiv.innerHTML = content;
        }
        showResult();
    };

    const saveToHistory = (code, data) => {
        const historico = JSON.parse(localStorage.getItem("historico")) || {};
        historico[code] = data;
        localStorage.setItem("historico", JSON.stringify(historico));
        loadHistory();
    };

    const loadHistory = () => {
        const historico = JSON.parse(localStorage.getItem("historico")) || {};
        historyDiv.innerHTML = "";

        if (Object.keys(historico).length) {
            historySection.style.display = "block";
        } else {
            historySection.style.display = "none";
        }

        for (const [code, data] of Object.entries(historico)) {
            const eventos = data.events || [];
            const ultimaAtualizacao = eventos.length ? eventos[0].status : "Sem informações";

            const item = document.createElement("div");
            item.className = "history-item";
            item.innerHTML = `
                <p><strong>${code}</strong></p>
                <p>${ultimaAtualizacao}</p>
                <button class="remover" data-code="${code}">Remover</button>
            `;
            historyDiv.appendChild(item);
        }

        document.querySelectorAll(".remover").forEach(btn => {
            btn.addEventListener("click", (e) => {
                codeToDelete = e.target.getAttribute("data-code");
                confirmationDialog.style.display = "flex";
            });
        });
    };

    confirmYes.addEventListener("click", () => {
        if (codeToDelete) {
            const historico = JSON.parse(localStorage.getItem("historico")) || {};
            delete historico[codeToDelete];
            localStorage.setItem("historico", JSON.stringify(historico));
            codeToDelete = null;
            loadHistory();
        }
        confirmationDialog.style.display = "none";
    });

    confirmNo.addEventListener("click", () => {
        codeToDelete = null;
        confirmationDialog.style.display = "none";
    });

    buscarBtn.addEventListener("click", () => {
        const code = codigoInput.value.trim().toUpperCase();
        if (!code) {
            alert("Por favor, insira um código de rastreamento.");
            return;
        }

        getTrackingData(code);
        updateRecentAccesses(code);
    });

    const updateRecentAccesses = (code) => {
        let acessos = JSON.parse(localStorage.getItem("recentes")) || [];
        acessos = acessos.filter(c => c !== code);
        acessos.unshift(code);
        acessos = acessos.slice(0, 5);
        localStorage.setItem("recentes", JSON.stringify(acessos));
        loadRecentAccesses();
    };

    const loadRecentAccesses = () => {
        const acessos = JSON.parse(localStorage.getItem("recentes")) || [];
        recentAccessesDiv.innerHTML = "";

        if (acessos.length) {
            recentAccessesSection.style.display = "block";
        } else {
            recentAccessesSection.style.display = "none";
        }

        acessos.forEach(code => {
            const item = document.createElement("button");
            item.className = "recent-code";
            item.textContent = code;
            item.addEventListener("click", () => {
                codigoInput.value = code;
                getTrackingData(code);
            });
            recentAccessesDiv.appendChild(item);
        });
    };

    // Inicialização
    loadHistory();
    loadRecentAccesses();
});
