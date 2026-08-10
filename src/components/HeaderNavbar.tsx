import React from 'react';
import { LogOut, Volume2, VolumeX } from 'lucide-react';

interface HeaderNavbarProps {
  p1Name: string;
  p1Hp: number;
  p2Name: string;
  p2Hp: number;
  timer: number;
  isGameActive: boolean;
  onExitGame?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  p1Name,
  p1Hp,
  p2Name,
  p2Hp,
  timer,
  isGameActive,
  onExitGame,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header id="arena-header" className="relative z-20 p-3 md:p-5 flex flex-col items-center border-b border-neutral-800/60 bg-neutral-950/90 backdrop-blur-md">
      <div className="w-full max-w-6xl flex justify-between items-center px-2 md:px-8">
        {/* Left: Player 1 Health Bar (Red Side) */}
        <div className="flex flex-col items-start gap-1.5 w-5/12 max-w-[280px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                YOU
              </span>
              <span className="text-xs font-bold tracking-wider text-red-400 uppercase truncate">
                {p1Name || 'PLAYER 01'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-red-300 ml-1 shrink-0">
              {p1Hp} HP
            </span>
          </div>
          <div className="w-full h-4 bg-neutral-900 border border-neutral-700/80 relative rounded-sm overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-700 via-red-600 to-red-400 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(0, p1Hp)}%` }}
            />
          </div>
        </div>

        {/* Center: Title & Timer & Controls */}
        <div className="flex flex-col items-center mx-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="text-xl md:text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
              FACE-OFF
            </div>
            {onExitGame && (
              <button
                onClick={onExitGame}
                title="게임 나가기 (로비로 돌아가기)"
                className="flex items-center gap-1 px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-800/80 font-mono text-xs font-bold rounded-lg transition shadow-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">나가기</span>
              </button>
            )}
            {onToggleSound && (
              <button
                onClick={onToggleSound}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 rounded-lg transition"
                title={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-yellow-400" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
              </button>
            )}
          </div>

          {isGameActive ? (
            <div className="text-2xl md:text-4xl font-mono font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse mt-0.5">
              {timer < 10 ? `0${timer}` : timer}
            </div>
          ) : (
            <div className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mt-0.5">
              1v1 KNOWLEDGE FIGHT
            </div>
          )}
        </div>

        {/* Right: Player 2 Health Bar (Blue Side) */}
        <div className="flex flex-col items-end gap-1.5 w-5/12 max-w-[280px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-mono font-bold text-blue-300 mr-1 shrink-0">
              {p2Hp} HP
            </span>
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase truncate">
                {p2Name || 'PLAYER 02'}
              </span>
              <span className="text-[10px] bg-blue-950/80 text-blue-400 border border-blue-800/60 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                VS
              </span>
            </div>
          </div>
          <div className="w-full h-4 bg-neutral-900 border border-neutral-700/80 relative rounded-sm overflow-hidden shadow-inner">
            <div
              className="absolute top-0 right-0 h-full bg-gradient-to-l from-blue-700 via-blue-600 to-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(0, p2Hp)}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

