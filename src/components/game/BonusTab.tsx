import React, { useState, useEffect } from 'react';
import { GameState, GameAction } from '@/types/game';

interface Props {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

interface FloatingCoin {
  id: number;
  x: number;
  amount: number;
}

function EnotCoin({ size = 40, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, hsl(42,95%,60%), hsl(38,90%,45%))',
        boxShadow: glow
          ? '0 0 0 3px hsl(42,95%,30%), 0 4px 20px hsla(42,95%,55%,0.6)'
          : '0 0 0 2.5px hsl(42,90%,35%), 0 2px 8px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span style={{ lineHeight: 1 }}>🦝</span>
      <div style={{
        position: 'absolute',
        top: '15%', left: '15%',
        width: '25%', height: '25%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.35)',
      }} />
    </div>
  );
}

function CoinRow({ amount }: { amount: number }) {
  const count = Math.min(amount, 8);
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: count }).map((_, i) => (
        <EnotCoin key={i} size={28} />
      ))}
      {amount > 8 && (
        <span className="text-sm font-bold" style={{ color: 'hsl(var(--enot-gold))' }}>
          +{amount - 8} ещё
        </span>
      )}
    </div>
  );
}

function useCooldown(lastTs: number, durationMs: number) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Date.now() - lastTs;
  const remaining = Math.max(0, durationMs - elapsed);
  const ready = remaining === 0;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return { ready, mins, secs, remaining };
}

export default function BonusTab({ gameState, dispatch }: Props) {
  const { lastBonus, bonusStreak, coins } = gameState;
  const [lastWon, setLastWon] = useState<number | null>(null);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [coinPreview, setCoinPreview] = useState<number | null>(null);

  const hourMs = 60 * 60 * 1000;
  const { ready, mins, secs } = useCooldown(lastBonus, hourMs);
  const progress = Math.min(100, ((Date.now() - lastBonus) / hourMs) * 100);

  // Генерируем превью рандомного бонуса
  useEffect(() => {
    if (ready) {
      setCoinPreview(Math.floor(Math.random() * 41) + 10);
    }
  }, [ready]);

  const handleClaim = () => {
    if (!ready) return;
    const amount = Math.floor(Math.random() * 41) + 10; // 10–50
    dispatch({ type: 'ADD_COINS', amount });
    dispatch({ type: 'CLAIM_BONUS' });
    setLastWon(amount);
    setCoinPreview(null);

    // Летящие монетки
    const newCoins: FloatingCoin[] = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + i * 12,
      amount,
    }));
    setFloatingCoins(newCoins);
    setTimeout(() => setFloatingCoins([]), 1200);
    setTimeout(() => setLastWon(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Бонус карточка */}
      <div className="card-game relative overflow-hidden" style={{ minHeight: 200 }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 70% 30%, hsl(42,95%,55%), transparent 60%)' }} />

        {/* Летящие монетки */}
        {floatingCoins.map(c => (
          <div
            key={c.id}
            className="absolute pointer-events-none"
            style={{
              left: `${c.x}%`,
              bottom: 40,
              animation: 'float-up 1.2s ease-out forwards',
              zIndex: 10,
            }}
          >
            <EnotCoin size={32} glow />
          </div>
        ))}

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-rubik font-bold text-lg text-white">Ежечасный бонус</h3>
            <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {ready ? '🎉 Можно забрать!' : `Следующий через ${mins}м ${String(secs).padStart(2, '0')}с`}
            </p>
          </div>
          <EnotCoin size={52} glow={ready} />
        </div>

        {/* Прогресс-бар кулдауна */}
        <div className="stat-bar mb-4">
          <div
            className="stat-bar-fill transition-all duration-1000"
            style={{ width: `${progress}%`, background: ready ? 'hsl(42,95%,55%)' : 'hsl(152,70%,45%)' }}
          />
        </div>

        {/* Превью суммы */}
        {ready && coinPreview && !lastWon && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Получишь примерно:</span>
            <CoinRow amount={coinPreview} />
          </div>
        )}

        {/* Результат */}
        {lastWon && (
          <div className="mb-3 flex items-center gap-3 animate-bounce-in">
            <CoinRow amount={lastWon} />
            <span className="font-rubik font-bold text-xl" style={{ color: 'hsl(var(--enot-gold))' }}>
              +{lastWon}!
            </span>
          </div>
        )}

        <button
          className={ready ? 'btn-gold w-full py-3 text-base font-bold' : 'btn-secondary w-full py-3 text-base'}
          style={{ opacity: ready ? 1 : 0.55, cursor: ready ? 'pointer' : 'not-allowed' }}
          onClick={handleClaim}
          disabled={!ready}
        >
          {ready ? (
            <span className="flex items-center justify-center gap-2">
              <EnotCoin size={22} /> Забрать бонус
            </span>
          ) : (
            `⏳ ${mins}:${String(secs).padStart(2, '0')}`
          )}
        </button>
      </div>

      {/* Монеты-кружочки — баланс */}
      <div className="card-game">
        <h3 className="font-rubik font-semibold mb-3">Твои монеты</h3>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(Math.floor(coins / 20) + 1, 10) }).map((_, i) => (
              <EnotCoin key={i} size={36} glow={i === 0} />
            ))}
            {coins > 200 && (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'hsl(220,20%,20%)',
                  border: '2px solid hsl(42,95%,45%)',
                  color: 'hsl(var(--enot-gold))',
                  zIndex: 1,
                }}
              >
                +{Math.floor(coins / 20) - 9}
              </div>
            )}
          </div>
          <div>
            <p className="font-rubik font-black text-3xl text-white">{coins}</p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>монет в кошельке</p>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="card-game">
        <h3 className="font-rubik font-semibold mb-3">Статистика</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Собрано бонусов', value: bonusStreak, emoji: '🎁' },
            { label: 'Кормлений', value: gameState.totalFed, emoji: '🍖' },
            { label: 'Игр сыграно', value: gameState.totalGames, emoji: '🎮' },
            { label: 'Уровень', value: gameState.enot.level, emoji: '⭐' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-2xl flex flex-col gap-1" style={{ background: 'hsl(var(--enot-surface2))' }}>
              <span style={{ fontSize: 22 }}>{s.emoji}</span>
              <p className="font-rubik font-bold text-xl text-white">{s.value}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
