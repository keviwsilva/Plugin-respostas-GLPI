(function () {
    const APP_TOKEN = 'qk3Tc6AgEDtcEpi4HbVwkuNWkrF04oLg5KfqLoOd';
    const USER_TOKEN = 'XckImCc3N7gcd8a5MkhZj7tHkOu8HUAyQBRkVaXH';
    let sessionToken = null;
    let MEU_USER_ID = null;
    let ticketsNotificados = {};

    // Pegar ID do usuário do cookie
    function pegarUserIdDoCookie() {
        const cookieName = 'glpi_70a0f13dd8971b6c5952053cb97fe86b_rememberme';
        const cookies = document.cookie.split(';');
        for (let c of cookies) {
            c = c.trim();
            const [name, value] = c.split('=');
            if (name === cookieName) {
                try {
                    const arr = JSON.parse(decodeURIComponent(value));
                    return parseInt(arr[0], 10);
                } catch (err) {
                    console.error("Erro ao decodificar cookie:", err);
                    return null;
                }
            }
        }
        return null;
    }

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

    // 2️⃣ Buscar tickets
    async function buscarTickets() {
        if (!sessionToken) return [];
        try {
            const res = await fetch('/apirest.php/Ticket?range=0-20&order=DESC', {
                headers: {
                    'App-Token': APP_TOKEN,
                    'Session-Token': sessionToken
                }
            });
            return await res.json() || [];
        } catch (err) {
            console.error("Erro ao buscar tickets:", err);
            return [];
        }
    }

    // 3️⃣ Buscar todos técnicos de um ticket
    async function getTodosTecnicosTicket(ticketId) {
        if (!sessionToken) return [];
        try {
            const res = await fetch(`/apirest.php/Ticket/${ticketId}/Ticket_User/`, {
                headers: {
                    'Session-Token': sessionToken,
                    'App-Token': APP_TOKEN
                }
            });
            const data = await res.json();
            return data.filter(item => item.type === 1 || item.type === 4); // técnicos
        } catch (err) {
            console.error("Erro ao buscar técnicos:", err);
            return [];
        }
    }

    // 4️⃣ Mostrar notificação
    function mostrarNotificacao(ticket) {
        const container = document.createElement('div');
        container.innerHTML = `
            <strong>Ticket #${ticket.id}</strong><br>
            Atualizado em: ${ticket.date_mod}<br>
            ${ticket.name || "Sem título"}
        `;
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'red',
            color: 'white',
            padding: '10px',
            zIndex: '99999',
            fontSize: '14px',
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        });
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 8000);
    }

    // 5️⃣ Verificar tickets atualizados
    async function verificarTickets() {
        if (!MEU_USER_ID) {
            console.warn("⚠ MEU_USER_ID não encontrado, pulando verificação...");
            return;
        }
        const tickets = await buscarTickets();
        for (let ticket of tickets) {
            if (!ticket.id || !ticket.date_mod) continue;

            // Pega todos técnicos do ticket
            const tecnicos = await getTodosTecnicosTicket(ticket.id);
            const tecnicoIds = tecnicos.map(t => parseInt(t.users_id, 10));

            if (!tecnicoIds.includes(MEU_USER_ID)) continue;

            const key = `ticket_${ticket.id}_last_mod`;
            const ultimoNotificado = parseInt(ticketsNotificados[key] || localStorage.getItem(key) || 0, 10);
            const ultimaModificacao = new Date(ticket.date_mod).getTime();

            if (ultimaModificacao > ultimoNotificado) {
                mostrarNotificacao(ticket);
                ticketsNotificados[key] = ultimaModificacao;
                localStorage.setItem(key, ultimaModificacao);
            }
        }
    }

    // 6️⃣ Fluxo principal
    (async function main() {
        MEU_USER_ID = pegarUserIdDoCookie();
        if (!MEU_USER_ID) console.error("Não foi possível pegar MEU_USER_ID do cookie!");

        await iniciarSessao(); // aguarda sessionToken
        await verificarTickets(); // primeira execução
        setInterval(verificarTickets, 60000); // rodar a cada minuto
    })();

})();
