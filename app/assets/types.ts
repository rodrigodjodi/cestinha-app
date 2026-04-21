// Geo.ts
export type Geo = {
    lat: number;
    lng: number;
  };
  
  // Jogador.ts
  export type Jogador = {
    id: string; // Firestore ID
    nome: string;
    apelido?: string;
    fotoUrl?: string;
    estatisticasGlobais?: Record<string, number>; // exemplo: { "pontos": 12, "assistencias": 3 }
    usuarioId?: string; // só aparece se for reclamado
  };
  
  // Local.ts
  export type Localizacao = {
    nome: string;
    coordenadas: Geo;
    endereco: string;
  };
  
  // Grupo.ts
  
  export type Grupo = {
    id: string; // Firestore ID
    nome: string;
    local: Localizacao;
    jogadores: string[]; // Array de referências (ID) para jogadores
    jogos: string[];     // Array de referências (ID) para jogos
  };
  
  // Jogo.ts
  export type Jogo = {
    id: string; // Firestore ID
    grupo: string; // ID do grupo
    data: Date;
    jogadores: string[]; // IDs de jogadores participantes
    estatisticas?: Record<string, Record<string, number>>; // jogadorId => { tipo: valor }
    videoUrl?: string;
    jogadas: string[]; // IDs das jogadas
  };
  
  // Jogada.ts
  export type CategoriaJogada =
    | 'cesta-3'
    | 'cesta-2'
    | 'assistência'
    | 'rebote'
    | 'roubada'
    | 'falta';
  
  export type Clipe = {
    videoId: string;
    inicio: number; // segundos
    duracao?: number;
  };
  
  export type Jogada = {
    id: string; // Firestore ID
    jogo: string;    // ID do jogo
    jogador: string; // ID do jogador
    categoria: CategoriaJogada;
    tempo: number; // segundos desde o início do vídeo
    clipe?: Clipe;
  };
  