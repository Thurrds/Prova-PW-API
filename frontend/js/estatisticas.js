// /frontend/js/estatisticas.js
document.addEventListener('DOMContentLoaded', () => {
    const usuario = verificarAutenticacao();
    if (!usuario) return;

    const btnAtualizar = document.getElementById('btnAtualizar');
    const loadingDiv = document.getElementById('loading');
    const statsContainer = document.getElementById('statsContainer');

    // Comportamento (Req. pág 0013)
    async function carregarEstatisticas() {
        loadingDiv.style.display = 'block'; // Mostrar loading (Req. pág 0012 e 0017)
        loadingDiv.textContent = 'Carregando dados...';
        statsContainer.style.display = 'none';
        
        try {
            // 1. Buscar abastecimentos do localStorage
            const abastecimentos = obterAbastecimentos(usuario.id);
            
            // 2. Se vazio, exibir erro
            if (abastecimentos.length === 0) {
                loadingDiv.textContent = 'Você precisa registrar abastecimentos para ver as estatísticas.';
                return;
            }

            // 3. POST para /api/analise/consumo
            const stats = await apiRequest('/api/analise/consumo', 'POST', abastecimentos);
            
            // 4. Preencher dados na tela
            preencherDados(stats);

            loadingDiv.style.display = 'none';
            statsContainer.style.display = 'block';

        } catch (error) {
            loadingDiv.textContent = `Erro ao carregar estatísticas: ${error.message}`;
        }
    }
    
    function preencherDados(stats) {
        // 1. Análise de Consumo
        document.getElementById('consumoMedioGeral').textContent = `${stats.consumoMedioGeral} km/l`;
        document.getElementById('tendenciaConsumo').textContent = stats.tendenciaConsumo;
        document.getElementById('kmPercorridos').textContent = `${stats.kmTotalPercorridos} km`;
        
        // 2. Preferências
        document.getElementById('combustivelFavorito').textContent = `${stats.combustivelMaisUsado.tipo} (${stats.combustivelMaisUsado.quantidade}x)`;
        document.getElementById('postoFavorito').textContent = `${stats.postoMaisFrequentado.nome} (${stats.postoMaisFrequentado.vezes}x)`;

        // 3. Análise Financeira
        document.getElementById('gastoMedioMensal').textContent = `R$ ${stats.gastoMedioPorMes}`;

        // 4. Alertas
        const alertasContainer = document.getElementById('alertasContainer');
        alertasContainer.innerHTML = '';
        if (stats.alertas.length === 0) {
            // Se nenhum: "Nenhum alerta" (Req. pág 0012)
            alertasContainer.innerHTML = '<p>Nenhum alerta.</p>';
        } else {
            stats.alertas.forEach(alerta => {
                alertasContainer.innerHTML += `<p><strong>${alerta.tipo}:</strong> ${alerta.mensagem}</p>`;
            });
        }
    }

    btnAtualizar.addEventListener('click', carregarEstatisticas);
    carregarEstatisticas(); // Carga inicial
});