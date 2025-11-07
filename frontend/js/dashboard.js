// /frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // Ao carregar: verificar auth (Req. pág 0008)
    const usuario = verificarAutenticacao();
    if (!usuario) return; // Interrompe se o usuário não estiver logado

    // Exibe mensagem de boas-vindas
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `Bem-vindo(a), ${usuario.nome}!`;

    // Ao carregar: Buscar abastecimentos (Req. pág 0008)
    const abastecimentos = obterAbastecimentos(usuario.id);

    // Calcular e exibir totais (Req. pág 0008)
    if (abastecimentos.length > 0) {
        const totalAbastecimentos = abastecimentos.length;
        const gastoTotal = abastecimentos.reduce((acc, a) => acc + parseFloat(a.valorTotal), 0);
        const totalLitros = abastecimentos.reduce((acc, a) => acc + parseFloat(a.litros), 0);
        
        // Apenas abastecimentos com consumo médio calculado
        const abastecimentosComConsumo = abastecimentos.filter(a => a.consumoMedio > 0 && a.tanqueCheio);
        let consumoMedio = 0;
        if (abastecimentosComConsumo.length > 0) {
             consumoMedio = abastecimentosComConsumo.reduce((acc, a) => acc + parseFloat(a.consumoMedio), 0) / abastecimentosComConsumo.length;
        }

        document.getElementById('totalAbastecimentos').textContent = totalAbastecimentos;
        document.getElementById('gastoTotal').textContent = `R$ ${gastoTotal.toFixed(2)}`;
        document.getElementById('totalLitros').textContent = `${totalLitros.toFixed(2)} L`;
        document.getElementById('consumoMedio').textContent = `${consumoMedio.toFixed(2)} km/l`;
    }
});