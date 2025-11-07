// /frontend/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    // Se já estiver logado, redireciona para o dashboard
    if (localStorage.getItem('usuarioLogado')) {
        window.location.href = 'dashboard.html';
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const data = await apiRequest('/api/usuario/login', 'POST', { email, senha });
            
            // Salvar no localStorage e ir para dashboard (Req. pág 0006)
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
            
            // Redireciona para o dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            // Exibir mensagem (Req. pág 0006)
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
});