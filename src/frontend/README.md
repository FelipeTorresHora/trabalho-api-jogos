# Aventurem - E-commerce de Jogos Digitais

Projeto frontend de e-commerce de jogos digitais desenvolvido com HTML, CSS e JavaScript puro. Demonstração inicial com dados fake para prototipagem.

## 🎮 Sobre o Projeto

Aventurem é uma plataforma de e-commerce para jogos digitais com design moderno em dark mode, utilizando uma paleta de cores em roxo lavanda (#BDB2FF) e tons de cinza escuro.

## 🚀 Funcionalidades

- ✅ Sistema de autenticação (login)
- ✅ Catálogo de jogos com busca
- ✅ Detalhes do jogo com galeria de imagens e avaliações
- ✅ Carrinho de compras com gerenciamento de quantidades
- ✅ Processo completo de checkout
- ✅ Histórico de compras
- ✅ Perfil do usuário editável
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ Persistência com localStorage

## 📁 Estrutura do Projeto

```
aventurem/
├── index.html              # Página de login
├── home.html               # Página inicial com catálogo
├── game-details.html       # Detalhes do jogo
├── cart.html               # Carrinho de compras
├── checkout.html           # Finalização de compra
├── history.html            # Histórico de pedidos
├── profile.html            # Perfil do usuário
├── css/
│   ├── global.css          # Estilos globais e design system
│   ├── login.css
│   ├── home.css
│   ├── game-details.css
│   ├── cart.css
│   ├── checkout.css
│   ├── history.css
│   └── profile.css
├── js/
│   ├── data.js             # Dados fake (jogos, usuários, pedidos)
│   ├── utils.js            # Funções utilitárias
│   ├── login.js
│   ├── home.js
│   ├── game-details.js
│   ├── cart.js
│   ├── checkout.js
│   ├── history.js
│   └── profile.js
├── images/
│   └── placeholder/        # Pasta para imagens
└── README.md
```

## 🎨 Design System

### Cores
- **Background Principal**: `#1E1E1E`
- **Background Secundário**: `#2C2C2E`
- **Cor Primária (Accent)**: `#BDB2FF`
- **Texto Principal**: `#FFFFFF`
- **Texto Secundário**: `#E0E0E0`
- **Cor de Erro**: `#FF5252`

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Títulos H1**: 24px, weight 600
- **Títulos H2**: 20px, weight 500
- **Corpo**: 16px, weight 400
- **Small**: 14px, weight 400

## 🔐 Credenciais de Teste

Para acessar o sistema, use as seguintes credenciais:

**Usuário 1:**
- Email: `joao@email.com`
- Senha: `123456`

**Usuário 2:**
- Email: `maria@email.com`
- Senha: `senha123`

## 🚀 Como Executar

1. Clone ou baixe o projeto
2. Abra o arquivo `index.html` em seu navegador
3. Use as credenciais de teste para fazer login
4. Navegue pelas páginas e teste as funcionalidades

**Nota**: Como o projeto usa apenas frontend, você pode simplesmente abrir o arquivo HTML no navegador. Não é necessário servidor local, mas é recomendado para evitar problemas com CORS.

### Opção com Servidor Local

Se preferir usar um servidor local:

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (http-server)
npx http-server

# Com PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## 📱 Funcionalidades Principais

### 1. Login
- Validação de formulário
- Mensagens de erro
- Redirecionamento automático

### 2. Home
- Catálogo de jogos em grid responsivo
- Busca por nome ou categoria
- Banner hero com jogo em destaque
- Adicionar ao carrinho direto da home

### 3. Detalhes do Jogo
- Galeria de imagens interativa
- Abas: Descrição e Avaliações
- Sistema de avaliações com estrelas
- Adicionar ao carrinho ou comprar agora

### 4. Carrinho
- Visualização de itens
- Ajuste de quantidade (+/-)
- Remoção de itens
- Cálculo automático de totais
- Estado vazio com mensagem

### 5. Checkout
- Formulário multi-seção
- Métodos de pagamento (Cartão/Pix)
- Campos condicionais
- Validação de formulário
- Formatação automática (CEP, telefone, cartão)

### 6. Histórico
- Lista de pedidos do usuário
- Status com badges coloridos
- Detalhes expansíveis
- Ordenação por data

### 7. Perfil
- Edição de dados pessoais
- Avatar do usuário
- Link para histórico
- Botão de logout

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização com variáveis CSS, Grid e Flexbox
- **JavaScript (ES6+)**: Lógica e interatividade
- **LocalStorage**: Persistência de dados
- **Google Fonts**: Tipografia (Inter)
- **Unsplash & Pravatar**: Imagens de demonstração

## 💾 Persistência de Dados

O projeto utiliza `localStorage` para armazenar:
- Sessão do usuário logado
- Itens do carrinho
- Pedidos realizados
- Dados do perfil

## 📦 Dados Fake

O arquivo `data.js` contém:
- **2 usuários** de teste
- **12 jogos** com preços, categorias, imagens e avaliações
- **3 pedidos** de histórico de exemplo

## 🎯 Próximos Passos (Sugestões)

Para evoluir este projeto para produção:

1. **Backend**:
   - Implementar API REST
   - Banco de dados (PostgreSQL/MongoDB)
   - Autenticação JWT
   - Upload de imagens

2. **Pagamento**:
   - Integração com gateway (Stripe, Mercado Pago)
   - Webhook de confirmação

3. **Funcionalidades**:
   - Sistema de avaliações real
   - Wishlist
   - Notificações
   - Sistema de cupons
   - Chat de suporte

4. **Otimização**:
   - Minificação de assets
   - Lazy loading de imagens
   - Service Worker (PWA)
   - Performance optimization

## 📄 Licença

Projeto desenvolvido para fins educacionais e demonstrativos.

## 👨‍💻 Autor

Desenvolvido seguindo a documentação de design fornecida.

---

**Aventurem** - Sua plataforma de jogos digitais 🎮
