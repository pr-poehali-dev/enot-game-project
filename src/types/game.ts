export interface EnotState {
  name: string;
  health: number;
  mood: number;
  hunger: number;
  energy: number;
  level: number;
  xp: number;
  xpMax: number;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  hunger: number;
  mood: number;
  count: number;
}

export type SkinRarity = 'обычный' | 'редкий' | 'эпический' | 'мифический' | 'легендарный' | 'ультра';

export interface EnotSkin {
  id: string;
  name: string;
  emoji: string;
  price: number;
  owned: boolean;
  rarity: SkinRarity;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  unlocked: boolean;
  condition: string;
}

export interface GameState {
  coins: number;
  enot: EnotState;
  activeEnot: string;
  food: FoodItem[];
  enotSkins: EnotSkin[];
  achievements: Achievement[];
  lastBonus: number;
  bonusStreak: number;
  totalClicks: number;
  totalFed: number;
  totalGames: number;
  tab: string;
  lastFed: number;
  lastPlayed: number;
  lastSlept: number;
}

export type GameAction =
  | { type: 'PET_ENOT' }
  | { type: 'QUICK_FEED' }
  | { type: 'QUICK_PLAY' }
  | { type: 'QUICK_SLEEP' }
  | { type: 'BUY_FOOD'; id: string }
  | { type: 'BUY_SKIN'; id: string }
  | { type: 'FEED_ENOT'; id: string }
  | { type: 'SET_ACTIVE_ENOT'; id: string }
  | { type: 'PLAY_GAME'; game: string }
  | { type: 'CLAIM_BONUS' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'SET_TAB'; tab: string };