import React, { useState } from 'react';
import { GameState, GameAction } from '@/types/game';

interface Props {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

const DAILY_REWARDS = [
  { day: 1, reward: 20, emoji: '🪙' },
  { day: 2, reward: 35, emoji: '🪙' },
  { day: 3, reward: 50, emoji: '🪙' },
  { day: 4, reward: 75, emoji: '🪙' },
  { day: 5, reward: 100, emoji: '💎' },
  { day: 6, reward: 150, emoji: '💎' },
  { day: 7, reward: 250, emoji: '🏆' },
];

export default function BonusTab({ gameState, dispatch }: Props) {
  const { lastBonus, bonusStreak, coins } = gameState;
  const [claimed, setClaimed] = useState(false);

  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const timeSinceBonus = now - lastBonus;
  const canClaim = timeSinceBonus >= hourMs;
  const nextIn = Math.max(0, hourMs - timeSinceBonus);
  const nextMins = Math.floor(nextIn / 60000);
  const nextSecs = Math.floor((nextIn % 60000) / 1000);

  const currentDay = Math.min(bonusStreak, 7);
  const todayReward = DAILY_REWARDS[currentDay] ?? DAILY_REWARDS[0];

  const handleClaim = () => {
    if (!canClaim) return;
    dispatch({ type: 'CLAIM_BONUS' });
    setClaimed(true);
    setTimeout(() => setClaimed(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Ежечасный бонус */}
      <div className="card-game relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 50%, hsl(42,95%,55%), transparent 60%)' }} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-rubik font-bold text-lg text-white">Ежечасный бонус</h3>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {canClaim ? 'Можно забрать!' : `Следующий через ${nextMins}м ${nextSecs}с`}
            </p>
          </div>
          <span style={{ fontSize: 48 }}>⏰</span>
        </div>

        {claimed && (
          <div className="text-center py-2 font-bold text-lg animate-bounce-in" style={{ color: 'hsl(var(--enot-gold))' }}>
            🎉 Бонус получен!
          </div>
        )}

        <button
          className={canClaim ? 'btn-gold w-full py-3 text-base' : 'btn-secondary w-full py-3 text-base'}
          style={{ opacity: canClaim ? 1 : 0.5, cursor: canClaim ? 'pointer' : 'not-allowed' }}
          onClick={handleClaim}
          disabled={!canClaim}
        >
          {canClaim ? '🪙 Получить бонус' : `⏳ ${nextMins}:${String(nextSecs).padStart(2, '0')}`}
        </button>
      </div>

      {/* Ежедневные награды */}
      <div className="card-game">
        <h3 className="font-rubik font-bold text-base mb-4">
          Ежедневные награды
          <span className="ml-2 text-sm font-normal" style={{ color: 'hsl(var(--muted-foreground))' }}>
            День {Math.min(bonusStreak + 1, 7)}/7
          </span>
        </h3>
        <div className="grid grid-cols-7 gap-1.5">
          {DAILY_REWARDS.map((r, i) => {
            const isPast = i < bonusStreak % 7;
            const isCurrent = i === bonusStreak % 7;
            return (
              <div
                key={r.day}
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                style={{
                  background: isPast
                    ? 'hsl(var(--primary)/0.15)'
                    : isCurrent
                    ? 'hsl(var(--enot-gold)/0.15)'
                    : 'hsl(var(--enot-surface2))',
                  border: `1px solid ${isCurrent ? 'hsl(var(--enot-gold)/0.5)' : isPast ? 'hsl(var(--primary)/0.3)' : 'transparent'}`,
                }}
              >
                <span style={{ fontSize: 18 }}>{isPast ? '✓' : r.emoji}</span>
                <span className="text-[10px] font-bold" style={{ color: isCurrent ? 'hsl(var(--enot-gold))' : isPast ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
                  {r.day}д
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-2xl text-center" style={{ background: 'hsl(var(--enot-surface2))' }}>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Сегодня</p>
          <p className="font-rubik font-bold text-xl" style={{ color: 'hsl(var(--enot-gold))' }}>
            {todayReward.emoji} {todayReward.reward} монет
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="card-game">
        <h3 className="font-rubik font-semibold mb-3">Статистика</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Монет всего', value: coins, emoji: '🪙' },
            { label: 'Дней подряд', value: bonusStreak, emoji: '🔥' },
            { label: 'Кормлений', value: gameState.totalFed, emoji: '🍖' },
            { label: 'Игр сыграно', value: gameState.totalGames, emoji: '🎮' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-2xl flex flex-col gap-1" style={{ background: 'hsl(var(--enot-surface2))' }}>
              <span style={{ fontSize: 24 }}>{s.emoji}</span>
              <p className="font-rubik font-bold text-xl text-white">{s.value}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
