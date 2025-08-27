(function() {

    const APP_TOKEN = 'qk3Tc6AgEDtcEpi4HbVwkuNWkrF04oLg5KfqLoOd';
    const USER_TOKEN = 'XckImCc3N7gcd8a5MkhZj7tHkOu8HUAyQBRkVaXH';
    let sessionToken = null;
    let chamadosNotificados = [];

    // Função para iniciar sessão
    async function iniciarSessao() {
        console.log("Chamando iniciarSessao...");
        try {
            const res = await fetch('/apirest.php/initSession', {
                method: 'POST',
                headers: {
                    'App-Token': APP_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_token: USER_TOKEN })
            });
            const data = await res.json();
            if (data.session_token) {
                sessionToken = data.session_token;
                console.log("Sessão iniciada:", sessionToken);
            } else {
                console.error("Falha ao iniciar sessão:", data);
            }
        } catch (err) {
            console.error("Erro ao iniciar sessão:", err);
        }
    }

    // Função para buscar chamados
    
    // Função para mostrar notificações
    function mostrarNotificacao(ticket) {
        const container = document.createElement('div');
        container.className = 'custom-alert';
        container.innerHTML = `
            <strong>Chamado #${ticket.id}</strong><br>
            ${ticket.name || "Atualização recebida"}
        `;
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 8000);
    }

    // Fluxo principal
    (async function() {
        await iniciarSessao();        // abre sessão primeiro
                // primeira checagem
        // checagens seguintes a cada 60s
    })();

})();

