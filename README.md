# Aventurem - Loja de Jogos Digitais

Projeto de loja de jogos digitais com frontend em HTML/JavaScript e backend em Node.js/Express.

## Estrutura do Projeto

```
a3/
├── backend/          # API Node.js + Express + SQLite
│   ├── controllers/  # Controladores da API
│   ├── routes/       # Rotas da API
│   ├── models/       # Modelos de dados
│   ├── daos/         # Data Access Objects
│   ├── middleware/   # Middlewares (auth, admin)
│   ├── services/     # Serviços
│   ├── .env          # Variáveis de ambiente
│   └── index.js      # Entrada da aplicação
│
├── frontend/         # Frontend HTML/JS
│   ├── css/          # Estilos
│   ├── js/           # Scripts
│   │   ├── config.js # Configuração da API
│   │   ├── api.js    # Módulo de comunicação com API
│   │   ├── utils.js  # Utilitários
│   │   └── *.js      # Scripts das páginas
│   ├── images/       # Imagens
│   └── *.html        # Páginas HTML
│
├── INTEGRACAO.md     # Guia de integração (LEIA PRIMEIRO!)
└── README.md         # Este arquivo
```

## Requisitos

- **Node.js** 18+ e npm
- **Navegador moderno** (Chrome, Firefox, Edge)
- **Editor de código** (VS Code recomendado)

## Instalação Rápida

### 1. Backend

```bash
cd backend
npm install
npm start
```

O backend estará disponível em: **http://localhost:3000**

### 2. Frontend

#### Opção A: VS Code Live Server (Recomendado)
1. Instale a extensão "Live Server" no VS Code
2. Abra `frontend/index.html`
3. Clique com botão direito > "Open with Live Server"

#### Opção B: Servidor HTTP Python
```bash
cd frontend
python -m http.server 8000
```
Acesse: **http://localhost:8000**

#### Opção C: Abrir diretamente
Abra `frontend/index.html` no navegador (pode ter problemas de CORS)

## Credenciais de Teste

A aplicação vem com usuários pré-cadastrados para teste:

**Usuário comum:**
- Email: `joao@email.com`
- Senha: `123456`

**Administrador:**
- Email: `admin@email.com`
- Senha: `admin123`

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

## Integração Frontend ↔ Backend

Para informações detalhadas sobre como a integração funciona, consulte:

**📄 [INTEGRACAO.md](INTEGRACAO.md)** - Guia completo de integração

Este documento contém:
- Como iniciar backend e frontend
- Estrutura da API
- Como integrar cada arquivo JavaScript
- Exemplos de código
- Mapeamento de campos
- Troubleshooting

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilos
- **JavaScript (ES6+)** - Lógica
- **Fetch API** - Requisições HTTP
- **LocalStorage** - Armazenamento local
- **Chart.js** - Gráficos (admin)

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

```env
DB_NAME="vendas_api.db"
APP_PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
```

### Frontend (js/config.js)

```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  TIMEOUT: 30000,
  DEBUG: true
};
```

## Desenvolvimento

### Adicionar novo endpoint no backend

1. Criar controller em `backend/controllers/`
2. Criar rota em `backend/routes/`
3. Adicionar rota em `backend/routes/v1.js`
4. (Opcional) Criar serviço no frontend `frontend/js/api.js`

### Adicionar nova página no frontend

1. Criar HTML em `frontend/*.html`
2. Criar CSS em `frontend/css/*.css`
3. Criar JS em `frontend/js/*.js`
4. Incluir scripts necessários (config.js, api.js, utils.js)

## Scripts Disponíveis

### Backend

```bash
npm start              # Inicia servidor com nodemon
npm run generate:jwt-secret  # Gera chave JWT
```

## Troubleshooting

### Backend não inicia
- Verifique se o arquivo `.env` existe
- Certifique-se de que a porta 3000 está livre
- Execute `npm install` novamente

### Erro de CORS no frontend
- Verifique se o backend está rodando
- Confira se o middleware CORS está configurado
- Use Live Server em vez de abrir o HTML diretamente

### Login não funciona
- Verifique se o backend está rodando
- Abra o Console do navegador (F12) e veja os erros
- Confira se a URL da API está correta em `config.js`

### Dados não aparecem
- Verifique se você está logado
- Confira se o token JWT não expirou
- Veja o Console do navegador para erros

## Testando a API

Use a collection do Postman incluída:
```
backend/Digital Game Store API.postman_collection.json
```

Importe no Postman e teste todos os endpoints.

## Próximos Passos

1. ✅ Backend e frontend configurados
2. ⏳ Completar integração de todos os arquivos JavaScript
3. ⏳ Testar todas as funcionalidades
4. ⏳ Ajustar estilos e UX
5. ⏳ Deploy em produção

Consulte **[INTEGRACAO.md](INTEGRACAO.md)** para continuar a integração.

## Licença

Este projeto foi desenvolvido para fins educacionais.

## Autor

Desenvolvido para o curso de Faculdade.

---

**Importante:** Leia o arquivo [INTEGRACAO.md](INTEGRACAO.md) para entender como conectar o frontend ao backend!
