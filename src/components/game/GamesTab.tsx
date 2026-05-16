import React, { useState } from 'react';
import { GameState, GameAction } from '@/types/game';
import MinesGame from './MinesGame';
import ClickerGame from './ClickerGame';

interface Props {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

type ActiveGame = null | 'mines' | 'clicker';

const activities = [
  { id: 'walk',       name: 'Прогулка',  emoji: '🌳', desc: 'Настроение +15',  mood: 15, energy: 10, anim: '🌳🦝🌲' },
  { id: 'football',   name: 'Футбол',    emoji: '⚽', desc: 'Настроение +20',  mood: 20, energy: 20, anim: '⚽🦝🥅' },
  { id: 'basketball', name: 'Баскетбол', emoji: '🏀', desc: 'Настроение +25',  mood: 25, energy: 25, anim: '🏀🦝🏆' },
];

const miniGames = [
  { id: 'mines',   name: 'Мины',   emoji: '💣', desc: 'Рискни — заработай' },
  { id: 'clicker', name: 'Кликер', emoji: '👆', desc: 'Кликай и зарабатывай' },
];

export default function GamesTab({ gameState, dispatch }: Props) {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [result, setResult] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleActivity = (act: typeof activities[0]) => {
    if (gameState.enot.energy < 10) {
      setResult('Енот слишком устал! Дай ему отдохнуть 😴');
      setTimeout(() => setResult(null), 2500);
      return;
    }
    setPlayingId(act.id);
    setTimeout(() => {
      dispatch({ type: 'PLAY_GAME', game: act.id });
      setResult(`${act.anim}  +${act.mood} настроения!`);
      setPlayingId(null);
      setTimeout(() => setResult(null), 2500);
    }, 1200);
  };

  if (activeGame === 'mines') {
    return <MinesGame onExit={() => setActiveGame(null)} dispatch={dispatch} coins={gameState.coins} />;
  }
  if (activeGame === 'clicker') {
    return <ClickerGame onExit={() => setActiveGame(null)} dispatch={dispatch} />;
  }

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {result && (
        <div
          className="card-game text-center font-semibold text-lg animate-bounce-in"
          style={{ borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))' }}
        >
          {result}
        </div>
      )}

      {/* Активности */}
      <div>
        <h3 className="font-rubik font-semibold mb-3">🎉 Активности</h3>
        <div className="flex flex-col gap-3">
          {activities.map(a => {
            const isPlaying = playingId === a.id;
            return (
              <div
                key={a.id}
                className="card-game flex items-center justify-between transition-all duration-300"
                style={{
                  borderColor: isPlaying ? 'hsl(var(--primary)/0.7)' : undefined,
                  transform: isPlaying ? 'scale(1.02)' : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      fontSize: 40,
                      display: 'inline-block',
                      animation: isPlaying ? 'bounce 0.5s infinite alternate' : undefined,
                      transition: 'transform 0.2s',
                    }}
                  >
                    {a.emoji}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{a.name}</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {a.desc} · Энергия −{a.energy}
                    </p>
                  </div>
                </div>
                <button
                  className="btn-primary text-xs px-4 py-2 transition-all"
                  style={{ opacity: isPlaying ? 0.6 : 1 }}
                  disabled={isPlaying}
                  onClick={() => handleActivity(a)}
                >
                  {isPlaying ? '...' : 'Играть'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Мини-игры */}
      <div>
        <h3 className="font-rubik font-semibold mb-3">🎮 Мини-игры</h3>
        <div className="grid grid-cols-2 gap-3">
          {miniGames.map(g => (
            <div key={g.id} className="card-game flex flex-col gap-3">
              <span style={{ fontSize: 48 }}>{g.emoji}</span>
              <div>
                <p className="font-semibold text-white">{g.name}</p>
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{g.desc}</p>
              </div>
              <button
                className="btn-gold text-xs py-2 w-full"
                onClick={() => setActiveGame(g.id as ActiveGame)}
              >
                Играть
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Энергия */}
      <div className="card-game flex items-center gap-3">
        <span style={{ fontSize: 32 }}>⚡</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Энергия: {gameState.enot.energy}%</p>
          <div className="stat-bar mt-1.5">
            <div className="stat-bar-fill" style={{ width: `${gameState.enot.energy}%`, background: 'hsl(270,70%,65%)' }} />
          </div>
        </div>
        <button
          className="btn-secondary text-xs px-3 py-2"
          onClick={() => dispatch({ type: 'QUICK_SLEEP' })}
        >
          Отдохнуть
        </button>
      </div>
    </div>
  );
}
