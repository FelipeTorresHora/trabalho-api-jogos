// Aventurem - Fake Data for Demonstration

// Fake Users
const users = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    password: "123456",
    phone: "(11) 98765-4321",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "user"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    password: "senha123",
    phone: "(21) 91234-5678",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "user"
  },
  {
    id: 3,
    name: "Administrador",
    email: "admin@email.com",
    password: "admin123",
    phone: "(11) 99999-9999",
    avatar: "https://i.pravatar.cc/150?img=33",
    role: "admin"
  },
  {
    id: 4,
    name: "Pedro Oliveira",
    email: "pedro@email.com",
    password: "123456",
    phone: "(31) 97777-8888",
    avatar: "https://i.pravatar.cc/150?img=15",
    role: "user"
  },
  {
    id: 5,
    name: "Ana Costa",
    email: "ana@email.com",
    password: "senha123",
    phone: "(41) 96666-5555",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "user"
  }
];

// Fake Games
const games = [
  {
    id: 1,
    title: "Cyber Legends",
    price: 89.99,
    rating: 4.8,
    platform: "PC",
    category: "Ação",
    brand: "Cyber Studios",
    featured: true,
    images: [
      "images/cyber_legends.jpg"
    ],
    description: "Entre em um mundo futurista onde a tecnologia e a ação se encontram. Cyber Legends oferece uma experiência de jogo única com gráficos impressionantes, combates intensos e uma história envolvente que vai te prender do início ao fim. Explore cidades neon, enfrente inimigos cibernéticos e descubra os segredos de um futuro distópico.",
    reviews: [
      {
        id: 1,
        userId: 1,
        userName: "João Silva",
        userAvatar: "https://i.pravatar.cc/150?img=12",
        rating: 5,
        comment: "Jogo incrível! Os gráficos são de tirar o fôlego e a jogabilidade é viciante. Recomendo!",
        date: "2024-01-15"
      },
      {
        id: 2,
        userId: 2,
        userName: "Maria Santos",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        rating: 4,
        comment: "Muito bom, mas poderia ter mais missões secundárias. De qualquer forma, vale cada centavo!",
        date: "2024-01-10"
      },
      {
        id: 3,
        userId: 4,
        userName: "Pedro Oliveira",
        userAvatar: "https://i.pravatar.cc/150?img=15",
        rating: 5,
        comment: "Simplesmente espetacular! A história me prendeu do início ao fim.",
        date: "2024-01-22"
      }
    ]
  },
  {
    id: 2,
    title: "GTA V",
    price: 59.99,
    rating: 4.9,
    platform: "PC",
    category: "Ação",
    brand: "Rockstar Games",
    featured: false,
    images: [
      "images/gta_v.jpg"
    ],
    description: "Grand Theft Auto V é um jogo de ação-aventura em mundo aberto desenvolvido pela Rockstar North. O jogo se passa no estado ficcional de San Andreas, baseado no sul da Califórnia. A história em modo individual segue três criminosos e seus esforços para cometerem assaltos sob a pressão de uma agência governamental.",
    reviews: [
      {
        id: 4,
        userId: 1,
        userName: "João Silva",
        userAvatar: "https://i.pravatar.cc/150?img=12",
        rating: 5,
        comment: "Clássico absoluto! Nunca canso de jogar.",
        date: "2024-01-20"
      },
      {
        id: 5,
        userId: 5,
        userName: "Ana Costa",
        userAvatar: "https://i.pravatar.cc/150?img=9",
        rating: 5,
        comment: "Um dos melhores jogos de mundo aberto que já joguei. Imperdível!",
        date: "2024-01-25"
      }
    ]
  },
  {
    id: 3,
    title: "The Witcher 3",
    price: 79.90,
    rating: 4.9,
    platform: "PC",
    category: "RPG",
    brand: "CD Projekt Red",
    featured: true,
    images: [
      "images/the_witcher.jpg"
    ],
    description: "The Witcher 3: Wild Hunt é um RPG de ação em mundo aberto baseado em uma série de livros de fantasia. Você é Geralt de Rívia, um caçador de monstros mercenário. À sua frente jaz um vasto mundo aberto repleto de mercadores, feiticeiros, caçadores e soldados.",
    reviews: [
      {
        id: 6,
        userId: 2,
        userName: "Maria Santos",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        rating: 5,
        comment: "Obra-prima! História envolvente e mundo gigantesco para explorar.",
        date: "2024-01-18"
      },
      {
        id: 7,
        userId: 4,
        userName: "Pedro Oliveira",
        userAvatar: "https://i.pravatar.cc/150?img=15",
        rating: 5,
        comment: "Melhor RPG que já joguei. Cada quest é uma aventura única.",
        date: "2024-01-19"
      }
    ]
  },
  {
    id: 4,
    title: "Red Dead Redemption 2",
    price: 99.90,
    rating: 4.8,
    platform: "PC",
    category: "Ação",
    brand: "Rockstar Games",
    featured: false,
    images: [
      "images/red_dead_redemption.jpg"
    ],
    description: "Red Dead Redemption 2 é um jogo eletrônico de ação-aventura ambientado no Velho Oeste americano. A história se concentra em Arthur Morgan, um fora-da-lei e membro da gangue Van der Linde.",
    reviews: [
      {
        id: 8,
        userId: 5,
        userName: "Ana Costa",
        userAvatar: "https://i.pravatar.cc/150?img=9",
        rating: 5,
        comment: "Narrativa cinematográfica impressionante. Um jogo que emociona.",
        date: "2024-01-21"
      }
    ]
  },
  {
    id: 5,
    title: "Minecraft",
    price: 39.90,
    rating: 4.7,
    platform: "PC",
    category: "Aventura",
    brand: "Mojang Studios",
    featured: false,
    images: [
      "images/minecraft.jpg"
    ],
    description: "Minecraft é um jogo de mundo aberto que permite aos jogadores explorar, construir e sobreviver em um mundo gerado proceduralmente feito de blocos.",
    reviews: [
      {
        id: 9,
        userId: 4,
        userName: "Pedro Oliveira",
        userAvatar: "https://i.pravatar.cc/150?img=15",
        rating: 5,
        comment: "Criatividade sem limites! Perfeito para relaxar e construir.",
        date: "2024-01-23"
      }
    ]
  },
  {
    id: 6,
    title: "Elden Ring",
    price: 149.90,
    rating: 4.6,
    platform: "PC",
    category: "RPG",
    brand: "FromSoftware",
    featured: false,
    images: [
      "images/eldenring.jpg"
    ],
    description: "Elden Ring é um RPG de ação em um vasto mundo criado por Hidetaka Miyazaki e George R. R. Martin. Explore as Terras Intermédias, um novo mundo de fantasia.",
    reviews: [
      {
        id: 10,
        userId: 2,
        userName: "Maria Santos",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        rating: 4,
        comment: "Desafiador mas recompensador. Para quem gosta de Souls-like.",
        date: "2024-01-24"
      }
    ]
  },
  {
    id: 7,
    title: "Cyberpunk 2077",
    price: 129.90,
    rating: 4.3,
    platform: "PC",
    category: "RPG",
    brand: "CD Projekt Red",
    featured: false,
    images: [
      "images/cyberpunk.jpg"
    ],
    description: "Cyberpunk 2077 é um RPG de ação e aventura em mundo aberto que se passa em Night City, uma megalópole perigosa onde todos são obcecados por poder, glamour e alterações corporais.",
    reviews: [
      {
        id: 11,
        userId: 5,
        userName: "Ana Costa",
        userAvatar: "https://i.pravatar.cc/150?img=9",
        rating: 4,
        comment: "Melhorou muito com as atualizações. Vale a pena jogar agora!",
        date: "2024-01-26"
      }
    ]
  },
  {
    id: 8,
    title: "God of War",
    price: 119.90,
    rating: 4.9,
    platform: "PC",
    category: "Ação",
    brand: "Santa Monica Studio",
    featured: true,
    images: [
      "images/god_of_war.jpg"
    ],
    description: "God of War é um jogo de ação-aventura que acompanha Kratos e seu filho Atreus em uma jornada épica através dos reinos nórdicos.",
    reviews: [
      {
        id: 12,
        userId: 1,
        userName: "João Silva",
        userAvatar: "https://i.pravatar.cc/150?img=12",
        rating: 5,
        comment: "Obra-prima absoluta! História emocionante e combate perfeito.",
        date: "2024-01-27"
      }
    ]
  },
  {
    id: 9,
    title: "Horizon Zero Dawn",
    price: 79.90,
    rating: 4.7,
    platform: "PC",
    category: "Aventura",
    brand: "Guerrilla Games",
    featured: false,
    images: [
      "images/horizon.jpg"
    ],
    description: "Horizon Zero Dawn é um jogo de RPG de ação em mundo aberto ambientado em um futuro pós-apocalíptico onde máquinas gigantes dominam a Terra.",
    reviews: [
      {
        id: 13,
        userId: 4,
        userName: "Pedro Oliveira",
        userAvatar: "https://i.pravatar.cc/150?img=15",
        rating: 5,
        comment: "Mundo fascinante e protagonista carismática. Adorei!",
        date: "2024-01-28"
      }
    ]
  },
  {
    id: 10,
    title: "Dark Souls III",
    price: 69.90,
    rating: 4.5,
    platform: "PC",
    category: "RPG",
    brand: "FromSoftware",
    featured: false,
    images: [
      "images/darksouls.jpg"
    ],
    description: "Dark Souls III é um RPG de ação que oferece combates intensos, exploração atmosférica e um nível de dificuldade desafiador.",
    reviews: []
  },
  {
    id: 11,
    title: "Assassin's Creed Valhalla",
    price: 99.90,
    rating: 4.4,
    platform: "PC",
    category: "Aventura",
    brand: "Ubisoft",
    featured: false,
    images: [
      "images/assasins_creed.jpg"
    ],
    description: "Torne-se Eivor, um lendário viking em busca de glória. Explore a Inglaterra da Era das Trevas e construa seu próprio assentamento.",
    reviews: []
  },
  {
    id: 12,
    title: "Spider-Man Remastered",
    price: 109.90,
    rating: 4.8,
    platform: "PC",
    category: "Ação",
    brand: "Insomniac Games",
    featured: true,
    images: [
      "images/spider_man.jpg"
    ],
    description: "Marvel's Spider-Man Remastered traz a aventura icônica para o PC com gráficos aprimorados e recursos adicionais.",
    reviews: [
      {
        id: 14,
        userId: 2,
        userName: "Maria Santos",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        rating: 5,
        comment: "Melhor jogo de super-herói já feito! A movimentação é perfeita.",
        date: "2024-01-29"
      }
    ]
  }
];

// Fake Orders (Purchase History) - All delivered
const orders = [
  // João's orders
  {
    id: 12345,
    userId: 1,
    date: "2024-01-15",
    orderTime: "2024-01-15T14:30:25",
    paymentMethod: "card",
    status: "Entregue",
    total: 149.98,
    items: [
      {
        gameId: 1,
        gameTitle: "Cyber Legends",
        platform: "PC",
        quantity: 1,
        price: 89.99
      },
      {
        gameId: 2,
        gameTitle: "GTA V",
        platform: "PC",
        quantity: 1,
        price: 59.99
      }
    ]
  },
  {
    id: 12344,
    userId: 1,
    date: "2024-01-10",
    orderTime: "2024-01-10T10:15:42",
    paymentMethod: "pix",
    status: "Entregue",
    total: 79.90,
    items: [
      {
        gameId: 3,
        gameTitle: "The Witcher 3",
        platform: "PC",
        quantity: 1,
        price: 79.90
      }
    ]
  },
  {
    id: 12343,
    userId: 1,
    date: "2024-01-27",
    orderTime: "2024-01-27T18:45:10",
    paymentMethod: "card",
    status: "Entregue",
    total: 119.90,
    items: [
      {
        gameId: 8,
        gameTitle: "God of War",
        platform: "PC",
        quantity: 1,
        price: 119.90
      }
    ]
  },
  // Maria's orders
  {
    id: 12346,
    userId: 2,
    date: "2024-01-12",
    orderTime: "2024-01-12T09:20:15",
    paymentMethod: "pix",
    status: "Entregue",
    total: 149.90,
    items: [
      {
        gameId: 6,
        gameTitle: "Elden Ring",
        platform: "PC",
        quantity: 1,
        price: 149.90
      }
    ]
  },
  {
    id: 12347,
    userId: 2,
    date: "2024-01-29",
    orderTime: "2024-01-29T16:30:00",
    paymentMethod: "card",
    status: "Entregue",
    total: 109.90,
    items: [
      {
        gameId: 12,
        gameTitle: "Spider-Man Remastered",
        platform: "PC",
        quantity: 1,
        price: 109.90
      }
    ]
  },
  // Pedro's orders
  {
    id: 12348,
    userId: 4,
    date: "2024-01-19",
    orderTime: "2024-01-19T11:00:00",
    paymentMethod: "card",
    status: "Entregue",
    total: 169.80,
    items: [
      {
        gameId: 3,
        gameTitle: "The Witcher 3",
        platform: "PC",
        quantity: 1,
        price: 79.90
      },
      {
        gameId: 1,
        gameTitle: "Cyber Legends",
        platform: "PC",
        quantity: 1,
        price: 89.99
      }
    ]
  },
  {
    id: 12349,
    userId: 4,
    date: "2024-01-23",
    orderTime: "2024-01-23T14:20:00",
    paymentMethod: "pix",
    status: "Entregue",
    total: 119.80,
    items: [
      {
        gameId: 5,
        gameTitle: "Minecraft",
        platform: "PC",
        quantity: 1,
        price: 39.90
      },
      {
        gameId: 9,
        gameTitle: "Horizon Zero Dawn",
        platform: "PC",
        quantity: 1,
        price: 79.90
      }
    ]
  },
  // Ana's orders
  {
    id: 12350,
    userId: 5,
    date: "2024-01-21",
    orderTime: "2024-01-21T10:45:00",
    paymentMethod: "card",
    status: "Entregue",
    total: 99.90,
    items: [
      {
        gameId: 4,
        gameTitle: "Red Dead Redemption 2",
        platform: "PC",
        quantity: 1,
        price: 99.90
      }
    ]
  },
  {
    id: 12351,
    userId: 5,
    date: "2024-01-25",
    orderTime: "2024-01-25T15:10:00",
    paymentMethod: "pix",
    status: "Entregue",
    total: 189.89,
    items: [
      {
        gameId: 2,
        gameTitle: "GTA V",
        platform: "PC",
        quantity: 1,
        price: 59.99
      },
      {
        gameId: 7,
        gameTitle: "Cyberpunk 2077",
        platform: "PC",
        quantity: 1,
        price: 129.90
      }
    ]
  }
];

// Fake Companies
const companies = [
  {
    id: 1,
    name: "Rockstar Games",
    country: "Estados Unidos",
    foundedYear: 1998,
    website: "https://www.rockstargames.com"
  },
  {
    id: 2,
    name: "CD Projekt Red",
    country: "Polônia",
    foundedYear: 2002,
    website: "https://www.cdprojektred.com"
  },
  {
    id: 3,
    name: "Santa Monica Studio",
    country: "Estados Unidos",
    foundedYear: 2005,
    website: "https://sms.playstation.com"
  },
  {
    id: 4,
    name: "FromSoftware",
    country: "Japão",
    foundedYear: 1986,
    website: "https://www.fromsoftware.jp"
  },
  {
    id: 5,
    name: "Mojang Studios",
    country: "Suécia",
    foundedYear: 2009,
    website: "https://www.minecraft.net"
  },
  {
    id: 6,
    name: "Insomniac Games",
    country: "Estados Unidos",
    foundedYear: 1994,
    website: "https://insomniac.games"
  },
  {
    id: 7,
    name: "Guerrilla Games",
    country: "Holanda",
    foundedYear: 2000,
    website: "https://www.guerrilla-games.com"
  },
  {
    id: 8,
    name: "Ubisoft",
    country: "França",
    foundedYear: 1986,
    website: "https://www.ubisoft.com"
  },
  {
    id: 9,
    name: "Cyber Studios",
    country: "Brasil",
    foundedYear: 2015,
    website: "https://www.cyberstudios.com"
  }
];

// Export data
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { users, games, orders, companies };
}
