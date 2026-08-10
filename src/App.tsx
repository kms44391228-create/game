/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { FighterCard } from './components/FighterCard';
import { QuizCard } from './components/QuizCard';
import { MatchmakingLobby } from './components/MatchmakingLobby';
import { FaceScannerModal } from './components/FaceScannerModal';
import { GameOverModal } from './components/GameOverModal';
import { QuizQuestion, GameMode } from './types';
import { soundFx } from './lib/audio';

export default function App() {
  // Player Local State
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('face_fighter_name') || '파이터_' + Math.floor(100 + Math.random() * 900);
  });
  const [faceUrl, setFaceUrl] = useState<string>(() => {
    return localStorage.getItem('face_fighter_face') || '';
  });

  // UI Modals
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Match State
  const [screen, setScreen] = useState<'LOBBY' | 'ARENA'>('LOBBY');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('SOLO_AI');

  // Private Friend Room State
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');
  const [customRoomCode, setCustomRoomCode] = useState<string>('');
  const [isWaitingCustomRoom, setIsWaitingCustomRoom] = useState<boolean>(false);
  const [customRoomError, setCustomRoomError] = useState<string | null>(null);

  // Parse URL search params ?room=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('code');
    if (roomParam) {
      setInitialRoomCode(roomParam.toUpperCase().trim());
    }
  }, []);

  // Battle Arena State
  const [p1Hp, setP1Hp] = useState<number>(100);
  const [p2Hp, setP2Hp] = useState<number>(100);
  const [p2Name, setP2Name] = useState<string>('AI CYBER TITAN');
  const [p2FaceUrl, setP2FaceUrl] = useState<string>('');
  const [p1DamageReason, setP1DamageReason] = useState<string>('');
  const [p2DamageReason, setP2DamageReason] = useState<string>('');
  const [p1Hit, setP1Hit] = useState<boolean>(false);
  const [p2Hit, setP2Hit] = useState<boolean>(false);

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [timer, setTimer] = useState<number>(12);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<any | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winnerName, setWinnerName] = useState<string>('');
  const [isWinner, setIsWinner] = useState<boolean>(false);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    localStorage.setItem('face_fighter_name', playerName);
  }, [playerName]);

  useEffect(() => {
    if (faceUrl) {
      localStorage.setItem('face_fighter_face', faceUrl);
    }
  }, [faceUrl]);

  // Connect WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'INIT_PLAYER',
            playerName,
            faceUrl
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'MATCHMAKING_SEARCHING') {
            setIsSearching(true);
          }

          if (data.type === 'CUSTOM_ROOM_CREATED') {
            setCustomRoomCode(data.roomId);
            setIsWaitingCustomRoom(true);
            setCustomRoomError(null);
          }

          if (data.type === 'JOIN_ROOM_ERROR') {
            setCustomRoomError(data.message || '입장할 수 없습니다.');
            setIsWaitingCustomRoom(false);
          }

          if (data.type === 'CUSTOM_ROOM_CANCELLED') {
            setIsWaitingCustomRoom(false);
            setCustomRoomCode('');
            setCustomRoomError(null);
          }

          if (data.type === 'MATCH_FOUND') {
            setIsSearching(false);
            setIsWaitingCustomRoom(false);
            setCustomRoomError(null);
            setScreen('ARENA');
            setP1Hp(100);
            setP2Hp(100);
            setIsGameOver(false);

            if (data.player2) {
              setP2Name(data.player2.name || '상대 파이터');
              setP2FaceUrl(data.player2.faceUrl || '');
            }
          }

          if (data.type === 'ROUND_STARTED') {
            setCurrentQuestion(data.question);
            setTimer(data.timer || 12);
            setSelectedOptionIndex(null);
            setRoundResult(null);
            setP1DamageReason('');
            setP2DamageReason('');

            if (data.players) {
              setP1Hp(data.players[0].hp);
              setP2Hp(data.players[1].hp);
            }
          }

          if (data.type === 'TIMER_TICK') {
            setTimer(data.timer);
            if (data.timer <= 3 && data.timer > 0) {
              soundFx.playCountdownBeep(data.timer === 1);
            }
          }

          if (data.type === 'ROUND_RESULT') {
            setRoundResult(data);

            if (data.p1Result) {
              setP1Hp(data.p1Result.hp);
              if (data.p1Result.damageTaken > 0) {
                setP1DamageReason(`-${data.p1Result.damageTaken} HP!`);
                setP1Hit(true);
                soundFx.playPunch(true);
                setTimeout(() => setP1Hit(false), 600);
              }
            }

            if (data.p2Result) {
              setP2Hp(data.p2Result.hp);
              if (data.p2Result.damageTaken > 0) {
                setP2DamageReason(`-${data.p2Result.damageTaken} HP!`);
                setP2Hit(true);
                soundFx.playPunch(false);
                setTimeout(() => setP2Hit(false), 600);
              }
            }

            if (data.isGameOver) {
              setTimeout(() => {
                setIsGameOver(true);
                soundFx.playKO();
                if (data.winnerId === 'DRAW') {
                  setWinnerName('무승부 (DRAW)');
                  setIsWinner(false);
                } else if (data.winnerId === 'p1' || p1Hp > p2Hp) {
                  setWinnerName(playerName);
                  setIsWinner(true);
                } else {
                  setWinnerName(p2Name);
                  setIsWinner(false);
                }
              }, 1500);
            }
          }

          if (data.type === 'MATCHMAKING_CANCELLED') {
            setIsSearching(false);
          }
        } catch (err) {
          console.error('Error handling WS message:', err);
        }
      };

      ws.onerror = () => {
        console.warn('WebSocket connection warning - falling back to local simulation when needed.');
      };
    } catch (e) {
      console.warn('WebSocket init exception:', e);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handlers
  const handleStartOnlineMatch = () => {
    setGameMode('ONLINE_1V1');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'START_MATCHMAKING',
          playerName,
          faceUrl
        })
      );
    } else {
      // Offline / fallback online simulator
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        setScreen('ARENA');
        setP2Name('온라인 라이벌 파이터');
        startLocalRound();
      }, 2000);
    }
  };

  const handleStartAiMatch = () => {
    setGameMode('SOLO_AI');
    setP2Name('AI CYBER TITAN');
    setP2FaceUrl('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'PLAY_VS_AI',
          playerName,
          faceUrl
        })
      );
    } else {
      setScreen('ARENA');
      startLocalRound();
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CANCEL_MATCHMAKING' }));
    }
  };

  const handleCreateCustomRoom = () => {
    setGameMode('ONLINE_1V1');
    setCustomRoomError(null);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'CREATE_CUSTOM_ROOM',
          playerName,
          faceUrl
        })
      );
    } else {
      const code = 'FIGHT' + Math.floor(10 + Math.random() * 90);
      setCustomRoomCode(code);
      setIsWaitingCustomRoom(true);
    }
  };

  const handleJoinCustomRoom = (codeToJoin: string) => {
    setGameMode('ONLINE_1V1');
    setCustomRoomError(null);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'JOIN_CUSTOM_ROOM',
          roomId: codeToJoin.toUpperCase().trim(),
          playerName,
          faceUrl
        })
      );
    } else {
      setScreen('ARENA');
      setP2Name('친구 파이터 (' + codeToJoin + ')');
      startLocalRound();
    }
  };

  const handleCancelCustomRoom = () => {
    setIsWaitingCustomRoom(false);
    setCustomRoomCode('');
    setCustomRoomError(null);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CANCEL_CUSTOM_ROOM' }));
    }
  };

  // Local fallback quiz cycle if server round isn't triggered
  const startLocalRound = () => {
    setP1Hp(100);
    setP2Hp(100);
    setIsGameOver(false);

    fetchNextQuiz();
  };

  const fetchNextQuiz = async () => {
    try {
      const res = await fetch('/api/quiz/generate');
      const data = await res.json();
      if (data.success && data.quiz) {
        setCurrentQuestion(data.quiz);
      } else {
        throw new Error('No quiz returned');
      }
    } catch (err) {
      // Fallback local quiz
      setCurrentQuestion({
        id: 'q_fallback_' + Date.now(),
        category: 'Nonsense',
        question: '왕이 넘어지면 무엇이 될까요?',
        options: ['파킹', '킹파', '드롭킹', '킹덤'],
        correctIndex: 0,
        explanation: '킹(King)이 파(Park)해서 파킹!'
      });
    }
    setTimer(12);
    setSelectedOptionIndex(null);
    setRoundResult(null);
    setP1DamageReason('');
    setP2DamageReason('');
  };

  const handleSelectOption = (index: number) => {
    setSelectedOptionIndex(index);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'SUBMIT_ANSWER',
          answerIndex: index
        })
      );
    } else {
      // Offline local evaluation
      if (!currentQuestion) return;
      const isCorrect = index === currentQuestion.correctIndex;

      let p1Damage = 0;
      let p2Damage = 0;

      if (isCorrect) {
        soundFx.playCorrect();
        p2Damage = 10;
        setP2DamageReason('-10 HP 데미지!');
        setP2Hit(true);
        setTimeout(() => setP2Hit(false), 600);
      } else {
        soundFx.playWrong();
        p1Damage = 10;
        setP1DamageReason('-10 HP 오답 타격!');
        setP1Hit(true);
        setTimeout(() => setP1Hit(false), 600);
      }

      const nextP1Hp = Math.max(0, p1Hp - p1Damage);
      const nextP2Hp = Math.max(0, p2Hp - p2Damage);

      setP1Hp(nextP1Hp);
      setP2Hp(nextP2Hp);

      const mockResult = {
        correctIndex: currentQuestion.correctIndex,
        explanation: currentQuestion.explanation
      };
      setRoundResult(mockResult);

      if (nextP1Hp <= 0 || nextP2Hp <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
          soundFx.playKO();
          if (nextP1Hp > nextP2Hp) {
            setWinnerName(playerName);
            setIsWinner(true);
          } else {
            setWinnerName(p2Name);
            setIsWinner(false);
          }
        }, 1500);
      } else {
        setTimeout(() => {
          fetchNextQuiz();
        }, 4000);
      }
    }
  };

  const handleToggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between overflow-x-hidden relative select-none">
      {/* Immersive Background Radial Purple Effect */}
      <div
        className="fixed inset-0 opacity-25 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #3b0764 0%, transparent 70%)'
        }}
      />

      {/* Arena Top Header */}
      <HeaderNavbar
        p1Name={playerName}
        p1Hp={p1Hp}
        p2Name={p2Name}
        p2Hp={p2Hp}
        timer={timer}
        isGameActive={screen === 'ARENA' && !isGameOver}
      />

      {/* Main View Router */}
      {screen === 'LOBBY' ? (
        <MatchmakingLobby
          playerName={playerName}
          onNameChange={setPlayerName}
          faceUrl={faceUrl}
          onOpenScanner={() => setIsScannerOpen(true)}
          onStartOnlineMatch={handleStartOnlineMatch}
          onStartAiMatch={handleStartAiMatch}
          isSearching={isSearching}
          onCancelSearch={handleCancelSearch}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onCreateCustomRoom={handleCreateCustomRoom}
          onJoinCustomRoom={handleJoinCustomRoom}
          onCancelCustomRoom={handleCancelCustomRoom}
          customRoomCode={customRoomCode}
          isWaitingCustomRoom={isWaitingCustomRoom}
          customRoomError={customRoomError}
          initialRoomCode={initialRoomCode}
        />
      ) : (
        <main className="flex-grow relative z-10 flex flex-col items-center justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full gap-6">
          {/* Fighter Cards Arena Layout */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 my-2 relative">
            {/* Player 1 Card (Red Side) */}
            <FighterCard
              id="p1"
              name={playerName}
              faceUrl={faceUrl}
              hp={p1Hp}
              isLocal={true}
              damageReason={p1DamageReason}
              isHit={p1Hit}
            />

            {/* VS Watermark Center */}
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl xl:text-9xl font-black italic text-neutral-800 pointer-events-none opacity-40 select-none">
              VS
            </div>

            {/* Quiz Panel in the Middle for small/medium, or stacked */}
            {currentQuestion && (
              <QuizCard
                question={currentQuestion}
                timer={timer}
                onSelectOption={handleSelectOption}
                disabled={selectedOptionIndex !== null || isGameOver}
                selectedOptionIndex={selectedOptionIndex}
                roundResult={roundResult}
              />
            )}

            {/* Player 2 Card (Blue Side) */}
            <FighterCard
              id="p2"
              name={p2Name}
              faceUrl={p2FaceUrl}
              hp={p2Hp}
              isLocal={false}
              isAi={gameMode === 'SOLO_AI'}
              damageReason={p2DamageReason}
              isHit={p2Hit}
            />
          </div>
        </main>
      )}

      {/* Modals */}
      <FaceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaveFace={(newFace) => setFaceUrl(newFace)}
        currentFaceUrl={faceUrl}
      />

      <GameOverModal
        isOpen={isGameOver}
        isWinner={isWinner}
        winnerName={winnerName}
        p1Name={playerName}
        p1Hp={p1Hp}
        p1FaceUrl={faceUrl}
        p2Name={p2Name}
        p2Hp={p2Hp}
        p2FaceUrl={p2FaceUrl}
        onRematch={() => {
          if (gameMode === 'SOLO_AI') {
            handleStartAiMatch();
          } else {
            handleStartOnlineMatch();
          }
        }}
        onReturnLobby={() => {
          setIsGameOver(false);
          setScreen('LOBBY');
        }}
      />
    </div>
  );
}
