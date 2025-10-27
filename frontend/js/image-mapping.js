// Image Mapping Module
// Maps game names to their image paths

/**
 * Mapeamento de nomes de jogos para caminhos de imagens
 * A chave é o nome do jogo (normalizado para lowercase)
 * O valor é o caminho da imagem relativo à pasta frontend
 */
const GAME_IMAGE_MAP = {
  // Jogos com imagens correspondentes
  "the witcher 3: wild hunt": "images/the_witcher.jpg",
  "grand theft auto v": "images/gta_v.jpg",
  "red dead redemption 2": "images/red_dead_redemption2.jpg",
  "the legend of zelda: breath of the wild": "images/the_legend_of_zelda.jpg",
  "minecraft": "images/minecraft.jpg",
  "stardew valley": "images/stardew_valley.jpg",
  "portal 2": "images/portal2.jpg",
  "cyberpunk 2077": "images/cyberpunk.jpg",
  "a lenda do herói": "images/a_lenda_do_heroi.jpg",
  "enigma do medo": "images/enigma_do_medo.jpg",
  "horizon zero dawn": "images/horizon.jpg",
  "bloodborne": "images/bloodborne.jpg",
  "call of duty: modern warfare": "images/call_of_duty.jpg",
  "fallout 4": "images/fallout.jpg",
  "resident evil 7: biohazard": "images/resident_evil.jpg",

  // Novos jogos adicionados
  "half-life: alyx": "images/alyx.jpg",
  "among us": "images/among_us.jpg",
  "sekiro: shadows die twice": "images/sekiro.jpg",
  "the elder scrolls v: skyrim": "images/skyrim.jpg",
  "monster hunter: world": "images/monster_hunter.jpg",
  "persona 5 royal": "images/persona_royal.jpg",
  "yakuza: like a dragon": "images/like_a_dragon.jpg",

};

// Imagem padrão para jogos sem imagem específica
const DEFAULT_IMAGE = "images/default.jpg";

/**
 * Retorna o caminho da imagem para um jogo
 * @param {string} gameName - Nome do jogo
 * @returns {string} Caminho da imagem
 */
function getGameImage(gameName) {
  if (!gameName) {
    return DEFAULT_IMAGE;
  }

  // Normaliza o nome do jogo (lowercase, remove espaços extras)
  const normalizedName = gameName.toLowerCase().trim();

  // Procura correspondência exata
  if (GAME_IMAGE_MAP[normalizedName]) {
    return GAME_IMAGE_MAP[normalizedName];
  }

  // Procura correspondência parcial (caso o nome no banco seja ligeiramente diferente)
  for (const [key, value] of Object.entries(GAME_IMAGE_MAP)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }

  // Retorna imagem padrão se não encontrar correspondência
  return DEFAULT_IMAGE;
}

/**
 * Adiciona o campo 'imagem' a um objeto de jogo baseado no nome
 * @param {Object} jogo - Objeto do jogo
 * @returns {Object} Jogo com campo imagem adicionado
 */
function enrichGameWithImage(jogo) {
  if (!jogo) return jogo;

  // Se já tem imagem definida (diferente de undefined, null ou default), mantém
  if (jogo.imagem && jogo.imagem !== 'images/default.jpg') {
    return jogo;
  }

  // Usa o nome ou titulo do jogo para buscar a imagem
  const gameName = jogo.nome || jogo.titulo || '';
  jogo.imagem = getGameImage(gameName);

  return jogo;
}

/**
 * Processa um array de jogos e adiciona imagens a todos
 * @param {Array} jogos - Array de jogos
 * @returns {Array} Array de jogos com imagens
 */
function enrichGamesWithImages(jogos) {
  if (!Array.isArray(jogos)) return jogos;
  return jogos.map(jogo => enrichGameWithImage(jogo));
}
