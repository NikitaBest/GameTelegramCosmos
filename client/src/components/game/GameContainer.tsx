import { useEffect, useRef } from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { Spaceship } from './Spaceship';
import { FallingObject } from './FallingObject';
import { HUD } from './HUD';
import { StartScreen } from './StartScreen';
import { GameOverScreen } from './GameOverScreen';
import { GAME_WIDTH, GAME_HEIGHT } from '../../lib/game-types';
import generatedImage from '@assets/generated_images/deep_space_nebula_background.png';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function GameContainer() {
  const {
    gameState,
    playerX,
    gameObjects,
    startGame,
    resetGame,
    setMovement
  } = useGameLogic();

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying || gameState.isPaused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') setMovement('left');
      if (e.key === 'ArrowRight' || e.key === 'd') setMovement('right');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
        setMovement('stop');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying, gameState.isPaused, setMovement]);

  // Touch controls handlers
  const handleTouchStart = (direction: 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); // Prevent default touch actions (scrolling, zooming)
    if (!gameState.isPlaying || gameState.isPaused) return;
    setMovement(direction);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setMovement('stop');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative touch-none">
      {/* Game Area Wrapper - Handles aspect ratio and scaling */}
      <div className="w-full max-w-4xl px-2 flex-1 flex items-center justify-center relative">
        <div 
          ref={containerRef}
          className="relative overflow-hidden rounded-xl shadow-[0_0_50px_rgba(8,145,178,0.2)] bg-black ring-1 ring-white/10 w-full aspect-[4/3] md:aspect-auto md:h-[600px] md:w-[800px]"
        >
          {/* Inner container to scale logic coordinates to visual size */}
          <div className="absolute inset-0 w-full h-full">
            {/* We map internal 800x600 coordinates to percentage-based display for responsiveness */}
            <div className="relative w-full h-full">
              
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

              {/* Game Elements - Using % for positions to be responsive */}
              {gameState.isPlaying && !gameState.isGameOver && (
                <>
                  {/* Spaceship mapped from 0-800 to 0-100% */}
                  <div 
                    className="absolute bottom-4 z-20 transition-transform duration-75"
                    style={{ 
                      left: `${(playerX / GAME_WIDTH) * 100}%`,
                      width: `${(60 / GAME_WIDTH) * 100}%`, // approximate width relative to game width
                      height: '10%', // approximate height
                    }}
                  >
                     <Spaceship x={0} /* x is handled by parent div style */ /> 
                  </div>

                  {gameObjects.map(obj => (
                    <div
                      key={obj.id}
                      className="absolute z-10"
                      style={{
                        left: `${(obj.x / GAME_WIDTH) * 100}%`,
                        top: `${(obj.y / GAME_HEIGHT) * 100}%`,
                        width: `${(obj.width / GAME_WIDTH) * 100}%`,
                        height: `${(obj.height / GAME_HEIGHT) * 100}%`,
                      }}
                    >
                       <FallingObject object={{...obj, x:0, y:0}} /* pos handled by parent */ />
                    </div>
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
        </div>
      </div>

      {/* Mobile Controls Overlay */}
      <div className="w-full max-w-lg p-6 pb-12 flex justify-between gap-4 z-50">
        <Button 
          variant="outline"
          className="flex-1 h-24 bg-white/10 active:bg-cyan-500/40 border-white/20 rounded-2xl backdrop-blur-sm transition-all active:scale-95 touch-none select-none"
          onMouseDown={handleTouchStart('left')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd}
        >
          <ArrowLeft className="w-12 h-12 text-white" />
        </Button>
        
        <Button 
          variant="outline"
          className="flex-1 h-24 bg-white/10 active:bg-cyan-500/40 border-white/20 rounded-2xl backdrop-blur-sm transition-all active:scale-95 touch-none select-none"
          onMouseDown={handleTouchStart('right')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd}
        >
          <ArrowRight className="w-12 h-12 text-white" />
        </Button>
      </div>
    </div>
  );
}
