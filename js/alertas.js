(function() {

    const APP_TOKEN = 'qk3Tc6AgEDtcEpi4HbVwkuNWkrF04oLg5KfqLoOd';
    const USER_TOKEN = 'XckImCc3N7gcd8a5MkhZj7tHkOu8HUAyQBRkVaXH';
    let sessionToken = null;
    let chamadosNotificados = [];

    // Últimos tickets notificados
    let ticketsNotificados = {};

 // Pega o ID do usuário logado no GLPI
    function pegarUserIdDoCookie() {
        const match = document.cookie.match(/glpi_\w+=\[(\d+),"/);
        if (match) {
            return parseInt(match[1]);
        }
        return null;
    }
    const MEU_USER_ID = pegarUserIdDoCookie();
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

  // Mostrar notificação
 function mostrarNotificacao(ticket) {
    console.log(ticket.id , ticket.name)
    const container = document.createElement('div');
    container.innerHTML = `
        <strong>Ticket #${ticket.id}</strong><br>
        Atualizado em: ${ticket.date_mod}<br>
        ${ticket.name || "Sem título"}
    `;
    // Adiciona estilo inline para teste
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.backgroundColor = 'red';
    container.style.color = 'white';
    container.style.padding = '10px';
    container.style.zIndex = '99999';
    container.style.fontSize = '14px';
    container.style.borderRadius = '6px';
    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 8000);
}


    // Verificar tickets atualizados
   async function verificarTickets() {
        if (!MEU_USER_ID) return;
        const tickets = await buscarTickets();
        tickets.forEach(ticket => {
            if (!ticket.id || !ticket.date_mod) return;

            // Só mostra para tickets atribuídos ao usuário logado
            if (ticket.users_id_assign != MEU_USER_ID) return;

            const key = `ticket_${ticket.id}_last_mod`;
            const ultimoNotificado = ticketsNotificados[key] || localStorage.getItem(key) || 0;
            const ultimaModificacao = new Date(ticket.date_mod).getTime();

            if (ultimaModificacao > ultimoNotificado) {
                mostrarNotificacao(ticket);
                ticketsNotificados[key] = ultimaModificacao;
                localStorage.setItem(key, ultimaModificacao);
            }
        });
    }


    // Fluxo principal
   iniciarSessao().then(() => {
    verificarTickets();              // só roda depois que sessionToken existir
    setInterval(verificarTickets, 60000);
});

})();
















