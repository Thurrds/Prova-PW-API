// /backend/server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Importar o node-fetch

const app = express();
const PORT = 3000;

app.use(cors()); // Habilitar CORS (Dica Importante 6)
app.use(express.json());

// --- Banco de Dados Simulado ---
// (Conforme página 0003: "Array global de usuários (começa vazio)")
let users = [];
let userIdCounter = 1;

// --- Helper: Fetch API Externa ---
async function fetchBrasilAPI(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}

// --- ENDPOINTS DE AUTENTICAÇÃO (Parte 1) ---

/**
 * ENDPOINT 1: Cadastrar Usuário
 * (Conforme páginas 0003 e 0004)
 */
app.post('/api/usuario/cadastrar', async (req, res) => {
    try {
        const { nome, email, senha, dicaSenha, cep } = req.body;

        // 1. Validar campos obrigatórios
        if (!nome || !email || !senha || !dicaSenha || !cep) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }
        // 2. Validar regras de negócio
        if (nome.length < 3) return res.status(400).json({ message: 'Nome deve ter no mínimo 3 caracteres.' });
        if (senha.length < 6) return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres.' });
        if (dicaSenha.length < 10) return res.status(400).json({ message: 'Dica da senha deve ter no mínimo 10 caracteres.' });
        if (cep.replace(/\D/g, '').length !== 8) return res.status(400).json({ message: 'CEP deve ter 8 dígitos.' });
        // 3. Verificar email duplicado
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Este email já está em uso.' });
        }
        // 4. Chamar Brasil API para validar CEP (Req. 7, pág 0004)
        let endereco;
        try {
            const cepLimpo = cep.replace(/\D/g, '');
            const dataCEP = await fetchBrasilAPI(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
            endereco = {
                rua: dataCEP.street,
                bairro: dataCEP.neighborhood,
                cidade: dataCEP.city,
                estado: dataCEP.state,
            };
        } catch (error) {
            return res.status(400).json({ message: 'CEP inválido ou não encontrado.' });
        }
        // 5. Adicionar usuário ao array
        const newUser = {
            id: userIdCounter++,
            nome,
            email,
            senha, // Em um app real, isso seria hasheado
            dicaSenha,
            cep,
            endereco, // Salvar endereço completo (Req. 4, pág 0004)
            dataCadastro: new Date().toISOString()
        };
        users.push(newUser);
        console.log('Usuário cadastrado:', newUser);
        
        // 6. Retornar sucesso (sem senha)
        res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            user: {
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email,
                cep: newUser.cep,
                endereco: newUser.endereco
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
    }
});

/**
 * ENDPOINT 2: Login
 * (Conforme página 0004)
 */
app.post('/api/usuario/login', (req, res) => {
    const { email, senha } = req.body;
    const user = users.find(u => u.email === email && u.senha === senha);
    
    if (user) {
        res.json({
            message: 'Login bem-sucedido!',
            user: { id: user.id, nome: user.nome, email: user.email, cep: user.cep }
        });
    } else {
        res.status(401).json({ message: 'Email ou senha inválidos.' });
    }
});

/**
 * ENDPOINT 3: Recuperar Dica
 * (Conforme páginas 0004 e 0005)
 */
app.post('/api/usuario/recuperar-dica', (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    if (user) {
        res.json({ dica: user.dicaSenha });
    } else {
        res.status(404).json({ message: 'Email não encontrado.' });
    }
});

/**
 * ENDPOINT 4: Redefinir Senha
 * (Conforme página 0005)
 */
app.post('/api/usuario/redefinir-senha', (req, res) => {
    const { email, novaSenha, confirmarSenha } = req.body;

    // 1. Validar
    if (novaSenha !== confirmarSenha) return res.status(400).json({ message: 'As senhas não conferem.' });
    if (novaSenha.length < 6) return res.status(400).json({ message: 'Nova senha deve ter no mínimo 6 caracteres.' });
    
    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ message: 'Email não encontrado.' });
    if (novaSenha === user.senha) return res.status(400).json({ message: 'A nova senha deve ser diferente da atual.' });

    // 2. Atualizar senha
    user.senha = novaSenha;
    console.log('Senha redefinida para:', user.email);
    res.json({ message: 'Senha redefinida com sucesso!' });
});


// --- ENDPOINT DE ANÁLISE E ESTATÍSTICAS (Parte 3) ---
// (Conforme página 0011)
app.post('/api/analise/consumo', (req, res) => {
    const abastecimentos = req.body;

    if (!abastecimentos || abastecimentos.length === 0) {
        return res.status(400).json({ message: 'Nenhum dado de abastecimento fornecido.' });
    }

    // 1. Consumo médio geral (apenas tanque cheio)
    const comTanqueCheio = abastecimentos.filter(a => a.tanqueCheio);
    const consumoMedioGeral = comTanqueCheio.reduce((acc, a) => acc + parseFloat(a.consumoMedio), 0) / (comTanqueCheio.length || 1);

    // 2. Combustível mais usado
    const contagemCombustivel = abastecimentos.reduce((acc, a) => {
        acc[a.tipoCombustivel] = (acc[a.tipoCombustivel] || 0) + 1;
        return acc;
    }, {});
    const combustivelMaisUsado = Object.keys(contagemCombustivel).reduce((a, b) => contagemCombustivel[a] > contagemCombustivel[b] ? a : b, '');

    // 3. Posto mais frequentado
    const contagemPosto = abastecimentos.reduce((acc, a) => {
        acc[a.posto] = (acc[a.posto] || 0) + 1;
        return acc;
    }, {});
    const postoMaisFrequentado = Object.keys(contagemPosto).reduce((a, b) => contagemPosto[a] > contagemPosto[b] ? a : b, '');

    // 4. Tendência de consumo
    let tendenciaConsumo = 'estável';
    const ultimos6TanquesCheios = comTanqueCheio.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 6);
    if (ultimos6TanquesCheios.length === 6) {
        const mediaRecente = (ultimos6TanquesCheios.slice(0, 3).reduce((acc, a) => acc + parseFloat(a.consumoMedio), 0)) / 3;
        const mediaAnterior = (ultimos6TanquesCheios.slice(3, 6).reduce((acc, a) => acc + parseFloat(a.consumoMedio), 0)) / 3;
        if (mediaRecente > mediaAnterior * 1.05) tendenciaConsumo = 'melhorando';
        if (mediaRecente < mediaAnterior * 0.95) tendenciaConsumo = 'piorando';
    }

    // 5. Gasto médio mensal
    const gastosPorMes = {};
    abastecimentos.forEach(a => {
        const mes = a.data.substring(0, 7); // YYYY-MM
        gastosPorMes[mes] = (gastosPorMes[mes] || 0) + parseFloat(a.valorTotal);
    });
    const gastoMedioMensal = Object.values(gastosPorMes).reduce((a, b) => a + b, 0) / (Object.keys(gastosPorMes).length || 1);

    // 6. Km total percorrido
    const kmInicial = abastecimentos.length > 0 ? Math.min(...abastecimentos.map(a => parseFloat(a.quilometragem))) : 0;
    const kmFinal = abastecimentos.length > 0 ? Math.max(...abastecimentos.map(a => parseFloat(a.quilometragem))) : 0;
    const kmTotalPercorridos = kmFinal - kmInicial;
    
    // 7. Alertas
    const alertas = [];
    if (kmTotalPercorridos >= 5000) alertas.push({ tipo: 'Revisão', mensagem: 'Revisão recomendada a cada 5.000 km.' });
    if (kmTotalPercorridos >= 10000) alertas.push({ tipo: 'Óleo', mensagem: 'Troca de óleo recomendada a cada 10.000 km.' });

    res.json({
        consumoMedioGeral: consumoMedioGeral.toFixed(2),
        combustivelMaisUsado: { tipo: combustivelMaisUsado, quantidade: contagemCombustivel[combustivelMaisUsado] || 0 },
        postoMaisFrequentado: { nome: postoMaisFrequentado, vezes: contagemPosto[postoMaisFrequentado] || 0 },
        tendenciaConsumo: tendenciaConsumo,
        gastoMedioPorMes: gastoMedioMensal.toFixed(2),
        kmTotalPercorridos: kmTotalPercorridos.toFixed(0),
        alertas: alertas,
    });
});


// --- ENDPOINT HELPER DE CLIMA E VIAGEM (Parte 4) ---
/**
 * ENDPOINT 5: Clima
 * (Corrigido conforme página 0003 e 0013)
 */
app.get('/api/clima/:nomeCidade', async (req, res) => {
    const { nomeCidade } = req.params;
    try {
        // Passo 1: Buscar código da cidade (pág 0003)
        const cidades = await fetchBrasilAPI(`https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(nomeCidade)}`);
        
        if (!cidades || cidades.length === 0) {
            return res.status(404).json({ message: 'Cidade não encontrada.' });
        }
        
        const codigoCidade = cidades[0].id; // Pega a primeira cidade correspondente
        const nomeRetornado = cidades[0].nome;
        const estadoRetornado = cidades[0].estado;

        // Passo 2: Buscar previsão com o código (pág 0003)
        const previsao = await fetchBrasilAPI(`https://brasilapi.com.br/api/cptec/v1/clima/previsao/${codigoCidade}`);
        
        // Pega a previsão do primeiro dia
        const climaHoje = previsao.clima[0]; 

        res.json({
            cidade: nomeRetornado,
            estado: estadoRetornado,
            clima: {
                min: climaHoje.min,
                max: climaHoje.max,
                condicao: climaHoje.condicao_desc
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados de clima.', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});