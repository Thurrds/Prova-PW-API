// /frontend/js/meus-abastecimentos.js
document.addEventListener('DOMContentLoaded', () => {
    const usuario = verificarAutenticacao();
    if (!usuario) return;

    const listaContainer = document.getElementById('listaAbastecimentos');
    const filtroForm = document.getElementById('filtroForm');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    
    // Elementos Totalizadores
    const totalGastoEl = document.getElementById('totalGastoFiltrado');
    const totalLitrosEl = document.getElementById('totalLitrosFiltrado');
    const totalCountEl = document.getElementById('totalAbastecimentosFiltrados');

    const todosAbastecimentos = obterAbastecimentos(usuario.id);

    // Função principal de renderização
    function renderizarLista(abastecimentos) {
        listaContainer.innerHTML = '';
        
        // Ordenar por data (mais recente primeiro) - (Req. pág 0010 e 0017)
        const abastecimentosOrdenados = abastecimentos.sort((a, b) => new Date(b.data) - new Date(a.data));

        if (abastecimentosOrdenados.length === 0) {
            listaContainer.innerHTML = '<p style="text-align: center;">Nenhum abastecimento encontrado para estes filtros.</p>';
        }

        // Renderizar Cards (Req. pág 0010)
        abastecimentosOrdenados.forEach(a => {
            const card = document.createElement('div');
            card.className = 'abastecimento-card';
            // Formatar data (Erro comum a evitar - pág 0017)
            const dataFormatada = new Date(a.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'});

            card.innerHTML = `
                <div class="header">
                    <span>${dataFormatada} - ${a.posto}</span>
                    <button class="btn btn-danger btn-sm" onclick="excluirAbastecimento(${a.id})">Excluir</button>
                </div>
                <div class="details">
                    <span><strong>Tipo:</strong> ${a.tipoCombustivel}</span>
                    <span><strong>Litros:</strong> ${a.litros.toFixed(2)} L</span>
                    <span><strong>Preço/L:</strong> R$ ${a.precoPorLitro.toFixed(2)}</span>
                    <span><strong>Total:</strong> R$ ${a.valorTotal.toFixed(2)}</span>
                    <span><strong>KM:</strong> ${a.quilometragem}</span>
                    <span><strong>Consumo:</strong> ${a.consumoMedio > 0 ? a.consumoMedio + ' km/l' : 'N/A'}</span>
                </div>
                ${a.enderecoPosto ? `<small><strong>Endereço:</strong> ${a.enderecoPosto}</small>` : ''}
                ${a.observacoes ? `<p style="margin-top: 10px;"><strong>Obs:</strong> ${a.observacoes}</p>` : ''}
            `;
            listaContainer.appendChild(card);
        });
        
        // Atualizar Totalizadores (Req. pág 0010)
        const gastoTotal = abastecimentosOrdenados.reduce((acc, a) => acc + parseFloat(a.valorTotal), 0);
        const totalLitros = abastecimentosOrdenados.reduce((acc, a) => acc + parseFloat(a.litros), 0);
        
        totalGastoEl.textContent = `R$ ${gastoTotal.toFixed(2)}`;
        totalLitrosEl.textContent = `${totalLitros.toFixed(2)} L`;
        totalCountEl.textContent = abastecimentosOrdenados.length;
    }

    // Aplicar Filtros (Req. pág 0010)
    filtroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tipo = document.getElementById('filtroTipo').value;
        const posto = document.getElementById('filtroPosto').value.toLowerCase();
        const dataInicio = document.getElementById('filtroDataInicio').value;
        const dataFim = document.getElementById('filtroDataFim').value;

        let filtrados = todosAbastecimentos;

        if (tipo) filtrados = filtrados.filter(a => a.tipoCombustivel === tipo);
        if (posto) filtrados = filtrados.filter(a => a.posto.toLowerCase().includes(posto));
        if (dataInicio) filtrados = filtrados.filter(a => a.data >= dataInicio);
        if (dataFim) filtrados = filtrados.filter(a => a.data <= dataFim);
        
        renderizarLista(filtrados);
    });

    // Botão Limpar Filtros (Req. pág 0010 e 0017)
    btnLimparFiltros.addEventListener('click', () => {
        filtroForm.reset();
        renderizarLista(todosAbastecimentos);
    });

    // Função de exclusão (Req. pág 0011)
    window.excluirAbastecimento = (id) => {
        // 1. Confirmar
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            // 2. Remover do array
            let abastecimentosAtuais = obterAbastecimentos(usuario.id);
            abastecimentosAtuais = abastecimentosAtuais.filter(a => a.id !== id);
            // 3. Salvar
            salvarAbastecimentos(usuario.id, abastecimentosAtuais);
            // 4. Recarregar lista (filtrada)
            filtroForm.dispatchEvent(new Event('submit')); // Re-aplica os filtros atuais
        }
    };

    // Renderização inicial
    renderizarLista(todosAbastecimentos);
});