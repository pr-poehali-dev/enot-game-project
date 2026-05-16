import React from 'react';
import { GameState } from '@/types/game';

interface Props {
  gameState: GameState;
}

export default function AchievementsTab({ gameState }: Props) {
  const { achievements, totalClicks, totalFed, totalGames, bonusStreak, enot } = gameState;

  const computed = achievements.map(a => {
    let unlocked = a.unlocked;
    if (!unlocked) {
      if (a.id === 'first_feed' && totalFed >= 1) unlocked = true;
      if (a.id === 'feed_10' && totalFed >= 10) unlocked = true;
      if (a.id === 'feed_50' && totalFed >= 50) unlocked = true;
      if (a.id === 'clicker_100' && totalClicks >= 100) unlocked = true;
      if (a.id === 'clicker_500' && totalClicks >= 500) unlocked = true;
      if (a.id === 'games_5' && totalGames >= 5) unlocked = true;
      if (a.id === 'streak_3' && bonusStreak >= 3) unlocked = true;
      if (a.id === 'streak_7' && bonusStreak >= 7) unlocked = true;
      if (a.id === 'level_5' && enot.level >= 5) unlocked = true;
    }
    return { ...a, unlocked };
  });

  const unlockedCount = computed.filter(a => a.unlocked).length;

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Прогресс */}
      <div className="card-game relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 50%, hsl(270,70%,65%), transparent 60%)' }} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-rubik font-bold text-lg text-white">Достижения</h3>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {unlockedCount} из {computed.length}
            </p>
          </div>
          <span style={{ fontSize: 48 }}>🏆</span>
        </div>
        <div className="stat-bar">
          <div className="stat-bar-fill" style={{ width: `${(unlockedCount / computed.length) * 100}%`, background: 'hsl(270,70%,65%)' }} />
        </div>
      </div>

      {/* Список достижений */}
      <div className="flex flex-col gap-3">
        {computed.map(a => (
          <div
            key={a.id}
            className="card-game flex items-center gap-4 transition-all"
            style={{
              opacity: a.unlocked ? 1 : 0.5,
              borderColor: a.unlocked ? 'hsl(270,70%,65%/0.4)' : undefined,
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: a.unlocked ? 'hsl(270,70%,65%/0.2)' : 'hsl(var(--enot-surface2))',
                fontSize: 32,
              }}
            >
              {a.unlocked ? a.emoji : '🔒'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{a.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{a.desc}</p>
              {!a.unlocked && (
                <p className="text-xs mt-1" style={{ color: 'hsl(270,70%,55%)' }}>
                  🎯 {a.condition}
                </p>
              )}
            </div>
            {a.unlocked && (
              <div className="flex-shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: 'hsl(270,70%,65%/0.2)', color: 'hsl(270,70%,75%)' }}>
                  ✓
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
