import React, { useState, useEffect } from 'react';
import { GameState, GameAction } from '@/types/game';

interface Props {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

const COOLDOWN_MS = 30 * 60 * 1000;

function useFeedCooldown(lastFed: number) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - lastFed));
  const ready = remaining === 0;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const label = mins > 0 ? `${mins}м ${String(secs).padStart(2, '0')}с` : `${secs}с`;
  return { ready, label };
}

export default function StorageTab({ gameState, dispatch }: Props) {
  const { food, enot, lastFed } = gameState;
  const ownedFood = food.filter(f => f.count > 0);
  const { ready, label: timerLabel } = useFeedCooldown(lastFed);

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Заголовок */}
      <div className="card-game flex items-center gap-4">
        <span style={{ fontSize: 48 }}>🗄️</span>
        <div>
          <h3 className="font-rubik font-bold text-lg text-white">Хранилище</h3>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {ownedFood.length === 0 ? 'Пусто — купи еды в магазине!' : `${ownedFood.reduce((s, f) => s + f.count, 0)} предмет(ов)`}
          </p>
        </div>
      </div>

      {/* Состояние енота */}
      <div className="card-game">
        <h3 className="font-rubik font-semibold mb-3">Енот хочет</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Сытость', value: enot.hunger, color: 'hsl(210,80%,58%)', emoji: '🍖' },
            { label: 'Настроение', value: enot.mood, color: 'hsl(42,95%,55%)', emoji: '😊' },
          ].map(s => (
            <div key={s.label} className="flex flex-col gap-1.5 p-3 rounded-2xl" style={{ background: 'hsl(var(--enot-surface2))' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.emoji} {s.label}</span>
                <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}%</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${s.value}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Таймер кормления */}
      {!ready && (
        <div
          className="card-game flex items-center gap-3"
          style={{ borderColor: 'hsl(210,80%,58%/0.4)' }}
        >
          <span style={{ fontSize: 28 }}>⏳</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Следующее кормление через</p>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(210,80%,58%)' }}>{timerLabel}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'hsl(210,80%,58%/0.15)', color: 'hsl(210,80%,58%)' }}>
            🍖
          </div>
        </div>
      )}

      {/* Еда */}
      {ownedFood.length === 0 ? (
        <div className="card-game flex flex-col items-center gap-3 py-10 text-center">
          <span style={{ fontSize: 64, opacity: 0.4 }}>🛒</span>
          <p className="font-semibold text-white">Хранилище пусто</p>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Купи еду в магазине и корми енота!</p>
        </div>
      ) : (
        <div>
          <h3 className="font-rubik font-semibold mb-3">Еда</h3>
          <div className="grid grid-cols-2 gap-3">
            {ownedFood.map(item => (
              <div key={item.id} className="card-game flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 42 }}>{item.emoji}</span>
                  <span className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>×{item.count}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{item.name}</p>
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    🍖+{item.hunger} 😊+{item.mood}
                  </p>
                </div>
                <button
                  className="text-xs py-2 w-full rounded-2xl font-semibold transition-all active:scale-95"
                  style={{
                    background: ready ? 'hsl(var(--primary))' : 'hsl(var(--enot-surface2))',
                    color: ready ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                    cursor: ready ? 'pointer' : 'not-allowed',
                    opacity: ready ? 1 : 0.6,
                  }}
                  disabled={!ready}
                  onClick={() => dispatch({ type: 'FEED_ENOT', id: item.id })}
                >
                  {ready ? 'Покормить' : timerLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Еноты */}
      <div>
        <h3 className="font-rubik font-semibold mb-3">Твои еноты</h3>
        <div className="grid grid-cols-3 gap-3">
          {gameState.enotSkins.filter(s => s.owned).map(skin => (
            <div
              key={skin.id}
              className="card-game flex flex-col items-center gap-2 py-3 cursor-pointer"
              style={{ borderColor: gameState.activeEnot === skin.id ? 'hsl(var(--primary)/0.6)' : undefined }}
              onClick={() => dispatch({ type: 'SET_ACTIVE_ENOT', id: skin.id })}
            >
              <span style={{ fontSize: 40 }}>{skin.emoji}</span>
              <span className="text-xs font-medium text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>{skin.name}</span>
              {gameState.activeEnot === skin.id && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'hsl(var(--primary)/0.2)', color: 'hsl(var(--primary))' }}>
                  Активен
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
