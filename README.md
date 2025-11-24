# Aventurem - Loja de Jogos Digitais

Projeto de loja de jogos digitais desenvolvido com **React** (Frontend) e **Node.js/Express** (Backend).

## Estrutura do Projeto

```
a3/
├── src/
│   ├── backend/          # API Node.js + Express + SQLite
│   │   ├── controllers/  # Controladores da API
│   │   ├── routes/       # Rotas da API
│   │   ├── models/       # Modelos de dados
│   │   ├── daos/         # Data Access Objects
│   │   ├── middleware/   # Middlewares (auth, admin)
│   │   ├── services/     # Serviços
│   │   ├── .env          # Variáveis de ambiente
│   │   └── index.js      # Entrada da aplicação
│   │
│   └── frontend-react/   # Frontend React + Vite
│       ├── src/          # Código fonte React
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── store/    # Gerenciamento de estado (Zustand)
│       │   └── services/ # Comunicação com API
│       ├── public/
│       └── index.html
│
└── README.md             # Este arquivo
```

## Requisitos

- **Node.js** 18+ e npm
- **Navegador moderno** (Chrome, Firefox, Edge)
- **Editor de código** (VS Code recomendado)

## Instalação e Execução

### 1. Backend

O backend é responsável pela API e banco de dados.

```bash
cd src/backend
npm install
npm start
```

O backend estará disponível em: **http://localhost:3000**

### 2. Frontend

O frontend é uma aplicação React construída com Vite.

```bash
cd src/frontend-react
npm install
npm run dev
```

Acesse a aplicação em: **http://localhost:5173** (ou a porta indicada no terminal)

## Credenciais de Teste

A aplicação vem com usuários pré-cadastrados para teste:

**Usuário comum:**
- Email: admin@avjd.com
- Senha: admin123

**Administrador:**
- Email: cliente@avjd.com
- Senha: cliente123

Ou registre uma nova conta na tela de cadastro.

## Funcionalidades

### Para Usuários
- ✅ Cadastro e login
- ✅ Navegar catálogo de jogos
- ✅ Buscar e filtrar jogos
- ✅ Ver detalhes e avaliações
- ✅ Adicionar ao carrinho
- ✅ Lista de desejos
- ✅ Finalizar compra (Pix ou Cartão)
- ✅ Histórico de compras
- ✅ Avaliar jogos comprados
- ✅ Editar perfil
- ✅ Tema claro/escuro

### Para Administradores
- ✅ Dashboard com estatísticas
- ✅ Gerenciar usuários
- ✅ Gerenciar jogos
- ✅ Gerenciar empresas
- ✅ Visualizar vendas

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

### Frontend
- **React 19** - Biblioteca de UI
- **Vite** - Build tool
- **Zustand** - Gerenciamento de estado
- **React Router DOM** - Roteamento
- **React Hook Form** - Formulários
- **Axios** - Requisições HTTP
- **Chart.js** - Gráficos

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `PUT /auth/change-password` - Alterar senha

### Jogos
- `GET /jogos` - Listar jogos
- `GET /jogos/:id` - Buscar jogo
- `POST /jogos` - Criar jogo (admin)
- `PUT /jogos/:id` - Atualizar jogo (admin)
- `DELETE /jogos/:id` - Deletar jogo (admin)

### Carrinho
- `GET /carrinho` - Buscar carrinho
- `POST /carrinho/itens` - Adicionar item
- `PUT /carrinho/itens/:id` - Atualizar item
- `DELETE /carrinho/itens/:id` - Remover item
- `DELETE /carrinho` - Limpar carrinho

### Vendas
- `POST /vendas` - Finalizar compra
- `GET /vendas` - Histórico de compras
- `GET /vendas/:id` - Buscar venda

### Lista de Desejos
- `GET /lista-desejo` - Buscar lista
- `POST /lista-desejo` - Adicionar jogo
- `DELETE /lista-desejo/:id` - Remover jogo

### Avaliações
- `GET /avaliacoes/jogo/:id` - Listar avaliações
- `POST /avaliacoes` - Criar avaliação
- `DELETE /avaliacoes/:id` - Deletar avaliação

### Usuários (Admin)
- `GET /usuarios` - Listar usuários
- `GET /usuarios/:id` - Buscar usuário
- `POST /usuarios` - Criar usuário
- `PUT /usuarios/:id` - Atualizar usuário
- `DELETE /usuarios/:id` - Deletar usuário

### Perfil
- `GET /profiles/me` - Buscar perfil
- `PUT /profiles/me` - Atualizar perfil

### Empresas (Admin)
- `GET /empresas` - Listar empresas
- `GET /empresas/:id` - Buscar empresa
- `POST /empresas` - Criar empresa
- `PUT /empresas/:id` - Atualizar empresa
- `DELETE /empresas/:id` - Deletar empresa

## Configuração

### Backend (.env)

Crie um arquivo `.env` em `src/backend/` se não existir:

```env
DB_NAME="vendas_api.db"
APP_PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
```

## Scripts Disponíveis

### Backend (`src/backend`)

```bash
npm start              # Inicia servidor
npm run generate:jwt-secret  # Gera chave JWT
```

### Frontend (`src/frontend-react`)

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Visualizar build de produção
npm run lint     # Verificar código
```

## Licença

Este projeto foi desenvolvido para fins educacionais.
