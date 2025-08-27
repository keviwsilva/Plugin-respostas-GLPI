(function () {
    const APP_TOKEN = 'qk3Tc6AgEDtcEpi4HbVwkuNWkrF04oLg5KfqLoOd';
    const USER_TOKEN = 'XckImCc3N7gcd8a5MkhZj7tHkOu8HUAyQBRkVaXH';
    let sessionToken = null;
    let MEU_USER_ID = null; // será preenchido pelo valor do cookie
    let ticketsNotificados = {};


    // Função para pegar o ID do usuário direto do cookie
async function pegarUserIdDoBackend() {
    try {
        const response = await fetch('../plugins/customjs/get_user_id.php', {
            credentials: 'include' // importante para enviar cookies
        });
        
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        
        const data = await response.json();
        return data.user_id;
        
    } catch (error) {
        console.error('Erro ao buscar user_id:', error);
        return null;
    }
}

MEU_USER_ID = pegarUserIdDoBackend();
// Usar:
pegarUserIdDoBackend().then(userId => {
    MEU_USER_ID = userId
});

async function getTodosTecnicosTicket(ticketId) {
    try {
        const response = await fetch(`/apirest.php/Ticket/${ticketId}/Ticket_User/`, {
            headers: {
                'Session-Token': sessionToken,
                'App-Token': APP_TOKEN,
            }
        });
        
        const data = await response.json();
        // Filtrar apenas técnicos (type 1 e 4)
        const tecnicos = data.filter(item => item.type === 2 || item.type === 4);
        console.log(tecnicos)
        return tecnicos;
        
    } catch (error) {
        console.error('Erro ao buscar técnicos:', error);
        return [];
    }
}

// Usar
// getTodosTecnicosTicket(8236).then(tecnicos => {
//     tecnicos.forEach(tech => {
//         console.log(`Técnico ID: ${tech.users_id}, Tipo: ${tech.type}`);
//     });
// });
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
            const res = await fetch('/apirest.php/Ticket?range=0-40&order=DESC', {
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

 // Contêiner geral para empilhar notificações
let notificacoesContainer = document.getElementById('notificacoes-container');
if (!notificacoesContainer) {
    notificacoesContainer = document.createElement('div');
    notificacoesContainer.id = 'notificacoes-container';
    notificacoesContainer.style.position = 'fixed';
    notificacoesContainer.style.bottom = '20px';
    notificacoesContainer.style.right = '20px';
    notificacoesContainer.style.display = 'flex';
    notificacoesContainer.style.flexDirection = 'column-reverse'; // nova em cima
    notificacoesContainer.style.gap = '10px';
    notificacoesContainer.style.zIndex = '99999';
    document.body.appendChild(notificacoesContainer);
}

function mostrarNotificacao(ticket) {
    console.log("🔔 Notificação:", ticket.id, ticket.name);

    const container = document.createElement('div');
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>Ticket #${ticket.id}</strong><br>
                Atualizado em: ${ticket.date_mod}<br>
                ${ticket.name || "Sem título"}<br>
                <a href="http://192.168.2.150/front/ticket.form.php?id=${ticket.id}" 
                   target="_blank" title="Abrir ticket">
                   🔗 Abrir Ticket
                </a>
            </div>
            <button style="
                margin-left: 10px;
                background: transparent;
                border: none;
                color: white;
                font-weight: bold;
                cursor: pointer;
                font-size: 16px;
            " title="Fechar">✖</button>
        </div>
    `;
    container.style.backgroundColor = 'red';
    container.style.color = 'white';
    container.style.padding = '10px';
    container.style.borderRadius = '6px';
    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    container.style.minWidth = '250px';
    container.style.maxWidth = '300px';
    container.style.wordBreak = 'break-word';
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';

    // Botão fechar
    const btnFechar = container.querySelector('button');
    btnFechar.addEventListener('click', () => {
        container.remove();
    });

    notificacoesContainer.appendChild(container);
}


    // 4️⃣ Verificar tickets atualizados
    async function verificarTickets() {
    if (!MEU_USER_ID) {
        console.warn("⚠ MEU_USER_ID não encontrado no cookie, pulando verificação...");
        return;
    }

    const tickets = await buscarTickets();
    
    for (const ticket of tickets) {
        if (!ticket.id || !ticket.date_mod) continue;

        // Buscar todos os técnicos do ticket
        const tecnicos = await getTodosTecnicosTicket(ticket.id);
        
        // Verificar se o usuário atual está na lista de técnicos
        const usuarioEhTecnico = tecnicos.some(tecnico => tecnico.users_id === MEU_USER_ID);
        
        // Se o usuário não for técnico deste ticket, pular
        if (!usuarioEhTecnico) continue;

        const key = `ticket_${ticket.id}_last_mod`;
        const ultimoNotificado = ticketsNotificados[key] || localStorage.getItem(key) || 0;
        const ultimaModificacao = new Date(ticket.date_mod).getTime();

        if (ultimaModificacao > ultimoNotificado) {
            mostrarNotificacao(ticket);
            ticketsNotificados[key] = ultimaModificacao;
            localStorage.setItem(key, ultimaModificacao);
        }
    }
}

    // 5️⃣ Fluxo principal
    iniciarSessao().then(async() => {
        verificarTickets(); // primeira execução
        
           
        setInterval(verificarTickets, 60000); // roda a cada minuto
    });

})();








































