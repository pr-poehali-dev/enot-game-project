import React from 'react';
import { GameState, GameAction } from '@/types/game';

interface Props {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

export default function StorageTab({ gameState, dispatch }: Props) {
  const { food, enot } = gameState;
  const ownedFood = food.filter(f => f.count > 0);

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
                  className="btn-primary text-xs py-2 w-full"
                  onClick={() => dispatch({ type: 'FEED_ENOT', id: item.id })}
                >
                  Покормить
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
