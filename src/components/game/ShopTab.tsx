import React, { useState } from 'react';
import { GameState, GameAction, SkinRarity } from '@/types/game';

interface Props {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

const FOOD_SHOP = [
  { id: 'fish',  name: 'Рыбка',  emoji: '🐟', price: 10, hunger: 25, mood: 5  },
  { id: 'berry', name: 'Ягоды',  emoji: '🍓', price: 8,  hunger: 15, mood: 10 },
  { id: 'meat',  name: 'Мясо',   emoji: '🥩', price: 20, hunger: 40, mood: 8  },
  { id: 'cake',  name: 'Тортик', emoji: '🎂', price: 35, hunger: 20, mood: 30 },
  { id: 'apple', name: 'Яблоко', emoji: '🍎', price: 5,  hunger: 10, mood: 5  },
  { id: 'sushi', name: 'Суши',   emoji: '🍣', price: 50, hunger: 50, mood: 20 },
];

const RARITY_COLORS: Record<SkinRarity, { bg: string; text: string; border: string }> = {
  'обычный':    { bg: 'hsl(220,15%,30%/0.4)', text: 'hsl(220,15%,75%)',  border: 'hsl(220,15%,50%/0.4)' },
  'редкий':     { bg: 'hsl(210,80%,30%/0.4)', text: 'hsl(210,80%,70%)',  border: 'hsl(210,80%,50%/0.5)' },
  'эпический':  { bg: 'hsl(270,70%,30%/0.4)', text: 'hsl(270,70%,75%)',  border: 'hsl(270,70%,55%/0.6)' },
  'мифический': { bg: 'hsl(320,70%,30%/0.4)', text: 'hsl(320,70%,75%)',  border: 'hsl(320,70%,55%/0.6)' },
  'легендарный':{ bg: 'hsl(42,95%,30%/0.4)',  text: 'hsl(42,95%,65%)',   border: 'hsl(42,95%,55%/0.7)'  },
  'ультра':     { bg: 'hsl(0,90%,25%/0.4)',   text: 'hsl(0,90%,68%)',    border: 'hsl(0,90%,55%/0.8)'   },
};

export default function ShopTab({ gameState, dispatch }: Props) {
  const [tab, setTab] = useState<'food' | 'skins'>('food');
  const { coins, food, enotSkins } = gameState;

  const getOwnedCount = (id: string) => food.find(f => f.id === id)?.count ?? 0;

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Монеты */}
      <div className="card-game flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Твой баланс</p>
          <p className="font-rubik font-bold text-2xl text-white">
            {coins} <span style={{ color: 'hsl(var(--enot-gold))' }}>монет</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 36 }}>🦝</span>
          <span style={{ fontSize: 36 }}>🪙</span>
        </div>
      </div>

      {/* Переключатель */}
      <div className="flex p-1 rounded-2xl gap-1" style={{ background: 'hsl(var(--enot-surface))' }}>
        {(['food', 'skins'] as const).map(t => (
          <button
            key={t}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
            style={{
              background: tab === t ? 'hsl(var(--enot-surface2))' : 'transparent',
              color: tab === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
            }}
            onClick={() => setTab(t)}
          >
            {t === 'food' ? '🍖 Еда' : '🦝 Еноты'}
          </button>
        ))}
      </div>

      {/* Еда */}
      {tab === 'food' && (
        <div className="grid grid-cols-2 gap-3">
          {FOOD_SHOP.map(item => {
            const owned = getOwnedCount(item.id);
            const canBuy = coins >= item.price;
            return (
              <div key={item.id} className="card-game flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 40 }}>{item.emoji}</span>
                  {owned > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'hsl(var(--primary)/0.2)', color: 'hsl(var(--primary))' }}>
                      ×{owned}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    🍖+{item.hunger} 😊+{item.mood}
                  </p>
                </div>
                <button
                  className="btn-gold text-xs py-2 w-full"
                  disabled={!canBuy}
                  style={{ opacity: canBuy ? 1 : 0.4, cursor: canBuy ? 'pointer' : 'not-allowed' }}
                  onClick={() => dispatch({ type: 'BUY_FOOD', id: item.id })}
                >
                  🪙 {item.price}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Скины / Еноты */}
      {tab === 'skins' && (
        <div className="flex flex-col gap-3">
          {enotSkins.map(skin => {
            const isActive = gameState.activeEnot === skin.id;
            const canBuy = coins >= skin.price;
            const rarity = skin.rarity ?? 'обычный';
            const rc = RARITY_COLORS[rarity];
            return (
              <div
                key={skin.id}
                className="card-game flex items-center gap-4 relative transition-all duration-200"
                style={{
                  borderColor: isActive ? rc.border : skin.owned ? rc.border : 'transparent',
                  background: isActive ? rc.bg : undefined,
                }}
              >
                {/* Аватар */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: rc.bg, border: `2px solid ${rc.border}`, fontSize: 40 }}
                >
                  {skin.emoji}
                </div>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-rubik font-bold text-base text-white">{skin.name}</p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                      style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                    >
                      {rarity}
                    </span>
                  </div>
                  {skin.price > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Стоимость: <span style={{ color: 'hsl(var(--enot-gold))' }}>{skin.price}🪙</span>
                    </p>
                  )}
                </div>

                {/* Кнопка */}
                {skin.owned ? (
                  <button
                    className="text-xs px-3 py-2 rounded-xl font-semibold flex-shrink-0 transition-all"
                    style={{
                      background: isActive ? rc.bg : 'hsl(var(--primary)/0.2)',
                      color: isActive ? rc.text : 'hsl(var(--primary))',
                      border: `1px solid ${isActive ? rc.border : 'hsl(var(--primary)/0.4)'}`,
                      cursor: isActive ? 'default' : 'pointer',
                    }}
                    disabled={isActive}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_ENOT', id: skin.id })}
                  >
                    {isActive ? '✓ Активен' : 'Выбрать'}
                  </button>
                ) : (
                  <button
                    className="btn-gold text-xs px-3 py-2 flex-shrink-0"
                    disabled={!canBuy}
                    style={{ opacity: canBuy ? 1 : 0.4, cursor: canBuy ? 'pointer' : 'not-allowed' }}
                    onClick={() => dispatch({ type: 'BUY_SKIN', id: skin.id })}
                  >
                    🪙 {skin.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
