import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameObject, GameObjectType, GAME_WIDTH, GAME_HEIGHT, SHIP_WIDTH, SHIP_HEIGHT, ITEM_SIZE } from '../lib/game-types';

const INITIAL_STATE: GameState = {
  score: 0,
  lives: 3,
  multiplier: 1,
  multiplierEndTime: 0,
  isPaused: false,
  isGameOver: false,
  isPlaying: false,
  level: 1,
  gameSpeed: 1,
};

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - SHIP_WIDTH / 2);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  
  // Refs for loop to avoid dependency staleness
  const stateRef = useRef(gameState);
  const playerXRef = useRef(playerX);
  const objectsRef = useRef(gameObjects);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  // Sync refs
  useEffect(() => { stateRef.current = gameState; }, [gameState]);
  useEffect(() => { playerXRef.current = playerX; }, [playerX]);
  useEffect(() => { objectsRef.current = gameObjects; }, [gameObjects]);

  const gameLoop = (time: number) => {
    if (!stateRef.current.isPlaying || stateRef.current.isPaused || stateRef.current.isGameOver) {
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Spawn objects
    spawnTimerRef.current += deltaTime;
    const spawnRate = Math.max(500, 2000 - (stateRef.current.level * 100)); // Spawns faster as level increases
    
    if (spawnTimerRef.current > spawnRate) {
      spawnObject();
      spawnTimerRef.current = 0;
    }

    // Move objects
    setGameObjects(prev => prev.map(obj => ({
      ...obj,
      y: obj.y + obj.speed
    })));

    checkCollisions();

    // Loop
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = useCallback(() => {
    setGameState({ ...INITIAL_STATE, isPlaying: true });
    setGameObjects([]);
    setPlayerX(GAME_WIDTH / 2 - SHIP_WIDTH / 2);
    lastTimeRef.current = performance.now();
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const movePlayer = useCallback((direction: 'left' | 'right' | number) => {
    if (typeof direction === 'number') {
      // Direct position setting (mouse/touch)
      const newX = Math.max(0, Math.min(GAME_WIDTH - SHIP_WIDTH, direction));
      setPlayerX(newX);
    } else {
      // Keyboard movement
      setPlayerX(prev => {
        const step = 25; // Speed of keyboard movement
        const newX = direction === 'left' ? prev - step : prev + step;
        return Math.max(0, Math.min(GAME_WIDTH - SHIP_WIDTH, newX));
      });
    }
  }, []);

  const spawnObject = () => {
    const rand = Math.random();
    let type: GameObjectType = 'star';
    
    // Spawn probabilities
    if (rand > 0.98) type = 'bonus';
    else if (rand > 0.95) type = 'blackhole'; // Very rare
    else if (rand > 0.85) type = 'crystal';
    else if (rand > 0.70) type = 'enemy';
    else if (rand > 0.55) type = 'asteroid';
    else type = 'star';

    const object: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: Math.random() * (GAME_WIDTH - ITEM_SIZE),
      y: -ITEM_SIZE,
      speed: (Math.random() * 2 + 2) * stateRef.current.gameSpeed, // Base speed * game speed
      width: ITEM_SIZE,
      height: ITEM_SIZE,
    };

    setGameObjects(prev => [...prev, object]);
  };

  const checkCollisions = () => {
    const shipRect = {
      x: playerXRef.current + 10, // Hitbox adjustment
      y: GAME_HEIGHT - SHIP_HEIGHT - 10,
      width: SHIP_WIDTH - 20,
      height: SHIP_HEIGHT - 20
    };

    const newObjects = objectsRef.current.filter(obj => {
      // Check bounds
      if (obj.y > GAME_HEIGHT) return false;

      // Check collision
      const objRect = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
      
      const isColliding = (
        shipRect.x < objRect.x + objRect.width &&
        shipRect.x + shipRect.width > objRect.x &&
        shipRect.y < objRect.y + objRect.height &&
        shipRect.height + shipRect.y > objRect.y
      );

      if (isColliding) {
        handleCollision(obj);
        return false; // Remove object
      }

      return true;
    });

    if (newObjects.length !== objectsRef.current.length) {
        setGameObjects(newObjects);
    }
  };

  const handleCollision = (obj: GameObject) => {
    const currentState = stateRef.current;
    let newState = { ...currentState };

    // Check multiplier expiration
    if (newState.multiplier > 1 && Date.now() > newState.multiplierEndTime) {
      newState.multiplier = 1;
    }

    switch (obj.type) {
      case 'star':
        newState.score += 10 * newState.multiplier;
        break;
      case 'crystal':
        newState.score += 25 * newState.multiplier;
        break;
      case 'bonus':
        newState.multiplier = 2;
        newState.multiplierEndTime = Date.now() + 5000;
        break;
      case 'asteroid':
      case 'enemy':
        newState.lives -= 1;
        // Visual feedback would go here (shake, red flash)
        break;
      case 'blackhole':
         // Slow down logic could go here, for now just a penalty
         newState.score = Math.max(0, newState.score - 50);
         break;
    }

    // Level up logic
    const newLevel = Math.floor(newState.score / 1000) + 1;
    if (newLevel > newState.level) {
      newState.level = newLevel;
      newState.gameSpeed += 0.2;
    }

    // Game Over logic
    if (newState.lives <= 0) {
      newState.isGameOver = true;
      newState.isPlaying = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    setGameState(newState);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const resetGame = () => {
      startGame();
  };

  return {
    gameState,
    playerX,
    gameObjects,
    startGame,
    pauseGame,
    resetGame,
    movePlayer
  };
}
