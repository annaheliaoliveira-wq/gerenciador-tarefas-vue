# Gerenciador de Tarefas (Vue.js) — Desenvolvimento Web III

Projeto desenvolvido durante a disciplina de Desenvolvimento Web III, utilizando Node.js, Express, Vue.js e banco de dados SQLite. O sistema permite o gerenciamento de tarefas, autenticação de usuários e integração entre o cliente e o servidor por meio de uma API REST.

## Tecnologias utilizadas

- Node.js
- Express
- Vue.js 3
- Vue Router 4
- JavaScript
- HTML5 e CSS3
- EJS para renderização de páginas no servidor (SSR)
- Sequelize ORM
- SQLite
- Fetch API
- API REST
- JSON Web Token (JWT)
- sessionStorage
- express-session

## Funcionalidades

- Autenticação de usuários.
- Gerenciamento de tarefas.
- Listagem e visualização de tarefas.
- Criação, edição e exclusão de registros, conforme as funcionalidades implementadas.
- Controle de acesso a funcionalidades administrativas.
- Navegação entre páginas utilizando Vue.js e Vue Router.
- Comunicação entre o cliente e o servidor por meio de requisições HTTP.

## Como executar o projeto

### 1. Pré-requisitos

É necessário ter o Node.js e o npm instalados no computador.

### 2. Clonar o repositório

```bash
git clone https://github.com/annaheliaoliveira-wq/gerenciador-tarefas-vue.git
```

### 3. Acessar a pasta do projeto

```bash
cd gerenciador-tarefas-vue
```

### 4. Instalar as dependências

```bash
npm install
```

### 5. Executar o servidor

```bash
npm start
```

Se o projeto utilizar outro comando definido no `package.json`, execute o comando correspondente.

### 6. Acessar a aplicação

Abra o navegador e acesse:

- Aplicação: http://localhost:3000
- Interface Vue: http://localhost:3000/vue

A disponibilidade de cada endereço depende das rotas configuradas no servidor.

## Unidade 4 — Desenvolvimento da aplicação

Nesta etapa, foram desenvolvidas funcionalidades do sistema de gerenciamento de tarefas, incluindo a estrutura do servidor, o acesso ao banco de dados e a interação com os registros da aplicação.

## Unidade 6 — Aplicação de Página Única (SPA)

Nesta etapa, o projeto começou a utilizar uma Single Page Application (SPA), com Vue.js e Vue Router, permitindo navegar entre páginas sem recarregar toda a aplicação.

A estrutura da SPA está no arquivo `public/spa.html`.

Entre as páginas e funcionalidades previstas no projeto estão:

- Inicial.
- Detalhes.
- Login.
- Administração de objetos.
- Administração de usuários.
- Informações sobre o autor.

## Unidade 7 — Integração do cliente com o servidor

Nesta etapa, o cliente foi integrado à API REST do servidor, com autenticação por token JWT e comunicação por meio da Fetch API.

### Login e autenticação

- Formulário de login integrado ao endpoint `POST /login`.
- Tratamento de erros de autenticação e exibição de mensagens ao usuário.
- Armazenamento do token JWT na `sessionStorage` após o login bem-sucedido.
- Utilização do token nas requisições autenticadas.
- Redirecionamento para a área administrativa após o login.

### Administração

A aplicação utiliza uma SPA para organizar a navegação entre as páginas administrativas.

As funcionalidades de administração integram o cliente aos endpoints da API REST para gerenciar tarefas e usuários, conforme as operações implementadas no servidor.

### Lista de objetos

A atividade também prevê transformar a lista de objetos em uma SPA, com navegação entre páginas de resultados e visualização dos detalhes de cada objeto.

### API REST

A aplicação utiliza endpoints HTTP para autenticação e operações sobre os dados. As rotas administrativas devem respeitar as regras de autenticação e autorização definidas pelo servidor.

### Controle de versão

As alterações da Unidade 7 foram desenvolvidas na branch `integracao` e, posteriormente, mescladas à branch principal `main`.

## Repositório

GitHub: https://github.com/annaheliaoliveira-wq/gerenciador-tarefas-vue

## Autor

**Anna Hélia de Sousa Oliveira**

Estudante de Informática para Internet no Instituto Federal do Ceará (IFCE) — Campus Limoeiro do Norte.

- Ensino Médio completo — Escola Agrotécnica Federal de Iguatu – CE (2026).
- Técnico em Informática para Internet — IFCE, Campus Limoeiro do Norte (em andamento).

