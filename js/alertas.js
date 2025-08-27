(function() {

    const APP_TOKEN = 'qk3Tc6AgEDtcEpi4HbVwkuNWkrF04oLg5KfqLoOd';
    const USER_TOKEN = 'XckImCc3N7gcd8a5MkhZj7tHkOu8HUAyQBRkVaXH';
    let sessionToken = null;
    let chamadosNotificados = [];

    // 1️⃣ Iniciar sessão
    async function iniciarSessao() {
        console.log("Iniciando sessão...");
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

  async function buscarTickets() {
        if (!sessionToken) return [];
        try {
            const res = await fetch('/apirest.php/Ticket?range=0-10&order=DESC', {
                headers: {
                    'App-Token': APP_TOKEN,
                    'Session-Token': sessionToken
                }
            });
            const tickets = await res.json();
            return tickets || [];
        } catch (err) {
            console.error("Erro ao buscar tickets:", err);
            return [];
        }
    }

    // 3️⃣ Buscar followups de um ticket (sem sort)
    async function buscarFollowups(ticketId) {
        if (!sessionToken || !ticketId) return [];
        try {
            const url = `/apirest.php/TicketFollowup?range=0-50&criteria[0][field]=tickets_id&criteria[0][searchtype]=equals&criteria[0][value]=${ticketId}`;
            const res = await fetch(url, {
                headers: {
                    'App-Token': APP_TOKEN,
                    'Session-Token': sessionToken
                }
            });
            const data = await res.json();
            return data || [];
        } catch (err) {
            console.error("Erro ao buscar followups do ticket", ticketId, err);
            return [];
        }
    }

    // 4️⃣ Mostrar notificação visual
    function mostrarNotificacao(ticket, followup) {
        console.log('teste notificacao')
        const container = document.createElement('div');
        container.className = 'custom-alert';
        container.innerHTML = `
            <strong>Ticket #${ticket.id}</strong><br>
            Nova resposta: ${followup.content || "Sem texto"}
        `;
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 8000);
    }

    // 5️⃣ Verificar novos followups e notificar
    async function verificarNovosFollowups() {
const tickets = await buscarTickets();
        tickets.forEach(ticket => {
            if (!ticket.id || !ticket.date_mod) return;

            const key = `ticket_${ticket.id}_last_mod`;
            const ultimoNotificado = ticketsNotificados[key] || localStorage.getItem(key) || 0;
            const ultimaModificacao = new Date(ticket.date_mod).getTime();

            // Se a modificação é mais recente que o último notificado
            if (ultimaModificacao > ultimoNotificado) {
                mostrarNotificacao(ticket);
                ticketsNotificados[key] = ultimaModificacao;
                localStorage.setItem(key, ultimaModificacao);
            }
        });
    }


    // Fluxo principal
   iniciarSessao().then(() => {
    verificarNovosFollowups();              // só roda depois que sessionToken existir
    setInterval(verificarNovosFollowups, 60000);
});

})();










