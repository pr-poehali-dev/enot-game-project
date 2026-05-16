import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import { GameState, GameAction } from '@/types/game';

interface Props {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

const ENOT_EMOJIS: Record<string, string> = {
  default: '🦝',
  ninja: '🥷',
  royal: '👑',
  snow: '❄️',
};

const StatBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="stat-bar w-full">
    <div className="stat-bar-fill" style={{ width: `${Math.round((value / max) * 100)}%`, background: color }} />
  </div>
);

export default function ProfileTab({ gameState, dispatch }: Props) {
  const { enot, activeEnot } = gameState;
  const emoji = ENOT_EMOJIS[activeEnot] || '🦝';
  const [popped, setPopped] = useState(false);

  const handlePet = () => {
    dispatch({ type: 'PET_ENOT' });
    setPopped(true);
    setTimeout(() => setPopped(false), 500);
  };

  const moodData =
    enot.mood >= 80 ? { label: 'Счастлив', emoji: '😄', color: 'hsl(152,70%,45%)' }
    : enot.mood >= 50 ? { label: 'Доволен', emoji: '😊', color: 'hsl(42,95%,55%)' }
    : enot.mood >= 30 ? { label: 'Грустит', emoji: '😕', color: 'hsl(210,80%,58%)' }
    : { label: 'Злится', emoji: '😤', color: 'hsl(0,72%,55%)' };

  const stats = [
    { label: 'Здоровье', value: enot.health, max: 100, color: 'hsl(152,70%,45%)', icon: 'Heart' },
    { label: 'Настроение', value: enot.mood, max: 100, color: 'hsl(42,95%,55%)', icon: 'Smile' },
    { label: 'Сытость', value: enot.hunger, max: 100, color: 'hsl(210,80%,58%)', icon: 'UtensilsCrossed' },
    { label: 'Энергия', value: enot.energy, max: 100, color: 'hsl(270,70%,65%)', icon: 'Zap' },
  ];

  const quickActions = [
    { label: 'Покормить', icon: '🍖', action: { type: 'QUICK_FEED' as const } },
    { label: 'Поиграть', icon: '🎾', action: { type: 'QUICK_PLAY' as const } },
    { label: 'Поспать', icon: '😴', action: { type: 'QUICK_SLEEP' as const } },
  ];

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Карточка енота */}
      <div className="card-game flex flex-col items-center gap-4 py-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 40%, hsl(152,70%,45%), transparent 60%)' }}
        />
        <div
          className={`enot-avatar select-none cursor-pointer transition-transform duration-300 ${popped ? 'scale-125' : ''}`}
          onClick={handlePet}
        >
          {emoji}
        </div>
        <div className="text-center">
          <h2 className="font-rubik font-bold text-2xl text-white">{enot.name}</h2>
          <p className="text-sm mt-1" style={{ color: moodData.color }}>
            {moodData.emoji} {moodData.label}
          </p>
        </div>
        <div className="flex gap-2">
          {[`Ур. ${enot.level}`, `Опыт ${enot.xp}/${enot.xpMax}`].map(t => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'hsl(var(--enot-surface2))', color: 'hsl(var(--muted-foreground))' }}>
              {t}
            </span>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Нажми на енота, чтобы погладить 🤍
        </p>
      </div>

      {/* Статы */}
      <div className="card-game flex flex-col gap-4">
        <h3 className="font-rubik font-semibold">Состояние</h3>
        {stats.map(s => (
          <div key={s.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon name={s.icon as 'Heart'} size={14} style={{ color: s.color }} />
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</span>
              </div>
              <span className="text-xs font-semibold">{s.value}%</span>
            </div>
            <StatBar value={s.value} max={s.max} color={s.color} />
          </div>
        ))}
      </div>

      {/* Быстрые действия */}
      <div className="card-game">
        <h3 className="font-rubik font-semibold mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map(a => (
            <button
              key={a.label}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 hover:opacity-90"
              style={{ background: 'hsl(var(--enot-surface2))' }}
              onClick={() => dispatch(a.action)}
            >
              <span style={{ fontSize: 28 }}>{a.icon}</span>
              <span className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
