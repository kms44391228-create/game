export type QuizCategory = 'Nonsense' | 'General Knowledge' | 'Fun Trivia' | 'Science & Nature' | 'Korean Pop & Culture';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Player {
  id: string;
  name: string;
  faceUrl: string; // Base64 or URL
  hp: number; // 0 to 100
  score: number;
  isAi: boolean;
  isReady: boolean;
  lastDamageReason?: string;
  wounds: {
    scratches: number;
    bruises: number;
    cuts: number;
    swollenEyes: number;
    bloodSplatter: number;
  };
  damagedFaceUrl?: string; // AI generated or canvas processed face with injuries
}

export type GameMode = 'SOLO_AI' | 'ONLINE_1V1';

export type RoomStatus = 'LOBBY' | 'MATCHING' | 'COUNTDOWN' | 'QUIZ_ACTIVE' | 'ROUND_RESULT' | 'GAME_OVER';

export interface RoomState {
  id: string;
  mode: GameMode;
  status: RoomStatus;
  players: [Player, Player | null];
  currentQuestion?: QuizQuestion;
  questionNumber: number;
  timeRemaining: number; // in seconds
  roundWinnerId?: string | 'DRAW' | 'BOTH_WRONG';
  playerAnswers: { [playerId: string]: { optionIndex: number; timeTaken: number; isCorrect: boolean } };
  winnerId?: string;
  logs: string[];
}

export interface DamageRequestPayload {
  faceImageBase64: string;
  hp: number;
  lastHitType?: 'CRITICAL' | 'NORMAL' | 'WRONG_ANSWER';
}
