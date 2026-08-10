import React, { useState, useEffect } from 'react';
import { Camera, Bot, Volume2, VolumeX, Swords, Sparkles, Plus, RefreshCw, Copy, Check, KeyRound, UserPlus, AlertCircle, PlayCircle, ShieldAlert } from 'lucide-react';
import { WaitingRoomInfo } from '../types';

interface MatchmakingLobbyProps {
  playerName: string;
  onNameChange: (name: string) => void;
  faceUrl: string;
  onOpenScanner: () => void;
  onStartAiMatch: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;

  // Rooms List & Custom Room
  openRooms: WaitingRoomInfo[];
  onRefreshRooms: () => void;
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
  onStartAiMatch,
  soundEnabled,
  onToggleSound,
  openRooms,
  onRefreshRooms,
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
          사진 등록 후 퀴즈 대결! 오답 시 -10 HP 데미지를 입고, AI가 얼굴에 실시간 상처와 피멍을 그립니다.
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

          {/* Single Player Mode Alternative */}
          <div className="w-full pt-3 border-t border-neutral-800 flex flex-col gap-1.5">
            <span className="text-[11px] font-mono text-neutral-400">싱글 플레이</span>
            <button
              onClick={onStartAiMatch}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-blue-300 border border-blue-500/30 font-bold uppercase text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-blue-400" />
              <span>AI 보스 싱글 대결</span>
            </button>
          </div>
        </div>

        {/* Right: Room List & Create Room Options */}
        <div className="bg-neutral-900/90 border-2 border-neutral-800 rounded-2xl p-6 flex flex-col gap-5">
          {/* Top Banner for Room Matchmaking */}
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              1v1 격투 대결 방 선택 / 만들기
            </span>
            <button
              onClick={onRefreshRooms}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg transition text-xs flex items-center gap-1 font-mono"
              title="방 목록 새로고침"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>새로고침</span>
            </button>
          </div>

          {/* If Opened via Invite Link */}
          {initialRoomCode && !isWaitingCustomRoom && (
            <div className="bg-amber-900/60 border border-amber-400/80 p-3 rounded-xl text-xs font-mono text-amber-200 flex items-center justify-between gap-2 animate-pulse">
              <span>초대 링크 접속: 방 <strong>[{initialRoomCode}]</strong></span>
              <button
                onClick={() => onJoinCustomRoom(initialRoomCode)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg transition shrink-0"
              >
                즉시 입장
              </button>
            </div>
          )}

          {/* If Currently Waiting in Created Custom Room */}
          {isWaitingCustomRoom ? (
            <div className="flex flex-col items-center text-center gap-3 bg-neutral-950 p-5 rounded-xl border-2 border-amber-500/60 animate-pulse">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                <Swords className="w-5 h-5 text-amber-400 animate-spin" />
                <span>내가 만든 방에서 상대를 대기 중입니다!</span>
              </div>

              <div className="bg-black/90 px-6 py-2 rounded-lg border border-amber-500/80 font-mono text-3xl font-black text-amber-300 tracking-widest my-1">
                {customRoomCode}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                상대방이 방 목록에서 이 방을 선택하거나, 아래 초대 링크를 통해 접속하면 대결이 바로 시작됩니다.
              </p>

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  onClick={handleCopyInviteLink}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '초대 링크 복사 완료!' : '초대 링크 복사하기'}</span>
                </button>
                <button
                  onClick={onCancelCustomRoom}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-bold rounded-lg transition border border-neutral-700"
                >
                  방 해제
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Button: Create Room */}
              <button
                onClick={onCreateCustomRoom}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>새 대결 방 개설하기 (상대 대기)</span>
              </button>

              {/* Waiting Rooms List */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5 font-bold text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
                    실시간 대기 중인 방 ({openRooms.length})
                  </span>
                  <span className="text-[10px] text-neutral-500">방을 선택해 즉시 대결</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {openRooms.length > 0 ? (
                    openRooms.map((room) => (
                      <div
                        key={room.roomId}
                        className="bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-700 hover:border-amber-500 p-3 rounded-xl flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-amber-500/50 overflow-hidden shrink-0 flex items-center justify-center">
                            {room.hostFaceUrl ? (
                              <img src={room.hostFaceUrl} alt={room.hostName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-amber-400 text-xs">{room.hostName.slice(0, 2)}</span>
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-white text-xs truncate">{room.hostName} 님의 방</span>
                            <span className="font-mono text-[10px] text-amber-400/80">CODE: {room.roomId}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onJoinCustomRoom(room.roomId)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-md"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>입장 대결</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl text-center flex flex-col items-center gap-2">
                      <ShieldAlert className="w-8 h-8 text-neutral-600" />
                      <p className="text-xs font-mono text-neutral-400">현재 오픈된 대기 방이 없습니다.</p>
                      <p className="text-[11px] font-mono text-amber-400/90">
                        위 [새 대결 방 개설하기]를 눌러 방을 만들어보세요!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enter Room Code Manually */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-800">
                <label className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>특정 방 코드로 직접 참가</span>
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
      </div>

      {/* Footer controls */}
      <div className="w-full flex items-center justify-between border-t border-neutral-800 pt-4 mt-2">
        <div className="flex items-center gap-2 text-neutral-500 font-mono text-[10px]">
          <span className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
            ROOM_LIST_MATCHMAKER_ACTIVE
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
