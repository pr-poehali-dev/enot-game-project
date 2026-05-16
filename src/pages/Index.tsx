import React, { useReducer, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { GameState, GameAction } from '@/types/game';
import ProfileTab from '@/components/game/ProfileTab';
import ShopTab from '@/components/game/ShopTab';
import StorageTab from '@/components/game/StorageTab';
import GamesTab from '@/components/game/GamesTab';
import BonusTab from '@/components/game/BonusTab';
import AchievementsTab from '@/components/game/AchievementsTab';

export type { GameState, GameAction };

const INITIAL_STATE: GameState = {
  coins: 100,
  enot: {
    name: 'Рикки',
    health: 85,
    mood: 70,
    hunger: 60,
    energy: 90,
    level: 1,
    xp: 0,
    xpMax: 100,
  },
  activeEnot: 'default',
  food: [
    { id: 'fish', name: 'Рыбка', emoji: '🐟', price: 10, hunger: 25, mood: 5, count: 0 },
    { id: 'berry', name: 'Ягоды', emoji: '🍓', price: 8, hunger: 15, mood: 10, count: 0 },
    { id: 'meat', name: 'Мясо', emoji: '🥩', price: 20, hunger: 40, mood: 8, count: 0 },
    { id: 'cake', name: 'Тортик', emoji: '🎂', price: 35, hunger: 20, mood: 30, count: 0 },
    { id: 'apple', name: 'Яблоко', emoji: '🍎', price: 5, hunger: 10, mood: 5, count: 2 },
    { id: 'sushi', name: 'Суши', emoji: '🍣', price: 50, hunger: 50, mood: 20, count: 0 },
  ],
  enotSkins: [
    { id: 'default', name: 'Обычный', emoji: '🦝', price: 0, owned: true },
    { id: 'ninja', name: 'Ниндзя', emoji: '🥷', price: 200, owned: false },
    { id: 'royal', name: 'Королевский', emoji: '👑', price: 500, owned: false },
    { id: 'snow', name: 'Снежный', emoji: '❄️', price: 300, owned: false },
  ],
  achievements: [
    { id: 'first_feed', name: 'Первая кормёжка', desc: 'Покорми енота первый раз', emoji: '🍽️', unlocked: false, condition: 'Покорми енота 1 раз' },
    { id: 'feed_10', name: 'Заботливый', desc: 'Покорми енота 10 раз', emoji: '❤️', unlocked: false, condition: 'Покорми 10 раз' },
    { id: 'feed_50', name: 'Шеф-повар', desc: 'Покорми енота 50 раз', emoji: '👨‍🍳', unlocked: false, condition: 'Покорми 50 раз' },
    { id: 'clicker_100', name: 'Кликер-новичок', desc: '100 кликов в кликере', emoji: '👆', unlocked: false, condition: '100 кликов' },
    { id: 'clicker_500', name: 'Кликер-про', desc: '500 кликов в кликере', emoji: '⚡', unlocked: false, condition: '500 кликов' },
    { id: 'games_5', name: 'Игроман', desc: 'Сыграй 5 игр', emoji: '🎮', unlocked: false, condition: '5 игр' },
    { id: 'streak_3', name: 'Постоянный', desc: '3 дня подряд', emoji: '🔥', unlocked: false, condition: '3 дня подряд' },
    { id: 'streak_7', name: 'Неделя с енотом', desc: '7 дней подряд', emoji: '🏆', unlocked: false, condition: '7 дней подряд' },
    { id: 'level_5', name: 'Опытный', desc: 'Достигни 5 уровня', emoji: '⭐', unlocked: false, condition: 'Уровень 5' },
  ],
  lastBonus: 0,
  bonusStreak: 0,
  totalClicks: 0,
  totalFed: 0,
  totalGames: 0,
  tab: 'profile',
};

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function addXP(enot: GameState['enot'], amount: number) {
  let xp = enot.xp + amount;
  let level = enot.level;
  let xpMax = enot.xpMax;
  while (xp >= xpMax) {
    xp -= xpMax;
    level++;
    xpMax = Math.round(xpMax * 1.5);
  }
  return { ...enot, xp, level, xpMax };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PET_ENOT':
      return {
        ...state,
        enot: addXP({ ...state.enot, mood: clamp(state.enot.mood + 3) }, 2),
        totalClicks: state.totalClicks + 1,
      };

    case 'QUICK_FEED': {
      const apple = state.food.find(f => f.id === 'apple');
      if (!apple || apple.count === 0) return state;
      return {
        ...state,
        food: state.food.map(f => f.id === 'apple' ? { ...f, count: f.count - 1 } : f),
        enot: addXP({ ...state.enot, hunger: clamp(state.enot.hunger + apple.hunger), mood: clamp(state.enot.mood + apple.mood) }, 5),
        totalFed: state.totalFed + 1,
      };
    }

    case 'QUICK_PLAY':
      return {
        ...state,
        enot: addXP({ ...state.enot, mood: clamp(state.enot.mood + 10), energy: clamp(state.enot.energy - 10) }, 8),
        totalGames: state.totalGames + 1,
      };

    case 'QUICK_SLEEP':
      return { ...state, enot: { ...state.enot, energy: clamp(state.enot.energy + 40), health: clamp(state.enot.health + 5) } };

    case 'BUY_FOOD': {
      const item = state.food.find(f => f.id === action.id);
      if (!item || state.coins < item.price) return state;
      return {
        ...state,
        coins: state.coins - item.price,
        food: state.food.map(f => f.id === action.id ? { ...f, count: f.count + 1 } : f),
      };
    }

    case 'BUY_SKIN': {
      const skin = state.enotSkins.find(s => s.id === action.id);
      if (!skin || skin.owned || state.coins < skin.price) return state;
      return {
        ...state,
        coins: state.coins - skin.price,
        enotSkins: state.enotSkins.map(s => s.id === action.id ? { ...s, owned: true } : s),
        activeEnot: action.id,
      };
    }

    case 'FEED_ENOT': {
      const item = state.food.find(f => f.id === action.id);
      if (!item || item.count === 0) return state;
      return {
        ...state,
        food: state.food.map(f => f.id === action.id ? { ...f, count: f.count - 1 } : f),
        enot: addXP({ ...state.enot, hunger: clamp(state.enot.hunger + item.hunger), mood: clamp(state.enot.mood + item.mood) }, 10),
        totalFed: state.totalFed + 1,
      };
    }

    case 'SET_ACTIVE_ENOT':
      return { ...state, activeEnot: action.id };

    case 'PLAY_GAME': {
      const moodBonus: Record<string, number> = { walk: 15, football: 20, basketball: 25 };
      const boost = moodBonus[action.game] ?? 10;
      return {
        ...state,
        enot: addXP({ ...state.enot, mood: clamp(state.enot.mood + boost), energy: clamp(state.enot.energy - 15) }, 15),
        totalGames: state.totalGames + 1,
      };
    }

    case 'CLAIM_BONUS': {
      const now = Date.now();
      const newStreak = state.bonusStreak + 1;
      const bonus = 15 + state.bonusStreak * 5;
      return {
        ...state,
        coins: state.coins + bonus,
        lastBonus: now,
        bonusStreak: newStreak,
      };
    }

    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.amount, totalClicks: state.totalClicks + (action.amount > 0 ? 1 : 0) };

    case 'SET_TAB':
      return { ...state, tab: action.tab };

    default:
      return state;
  }
}

// fix duplicate bonusStreak
function safeReducer(state: GameState, action: GameAction): GameState {
  return reducer(state, action);
}

const TABS = [
  { id: 'profile', label: 'Енот', icon: 'User' },
  { id: 'shop', label: 'Магазин', icon: 'ShoppingBag' },
  { id: 'storage', label: 'Склад', icon: 'Archive' },
  { id: 'games', label: 'Игры', icon: 'Gamepad2' },
  { id: 'bonus', label: 'Бонусы', icon: 'Gift' },
  { id: 'medals', label: 'Медали', icon: 'Trophy' },
];

export default function Index() {
  const [state, dispatch] = useReducer(safeReducer, INITIAL_STATE);

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'ADD_COINS', amount: 0 });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const renderTab = () => {
    switch (state.tab) {
      case 'profile': return <ProfileTab gameState={state} dispatch={dispatch} />;
      case 'shop': return <ShopTab gameState={state} dispatch={dispatch} />;
      case 'storage': return <StorageTab gameState={state} dispatch={dispatch} />;
      case 'games': return <GamesTab gameState={state} dispatch={dispatch} />;
      case 'bonus': return <BonusTab gameState={state} dispatch={dispatch} />;
      case 'medals': return <AchievementsTab gameState={state} />;
      default: return null;
    }
  };

  const canBonus = (Date.now() - state.lastBonus) >= 3600000;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
      {/* Шапка */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'hsl(var(--enot-surface))', borderBottom: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 28 }}>🦝</span>
          <span className="font-rubik font-bold text-lg text-white">EnotGame</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="coin-badge">
            <span>🪙</span>
            <span>{state.coins}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Ур.</span>
            <span className="font-bold text-white">{state.enot.level}</span>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {renderTab()}
      </main>

      {/* Навигация */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 px-2 py-2"
        style={{ background: 'hsl(var(--enot-surface))', borderTop: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center justify-around">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`nav-item relative ${state.tab === t.id ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TAB', tab: t.id })}
            >
              {t.id === 'bonus' && canBonus && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: 'hsl(var(--enot-gold))' }}
                />
              )}
              <Icon name={t.icon as 'User'} size={20} />
              <span className="text-[10px] font-medium leading-none">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}