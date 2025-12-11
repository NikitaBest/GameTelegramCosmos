import { useEffect, useRef } from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { Spaceship } from './Spaceship';
import { FallingObject } from './FallingObject';
import { HUD } from './HUD';
import { StartScreen } from './StartScreen';
import { GameOverScreen } from './GameOverScreen';
import { GAME_WIDTH, GAME_HEIGHT } from '../../lib/game-types';
import generatedImage from '@assets/generated_images/deep_space_nebula_background.png';

export function GameContainer() {
  const {
    gameState,
    playerX,
    gameObjects,
    startGame,
    resetGame,
    movePlayer
  } = useGameLogic();

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying || gameState.isPaused) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        movePlayer('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        movePlayer('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.isPaused, movePlayer]);

  // Mouse/Touch controls
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameState.isPlaying || gameState.isPaused || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    movePlayer(x - 30); // Center ship
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gameState.isPlaying || gameState.isPaused || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    movePlayer(x - 30);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-xl shadow-[0_0_50px_rgba(8,145,178,0.2)] bg-black ring-1 ring-white/10"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Background Layer */}
        <div 
          className="absolute inset-0 z-0 opacity-60"
          style={{
            backgroundImage: `url(${generatedImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Animated Stars Layer (CSS) */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_4s_infinite]" />

        {/* Game Elements */}
        {gameState.isPlaying && !gameState.isGameOver && (
          <>
            <Spaceship x={playerX} />
            {gameObjects.map(obj => (
              <FallingObject key={obj.id} object={obj} />
            ))}
            <HUD gameState={gameState} />
          </>
        )}

        {/* Screens */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <StartScreen onStart={startGame} />
        )}

        {gameState.isGameOver && (
          <GameOverScreen score={gameState.score} onRestart={resetGame} />
        )}
      </div>
    </div>
  );
}
