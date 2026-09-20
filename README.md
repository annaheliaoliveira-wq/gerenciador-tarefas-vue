# Gerenciador de Tarefas (Vue.js) - Desenvolvimento Web III

Projeto web desenvolvido para a disciplina de **Desenvolvimento Web III**, evoluído para a **Unidade 4: Primeira interface Vue para o Gerenciador de Tarefas**.

---

## 🚀 Tecnologias Utilizadas

- **Node.js** com **Express.js**
- **Vue.js 3** (Interface reativa via CDN)
- **EJS** (Embedded JavaScript Templating)
- **Sequelize ORM** com **SQLite**
- **express-session** para gerenciamento de sessões do usuário
- **Fetch API** para comunicação assíncrona entre o front-end Vue e a API back-end

---

## 👥 Usuários de Teste para Avaliação

O sistema cria automaticamente os seguintes usuários no banco SQLite ao ser iniciado:

| Perfil | E-mail | Senha | Permissões |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@teste.com` | `admin123` | Acesso total, incluindo `/admin` e gerenciamento global |
| **Usuário Comum** | `user@teste.com` | `user123` | Acesso a `/`, `/vue` e às suas próprias tarefas (bloqueado em `/admin` - 403) |

---

## 🛠️ Instruções de Execução

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor:**
   ```bash
   npm start
   ```

   Ou em modo de desenvolvimento (com reinício automático):
   ```bash
   npm run dev
   ```

3. **Acessar a aplicação no navegador:**
   - Interface EJS: [http://localhost:3000](http://localhost:3000)
   - Interface Vue.js: [http://localhost:3000/vue](http://localhost:3000/vue)

---

## 📋 Funcionalidades da Interface Vue (`/vue`)

- Página `vue-tarefas.html` localizada na pasta `public/` e servida pela rota protegida `/vue`.
- Mensagem de boas-vindas exibindo o nome do usuário autenticado.
- Área de carregamento durante a requisição de dados.
- Listagem dinâmica de tarefas utilizando a diretiva `v-for`.
- Mensagem condicional com `v-if` quando o usuário não possui tarefas cadastradas.
- Formulário reativo com `v-model` para título e descrição de novas tarefas.
- Método assíncrono para carregar as tarefas via Fetch API (`GET /api/tarefas`).
- Método assíncrono para cadastro de tarefas via Fetch API (`POST /api/tarefas`).
- Método para alternância imediata do status da tarefa (`POST /api/tarefas/:id/toggle`).
- Tratamento amigável de erros na interface através de alertas visuais reativos.

---

## 🛡️ Rotas do Sistema

- **Autenticação:**
  - `GET /login` - Tela de login.
  - `POST /login` - Validação de credenciais e criação de sessão.
  - `GET /logout` - Encerramento de sessão.
- **Interfaces:**
  - `GET /` - Interface base renderizada com EJS.
  - `GET /vue` - Interface reativa construída com Vue.js 3 (requer login).
- **API REST (Consumida pelo Vue.js):**
  - `GET /api/tarefas` - Retorna a lista de tarefas do usuário conectado em formato JSON.
  - `POST /api/tarefas` - Cadastra uma nova tarefa no banco de dados.
  - `POST /api/tarefas/:id/toggle` - Alterna o status de conclusão da tarefa.
  - `POST /api/tarefas/:id/delete` - Remove a tarefa do banco de dados.
- **Painel Administrativo:**
  - `GET /admin` - Painel de métricas e listagem global restrito para administradores (403 para usuários comuns).
