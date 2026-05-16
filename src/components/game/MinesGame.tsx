import React, { useState, useCallback } from 'react';
import { GameAction } from '@/types/game';

interface Props {
  onExit: () => void;
  dispatch: (action: GameAction) => void;
  coins: number;
}

const GRID = 5;
const MINES = 5;
const TOTAL_SAFE = GRID * GRID - MINES;

function generateBoard() {
  const mines = new Set<number>();
  while (mines.size < MINES) mines.add(Math.floor(Math.random() * GRID * GRID));
  return Array.from({ length: GRID * GRID }, (_, i) => ({
    isMine: mines.has(i),
    state: 'hidden' as 'hidden' | 'open' | 'mine',
  }));
}

function getMultiplier(opened: number): number {
  if (opened === 0) return 1;
  return parseFloat((1 + opened * 0.35).toFixed(2));
}

export default function MinesGame({ onExit, dispatch, coins }: Props) {
  const [board, setBoard] = useState(() => generateBoard());
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [bet, setBet] = useState(10);
  const [opened, setOpened] = useState(0);
  const [cashed, setCashed] = useState(false);

  const multiplier = getMultiplier(opened);
  const potential = Math.floor(bet * multiplier);

  const startGame = () => {
    if (bet <= 0 || bet > coins) return;
    dispatch({ type: 'ADD_COINS', amount: -bet });
    setBoard(generateBoard());
    setOpened(0);
    setCashed(false);
    setStatus('playing');
  };

  const reveal = useCallback((idx: number) => {
    if (status !== 'playing') return;
    const cell = board[idx];
    if (cell.state !== 'hidden') return;

    const newBoard = [...board];
    if (cell.isMine) {
      newBoard.forEach((c, i) => {
        newBoard[i] = { ...c, state: c.isMine ? 'mine' : c.state };
      });
      setBoard(newBoard);
      setStatus('lost');
      return;
    }

    newBoard[idx] = { ...cell, state: 'open' };
    const newOpened = newBoard.filter(c => c.state === 'open').length;
    setBoard(newBoard);
    setOpened(newOpened);

    if (newOpened === TOTAL_SAFE) {
      const earned = Math.floor(bet * getMultiplier(newOpened));
      dispatch({ type: 'ADD_COINS', amount: earned });
      setStatus('won');
    }
  }, [board, status, bet, dispatch]);

  const cashOut = () => {
    if (status !== 'playing' || opened === 0) return;
    const earned = Math.floor(bet * multiplier);
    dispatch({ type: 'ADD_COINS', amount: earned });
    setCashed(true);
    setStatus('won');
  };

  const reset = () => {
    setBoard(generateBoard());
    setStatus('idle');
    setOpened(0);
    setCashed(false);
  };

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <button className="btn-secondary text-sm px-3 py-2" onClick={onExit}>← Назад</button>
        <h2 className="font-rubik font-bold text-lg">💣 Мины</h2>
        <button className="btn-secondary text-sm px-3 py-2" onClick={reset}>Заново</button>
      </div>

      {/* Ставка */}
      {status === 'idle' && (
        <div className="card-game flex flex-col gap-4">
          <h3 className="font-rubik font-semibold text-white">Сделай ставку</h3>
          <div className="flex gap-2 items-center">
            <button
              className="btn-secondary text-sm px-3 py-2 rounded-xl"
              onClick={() => setBet(b => Math.max(1, b - 10))}
            >−10</button>
            <input
              type="number"
              min={1}
              max={coins}
              value={bet}
              onChange={e => setBet(Math.max(1, Math.min(coins, Number(e.target.value))))}
              className="flex-1 text-center rounded-xl py-2 font-bold text-lg text-white"
              style={{ background: 'hsl(var(--enot-surface2))', border: '1px solid hsl(var(--border))' }}
            />
            <button
              className="btn-secondary text-sm px-3 py-2 rounded-xl"
              onClick={() => setBet(b => Math.min(coins, b + 10))}
            >+10</button>
          </div>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map(v => (
              <button
                key={v}
                className="flex-1 text-xs py-2 rounded-xl font-bold transition-all"
                style={{
                  background: bet === v ? 'hsl(var(--enot-gold)/0.25)' : 'hsl(var(--enot-surface2))',
                  color: bet === v ? 'hsl(var(--enot-gold))' : 'hsl(var(--muted-foreground))',
                  border: `1px solid ${bet === v ? 'hsl(var(--enot-gold)/0.5)' : 'transparent'}`,
                }}
                onClick={() => setBet(Math.min(coins, v))}
              >
                {v}🪙
              </button>
            ))}
          </div>
          <button
            className="btn-gold py-3 text-base font-bold w-full"
            disabled={bet <= 0 || bet > coins}
            style={{ opacity: bet > 0 && bet <= coins ? 1 : 0.4 }}
            onClick={startGame}
          >
            Начать игру · ставка {bet}🪙
          </button>
          <p className="text-xs text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {MINES} мин на поле · каждая открытая клетка увеличивает коэффициент
          </p>
        </div>
      )}

      {/* Статус игры */}
      {status !== 'idle' && (
        <div className="card-game flex items-center justify-between text-sm">
          <div className="flex flex-col items-center gap-0.5">
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Ставка</span>
            <span className="font-bold text-white">{bet}🪙</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Открыто</span>
            <span className="font-bold text-white">{opened}/{TOTAL_SAFE}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Коэфф.</span>
            <span className="font-bold" style={{ color: 'hsl(var(--enot-gold))' }}>×{multiplier}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Выигрыш</span>
            <span className="font-bold" style={{ color: 'hsl(152,70%,55%)' }}>{potential}🪙</span>
          </div>
        </div>
      )}

      {/* Результат */}
      {(status === 'won' || status === 'lost') && (
        <div
          className="card-game text-center animate-bounce-in"
          style={{ borderColor: status === 'won' ? 'hsl(152,70%,45%/0.5)' : 'hsl(0,72%,45%/0.5)' }}
        >
          <p className="text-3xl mb-1">{status === 'won' ? (cashed ? '💰' : '🎉') : '💥'}</p>
          <p className="font-rubik font-bold text-lg" style={{ color: status === 'won' ? 'hsl(152,70%,55%)' : 'hsl(0,72%,55%)' }}>
            {status === 'won'
              ? `+${Math.floor(bet * getMultiplier(opened))} монет!`
              : 'Взрыв! Ставка сгорела'}
          </p>
          {status === 'won' && <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Коэффициент ×{multiplier}</p>}
        </div>
      )}

      {/* Поле */}
      {status !== 'idle' && (
        <div
          className="grid gap-1.5 mx-auto w-full"
          style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, maxWidth: 340 }}
        >
          {board.map((cell, i) => {
            const isOpen = cell.state === 'open';
            const isMine = cell.state === 'mine';
            const isPlayable = status === 'playing' && cell.state === 'hidden';
            return (
              <button
                key={i}
                className="aspect-square rounded-xl text-xl font-bold transition-all duration-150"
                style={{
                  background: isOpen
                    ? 'hsl(152,70%,20%)'
                    : isMine
                    ? 'hsl(0,72%,22%)'
                    : isPlayable
                    ? 'hsl(var(--enot-surface))'
                    : 'hsl(var(--enot-surface2))',
                  border: `1.5px solid ${
                    isOpen ? 'hsl(152,70%,40%)' : isMine ? 'hsl(0,72%,40%)' : 'hsl(var(--border))'
                  }`,
                  transform: isPlayable ? undefined : undefined,
                  cursor: isPlayable ? 'pointer' : 'default',
                  boxShadow: isOpen ? '0 0 8px hsl(152,70%,30%/0.5)' : undefined,
                }}
                onClick={() => reveal(i)}
                disabled={!isPlayable}
              >
                {isMine ? '💣' : isOpen ? '✅' : ''}
              </button>
            );
          })}
        </div>
      )}

      {/* Кнопка вывести */}
      {status === 'playing' && opened > 0 && (
        <button
          className="btn-gold py-3 text-base font-bold w-full animate-bounce-in"
          onClick={cashOut}
        >
          💰 Вывести {potential} монет (×{multiplier})
        </button>
      )}

      {(status === 'won' || status === 'lost') && (
        <button className="btn-primary py-3 text-base font-bold w-full" onClick={reset}>
          Сыграть ещё
        </button>
      )}
    </div>
  );
}
