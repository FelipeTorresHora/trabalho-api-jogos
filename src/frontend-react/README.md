# Aventurem - Frontend React

> Loja de Jogos Digitais - Frontend desenvolvido em React com Vite

## 📋 Sobre o Projeto

Aventurem é uma plataforma completa de e-commerce de jogos digitais desenvolvida em React. O projeto foi migrado de HTML/CSS/JS vanilla para React, mantendo todas as funcionalidades do sistema original.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Chart.js** - Gráficos (painel admin)
- **Date-fns** - Manipulação de datas

## ⚙️ Configuração e Instalação

### Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- Backend da aplicação rodando (porta 3000)

### Instalação

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente**:
   O arquivo `.env` já está criado com as configurações padrão:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

3. **Inicie o backend**:
   ```bash
   cd ../backend
   npm install
   npm start
   ```

4. **Inicie o frontend**:
   ```bash
   npm run dev
   ```
   O frontend estará disponível em `http://localhost:5173`

## 📱 Funcionalidades

### Usuário
- ✅ Autenticação (Login/Registro)
- ✅ Catálogo de jogos com busca e filtros
- ✅ Detalhes do jogo com avaliações
- ✅ Carrinho de compras
- ✅ Lista de desejos
- ✅ Checkout com múltiplas formas de pagamento
- ✅ Perfil e histórico de compras
- ✅ Temas (Dark/Classic Nintendo)

### Administrador
- ✅ Dashboard com gráficos
- ✅ CRUD de Jogos
- ✅ CRUD de Empresas
- ✅ Gestão de Usuários
- ✅ Relatórios de vendas

## 📦 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

## 🛣️ Rotas

### Públicas
- `/` - Login
- `/register` - Cadastro

### Protegidas
- `/home` - Catálogo
- `/game/:id` - Detalhes do jogo
- `/cart` - Carrinho
- `/checkout` - Finalização de compra
- `/profile` - Perfil
- `/history` - Histórico

### Admin
- `/admin` - Painel administrativo

## 🔐 Autenticação

Sistema JWT com token armazenado no localStorage.

---

**Aventurem** - Loja de Jogos Digitais 🎮
