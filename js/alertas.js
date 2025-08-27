(function() {
    const APP_TOKEN = 'qk3Tc6AgEDtcEpi4HbVwkuNWkrF04oLg5KfqLoOd';
    const USER_TOKEN = 'XckImCc3N7gcd8a5MkhZj7tHkOu8HUAyQBRkVaXH';
    let chamadosNotificados = [];

    async function buscarChamados() {
        try {
            const response = await fetch('/apirest.php/Ticket?sort=2&order=DESC&range=0-10', {
                headers: {
                    'App-Token': APP_TOKEN,
                    'Authorization': 'user_token ' + USER_TOKEN
                }
            });
            const data = await response.json();

            if (data && data.length > 0) {
                data.forEach(ticket => {
                    const ultimaAtualizacao = new Date(ticket.date_mod).getTime();
                    const ultimoCheck = localStorage.getItem('last_check') || 0;

                    // Só alerta se for atualização depois do último check
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

    // Verifica a cada 60 segundos
    setInterval(buscarChamados, 60000);

    // Primeira checagem ao carregar
    buscarChamados();
})();

