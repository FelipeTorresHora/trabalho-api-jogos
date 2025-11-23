# 🎮 Script de Gerenciamento de Imagens de Jogos

Este script automatiza o processo de adicionar imagens para jogos no sistema Aventurem.

## 📋 O Que o Script Faz

1. Copia uma imagem de qualquer local do seu computador para `src/assets/images/`
2. Gera automaticamente um nome de arquivo adequado (snake_case)
3. Atualiza o arquivo `gameImages.json` com o mapeamento
4. Mantém tudo organizado e sem erros de digitação

## 🚀 Como Usar

### Passo 1: Abrir Terminal

Abra o terminal/PowerShell na pasta do projeto:

```bash
cd c:\Users\Felipe\Documents\facs\usa_web\a3\src\frontend-react
```

### Passo 2: Executar o Script

```bash
node scripts/add-game-image.js
```

### Passo 3: Responder as Perguntas

O script vai perguntar:

1. **Nome do jogo**: Digite exatamente como será cadastrado no Admin
   ```
   📝 Nome do jogo (ex: "Elden Ring"): Elden Ring
   ```

2. **Caminho da imagem**: Cole o caminho completo do arquivo
   ```
   📁 Caminho completo da imagem: C:\Downloads\elden_ring.jpg
   ```

### Passo 4: Criar o Jogo no Admin

Após o script finalizar:
1. Acesse o painel Admin
2. Crie um novo jogo
3. Use **exatamente** o mesmo nome que digitou no script
4. A imagem será carregada automaticamente!

## 📝 Exemplos Práticos

### Exemplo 1: Jogo Simples

```bash
node scripts/add-game-image.js

📝 Nome do jogo: God of War
📁 Caminho: C:\Downloads\god_of_war.png

✅ Imagem copiada: god_of_war.png
✅ Mapeamento atualizado!
```

### Exemplo 2: Jogo com Nome Composto

```bash
node scripts/add-game-image.js

📝 Nome do jogo: The Last of Us Part II
📁 Caminho: D:\Imagens\Games\tlou2.jpg

✅ Imagem copiada: the_last_of_us_part_ii.jpg
✅ Mapeamento atualizado!
```

### Exemplo 3: Atualizar Imagem Existente

```bash
node scripts/add-game-image.js

📝 Nome do jogo: Elden Ring
📁 Caminho: C:\nova_imagem_melhor.jpg

⚠️  Jogo "Elden Ring" já existe. Atualizando imagem...
✅ Imagem copiada: elden_ring.jpg
✅ Mapeamento atualizado!
```

## ⚠️ Cuidados Importantes

### 1. Nome Exato

O nome no script deve ser **exatamente igual** ao nome no Admin:

✅ **CORRETO:**
- Script: `Elden Ring`
- Admin: `Elden Ring`

❌ **ERRADO:**
- Script: `Elden Ring`
- Admin: `elden ring` (minúsculas)
- Admin: `EldenRing` (sem espaço)

### 2. Formatos Aceitos

Extensões permitidas:
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`

### 3. Caminhos no Windows

Você pode usar qualquer um destes formatos:

```bash
C:\Downloads\imagem.jpg           ✅
C:\\Downloads\\imagem.jpg         ✅
C:/Downloads/imagem.jpg           ✅
"C:\Downloads\imagem.jpg"         ✅
```

### 4. Caracteres Especiais

O script converte automaticamente:
- Acentos são removidos
- Espaços viram underscores
- Caracteres especiais são limpos

**Exemplos:**
- `Pokémon` → `pokemon.jpg`
- `Street Fighter II` → `street_fighter_ii.jpg`
- `The Witcher 3: Wild Hunt` → `the_witcher_3_wild_hunt.jpg`

## 🔍 Troubleshooting

### Problema: "Arquivo não encontrado"

**Causa:** Caminho da imagem está incorreto

**Solução:**
1. Clique com botão direito na imagem
2. Selecione "Copiar como caminho"
3. Cole no terminal (remove as aspas se necessário)

### Problema: "Extensão inválida"

**Causa:** Formato de imagem não suportado

**Solução:**
1. Converta a imagem para JPG ou PNG
2. Use um conversor online gratuito
3. Tente novamente

### Problema: Imagem não aparece no jogo

**Causa:** Nome no Admin diferente do nome no script

**Solução:**
1. Verifique o arquivo `gameImages.json`
2. Procure o nome exato que foi cadastrado
3. Edite o jogo no Admin para usar o nome correto

---

## 🌐 Upload via Interface Admin (Novo!)

Agora você também pode fazer upload de imagens diretamente pela interface web!

### Como Funciona:

1. **No Admin, clique em "Criar Novo Jogo"**
2. **Preencha o formulário normalmente**
3. **Clique no campo "Imagem do Jogo"**
4. **Selecione uma imagem do seu computador**
5. **Clique em "Salvar Jogo"**
6. **O navegador baixará automaticamente a imagem renomeada**
7. **Mova o arquivo baixado para `public/uploaded-games/`**
8. **Pronto! A imagem aparecerá automaticamente**

### Exemplo Prático:

**Jogo:** "FIFA 26"
**Imagem selecionada:** `cover.jpg`

**O sistema faz:**
1. Renomeia para: `fifa_26.jpg`
2. Faz download automático
3. Salva no localStorage: `"/uploaded-games/fifa_26.jpg"`

**Você faz:**
1. Move `fifa_26.jpg` (da pasta Downloads) para `public/uploaded-games/`
2. Recarrega a página
3. ✅ Imagem aparece!

### 🔧 Ferramentas de Debug

Na aba "Gerenciar Jogos", você encontra 2 botões úteis:

#### 1. 🔍 Debug Imagens

Clique neste botão para:
- Ver todos os mapeamentos salvos no navegador
- Verificar nomes esperados dos arquivos
- Identificar inconsistências

**Como usar:**
1. Clique em "🔍 Debug Imagens"
2. Abra o Console do navegador (F12)
3. Veja o relatório completo:

```
=== DEBUG: Dynamic Game Images ===
Total mappings: 2
Mappings:
  "FIFA 26" → /uploaded-games/fifa_26.jpg
    Expected filename: fifa_26.jpg
  "GTA VI" → /uploaded-games/gta_vi.jpg
    Expected filename: gta_vi.jpg
================================
```

#### 2. 🗑️ Limpar Mapeamentos

Use este botão quando:
- Arquivos foram renomeados incorretamente
- Caminhos estão errados
- Quer recomeçar do zero

**⚠️ CUIDADO:** Isso remove TODOS os mapeamentos salvos no navegador!

### 🐛 Troubleshooting - Upload Web

#### Problema: Imagem não aparece após mover para `public/uploaded-games/`

**Possíveis causas e soluções:**

**1. Nome do arquivo está incorreto**

✅ **Verificar:**
- Clique em "🔍 Debug Imagens"
- Veja no console qual é o nome esperado
- Compare com o nome do arquivo em `public/uploaded-games/`

**Exemplo:**
```
Console mostra: Expected filename: fifa_26.jpg
Arquivo salvo: fifa 26.jpg  ❌ (tem espaço!)
Solução: Renomear para: fifa_26.jpg
```

**2. Arquivo está na pasta errada**

✅ **Caminho correto:**
```
c:\Users\Felipe\Documents\facs\usa_web\a3\
  └── src\
      └── frontend-react\
          └── public\
              └── uploaded-games\    ← AQUI!
                  └── fifa_26.jpg
```

❌ **Caminhos errados:**
```
src\assets\images\          ❌ (pasta antiga)
src\uploaded-games\         ❌ (sem public/)
public\images\              ❌ (pasta errada)
```

**3. Servidor não reiniciado**

Após adicionar arquivo em `public/`, reinicie o servidor:

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

**4. Cache do navegador**

Limpe o cache:
- **Windows:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R
- Ou: F12 → Network → "Disable cache"

**5. localStorage tem caminho antigo**

Se você testou antes e salvou um caminho errado:

1. Clique em "🗑️ Limpar Mapeamentos"
2. Confirme a ação
3. Crie o jogo novamente com a imagem correta

#### Problema: Download não acontece ao salvar jogo

**Causa:** Navegador bloqueou download automático

**Solução:**
1. Verifique se o navegador pediu permissão
2. Autorize downloads do site
3. Tente salvar o jogo novamente

#### Problema: "Expected filename" diferente do que eu quero

**Explicação:** O sistema converte nomes para **snake_case** automaticamente:

- Remove acentos: `Pokémon` → `pokemon`
- Substitui espaços por `_`: `FIFA 26` → `fifa_26`
- Remove caracteres especiais: `FIFA: 26` → `fifa_26`

**Solução:** Isso é intencional e garante compatibilidade. Use o nome que o sistema gera.

### 📊 Fluxo Completo de Debug

Se a imagem não aparece, siga este checklist:

```
☐ 1. Cliquei em "🔍 Debug Imagens"
☐ 2. Verifiquei o console (F12)
☐ 3. Nome do arquivo corresponde ao "Expected filename"
☐ 4. Arquivo está em public/uploaded-games/
☐ 5. Reiniciei o servidor (npm run dev)
☐ 6. Limpei cache do navegador (Ctrl+Shift+R)
☐ 7. Recarreguei a página
```

Se ainda não funcionar:
1. Clique em "🗑️ Limpar Mapeamentos"
2. Delete o jogo no admin
3. Delete o arquivo de `public/uploaded-games/`
4. Comece novamente do zero

### 💡 Dicas para Upload Web

1. **Nome consistente:** Use o mesmo nome ao criar jogos similares
2. **Teste primeiro:** Crie um jogo de teste ("Teste 123") antes dos jogos reais
3. **Verifique sempre:** Clique em Debug após cada upload
4. **Organize downloads:** Crie uma pasta específica para as imagens baixadas automaticamente

## 📂 O Que Acontece Por Trás

### ANTES do script:

```
src/
├── assets/
│   └── images/
│       ├── cyberpunk.jpg
│       └── minecraft.jpg
└── data/
    └── gameImages.json
```

**gameImages.json:**
```json
{
  "Cyberpunk 2077": "cyberpunk.jpg",
  "Minecraft": "minecraft.jpg"
}
```

### Você executa:

```bash
node scripts/add-game-image.js
📝 Nome: Elden Ring
📁 Caminho: C:\Downloads\cover.jpg
```

### DEPOIS do script:

```
src/
├── assets/
│   └── images/
│       ├── cyberpunk.jpg
│       ├── elden_ring.jpg    ← NOVO!
│       └── minecraft.jpg
└── data/
    └── gameImages.json
```

**gameImages.json:**
```json
{
  "Cyberpunk 2077": "cyberpunk.jpg",
  "Elden Ring": "elden_ring.jpg",     ← NOVO!
  "Minecraft": "minecraft.jpg"
}
```

## 💡 Dicas

1. **Organize suas imagens:** Crie uma pasta `temp_images/` para baixar covers antes de adicionar
2. **Padronize nomes:** Sempre use o nome oficial do jogo
3. **Teste primeiro:** Adicione um jogo de teste para se familiarizar
4. **Backup:** O JSON é automaticamente organizado alfabeticamente

## 🆘 Suporte

Se tiver problemas:
1. Verifique se Node.js está instalado: `node --version`
2. Verifique se está na pasta correta: `pwd` (Linux/Mac) ou `cd` (Windows)
3. Veja o conteúdo de gameImages.json para confirmar

---

**Desenvolvido para Aventurem** 🎮
