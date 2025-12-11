export type GameObjectType = 'star' | 'crystal' | 'bonus' | 'asteroid' | 'enemy' | 'blackhole';

export interface GameObject {
  id: string;
  type: GameObjectType;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
}

export interface GameState {
  score: number;
  lives: number;
  multiplier: number;
  multiplierEndTime: number; // timestamp
  isPaused: boolean;
  isGameOver: boolean;
  isPlaying: boolean;
  level: number;
  gameSpeed: number;
}

export const GAME_WIDTH = 800; // Conceptual width for logic
export const GAME_HEIGHT = 600; // Conceptual height for logic
export const SHIP_WIDTH = 60;
export const SHIP_HEIGHT = 60;
export const ITEM_SIZE = 40;
