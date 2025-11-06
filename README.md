# FuelManager Pro

Sistema completo de gerenciamento de abastecimentos, desenvolvido como Prova de Programação Web.

---

### Como Executar

#### Backend

1.  Navegue até a pasta `backend`: `cd backend`
2.  Instale as dependências: `npm install express cors node-fetch`
3.  Inicie o servidor: `node server.js`
4.  O servidor estará rodando em `http://localhost:3000`

#### Frontend

1.  Abra a pasta `frontend`.
2.  Abra o arquivo `index.html` diretamente no seu navegador. O sistema foi feito em Vanilla JS e não requer um servidor de frontend.

---

### Funcionalidades Implementadas

- [x] **Autenticação completa (35 pontos):**
    - [x] Tela de Login
    - [x] Tela de Cadastro com validação de CEP via Brasil API
    - [x] Tela de Recuperação de senha em 2 passos (Dica + Redefinição)
    - [x] Proteção de rotas (`auth.js`) e botão de Sair
- [x] **Gestão de Abastecimentos (35 pontos):**
    - [x] Dashboard com resumo (4 cards)
    - [x] Formulário de Registro de Abastecimento
    - [x] Cálculos automáticos em tempo real (Valor Total, Consumo Médio)
    - [x] Busca de CEP do Posto (via Brasil API)
    - [x] Validações de formulário (Data futura, KM crescente)
    - [x] Listagem de Abastecimentos (ordenada por data)
    - [x] Filtros avançados (tipo, posto, período)
    - [x] Botão de Limpar Filtros
    - [x] Exclusão de abastecimento
- [x] **Estatísticas (20 pontos):**
    - [x] Backend: Endpoint `POST /api/analise/consumo`
    - [x] Backend: 7 cálculos complexos (Consumo médio, tendência, gasto mensal, etc.)
    - [x] Frontend: Tela de Estatísticas com 4 seções
    - [x] Frontend: Estado de "Loading" durante a requisição
    - [x] Frontend: Listagem de Alertas
- [x] **Clima e Viagem (10 pontos):**
    - [x] Backend: Endpoint `GET /api/clima/:nomeCidade` (com 2 passos)
    - [x] Frontend: Tela de Clima
    - [x] Frontend: Seção 1: Clima da cidade do usuário
    - [x] Frontend: Seção 2: Busca de clima de outra cidade
    - [x] Frontend: Seção 3: Calculadora de viagem (com consumo médio pré-preenchido)

---

### Decisões Técnicas

* **Backend (Node.js + Express):** Escolhi o Express pela sua simplicidade e robustez para criar APIs RESTful. Todas as lógicas de negócio complexas, como validação de cadastro (com chamada de API externa) e processamento de estatísticas, foram centralizadas no backend. Isso mantém o frontend "limpo" e focado na exibição de dados. O `node-fetch` foi usado para a comunicação com as APIs externas (Brasil API).
* **Frontend (Vanilla JS):** Optei por JavaScript puro, HTML5 e CSS3 para cumprir os requisitos de um projeto leve e sem frameworks. A modularização do JS (um arquivo por tela) e um `auth.js` global facilitam a manutenção. O `localStorage` é usado para persistir a sessão do usuário (`usuarioLogado`) e os dados de abastecimento (`abastecimentos_user_{id}`), garantindo que os dados de cada usuário sejam isolados.
* **Assincronicidade e Erros:** Todas as chamadas de API (tanto internas para o backend quanto externas do backend para a Brasil API) usam `async/await` encapsulado em blocos `try/catch`. Isso garante que erros de rede ou da API sejam tratados de forma elegante e que o usuário receba um feedback claro, conforme as boas práticas (Dicas 16 e 17).

---

### Dificuldades Encontradas e Soluções

1.  **Integração de APIs no Backend:** O requisito de chamar a Brasil API (CEP) *durante* o cadastro de usuário exigiu que o endpoint `POST /api/usuario/cadastrar` fosse transformado em `async`.
    * **Solução:** Implementei a chamada `fetch` dentro do endpoint de cadastro, com um `try/catch` próprio para tratar erros de CEP inválido (retornando 400) separadamente de erros internos (500).

2.  **Validação de KM Crescente:** Garantir que a quilometragem do novo abastecimento fosse maior que a anterior foi um desafio de lógica no frontend.
    * **Solução:** No `submit` do `abastecimento.js`, eu primeiro busco todos os abastecimentos (`obterAbastecimentos`), ordeno por data para achar o último, pego a `ultimaKm` e comparo com a `kmAtual` do formulário, bloqueando o envio se for menor.

3.  **Estado da Aplicação (Loading/Erros):** Em Vanilla JS, gerenciar estados de "carregando" exige manipulação manual do DOM.
    * **Solução:** Na tela de Estatísticas, criei uma `div` de "loading" que é exibida (`style.display = 'block'`) antes da chamada à API (`async`) e ocultada (`style.display = 'none'`) quando os dados chegam e são renderizados. O `try/catch` garante que, em caso de erro, a `div` de loading exiba a mensagem de erro.