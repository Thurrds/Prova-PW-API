// /frontend/js/clima.js
document.addEventListener('DOMContentLoaded', () => {
    const usuario = verificarAutenticacao();
    if (!usuario) return;

    // --- Seção 1: Clima da Cidade do Usuário ---
    const btnCarregarClima = document.getElementById('btnCarregarClima');
    const climaUsuarioResult = document.getElementById('climaUsuarioResult');

    btnCarregarClima.addEventListener('click', async () => {
        climaUsuarioResult.style.display = 'block';
        climaUsuarioResult.innerHTML = 'Carregando clima...';
        
        try {
            // 1. Buscar CEP do usuário no localStorage
            const cepLimpo = usuario.cep.replace(/\D/g, '');
            // 2. Chamar Brasil API para pegar nome da cidade
            const dataCEP = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
            if (!dataCEP.ok) throw new Error('CEP do usuário não encontrado.');
            const endereco = await dataCEP.json();
            const nomeCidadeUsuario = endereco.city;

            // 3. Chamar /api/clima/:nomeCidade (Req. pág 0013)
            const clima = await apiRequest(`/api/clima/${nomeCidadeUsuario}`);
            
            // 4. Exibir temperatura e condição (Req. pág 0013)
            climaUsuarioResult.innerHTML = `
                <strong>${clima.cidade} - ${clima.estado}</strong><br>
                Condição: ${clima.clima.condicao}<br>
                Temp. Mín: ${clima.clima.min}°C | Temp. Máx: ${clima.clima.max}°C
            `;
        } catch (error) {
            climaUsuarioResult.innerHTML = `Erro ao carregar clima: ${error.message}`;
        }
    });

    // --- Seção 2: Buscar Outra Cidade ---
    const btnBuscarCidade = document.getElementById('btnBuscarCidade');
    const inputNomeCidade = document.getElementById('inputNomeCidade');
    const climaBuscaResult = document.getElementById('climaBuscaResult');

    btnBuscarCidade.addEventListener('click', async () => {
        const nomeCidade = inputNomeCidade.value;
        if (!nomeCidade) return;

        climaBuscaResult.style.display = 'block';
        climaBuscaResult.innerHTML = 'Buscando...';
        
        try {
            // 1. Chamar API
            const clima = await apiRequest(`/api/clima/${nomeCidade}`);
            // 2. Exibir resultado
            climaBuscaResult.innerHTML = `
                <strong>${clima.cidade} - ${clima.estado}</strong><br>
                Condição: ${clima.clima.condicao}<br>
                Temp. Mín: ${clima.clima.min}°C | Temp. Máx: ${clima.clima.max}°C
            `;
        } catch (error) {
            climaBuscaResult.innerHTML = `Erro ao buscar clima: ${error.message}`;
        }
    });

    // --- Seção 3: Calculadora de Viagem ---
    const btnCalcularViagem = document.getElementById('btnCalcularViagem');
    const inputConsumoMedio = document.getElementById('inputConsumoMedio');
    const calculadoraResult = document.getElementById('calculadoraResult');

    // Pré-preencher consumo médio (Req. pág 0013)
    const abastecimentos = obterAbastecimentos(usuario.id);
    const abastecimentosComConsumo = abastecimentos.filter(a => a.consumoMedio > 0 && a.tanqueCheio);
    if (abastecimentosComConsumo.length > 0) {
        const consumoMedioUsuario = abastecimentosComConsumo.reduce((acc, a) => acc + parseFloat(a.consumoMedio), 0) / abastecimentosComConsumo.length;
        inputConsumoMedio.value = consumoMedioUsuario.toFixed(2);
    }

    btnCalcularViagem.addEventListener('click', () => {
        const distancia = parseFloat(document.getElementById('inputDistancia').value) || 0;
        const consumo = parseFloat(inputConsumoMedio.value) || 0;
        const preco = parseFloat(document.getElementById('inputPrecoCombustivel').value) || 0;

        if (distancia <= 0 || consumo <= 0 || preco <= 0) {
            alert('Por favor, preencha todos os campos da calculadora com valores válidos.');
            return;
        }

        // 1. Litros necessários: distância / consumo (Req. pág 0014)
        const litros = distancia / consumo;
        // 2. Custo: litros * preço
        const custo = litros * preco;
        // 3. Com margem 15%: custo * 1.15
        const custoMargem = custo * 1.15;

        // Exibir cálculos
        document.getElementById('litrosNecessarios').textContent = litros.toFixed(2);
        document.getElementById('custoTotal').textContent = custo.toFixed(2);
        document.getElementById('custoMargem').textContent = custoMargem.toFixed(2);
        calculadoraResult.style.display = 'block';
    });
});