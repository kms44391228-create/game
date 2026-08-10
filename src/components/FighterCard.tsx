import React, { useEffect, useRef, useState } from 'react';
import { renderDamagedFace, generateDefaultAiFace } from '../lib/damageEngine';
import { Shield, Zap, AlertTriangle, Sparkles } from 'lucide-react';

interface FighterCardProps {
  id: string;
  name: string;
  faceUrl: string;
  hp: number;
  isLocal: boolean;
  isAi?: boolean;
  damageReason?: string;
  isHit?: boolean;
}

export const FighterCard: React.FC<FighterCardProps> = ({
  name,
  faceUrl,
  hp,
  isLocal,
  isAi,
  damageReason,
  isHit
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [injuryTitle, setInjuryTitle] = useState<string>('정상 상태');
  const [injuryDesc, setInjuryDesc] = useState<string>('아직 상처 없이 깨끗한 상태입니다.');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (faceUrl && faceUrl.trim() !== '') {
      renderDamagedFace(faceUrl, hp, canvas);
    } else {
      generateDefaultAiFace(canvas, name || (isAi ? 'AI CYBER TITAN' : 'FIGHTER'));
    }

    // Determine Funny Cartoon Injury Text
    const damagePercent = 100 - hp;
    if (damagePercent === 0) {
      setInjuryTitle('100% 뽀송뽀송 피부');
      setInjuryDesc('상처 하나 없는 굴욕 없는 미남/미녀 얼굴!');
    } else if (damagePercent <= 20) {
      setInjuryTitle('귀여운 반창고 & 혹! (10~20%)');
      setInjuryDesc('볼에 노란 반창고와 이마에 분홍색 왕 혹 등장!');
    } else if (damagePercent <= 40) {
      setInjuryTitle('딸기코 & 빠진 이빨! (30~40%)');
      setInjuryDesc('코가 동그랗게 부풀고 앞니가 영구처럼 쏙 빠짐!');
    } else if (damagePercent <= 70) {
      setInjuryTitle('콧수염 & 바보 낙서! (50~70%)');
      setInjuryDesc('얼굴에 꼬불꼬불 콧수염과 "바보" 낙서 테러!');
    } else {
      setInjuryTitle('영혼 이탈 X_X 만신창이 (80~100%)');
      setInjuryDesc('눈이 X_X 가 되고 머리 위에 뱅뱅이 소용돌이가 빙글빙글!');
    }
  }, [faceUrl, hp, name, isAi]);

  const borderColor = isLocal ? 'border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.2)]' : 'border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.2)]';
  const tagColor = isLocal ? 'border-l-2 border-red-500 text-red-400' : 'border-r-2 border-blue-500 text-blue-400 text-right';

  return (
    <div
      id={`fighter-card-${isLocal ? 'p1' : 'p2'}`}
      className={`w-[280px] sm:w-[310px] md:w-[330px] h-[400px] sm:h-[450px] md:h-[480px] bg-neutral-900/90 border-2 ${borderColor} relative rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
        isHit ? 'animate-bounce ring-4 ring-red-500/80 scale-105' : ''
      }`}
    >
      {/* Laser scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent pointer-events-none animate-pulse" />

      {/* Hit Flash Overlay */}
      {isHit && (
        <div className="absolute inset-0 bg-red-600/40 z-30 pointer-events-none animate-ping" />
      )}

      {/* Damage Alert Banner */}
      {damageReason && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white font-mono font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider animate-bounce shadow-lg flex items-center gap-1.5 border border-red-300">
          <AlertTriangle className="w-3.5 h-3.5" /> {damageReason}
        </div>
      )}

      {/* Face Canvas Area */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-neutral-800">
        <canvas
          ref={canvasRef}
          width={330}
          height={320}
          className="w-full h-full object-cover"
        />

        {/* Cyber Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b0764_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Live HP Tag */}
        <div className="absolute bottom-2 left-2 z-10 bg-neutral-950/80 backdrop-blur border border-neutral-700/80 px-2.5 py-1 rounded text-[11px] font-mono text-neutral-300 flex items-center gap-1.5">
          <Zap className={`w-3 h-3 ${hp < 30 ? 'text-red-500 animate-spin' : 'text-yellow-400'}`} />
          <span>INTEGRITY: {hp}%</span>
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="p-3 sm:p-4 bg-neutral-900 flex flex-col justify-between flex-grow">
        <div className={tagColor}>
          <p className="text-[10px] font-mono uppercase tracking-widest opacity-80 flex items-center gap-1">
            <Sparkles className="w-3 h-3 inline" /> {injuryTitle}
          </p>
          <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-wider text-white truncate">
            {name || (isAi ? 'AI CYBER TITAN' : 'FIGHTER')}
          </h3>
        </div>

        <div className="mt-2 text-[11px] font-mono text-neutral-400 bg-neutral-950/60 p-2 rounded border border-neutral-800/80 line-clamp-2">
          {injuryDesc}
        </div>
      </div>
    </div>
  );
};
