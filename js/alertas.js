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
    async function buscarChamados() {
        console.log('chamados', sessionToken)
        
        if (!sessionToken) {
            console.warn("Session token não definido ainda, aguardando...");
            return;
        }
        try {
            const res = await fetch('/apirest.php/Ticket?range=0-10', {
                headers: {
                    'App-Token': APP_TOKEN,
                    'Session-Token': sessionToken
                }
            });

           const tickets = await res.json();

        for (const ticket of tickets) {
            // busca followups do ticket
            const res2 = await fetch(`/apirest.php/Ticket/${ticket.id}/TicketFollowups`, {
                headers: {
                    'App-Token': APP_TOKEN,
                    'Session-Token': sessionToken
                }
            });
            const followups = await res2.json();

            if (followups && followups.length > 0) {
                const ultimoFollowup = followups[followups.length - 1];
                const key = `ticket_${ticket.id}_last_followup`;
                const lastNotified = localStorage.getItem(key) || 0;

                if (new Date(ultimoFollowup.date).getTime() > lastNotified) {
                    mostrarNotificacao(ticket, ultimoFollowup);
                    localStorage.setItem(key, new Date(ultimoFollowup.date).getTime());
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}

function mostrarNotificacao(ticket, followup) {
    const container = document.createElement('div');
    container.className = 'custom-alert';
    container.innerHTML = `
        <strong>Ticket #${ticket.id}</strong><br>
        Nova resposta: ${followup.content || "Sem texto"}
    `;
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 8000);
}

    // Fluxo principal
   iniciarSessao().then(() => {
    buscarChamados();              // só roda depois que sessionToken existir
    setInterval(buscarChamados, 60000);
});

})();



