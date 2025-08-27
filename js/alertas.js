(function () {
    const APP_TOKEN = 'qk3Tc6AgEDtcEpi4HbVwkuNWkrF04oLg5KfqLoOd';
    const USER_TOKEN = 'XckImCc3N7gcd8a5MkhZj7tHkOu8HUAyQBRkVaXH';
    let sessionToken = null;
    let MEU_USER_ID = null; // será preenchido pelo valor do cookie
    let ticketsNotificados = {};

    // Função para pegar o ID do usuário direto do cookie
  function pegarUserIdDoCookie() {
    const cookieName = 'glpi_70a0f13dd8971b6c5952053cb97fe86b_rememberme';
    const cookies = document.cookie.split(';');
    
    for (let c of cookies) {
        c = c.trim();
        if (c.startsWith(cookieName + '=')) {
            const valor = c.substring(cookieName.length + 1); // Pega o valor após o "="
            try {
                // Remove possíveis espaços e decodifica URL
                const valorDecodificado = decodeURIComponent(valor.trim());
                console.log('Valor decodificado:', valorDecodificado);
                
                // Converte a string JSON em array
                const arr = JSON.parse(valorDecodificado);
                console.log('Array parseado:', arr);
                
                // Retorna o primeiro elemento (user_id) como número
                return parseInt(arr[0], 10);
            } catch (err) {
                console.error("Erro ao processar cookie:", err);
                console.log("Valor raw:", valor);
                return null;
            }
        }
    }
    console.log('Cookie não encontrado');
    return null;
}

    MEU_USER_ID = pegarUserIdDoCookie();
    console.log("✅ MEU_USER_ID do cookie:", MEU_USER_ID);

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
            const tickets = await res.json();
            return tickets || [];
        } catch (err) {
            console.error("Erro ao buscar tickets:", err);
            return [];
        }
    }

    // 3️⃣ Mostrar notificação
    function mostrarNotificacao(ticket) {
        console.log("🔔 Notificação:", ticket.id, ticket.name);

        const container = document.createElement('div');
        container.innerHTML = `
            <strong>Ticket #${ticket.id}</strong><br>
            Atualizado em: ${ticket.date_mod}<br>
            ${ticket.name || "Sem título"}
        `;
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

    // 4️⃣ Verificar tickets atualizados
    async function verificarTickets() {
        if (!MEU_USER_ID) {
            console.warn("⚠ MEU_USER_ID não encontrado no cookie, pulando verificação...");
            return;
        }

        const tickets = await buscarTickets();
        tickets.forEach(ticket => {
            if (!ticket.id || !ticket.date_mod) return;

            // Mostra só para tickets atribuídos ao usuário do cookie
            if (ticket.users_id_assign !== MEU_USER_ID) return;

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

    // 5️⃣ Fluxo principal
    iniciarSessao().then(() => {
        verificarTickets(); // primeira execução
        setInterval(verificarTickets, 60000); // roda a cada minuto
    });

})();



