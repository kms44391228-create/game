import React from 'react';
import { Camera, Users, Bot, Volume2, VolumeX, Shield, Swords, Sparkles, HelpCircle } from 'lucide-react';

interface MatchmakingLobbyProps {
  playerName: string;
  onNameChange: (name: string) => void;
  faceUrl: string;
  onOpenScanner: () => void;
  onStartOnlineMatch: () => void;
  onStartAiMatch: () => void;
  isSearching: boolean;
  onCancelSearch: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MatchmakingLobby: React.FC<MatchmakingLobbyProps> = ({
  playerName,
  onNameChange,
  faceUrl,
  onOpenScanner,
  onStartOnlineMatch,
  onStartAiMatch,
  isSearching,
  onCancelSearch,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <div id="matchmaking-lobby-screen" className="flex-grow flex flex-col items-center justify-between p-4 sm:p-8 max-w-5xl mx-auto w-full relative z-10">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col items-center text-center gap-2 mt-2 sm:mt-4">
        <div className="flex items-center gap-2 bg-red-950/80 border border-red-800 px-4 py-1.5 rounded-full text-xs font-mono text-red-400 uppercase tracking-widest animate-pulse">
          <Swords className="w-4 h-4 text-red-500" />
          REAL-TIME 1v1 FACE FIGHTER ARENA
        </div>
        <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight uppercase text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          얼굴 등록 1대1 AI 격투전
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg font-mono">
          사진 등록 후 넌센스 & 기초상식 퀴즈 대결! 오답 시 -10 HP 데미지를 입고, AI가 얼굴에 실시간 상처와 피멍을 그립니다.
        </p>
      </div>

      {/* Main Fighter Setup Panel */}
      <div className="w-full my-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Player Profile & Camera Card */}
        <div className="bg-neutral-900/90 border-2 border-red-500/40 rounded-2xl p-6 flex flex-col items-center gap-4 relative shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 self-start">
            <Sparkles className="w-4 h-4 text-red-500" /> MY FIGHTER AVATAR
          </div>

          <div className="relative group w-44 h-44 bg-neutral-950 rounded-2xl overflow-hidden border-2 border-red-500/60 shadow-xl flex items-center justify-center">
            {faceUrl ? (
              <img src={faceUrl} alt="Registered Face" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-500 p-4 text-center">
                <Camera className="w-10 h-10 text-red-500 animate-pulse" />
                <span className="text-xs font-mono">얼굴 사진이 등록되지 않았습니다</span>
              </div>
            )}

            {/* Hover overlay to re-scan */}
            <button
              onClick={onOpenScanner}
              className="absolute inset-0 bg-red-950/80 backdrop-blur-sm text-white font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200"
            >
              <Camera className="w-6 h-6" />
              <span>{faceUrl ? '얼굴 재촬영 / 변경' : '얼굴 촬영 및 등록'}</span>
            </button>
          </div>

          {/* Nickname Input */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              파이터 닉네임
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="닉네임 입력"
              maxLength={12}
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-red-500 text-white font-bold px-4 py-2.5 rounded-xl font-mono text-center outline-none transition"
            />
          </div>

          <button
            onClick={onOpenScanner}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-red-400 border border-neutral-700 font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> {faceUrl ? '얼굴 사진 변경하기' : '웹캠 / 파일로 얼굴 등록'}
          </button>
        </div>

        {/* Right: Game Rules & Battle Mode Triggers */}
        <div className="bg-neutral-900/90 border-2 border-neutral-800 rounded-2xl p-6 flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-mono text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> BATTLE RULES GUIDE
            </div>
            <ul className="text-xs font-mono text-neutral-300 space-y-2 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>총 HP: <strong>100</strong> (퀴즈 1문제당 틀리면 -10 HP)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>출제 종목: <strong>넌센스 퀴즈 + 상식 퀴즈</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>실시간 상처: <strong>타격받을수록 얼굴이 붓고 피투성이로 변화!</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>매칭: 같은 웹 접속자 <strong>실시간 1v1</strong> 또는 <strong>AI 보스전</strong></span>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            {isSearching ? (
              <div className="flex flex-col items-center gap-2 bg-neutral-950 border border-yellow-500/50 p-4 rounded-xl animate-pulse">
                <span className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-widest">
                  ONLINE OPPONENT SEARCHING...
                </span>
                <button
                  onClick={onCancelSearch}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-lg transition"
                >
                  매칭 취소
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onStartOnlineMatch}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase text-lg rounded-xl skew-x-[-8deg] shadow-[0_0_25px_rgba(239,68,68,0.4)] transition flex items-center justify-center gap-3"
                >
                  <Users className="w-5 h-5 unskew" />
                  <span>온라인 1대1 매칭 시작</span>
                </button>

                <button
                  onClick={onStartAiMatch}
                  className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 font-black italic uppercase text-base rounded-xl skew-x-[-8deg] transition flex items-center justify-center gap-3"
                >
                  <Bot className="w-5 h-5 text-blue-400" />
                  <span>AI 보스 싱글 매치</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="w-full flex items-center justify-between border-t border-neutral-800 pt-4 mt-2">
        <div className="flex items-center gap-2 text-neutral-500 font-mono text-[10px]">
          <span className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
            UPLOAD_SRC_ACTIVE
          </span>
          <span className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
            LIVE_MESH_DEFORM_ON
          </span>
        </div>

        <button
          onClick={onToggleSound}
          className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-2 font-mono text-xs"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          <span>{soundEnabled ? '사운드 ON' : '사운드 OFF'}</span>
        </button>
      </div>
    </div>
  );
};
