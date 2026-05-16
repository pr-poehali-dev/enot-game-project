import React, { useState, useEffect, useRef } from 'react';
import { GameAction } from '@/types/game';

interface Props {
  onExit: () => void;
  dispatch: (action: GameAction) => void;
}

export default function ClickerGame({ onExit, dispatch }: Props) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reward = Math.floor(clicks * 0.5);

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
      setDone(true);
      dispatch({ type: 'ADD_COINS', amount: reward });
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, timeLeft, reward, dispatch]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!running && !done) setRunning(true);
    if (!running) return;
    setClicks(c => c + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setParticles(p => [...(p || []), { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setParticles(p => p?.filter(pt => pt.id !== id)), 700);
  };

  const reset = () => {
    setClicks(0);
    setTimeLeft(15);
    setRunning(false);
    setDone(false);
    setParticles([]);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const progress = (timeLeft / 15) * 100;

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <button className="btn-secondary text-sm px-3 py-2" onClick={onExit}>← Назад</button>
        <h2 className="font-rubik font-bold text-lg">👆 Кликер</h2>
        <button className="btn-secondary text-sm px-3 py-2" onClick={reset}>Заново</button>
      </div>

      <div className="card-game">
        <div className="flex items-center justify-between text-sm mb-2">
          <span style={{ color: 'hsl(var(--muted-foreground))' }}>Время</span>
          <span className="font-bold" style={{ color: timeLeft <= 5 ? 'hsl(0,72%,55%)' : 'hsl(var(--primary))' }}>
            {timeLeft}с
          </span>
        </div>
        <div className="stat-bar">
          <div
            className="stat-bar-fill transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: timeLeft <= 5 ? 'hsl(0,72%,55%)' : 'hsl(152,70%,45%)',
            }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 card-game text-center py-4">
          <p className="text-3xl font-rubik font-black text-white">{clicks}</p>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>кликов</p>
        </div>
        <div className="flex-1 card-game text-center py-4">
          <p className="text-3xl font-rubik font-black" style={{ color: 'hsl(var(--enot-gold))' }}>{reward}</p>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>монет</p>
        </div>
      </div>

      {done ? (
        <div className="card-game text-center py-6 animate-bounce-in" style={{ borderColor: 'hsl(var(--primary)/0.5)' }}>
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-rubik font-bold text-xl" style={{ color: 'hsl(var(--primary))' }}>
            +{reward} монет!
          </p>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {clicks} кликов за 15 секунд
          </p>
          <button className="btn-primary mt-4 px-6" onClick={reset}>Ещё раз</button>
        </div>
      ) : (
        <button
          className="relative overflow-hidden rounded-3xl font-rubik font-black text-2xl transition-all active:scale-95"
          style={{
            height: 200,
            background: running
              ? 'linear-gradient(135deg, hsl(152,60%,25%), hsl(152,70%,35%))'
              : 'linear-gradient(135deg, hsl(42,80%,30%), hsl(42,95%,45%))',
            border: `3px solid ${running ? 'hsl(152,70%,45%)' : 'hsl(42,95%,55%)'}`,
            color: running ? 'hsl(152,70%,80%)' : 'hsl(42,95%,20%)',
            boxShadow: running
              ? '0 8px 32px hsla(152,70%,45%,0.4)'
              : '0 8px 32px hsla(42,95%,55%,0.3)',
          }}
          onClick={handleClick}
        >
          {!running && !done && <span>Нажми чтобы начать!</span>}
          {running && (
            <div className="flex flex-col items-center gap-1">
              <span style={{ fontSize: 64 }}>🦝</span>
              <span className="text-lg">КЛИК!</span>
            </div>
          )}
          {particles?.map(p => (
            <span
              key={p.id}
              className="absolute pointer-events-none font-bold text-lg animate-bounce-in"
              style={{
                left: p.x,
                top: p.y,
                color: 'hsl(var(--enot-gold))',
                transform: 'translate(-50%, -100%)',
                animation: 'slide-up 0.7s ease-out forwards',
              }}
            >
              +1
            </span>
          ))}
        </button>
      )}
    </div>
  );
}
