import React from 'react';
import { Trophy, Skull, RotateCcw, Home, Swords, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  isWinner: boolean;
  winnerName: string;
  p1Name: string;
  p1Hp: number;
  p1FaceUrl: string;
  p2Name: string;
  p2Hp: number;
  p2FaceUrl: string;
  onRematch: () => void;
  onReturnLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isWinner,
  winnerName,
  p1Name,
  p1Hp,
  p2Name,
  p2Hp,
  p1FaceUrl,
  p2FaceUrl,
  onRematch,
  onReturnLobby
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 relative shadow-[0_0_80px_rgba(239,68,68,0.4)] animate-scale-in">
        {/* Victory / Defeat Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            {isWinner ? (
              <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
            ) : (
              <Skull className="w-12 h-12 text-red-500 animate-pulse" />
            )}
          </div>

          <h1
            className={`text-4xl sm:text-6xl font-black italic uppercase tracking-tighter drop-shadow-lg ${
              isWinner ? 'text-yellow-400' : 'text-red-500'
            }`}
          >
            {isWinner ? 'VICTORY K.O.!' : 'DEFEATED K.O.'}
          </h1>

          <p className="text-sm font-mono text-neutral-300">
            승리자: <span className="font-bold text-yellow-400">{winnerName}</span>
          </p>
        </div>

        {/* Final Fighter Faces Comparison */}
        <div className="w-full grid grid-cols-2 gap-4 my-2">
          {/* P1 Local Player */}
          <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-red-400 uppercase font-bold">
              {p1Name} (내 얼굴)
            </span>
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-2 border-red-500/50 relative">
              {p1FaceUrl ? (
                <img src={p1FaceUrl} alt={p1Name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs font-mono">
                  NO IMAGE
                </div>
              )}
            </div>
            <div className="text-xs font-mono font-bold text-neutral-300">
              최종 HP: <span className={p1Hp <= 0 ? 'text-red-500 font-black' : 'text-green-400'}>{p1Hp}</span>
            </div>
          </div>

          {/* P2 Opponent */}
          <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-blue-400 uppercase font-bold">
              {p2Name} (상대 파이터)
            </span>
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-2 border-blue-500/50 relative">
              {p2FaceUrl ? (
                <img src={p2FaceUrl} alt={p2Name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs font-mono text-neutral-500">
                  AI TITAN
                </div>
              )}
            </div>
            <div className="text-xs font-mono font-bold text-neutral-300">
              최종 HP: <span className={p2Hp <= 0 ? 'text-red-500 font-black' : 'text-green-400'}>{p2Hp}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
          <button
            onClick={onRematch}
            className="w-full sm:flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase text-base rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> 다시 재대결하기
          </button>

          <button
            onClick={onReturnLobby}
            className="w-full sm:flex-1 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> 로비로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
