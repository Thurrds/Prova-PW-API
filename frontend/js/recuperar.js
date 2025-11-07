// /frontend/js/recuperar.js
document.addEventListener('DOMContentLoaded', () => {
    const formPasso1 = document.getElementById('formPasso1');
    const formPasso2 = document.getElementById('formPasso2');
    const passo1Div = document.getElementById('passo1');
    const passo2Div = document.getElementById('passo2');
    const emailInput = document.getElementById('email');
    const dicaSenhaEl = document.getElementById('dicaSenha');
    const errorMessage = document.getElementById('errorMessage');

    // PASSO 1: Buscar Dica
    formPasso1.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        const email = emailInput.value;

        try {
            // POST para /api/usuario/recuperar-dica (Req. pág 0007)
            const data = await apiRequest('/api/usuario/recuperar-dica', 'POST', { email });
            
            // Exibir dica retornada
            dicaSenhaEl.textContent = data.dica;
            // Mostrar Passo 2
            passo1Div.style.display = 'none';
            passo2Div.style.display = 'block';

        } catch (error) {
            showError(error.message);
        }
    });

    // PASSO 2: Redefinir Senha
    formPasso2.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        
        const email = emailInput.value; // Pega o email do Passo 1
        const novaSenha = document.getElementById('novaSenha').value;
        const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;

        // Validar senhas iguais e mínimo 6 chars (Req. pág 0007)
        if (novaSenha !== confirmarNovaSenha) return showError('As senhas não conferem.');
        if (novaSenha.length < 6) return showError('A nova senha deve ter no mínimo 6 caracteres.');

        try {
            // POST para /api/usuario/redefinir-senha (Req. pág 0007)
            const data = await apiRequest('/api/usuario/redefinir-senha', 'POST', { 
                email, 
                novaSenha,
                confirmarSenha: confirmarNovaSenha
            });

            alert(data.message + ' Você será redirecionado para o login.');

            // Se sucesso: redirecionar para login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            showError(error.message);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});