import React, { useState, useCallback } from 'react';
import { GameAction } from '@/types/game';

interface Props {
  onExit: () => void;
  dispatch: (action: GameAction) => void;
}

type CellState = 'hidden' | 'open' | 'flagged' | 'mine';

const GRID = 5;
const MINES = 5;

function generateBoard() {
  const mines = new Set<number>();
  while (mines.size < MINES) mines.add(Math.floor(Math.random() * GRID * GRID));
  return Array.from({ length: GRID * GRID }, (_, i) => ({
    isMine: mines.has(i),
    state: 'hidden' as CellState,
    neighbors: 0,
  }));
}

function countNeighbors(board: ReturnType<typeof generateBoard>) {
  return board.map((cell, i) => {
    if (cell.isMine) return cell;
    const row = Math.floor(i / GRID), col = i % GRID;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < GRID && c >= 0 && c < GRID && board[r * GRID + c].isMine) count++;
      }
    }
    return { ...cell, neighbors: count };
  });
}

const NEIGHBOR_COLORS = ['', 'hsl(152,70%,55%)', 'hsl(42,95%,55%)', 'hsl(0,72%,55%)', 'hsl(270,70%,65%)', 'hsl(0,72%,45%)', 'hsl(210,80%,58%)', '#fff', '#aaa'];

export default function MinesGame({ onExit, dispatch }: Props) {
  const [board, setBoard] = useState(() => countNeighbors(generateBoard()));
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [opened, setOpened] = useState(0);
  const [reward, setReward] = useState(0);

  const totalSafe = GRID * GRID - MINES;

  const reveal = useCallback((idx: number) => {
    if (status !== 'playing') return;
    const cell = board[idx];
    if (cell.state !== 'hidden') return;

    const newBoard = [...board];
    if (cell.isMine) {
      newBoard.forEach(c => { if (c.isMine) c.state = 'mine'; });
      setBoard(newBoard);
      setStatus('lost');
      return;
    }

    const toOpen = [idx];
    while (toOpen.length) {
      const i = toOpen.pop()!;
      if (newBoard[i].state !== 'hidden') continue;
      newBoard[i] = { ...newBoard[i], state: 'open' };
      if (newBoard[i].neighbors === 0) {
        const row = Math.floor(i / GRID), col = i % GRID;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < GRID && c >= 0 && c < GRID) toOpen.push(r * GRID + c);
          }
        }
      }
    }

    const newOpened = newBoard.filter(c => c.state === 'open').length;
    setBoard(newBoard);
    setOpened(newOpened);

    if (newOpened === totalSafe) {
      const earned = 50 + Math.floor(newOpened * 2);
      setReward(earned);
      dispatch({ type: 'ADD_COINS', amount: earned });
      setStatus('won');
    }
  }, [board, status, totalSafe, dispatch]);

  const reset = () => {
    setBoard(countNeighbors(generateBoard()));
    setStatus('playing');
    setOpened(0);
    setReward(0);
  };

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <button className="btn-secondary text-sm px-3 py-2" onClick={onExit}>← Назад</button>
        <h2 className="font-rubik font-bold text-lg">💣 Сапёр</h2>
        <button className="btn-secondary text-sm px-3 py-2" onClick={reset}>Заново</button>
      </div>

      <div className="card-game flex items-center justify-between text-sm">
        <span>💣 Мин: {MINES}</span>
        <span>✅ Открыто: {opened}/{totalSafe}</span>
        <span>🪙 Награда: {Math.floor(50 + opened * 2)}</span>
      </div>

      {(status === 'won' || status === 'lost') && (
        <div
          className="card-game text-center animate-bounce-in"
          style={{ borderColor: status === 'won' ? 'hsl(var(--primary)/0.5)' : 'hsl(var(--destructive)/0.5)' }}
        >
          <p className="text-2xl mb-1">{status === 'won' ? '🎉' : '💥'}</p>
          <p className="font-rubik font-bold text-lg" style={{ color: status === 'won' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
            {status === 'won' ? `Победа! +${reward} монет` : 'Взрыв! Попробуй ещё'}
          </p>
        </div>
      )}

      <div
        className="grid gap-1.5 mx-auto w-full"
        style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, maxWidth: 320 }}
      >
        {board.map((cell, i) => {
          const isOpen = cell.state === 'open';
          const isMine = cell.state === 'mine';
          return (
            <button
              key={i}
              className="aspect-square rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{
                background: isOpen
                  ? 'hsl(var(--enot-surface2))'
                  : isMine
                  ? 'hsl(0,72%,25%)'
                  : 'hsl(var(--enot-surface))',
                border: `1px solid ${isOpen ? 'hsl(var(--border))' : isMine ? 'hsl(0,72%,40%)' : 'hsl(var(--border))'}`,
                color: isOpen && cell.neighbors > 0 ? NEIGHBOR_COLORS[cell.neighbors] : 'white',
                cursor: status === 'playing' && cell.state === 'hidden' ? 'pointer' : 'default',
              }}
              onClick={() => reveal(i)}
              disabled={status !== 'playing' || cell.state !== 'hidden'}
            >
              {isMine ? '💣' : isOpen && cell.neighbors > 0 ? cell.neighbors : isOpen ? '' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
