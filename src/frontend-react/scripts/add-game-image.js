const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Função para converter nome em filename (snake_case)
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '_') // Substitui caracteres especiais por _
    .replace(/^_+|_+$/g, ''); // Remove _ do início e fim
}

async function main() {
  console.log('\n🎮 Adicionar Imagem de Jogo\n');
  console.log('Este script vai copiar uma imagem e atualizar o mapeamento automaticamente.\n');

  try {
    // 1. Solicitar nome do jogo
    const gameName = await question('📝 Nome do jogo (ex: "Elden Ring"): ');

    if (!gameName || gameName.trim() === '') {
      console.error('❌ Nome do jogo é obrigatório!');
      rl.close();
      return;
    }

    // 2. Solicitar caminho da imagem
    const imagePath = await question('📁 Caminho completo da imagem: ');

    if (!imagePath || imagePath.trim() === '') {
      console.error('❌ Caminho da imagem é obrigatório!');
      rl.close();
      return;
    }

    // Fechar interface de input
    rl.close();

    // 3. Verificar se arquivo existe
    const sourceImagePath = imagePath.trim().replace(/['"]/g, ''); // Remove aspas

    if (!fs.existsSync(sourceImagePath)) {
      console.error(`❌ Erro: Arquivo não encontrado em "${sourceImagePath}"`);
      return;
    }

    // 4. Validar extensão
    const ext = path.extname(sourceImagePath).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    if (!allowedExtensions.includes(ext)) {
      console.error(`❌ Erro: Extensão inválida "${ext}". Use: ${allowedExtensions.join(', ')}`);
      return;
    }

    // 5. Gerar nome do arquivo
    const baseFileName = toSnakeCase(gameName.trim());
    const imageFileName = `${baseFileName}${ext}`;

    // 6. Definir caminhos
    const projectRoot = path.join(__dirname, '..');
    const destImagePath = path.join(projectRoot, 'src', 'assets', 'images', imageFileName);
    const jsonPath = path.join(projectRoot, 'src', 'data', 'gameImages.json');

    // 7. Copiar imagem
    console.log('\n📁 Copiando imagem...');
    fs.copyFileSync(sourceImagePath, destImagePath);
    console.log(`   ✅ ${imageFileName} copiada para src/assets/images/`);

    // 8. Atualizar JSON
    console.log('\n📄 Atualizando gameImages.json...');

    // Ler JSON atual
    let gameImages = {};
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      gameImages = JSON.parse(jsonContent);
    }

    // Verificar se jogo já existe
    if (gameImages[gameName.trim()]) {
      console.log(`   ⚠️  Jogo "${gameName.trim()}" já existe. Atualizando imagem...`);
    }

    // Adicionar/atualizar mapeamento
    gameImages[gameName.trim()] = imageFileName;

    // Ordenar alfabeticamente (opcional, para manter organizado)
    const sortedGameImages = Object.keys(gameImages)
      .sort()
      .reduce((acc, key) => {
        acc[key] = gameImages[key];
        return acc;
      }, {});

    // Salvar JSON (formatado)
    fs.writeFileSync(jsonPath, JSON.stringify(sortedGameImages, null, 2), 'utf8');
    console.log('   ✅ Mapeamento atualizado!');

    // 9. Mensagem de sucesso
    console.log('\n🎉 SUCESSO!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Próximos passos:\n');
    console.log(`   1. Vá ao painel Admin no navegador`);
    console.log(`   2. Crie um novo jogo com o nome:`);
    console.log(`      "${gameName.trim()}"`);
    console.log(`   3. A imagem "${imageFileName}" será`);
    console.log(`      usada automaticamente!`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    rl.close();
  }
}

// Executar
main();
