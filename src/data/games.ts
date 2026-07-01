export interface GameSettings {
  flappy: {
    gravity: number;
    jumpForce: number;
    pipeSpeed: number;
    pipeGap: number;
    pipeFrequency: number;
  };
  snake: {
    initialSpeed: number;
    speedIncrement: number;
    gridSize: number;
  };
  laneRunner: {
    baseSpeed: number;
    speedIncrement: number;
    obstacleFrequency: number;
  };
  memoryMatch: {
    gridSize: number; // 4 = 4x4 grid (8 pairs)
    flipDelay: number;
  };
}

export const gameSettings: GameSettings = {
  flappy: {
    gravity: 0.5,
    jumpForce: -8,
    pipeSpeed: 3,
    pipeGap: 150,
    pipeFrequency: 90, // frames between pipes
  },
  snake: {
    initialSpeed: 150, // ms per tick
    speedIncrement: 2,
    gridSize: 20,
  },
  laneRunner: {
    baseSpeed: 3,
    speedIncrement: 0.2,
    obstacleFrequency: 60, // frames between obstacles
  },
  memoryMatch: {
    gridSize: 4,
    flipDelay: 600,
  },
};

export interface GameHighScore {
  flappy: number;
  snake: number;
  laneRunner: number;
  memoryMatch: number; // best time in seconds (0 = no record)
}

export const defaultHighScores: GameHighScore = {
  flappy: 0,
  snake: 0,
  laneRunner: 0,
  memoryMatch: 0,
};

export const GAME_STORAGE_KEY = 'diamond-birthday-games';
