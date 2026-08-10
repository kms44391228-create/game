import React, { useState, useEffect } from 'react';
import { Camera, Users, Bot, Volume2, VolumeX, Swords, Sparkles, HelpCircle, Share2, Copy, Check, Link, KeyRound, UserPlus, AlertCircle } from 'lucide-react';

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

  // Friend Private Room Props
  onCreateCustomRoom: () => void;
  onJoinCustomRoom: (code: string) => void;
  onCancelCustomRoom: () => void;
  customRoomCode: string;
  isWaitingCustomRoom: boolean;
  customRoomError: string | null;
  initialRoomCode?: string;
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
  onToggleSound,
  onCreateCustomRoom,
  onJoinCustomRoom,
  onCancelCustomRoom,
  customRoomCode,
  isWaitingCustomRoom,
  customRoomError,
  initialRoomCode = ''
}) => {
  const [typedCode, setTypedCode] = useState<string>(initialRoomCode);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialRoomCode) {
      setTypedCode(initialRoomCode.toUpperCase().trim());
    }
  }, [initialRoomCode]);

  const handleCopyInviteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${customRoomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

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
      <div className="w-full my-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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

        {/* Right: Game Modes & Private Room Options */}
        <div className="bg-neutral-900/90 border-2 border-neutral-800 rounded-2xl p-6 flex flex-col gap-5">
          {/* Friend Private Room Box (Top Priority for Link Sharing) */}
          <div className="bg-gradient-to-b from-amber-950/40 to-neutral-950 border-2 border-amber-500/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                친구 초대 1v1 대결 (링크/코드 매칭)
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/40">
                RECOMMENDED
              </span>
            </div>

            {/* If Opened via Invite Link */}
            {initialRoomCode && !isWaitingCustomRoom && (
              <div className="bg-amber-900/60 border border-amber-400/80 p-3 rounded-xl text-xs font-mono text-amber-200 flex items-center justify-between gap-2 animate-pulse">
                <span>초대 링크 접속: 방 <strong>[{initialRoomCode}]</strong></span>
                <button
                  onClick={() => onJoinCustomRoom(initialRoomCode)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg transition shrink-0"
                >
                  즉시 대결 입장
                </button>
              </div>
            )}

            {/* If Currently Waiting in Created Custom Room */}
            {isWaitingCustomRoom ? (
              <div className="flex flex-col items-center text-center gap-3 bg-neutral-900 p-4 rounded-xl border border-amber-500/40 animate-pulse">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                  <Swords className="w-5 h-5 text-amber-400 animate-spin" />
                  <span>친구 대기 중... 링크를 공유하세요!</span>
                </div>

                <div className="bg-black/80 px-6 py-2.5 rounded-lg border border-amber-500/60 font-mono text-2xl font-black text-amber-300 tracking-widest">
                  {customRoomCode}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={handleCopyInviteLink}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-mono text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '초대 링크 복사 완료!' : '초대 링크 복사 (Vercel/공유)'}</span>
                  </button>
                  <button
                    onClick={onCancelCustomRoom}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-bold rounded-lg transition border border-neutral-700"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* 1. Create Room Button */}
                <button
                  onClick={onCreateCustomRoom}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  <Share2 className="w-4 h-4" />
                  <span>방 만들고 초대 링크 생성하기</span>
                </button>

                {/* 2. Join via Code */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>초대받은 방 코드로 참가</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={typedCode}
                      onChange={(e) => setTypedCode(e.target.value.toUpperCase())}
                      placeholder="방 코드 입력 (예: A8X2K9)"
                      maxLength={8}
                      className="flex-1 bg-neutral-950 border border-neutral-700 focus:border-amber-500 text-white font-mono text-xs font-bold px-3 py-2 rounded-lg outline-none uppercase text-center"
                    />
                    <button
                      onClick={() => typedCode.trim() && onJoinCustomRoom(typedCode.trim())}
                      disabled={!typedCode.trim()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-amber-600 disabled:opacity-40 hover:text-black text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/40 transition flex items-center gap-1"
                    >
                      <span>입장</span>
                    </button>
                  </div>
                </div>

                {/* Custom Room Error display */}
                {customRoomError && (
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-950/60 border border-red-800 p-2.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{customRoomError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Match & AI Match Buttons */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-800">
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              기타 대결 모드
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center gap-2 bg-neutral-950 border border-yellow-500/50 p-3 rounded-xl animate-pulse">
                <span className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-widest">
                  무작위 매칭 상대 검색 중...
                </span>
                <button
                  onClick={onCancelSearch}
                  className="px-5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-lg transition"
                >
                  매칭 취소
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onStartOnlineMatch}
                  className="py-3 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 font-bold uppercase text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>랜덤 빠른 매칭</span>
                </button>

                <button
                  onClick={onStartAiMatch}
                  className="py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold uppercase text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>AI 보스 싱글 매치</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="w-full flex items-center justify-between border-t border-neutral-800 pt-4 mt-2">
        <div className="flex items-center gap-2 text-neutral-500 font-mono text-[10px]">
          <span className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
            INVITE_LINK_MATCHMAKER_ACTIVE
          </span>
          <span className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
            PORT_3000_WS_SYNC
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

