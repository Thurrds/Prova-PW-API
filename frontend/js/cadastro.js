// /frontend/js/cadastro.js
document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');
    const errorMessage = document.getElementById('errorMessage');
    const cepInput = document.getElementById('cep');
    const enderecoInfo = document.getElementById('enderecoInfo');

    let enderecoValidado = null;

    // Função para aplicar máscara de CEP
    cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove não dígitos
        if (value.length > 8) value = value.slice(0, 8); // Limita a 8 dígitos
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5);
        }
        e.target.value = value;

        // Validação de CEP (pág 0006)
        if (value.replace(/\D/g, '').length === 8) {
            buscarCEP(value.replace(/\D/g, ''));
        } else {
            enderecoInfo.style.display = 'none';
            enderecoValidado = null;
        }
    });

    // Buscar CEP na Brasil API (Req. pág 0002)
    async function buscarCEP(cep) {
        try {
            const data = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            if (!data.ok) throw new Error('CEP não encontrado.');
            const endereco = await data.json();
            
            enderecoInfo.textContent = `${endereco.street}, ${endereco.neighborhood}, ${endereco.city} - ${endereco.state}`;
            enderecoInfo.style.display = 'block';
            enderecoValidado = endereco; // Salva o endereço para o cadastro
        } catch (error) {
            enderecoInfo.textContent = 'CEP inválido ou não encontrado.';
            enderecoInfo.style.display = 'block';
            enderecoValidado = null;
        }
    }


    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const cep = document.getElementById('cep').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const dica = document.getElementById('dica').value;

        // Validações frontend (Req. pág 0006)
        if (nome.length < 3) return showError('Nome deve ter no mínimo 3 caracteres.');
        if (cep.replace(/\D/g, '').length !== 8 || !enderecoValidado) return showError('CEP inválido. Por favor, digite um CEP válido.');
        if (senha.length < 6) return showError('Senha deve ter no mínimo 6 caracteres.');
        if (senha !== confirmarSenha) return showError('As senhas não conferem.');
        if (dica.length < 10) return showError('Dica de senha deve ter no mínimo 10 caracteres.');

        try {
            // POST para /api/usuario/cadastrar (Req. pág 0006)
            const data = await apiRequest('/api/usuario/cadastrar', 'POST', {
                nome,
                email,
                senha,
                dicaSenha: dica,
                cep
            });

            alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
            
            // Se sucesso: redirecionar em 2s (Req. pág 0006)
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