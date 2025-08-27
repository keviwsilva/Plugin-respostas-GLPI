(function() {

     const APP_TOKEN = 'qk3Tc6AgEDtcEpi4HbVwkuNWkrF04oLg5KfqLoOd';
    const USER_TOKEN = 'XckImCc3N7gcd8a5MkhZj7tHkOu8HUAyQBRkVaXH';
    let sessionToken = null;
    let chamadosNotificados = [];

    async function iniciarSessao() {
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
            sessionToken = data.session_token;
            console.log("Sessão iniciada:", sessionToken);
        } catch (err) {
            console.error("Erro ao iniciar sessão:", err);
        }
    }

    async function buscarChamados() {
        if (!sessionToken) return;

        try {
            const res = await fetch('/apirest.php/Ticket?range=0-10', {
                headers: {
                    'App-Token': APP_TOKEN,
                    'Session-Token': sessionToken
                }
            });
            const data = await res.json();

            if (data && data.length > 0) {
                data.forEach(ticket => {
                    const ultimaAtualizacao = new Date(ticket.date_mod).getTime();
                    const ultimoCheck = localStorage.getItem('last_check') || 0;

                    if (ultimaAtualizacao > ultimoCheck && !chamadosNotificados.includes(ticket.id)) {
                        mostrarNotificacao(ticket);
                        chamadosNotificados.push(ticket.id);
                    }
                });

                localStorage.setItem('last_check', Date.now());
            }
        } catch (err) {
            console.error("Erro ao buscar chamados:", err);
        }
    }

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

    (async function() {
        await iniciarSessao();
        buscarChamados();
        setInterval(buscarChamados, 60000);
    })();

})();

