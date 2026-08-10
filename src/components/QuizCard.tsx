import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { soundFx } from '../lib/audio';
import { Brain, HelpCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface QuizCardProps {
  question: QuizQuestion;
  timer: number;
  maxTimer?: number;
  onSelectOption: (optionIndex: number) => void;
  disabled: boolean;
  selectedOptionIndex?: number | null;
  roundResult?: {
    correctIndex: number;
    explanation: string;
    p1Result?: { isCorrect: boolean; damageTaken: number };
    p2Result?: { isCorrect: boolean; damageTaken: number };
  } | null;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  timer,
  maxTimer = 12,
  onSelectOption,
  disabled,
  selectedOptionIndex,
  roundResult
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleOptionClick = (index: number) => {
    if (disabled || selectedOptionIndex !== null) return;
    onSelectOption(index);
  };

  const progressPercent = Math.max(0, Math.min(100, (timer / maxTimer) * 100));

  return (
    <div
      id="quiz-card-panel"
      className="w-full max-w-2xl bg-neutral-900/95 border-2 border-yellow-500/40 rounded-2xl p-4 sm:p-6 shadow-[0_0_35px_rgba(234,179,8,0.15)] flex flex-col gap-4 relative overflow-hidden backdrop-blur-md"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-red-500/5 pointer-events-none" />

      {/* Header Info: Category + Timer Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              {question.category}
            </span>
            <span className="text-neutral-400 text-xs font-mono">
              [데미지: 오답시 -10 HP]
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-yellow-400 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 animate-spin" />
            <span>{timer}s</span>
          </div>
        </div>

        {/* Progress bar timer */}
        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/80">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              progressPercent < 30 ? 'bg-red-500' : 'bg-yellow-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div className="my-2 bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 sm:p-5 text-center relative">
        <HelpCircle className="w-6 h-6 text-yellow-500/40 absolute top-3 left-3 pointer-events-none" />
        <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
          {question.question}
        </h2>
      </div>

      {/* Options Grid (4 Buttons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => {
          let btnStyle = 'bg-neutral-800/90 hover:bg-neutral-700 border-neutral-700 text-neutral-100';
          let icon = null;

          if (selectedOptionIndex === idx) {
            btnStyle = 'bg-yellow-500/30 border-yellow-400 text-yellow-300 ring-2 ring-yellow-400/50';
          }

          if (roundResult) {
            if (idx === roundResult.correctIndex) {
              btnStyle = 'bg-green-600/40 border-green-400 text-green-200 ring-2 ring-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]';
              icon = <CheckCircle2 className="w-5 h-5 text-green-400" />;
            } else if (selectedOptionIndex === idx && idx !== roundResult.correctIndex) {
              btnStyle = 'bg-red-600/40 border-red-500 text-red-200 ring-2 ring-red-500';
              icon = <XCircle className="w-5 h-5 text-red-400" />;
            } else {
              btnStyle = 'bg-neutral-900/60 border-neutral-800 text-neutral-500 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              id={`quiz-option-btn-${idx}`}
              onClick={() => handleOptionClick(idx)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              disabled={disabled || selectedOptionIndex !== null || roundResult !== null}
              className={`px-4 py-3 sm:py-4 rounded-xl border text-left font-bold text-sm sm:text-base flex items-center justify-between transition-all duration-200 active:scale-95 disabled:cursor-not-allowed ${btnStyle}`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className="w-7 h-7 rounded-lg bg-neutral-950 border border-neutral-700 flex items-center justify-center font-mono text-xs text-yellow-400 font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate">{option}</span>
              </div>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Round Result Explanation */}
      {roundResult && (
        <div className="mt-2 bg-neutral-950 border border-yellow-500/40 p-3 sm:p-4 rounded-xl flex flex-col gap-1 text-center animate-fade-in">
          <div className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest">
            정답 해설:
          </div>
          <p className="text-sm font-medium text-neutral-200">
            {roundResult.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
