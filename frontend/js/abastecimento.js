// /frontend/js/abastecimento.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar autenticação
    const usuario = verificarAutenticacao();
    if (!usuario) return;

    // 2. Pegar elementos do DOM
    const form = document.getElementById('abastecimentoForm');
    const kmAtualInput = document.getElementById('quilometragem');
    const litrosInput = document.getElementById('litros');
    const precoInput = document.getElementById('precoPorLitro');
    const valorTotalInput = document.getElementById('valorTotal');
    const tanqueCheioCheckbox = document.getElementById('tanqueCheio');
    const consumoMedioInput = document.getElementById('consumoMedio');
    const errorMessage = document.getElementById('errorMessage');
    const cepPostoInput = document.getElementById('cepPosto');
    const btnBuscarCEP = document.getElementById('btnBuscarCEP');
    const enderecoPostoInput = document.getElementById('enderecoPosto');

    let enderecoPostoSalvo = null; // Variável temporária (Req. pág 0009)

    // 3. Cálculos Automáticos (Req. pág 0009)
    
    // 3a. Valor Total
    function calcularValorTotal() {
        const litros = parseFloat(litrosInput.value) || 0;
        const preco = parseFloat(precoInput.value) || 0;
        valorTotalInput.value = (litros * preco).toFixed(2);
    }
    litrosInput.addEventListener('input', calcularValorTotal);
    precoInput.addEventListener('input', calcularValorTotal);

    // 3b. Consumo Médio
    async function calcularConsumoMedio() {
        consumoMedioInput.value = '';
        if (tanqueCheioCheckbox.checked) {
            const abastecimentos = obterAbastecimentos(usuario.id);
            // "Exibir só se houver abastecimento anterior com tanque cheio" (Req. pág 0009)
            const ultimoTanqueCheio = abastecimentos
                .filter(a => a.tanqueCheio)
                .sort((a, b) => new Date(b.data) - new Date(a.data))[0];
            
            if (ultimoTanqueCheio) {
                const kmAtual = parseFloat(kmAtualInput.value);
                const kmUltimoTanque = parseFloat(ultimoTanqueCheio.quilometragem);
                
                // Fórmula: (km atual - km último tanque cheio) / litros (Req. pág 0009)
                // Assumindo que "litros" são os litros *deste* abastecimento
                const litros = parseFloat(litrosInput.value); 
                
                if (kmAtual > kmUltimoTanque && litros > 0) {
                    // Esta fórmula está estranha. Vamos seguir a segunda:
                    // (km atual - km último tanque cheio) / litros
                    // Vamos assumir que "litros" são os litros do *abastecimento anterior*
                    
                    // Re-interpretação da pág 0009:
                    // "Fórmula: (km atual - km último tanque cheio) / litros"
                    // Isso é ambíguo. Vamos usar a fórmula mais lógica:
                    // Consumo = (KM Rodados) / (Litros Gastos)
                    // KM Rodados = kmAtual - kmUltimoTanqueCheio
                    // Litros Gastos = litros *deste* abastecimento (que encheu o tanque)
                    
                    const kmRodados = kmAtual - kmUltimoTanque;
                    if (kmRodados > 0 && litros > 0) {
                        consumoMedioInput.value = (kmRodados / litros).toFixed(2);
                    }
                }
            }
        }
    }
    tanqueCheioCheckbox.addEventListener('change', calcularConsumoMedio);
    kmAtualInput.addEventListener('input', calcularConsumoMedio);
    litrosInput.addEventListener('input', calcularConsumoMedio);


    // 4. Buscar CEP do Posto (Req. pág 0009)
    cepPostoInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);
        e.target.value = value;
    });

    btnBuscarCEP.addEventListener('click', async () => {
        const cep = cepPostoInput.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            alert('Digite um CEP válido com 8 dígitos.');
            return;
        }
        try {
            // Chamar Brasil API (Req. pág 0009)
            const data = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            if (!data.ok) throw new Error();
            const endereco = await data.json();
            
            const enderecoCompleto = `${endereco.street}, ${endereco.neighborhood}, ${endereco.city} - ${endereco.state}`;
            enderecoPostoInput.value = enderecoCompleto;
            enderecoPostoSalvo = enderecoCompleto; // Salvar na variável temporária
        } catch (error) {
            alert('CEP não encontrado.');
            enderecoPostoInput.value = '';
            enderecoPostoSalvo = null;
        }
    });

    // 5. Salvar Abastecimento (Submit)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const abastecimentos = obterAbastecimentos(usuario.id);
        const ultimoAbastecimento = abastecimentos.sort((a, b) => new Date(b.data) - new Date(a.data))[0];
        const ultimaKm = ultimoAbastecimento ? parseFloat(ultimoAbastecimento.quilometragem) : 0;
        
        const data = document.getElementById('data').value;
        const kmAtual = parseFloat(kmAtualInput.value);

        // Validação 1: Data não futura (Req. pág 0009)
        const hoje = new Date().toISOString().split('T')[0];
        if (data > hoje) {
            return showError('A data do abastecimento não pode ser no futuro.');
        }
        
        // Validação 2: Km atual >= última km (Req. pág 0009 e 0017)
        if (kmAtual < ultimaKm) {
            return showError(`A quilometragem atual (${kmAtual}) deve ser maior ou igual à última registrada (${ultimaKm}).`);
        }

        // Validação 3: Todos os campos obrigatórios (Req. pág 0009)
        // (HTML 'required' já trata a maioria, mas é uma boa prática)

        // Estrutura do objeto (Req. pág 0009)
        const novoAbastecimento = {
            id: Date.now(), // ID único
            userId: usuario.id,
            data: data,
            posto: document.getElementById('posto').value,
            enderecoPosto: enderecoPostoSalvo, // Pega da variável temporária
            tipoCombustivel: document.getElementById('tipoCombustivel').value,
            litros: parseFloat(litrosInput.value),
            precoPorLitro: parseFloat(precoInput.value),
            valorTotal: parseFloat(valorTotalInput.value),
            quilometragem: kmAtual,
            tanqueCheio: tanqueCheioCheckbox.checked,
            consumoMedio: parseFloat(consumoMedioInput.value) || 0,
            observacoes: document.getElementById('observacoes').value,
        };

        // Salvar (Req. pág 0010)
        abastecimentos.push(novoAbastecimento);
        salvarAbastecimentos(usuario.id, abastecimentos);
        
        alert('Abastecimento salvo com sucesso!');
        // Redirecionar (Req. pág 0010)
        window.location.href = 'meus-abastecimentos.html';
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});