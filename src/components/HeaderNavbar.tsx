import React from 'react';

interface HeaderNavbarProps {
  p1Name: string;
  p1Hp: number;
  p2Name: string;
  p2Hp: number;
  timer: number;
  isGameActive: boolean;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  p1Name,
  p1Hp,
  p2Name,
  p2Hp,
  timer,
  isGameActive
}) => {
  return (
    <header id="arena-header" className="relative z-20 p-4 md:p-6 flex flex-col items-center border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md">
      <div className="w-full max-w-6xl flex justify-between items-end px-2 md:px-8 mb-1">
        {/* Player 1 Health Bar (Red Side) */}
        <div className="flex flex-col items-start gap-1.5 w-1/3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-red-500 uppercase truncate max-w-[140px]">
              {p1Name || 'PLAYER 01'}
            </span>
            <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.5 rounded font-mono">
              LOCAL
            </span>
          </div>
          <div className="w-full h-5 bg-neutral-900 border border-neutral-700/80 relative rounded-sm overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-700 via-red-600 to-red-400 transition-all duration-500 ease-out"
              style={{ width: `${p1Hp}%` }}
            />
            {/* HP Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] font-mono font-bold text-white drop-shadow">
              {p1Hp} / 100 HP
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono tracking-wider">
            AI_FACIAL_INTEGRITY: <span className={p1Hp < 40 ? 'text-red-500 font-bold animate-pulse' : 'text-neutral-300'}>{p1Hp}%</span>
          </div>
        </div>

        {/* Center Title & Timer */}
        <div className="flex flex-col items-center mx-2">
          <div className="text-2xl md:text-4xl font-black italic tracking-tighter text-white mb-[-2px] drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            FACE-OFF
          </div>
          <div className="bg-red-600 px-3 py-0.5 text-xs md:text-sm font-bold italic tracking-wider skew-x-[-12deg] shadow-lg mb-1">
            ARENA AI v4.2
          </div>
          {isGameActive ? (
            <div className="text-3xl md:text-5xl font-mono font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse">
              {timer < 10 ? `0${timer}` : timer}
            </div>
          ) : (
            <div className="text-xs font-mono text-neutral-500 tracking-widest uppercase">
              1v1 ONLINE KNOWLEDGE FIGHT
            </div>
          )}
        </div>

        {/* Player 2 Health Bar (Blue Side) */}
        <div className="flex flex-col items-end gap-1.5 w-1/3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-950/80 text-blue-400 border border-blue-800/60 px-1.5 py-0.5 rounded font-mono">
              OPPONENT
            </span>
            <span className="text-xs font-bold tracking-widest text-blue-500 uppercase truncate max-w-[140px]">
              {p2Name || 'PLAYER 02'}
            </span>
          </div>
          <div className="w-full h-5 bg-neutral-900 border border-neutral-700/80 relative rounded-sm overflow-hidden shadow-inner">
            <div
              className="absolute top-0 right-0 h-full bg-gradient-to-l from-blue-700 via-blue-600 to-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${p2Hp}%` }}
            />
            {/* HP Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-start pl-2 text-[11px] font-mono font-bold text-white drop-shadow">
              {p2Hp} / 100 HP
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono tracking-wider">
            AI_FACIAL_INTEGRITY: <span className={p2Hp < 40 ? 'text-blue-400 font-bold animate-pulse' : 'text-neutral-300'}>{p2Hp}%</span>
          </div>
        </div>
      </div>
    </header>
  );
};
