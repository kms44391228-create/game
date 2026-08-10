import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client lazily or safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// Default Fallback Korean Quiz Questions (Nonsense & General Knowledge)
const PRELOADED_QUIZZES = [
  {
    id: 'q1',
    category: 'Nonsense',
    question: '세상에서 가장 가난한 왕은?',
    options: ['최저임금', '최저왕', '나체왕', '최저가'],
    correctIndex: 0,
    explanation: '최저임(왕)금!'
  },
  {
    id: 'q2',
    category: 'Nonsense',
    question: '왕이 넘어지면 무엇이 될까?',
    options: ['파킹', '킹파', '킹드롭', '킹콩'],
    correctIndex: 0,
    explanation: '킹이 파(Park)해서 파킹!'
  },
  {
    id: 'q3',
    category: 'General Knowledge',
    question: '대한민국의 수도는 어디일까요?',
    options: ['부산', '서울', '인천', '대구'],
    correctIndex: 1,
    explanation: '대한민국의 수도는 서울특별시입니다.'
  },
  {
    id: 'q4',
    category: 'Nonsense',
    question: '바나나가 웃으면?',
    options: ['바나나킥', '바나나웃음', '바나나나', '바나나하하'],
    correctIndex: 0,
    explanation: '바나나 + 킥(KiK) = 바나나킥!'
  },
  {
    id: 'q5',
    category: 'Nonsense',
    question: '자동차를 놀라게 하면?',
    options: ['카놀라유', '카놀람', '카놀라', '카쇼크'],
    correctIndex: 0,
    explanation: 'Car(카) + 놀라유 = 카놀라유!'
  },
  {
    id: 'q6',
    category: 'General Knowledge',
    question: '태양계에서 가장 큰 행성은 무엇일까요?',
    options: ['지구', '화성', '목성', '토성'],
    correctIndex: 2,
    explanation: '태양계에서 가장 지름과 질량이 큰 행성은 목성입니다.'
  },
  {
    id: 'q7',
    category: 'Nonsense',
    question: '소나무가 급하게 길을 건너면?',
    options: ['급소', '소나무', '비상소', '빛소'],
    correctIndex: 0,
    explanation: '급(急) + 소(牛) = 급소!'
  },
  {
    id: 'q8',
    category: 'Fun Trivia',
    question: '사과를 먹으면 신체 중 어디가 사과를 할까요?',
    options: ['사과문', '사과해', '사과껍질', '사과씨'],
    correctIndex: 1,
    explanation: '사과해!'
  },
  {
    id: 'q9',
    category: 'Nonsense',
    question: '세상에서 가장 뜨거운 과일은?',
    options: ['천도복숭아', '불수박', '핫바나나', '파이어사과'],
    correctIndex: 0,
    explanation: '천도(1000度) 복숭아!'
  },
  {
    id: 'q10',
    category: 'General Knowledge',
    question: '조선시대 세종대왕이 창제한 훈민정음의 원리는 몇 글자일까요?',
    options: ['24자', '28자', '32자', '14자'],
    correctIndex: 1,
    explanation: '훈민정음 창제 당시에는 자음 17자와 모음 11자로 총 28자였습니다.'
  },
  {
    id: 'q11',
    category: 'Nonsense',
    question: '할아버지가 좋아하는 돈은?',
    options: ['할머니', '할머니돈', '할돈', '할배돈'],
    correctIndex: 0,
    explanation: '할(머니) Money!'
  },
  {
    id: 'q12',
    category: 'Nonsense',
    question: '아몬드가 죽으면?',
    options: ['다이아몬드', '아몬드죽', '데스아몬드', '아몬드바'],
    correctIndex: 0,
    explanation: 'Diamond (Die + 아몬드)!'
  },
  {
    id: 'q13',
    category: 'Fun Trivia',
    question: '지구상에서 가장 빠른 동물은?',
    options: ['치타', '매(치켜뜨는 매)', '하늘매', '페레그린 매'],
    correctIndex: 3,
    explanation: '급강하 시 시속 380km 이상을 내는 페레그린 매(매)가 가장 빠릅니다.'
  },
  {
    id: 'q14',
    category: 'Nonsense',
    question: '오리와 닭이 만나면?',
    options: ['오닭', '덕치킨', '덕닭', '디시'],
    correctIndex: 1,
    explanation: 'Duck + Chicken = 덕치킨!'
  },
  {
    id: 'q15',
    category: 'Nonsense',
    question: '비행기 안에 있는 음료수는?',
    options: ['공중음료', '플라이쥬스', '플라이트', '이륙수'],
    correctIndex: 2,
    explanation: 'Fly(비행) + Light(음료) -> 플라이트!'
  }
];

// Dynamic Quiz Generation Route using Gemini API
app.get('/api/quiz/generate', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback to preloaded
      const randomQuiz = PRELOADED_QUIZZES[Math.floor(Math.random() * PRELOADED_QUIZZES.length)];
      return res.json({ success: true, quiz: randomQuiz, source: 'preload' });
    }

    const prompt = `재미있는 한국어 넌센스 퀴즈나 신기한 기초상식 퀴즈 1개를 생성해주세요.
JSON 형식으로 답하세요:
{
  "category": "Nonsense" 또는 "General Knowledge" 또는 "Fun Trivia",
  "question": "질문 문장",
  "options": ["보기1", "보기2", "보기3", "보기4"],
  "correctIndex": 0~3 정수 (정답 인덱스),
  "explanation": "재치있고 간결한 정답 해설"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      const quizData = JSON.parse(response.text);
      quizData.id = 'gemini_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      return res.json({ success: true, quiz: quizData, source: 'gemini' });
    } else {
      throw new Error('Empty response from Gemini');
    }
  } catch (error) {
    console.warn('Gemini quiz generation failed, using preloaded:', error);
    const randomQuiz = PRELOADED_QUIZZES[Math.floor(Math.random() * PRELOADED_QUIZZES.length)];
    return res.json({ success: true, quiz: randomQuiz, source: 'fallback' });
  }
});

// API endpoint to analyze face & generate wound prompt / damage effect description
app.post('/api/face/ai-damage', async (req, res) => {
  try {
    const { hp, playerName } = req.body;
    const currentHp = typeof hp === 'number' ? hp : 100;
    const damagePercent = 100 - currentHp;

    const ai = getGeminiClient();

    let injuryReport = {
      title: '정상 상태',
      description: '아직 상처 없이 깨끗한 상태입니다.',
      stage: 0,
      scratches: 0,
      bruises: 0,
      swollenEyes: 0,
      cuts: 0,
      bloodSplatter: 0
    };

    if (damagePercent >= 10 && damagePercent < 30) {
      injuryReport = {
        title: '미세한 긁힘 및 상처',
        description: '뺨과 턱 부분에 가벼운 긁힘과 작은 멍이 생겼습니다.',
        stage: 1,
        scratches: 2,
        bruises: 1,
        swollenEyes: 0,
        cuts: 1,
        bloodSplatter: 1
      };
    } else if (damagePercent >= 30 && damagePercent < 60) {
      injuryReport = {
        title: '중등도 타격 상처',
        description: '눈가가 붓고 입술이 터졌으며 뺨에 선명한 피멍과 상처가 가득합니다!',
        stage: 2,
        scratches: 4,
        bruises: 3,
        swollenEyes: 1,
        cuts: 3,
        bloodSplatter: 3
      };
    } else if (damagePercent >= 60 && damagePercent < 90) {
      injuryReport = {
        title: '중상 입은 얼굴',
        description: '한쪽 눈이 심하게 부어오르고 양 볼과 코에서 피가 흘러내리며 출혈이 큽니다!',
        stage: 3,
        scratches: 6,
        bruises: 5,
        swollenEyes: 2,
        cuts: 5,
        bloodSplatter: 6
      };
    } else if (damagePercent >= 90) {
      injuryReport = {
        title: '치명적 K.O. 만신창이',
        description: '얼굴 전체가 찢어지고 피투성이가 되었으며 완전히 만신창이가 된 K.O. 상태입니다!',
        stage: 4,
        scratches: 8,
        bruises: 8,
        swollenEyes: 2,
        cuts: 8,
        bloodSplatter: 10
      };
    }

    if (ai && damagePercent > 0) {
      try {
        const prompt = `체력 HP가 ${currentHp}/100 인 격투 게임 캐릭터 (${playerName || '선수'})의 얼굴 부상 상태를 실감나게 1줄로 표현해줘.`;
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        if (aiResponse.text) {
          injuryReport.description = aiResponse.text.trim();
        }
      } catch (err) {
        // Fallback description is already set
      }
    }

    return res.json({ success: true, injuryReport });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket Server
const wss = new WebSocketServer({ server });

interface ClientSession {
  ws: WebSocket;
  playerId: string;
  playerName: string;
  faceUrl: string;
  roomId?: string;
}

const clients = new Map<WebSocket, ClientSession>();
let matchmakingQueue: ClientSession[] = [];

// Game Rooms store
interface ActiveRoom {
  id: string;
  player1: {
    id: string;
    ws?: WebSocket;
    name: string;
    faceUrl: string;
    hp: number;
    isAi: boolean;
    answers: { [qIndex: number]: { index: number; timeTaken: number; isCorrect: boolean } };
  };
  player2?: {
    id: string;
    ws?: WebSocket;
    name: string;
    faceUrl: string;
    hp: number;
    isAi: boolean;
    answers: { [qIndex: number]: { index: number; timeTaken: number; isCorrect: boolean } };
  };
  status: 'WAITING' | 'COUNTDOWN' | 'QUIZ_ACTIVE' | 'ROUND_RESULT' | 'GAME_OVER';
  questionIndex: number;
  currentQuestion: any;
  timer: number;
  timerInterval?: NodeJS.Timeout;
}

const activeRooms = new Map<string, ActiveRoom>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getRandomQuiz() {
  return PRELOADED_QUIZZES[Math.floor(Math.random() * PRELOADED_QUIZZES.length)];
}

function getWaitingRoomsList() {
  const roomsList: { roomId: string; hostName: string; hostFaceUrl: string }[] = [];
  activeRooms.forEach((room, code) => {
    if (room.status === 'WAITING' && !room.player2) {
      roomsList.push({
        roomId: code,
        hostName: room.player1.name,
        hostFaceUrl: room.player1.faceUrl || ''
      });
    }
  });
  return roomsList;
}

function broadcastRoomList() {
  const rooms = getWaitingRoomsList();
  const payload = JSON.stringify({ type: 'ROOM_LIST_UPDATED', rooms });
  clients.forEach((session, socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  });
}

function broadcastToRoom(room: ActiveRoom, payload: any) {
  const jsonStr = JSON.stringify(payload);
  if (room.player1.ws && room.player1.ws.readyState === WebSocket.OPEN) {
    room.player1.ws.send(jsonStr);
  }
  if (room.player2 && room.player2.ws && room.player2.ws.readyState === WebSocket.OPEN) {
    room.player2.ws.send(jsonStr);
  }
}

function startNextRound(room: ActiveRoom) {
  room.questionIndex += 1;
  room.currentQuestion = getRandomQuiz();
  room.status = 'QUIZ_ACTIVE';
  room.timer = 12; // 12 seconds per quiz

  broadcastToRoom(room, {
    type: 'ROUND_STARTED',
    questionIndex: room.questionIndex,
    question: room.currentQuestion,
    timer: room.timer,
    players: [
      { id: room.player1.id, name: room.player1.name, hp: room.player1.hp, faceUrl: room.player1.faceUrl },
      room.player2 ? { id: room.player2.id, name: room.player2.name, hp: room.player2.hp, faceUrl: room.player2.faceUrl } : null
    ]
  });

  if (room.timerInterval) clearInterval(room.timerInterval);

  room.timerInterval = setInterval(() => {
    room.timer -= 1;

    // Check AI automatic response if player2 is AI
    if (room.player2 && room.player2.isAi && room.status === 'QUIZ_ACTIVE') {
      const qIndex = room.questionIndex;
      if (!room.player2.answers[qIndex]) {
        // AI answers around 4-7 seconds in
        if (room.timer === Math.floor(Math.random() * 3) + 5) {
          const isAiCorrect = Math.random() < 0.65; // 65% chance AI is correct
          const aiOption = isAiCorrect
            ? room.currentQuestion.correctIndex
            : (room.currentQuestion.correctIndex + 1) % 4;
          room.player2.answers[qIndex] = {
            index: aiOption,
            timeTaken: 12 - room.timer,
            isCorrect: isAiCorrect
          };
          checkRoundCompletion(room);
        }
      }
    }

    if (room.timer <= 0) {
      // Time expired
      clearInterval(room.timerInterval);
      handleRoundTimeOut(room);
    } else {
      broadcastToRoom(room, { type: 'TIMER_TICK', timer: room.timer });
    }
  }, 1000);
}

function handleRoundTimeOut(room: ActiveRoom) {
  const qIndex = room.questionIndex;
  // If player hasn't answered, mark as incorrect (-1 answer index)
  if (!room.player1.answers[qIndex]) {
    room.player1.answers[qIndex] = { index: -1, timeTaken: 12, isCorrect: false };
  }
  if (!room.player2.answers[qIndex]) {
    room.player2.answers[qIndex] = { index: -1, timeTaken: 12, isCorrect: false };
  }
  processRoundResult(room);
}

function checkRoundCompletion(room: ActiveRoom) {
  const qIndex = room.questionIndex;
  const p1Ans = room.player1.answers[qIndex];
  const p2Ans = room.player2.answers[qIndex];

  if (p1Ans && p2Ans) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    processRoundResult(room);
  }
}

function processRoundResult(room: ActiveRoom) {
  if (!room.player2) return;
  room.status = 'ROUND_RESULT';
  const qIndex = room.questionIndex;
  const p1Ans = room.player1.answers[qIndex];
  const p2Ans = room.player2.answers[qIndex];

  let p1DamageTaken = 0;
  let p2DamageTaken = 0;

  // Rule: Total HP = 100. Wrong answer = 10 Damage to self!
  // If opponent answered correctly first, extra hit / or simple 10 damage for wrong answer.
  if (!p1Ans.isCorrect) {
    p1DamageTaken += 10;
  }
  if (!p2Ans.isCorrect) {
    p2DamageTaken += 10;
  }

  // If both correct, the slower one takes 10 damage (speed hit)!
  if (p1Ans.isCorrect && p2Ans.isCorrect) {
    if (p1Ans.timeTaken < p2Ans.timeTaken) {
      p2DamageTaken += 10; // P1 hit P2
    } else if (p2Ans.timeTaken < p1Ans.timeTaken) {
      p1DamageTaken += 10; // P2 hit P1
    }
  }

  room.player1.hp = Math.max(0, room.player1.hp - p1DamageTaken);
  room.player2.hp = Math.max(0, room.player2.hp - p2DamageTaken);

  let isGameOver = false;
  let winnerId: string | undefined = undefined;

  if (room.player1.hp <= 0 && room.player2.hp <= 0) {
    isGameOver = true;
    winnerId = 'DRAW';
  } else if (room.player1.hp <= 0) {
    isGameOver = true;
    winnerId = room.player2.id;
  } else if (room.player2.hp <= 0) {
    isGameOver = true;
    winnerId = room.player1.id;
  }

  broadcastToRoom(room, {
    type: 'ROUND_RESULT',
    correctIndex: room.currentQuestion.correctIndex,
    explanation: room.currentQuestion.explanation,
    p1Result: {
      id: room.player1.id,
      answerIndex: p1Ans.index,
      isCorrect: p1Ans.isCorrect,
      hp: room.player1.hp,
      damageTaken: p1DamageTaken
    },
    p2Result: {
      id: room.player2.id,
      answerIndex: p2Ans.index,
      isCorrect: p2Ans.isCorrect,
      hp: room.player2.hp,
      damageTaken: p2DamageTaken
    },
    isGameOver,
    winnerId
  });

  if (isGameOver) {
    room.status = 'GAME_OVER';
  } else {
    // Next round after 4 seconds result screen
    setTimeout(() => {
      if (activeRooms.has(room.id) && room.status !== 'GAME_OVER') {
        startNextRound(room);
      }
    }, 4000);
  }
}

wss.on('connection', (ws) => {
  let session: ClientSession = {
    ws,
    playerId: 'p_' + Math.random().toString(36).substring(2, 9),
    playerName: 'GUEST_' + Math.floor(1000 + Math.random() * 9000),
    faceUrl: ''
  };

  clients.set(ws, session);

  // Send current open waiting rooms immediately on connect
  ws.send(JSON.stringify({ type: 'ROOM_LIST_UPDATED', rooms: getWaitingRoomsList() }));

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString());

      if (data.type === 'GET_ROOM_LIST') {
        ws.send(JSON.stringify({ type: 'ROOM_LIST_UPDATED', rooms: getWaitingRoomsList() }));
      }

      if (data.type === 'INIT_PLAYER') {
        session.playerName = data.playerName || session.playerName;
        session.faceUrl = data.faceUrl || '';
        ws.send(JSON.stringify({ type: 'PLAYER_INITIATED', playerId: session.playerId }));
      }

      if (data.type === 'PLAY_VS_AI') {
        session.playerName = data.playerName || session.playerName;
        session.faceUrl = data.faceUrl || '';

        // Remove from queue if present
        matchmakingQueue = matchmakingQueue.filter((s) => s !== session);

        const roomId = 'room_ai_' + Date.now();
        const newRoom: ActiveRoom = {
          id: roomId,
          player1: {
            id: session.playerId,
            ws: session.ws,
            name: session.playerName,
            faceUrl: session.faceUrl,
            hp: 100,
            isAi: false,
            answers: {}
          },
          player2: {
            id: 'ai_boss',
            name: 'AI Cyber Titan',
            faceUrl: '', // Default AI avatar generated on client
            hp: 100,
            isAi: true,
            answers: {}
          },
          status: 'COUNTDOWN',
          questionIndex: 0,
          currentQuestion: null,
          timer: 3
        };

        session.roomId = roomId;
        activeRooms.set(roomId, newRoom);

        ws.send(
          JSON.stringify({
            type: 'MATCH_FOUND',
            roomId,
            player1: { id: session.playerId, name: session.playerName, faceUrl: session.faceUrl },
            player2: { id: 'ai_boss', name: 'AI Cyber Titan', faceUrl: '' }
          })
        );

        setTimeout(() => {
          if (activeRooms.has(roomId)) {
            startNextRound(newRoom);
          }
        }, 3000);
      }

      if (data.type === 'SUBMIT_ANSWER') {
        if (!session.roomId) return;
        const room = activeRooms.get(session.roomId);
        if (!room || room.status !== 'QUIZ_ACTIVE') return;

        const qIndex = room.questionIndex;
        const answerIndex = data.answerIndex;
        const isCorrect = answerIndex === room.currentQuestion.correctIndex;
        const timeTaken = 12 - room.timer;

        if (session.playerId === room.player1.id) {
          if (!room.player1.answers[qIndex]) {
            room.player1.answers[qIndex] = { index: answerIndex, timeTaken, isCorrect };
          }
        } else if (session.playerId === room.player2.id) {
          if (!room.player2.answers[qIndex]) {
            room.player2.answers[qIndex] = { index: answerIndex, timeTaken, isCorrect };
          }
        }

        checkRoundCompletion(room);
      }

      if (data.type === 'CANCEL_MATCHMAKING') {
        matchmakingQueue = matchmakingQueue.filter((s) => s !== session);
        ws.send(JSON.stringify({ type: 'MATCHMAKING_CANCELLED' }));
      }

      if (data.type === 'CREATE_CUSTOM_ROOM') {
        session.playerName = data.playerName || session.playerName;
        session.faceUrl = data.faceUrl || '';

        if (session.roomId) {
          activeRooms.delete(session.roomId);
        }

        const roomCode = (data.roomId || generateRoomCode()).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
        session.roomId = roomCode;

        const newRoom: ActiveRoom = {
          id: roomCode,
          player1: {
            id: session.playerId,
            ws: session.ws,
            name: session.playerName,
            faceUrl: session.faceUrl,
            hp: 100,
            isAi: false,
            answers: {}
          },
          status: 'WAITING',
          questionIndex: 0,
          currentQuestion: null,
          timer: 3
        };

        activeRooms.set(roomCode, newRoom);

        ws.send(
          JSON.stringify({
            type: 'CUSTOM_ROOM_CREATED',
            roomId: roomCode,
            player1: { id: session.playerId, name: session.playerName, faceUrl: session.faceUrl }
          })
        );

        broadcastRoomList();
      }

      if (data.type === 'JOIN_CUSTOM_ROOM') {
        session.playerName = data.playerName || session.playerName;
        session.faceUrl = data.faceUrl || '';

        const code = (data.roomId || '').toUpperCase().trim();
        const room = activeRooms.get(code);

        if (!room) {
          ws.send(
            JSON.stringify({
              type: 'JOIN_ROOM_ERROR',
              message: `방 코드 [${code}]를 찾을 수 없습니다. 코드를 재확인하세요.`
            })
          );
        } else if (room.status !== 'WAITING' || room.player2) {
          ws.send(
            JSON.stringify({
              type: 'JOIN_ROOM_ERROR',
              message: `이미 경기 중이거나 정원이 가득 찬 방입니다.`
            })
          );
        } else {
          session.roomId = code;
          room.player2 = {
            id: session.playerId,
            ws: session.ws,
            name: session.playerName,
            faceUrl: session.faceUrl,
            hp: 100,
            isAi: false,
            answers: {}
          };
          room.status = 'COUNTDOWN';

          broadcastRoomList();

          broadcastToRoom(room, {
            type: 'MATCH_FOUND',
            roomId: code,
            player1: { id: room.player1.id, name: room.player1.name, faceUrl: room.player1.faceUrl },
            player2: { id: room.player2.id, name: room.player2.name, faceUrl: room.player2.faceUrl }
          });

          setTimeout(() => {
            if (activeRooms.has(code)) {
              startNextRound(room);
            }
          }, 3000);
        }
      }

      if (data.type === 'CANCEL_CUSTOM_ROOM') {
        if (session.roomId) {
          activeRooms.delete(session.roomId);
          session.roomId = undefined;
        }
        ws.send(JSON.stringify({ type: 'CUSTOM_ROOM_CANCELLED' }));
        broadcastRoomList();
      }
    } catch (e) {
      console.error('WebSocket Error processing message:', e);
    }
  });

  ws.on('close', () => {
    matchmakingQueue = matchmakingQueue.filter((s) => s !== session);
    if (session.roomId) {
      const room = activeRooms.get(session.roomId);
      if (room) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        if (room.status !== 'WAITING') {
          broadcastToRoom(room, {
            type: 'OPPONENT_DISCONNECTED',
            message: '상대방의 연결이 끊어졌습니다.'
          });
        }
        activeRooms.delete(session.roomId);
      }
    }
    clients.delete(ws);
    broadcastRoomList();
  });
});

// Production static serving vs Vite dev setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Face Fighter Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
