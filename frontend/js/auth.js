// /frontend/js/auth.js

/**
 * Verifica se o usuário está logado.
 * Se não estiver, redireciona para o index.html.
 * Se estiver, retorna os dados do usuário.
 * (Req. PARTE 2 - Sistema de Proteção)
 */
function verificarAutenticacao() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')); // Dica 5
    if (!usuario) {
        // Erro comum a evitar: Esquecer de verificar autenticação
        window.location.href = 'index.html';
        return null; // Retorna nulo para interromper a execução
    }
    return usuario;
}

/**
 * Função de logout.
 * (Req. PARTE 2 - Função sair())
 */
function sair() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('usuarioLogado');
        // Não precisamos limpar os abastecimentos, pois eles são atrelados ao ID do usuário
        window.location.href = 'index.html';
    }
}

/**
 * Busca os abastecimentos do usuário logado no localStorage.
 * (Req. PARTE 2 - Função obterAbastecimentos())
 */
function obterAbastecimentos(userId) {
    // Não salvar por userId é um erro comum (pág 0017)
    const chave = `abastecimentos_user_${userId}`;
    const data = localStorage.getItem(chave);
    return data ? JSON.parse(data) : []; // Dica 5
}

/**
 * Salva o array de abastecimentos do usuário logado no localStorage.
 * (Req. PARTE 2 - Função salvarAbastecimentos())
 */
function salvarAbastecimentos(userId, arrayDeAbastecimentos) {
    const chave = `abastecimentos_user_${userId}`;
    localStorage.setItem(chave, JSON.stringify(arrayDeAbastecimentos)); // Dica 5
}