import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameObject, GameObjectType, GameEffect, GAME_WIDTH, GAME_HEIGHT, SHIP_WIDTH, SHIP_HEIGHT, ITEM_SIZE } from '../lib/game-types';

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
  const [effects, setEffects] = useState<GameEffect[]>([]);
  
  // Refs for loop to avoid dependency staleness
  const stateRef = useRef(gameState);
  const playerXRef = useRef(playerX);
  const objectsRef = useRef(gameObjects);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const movementRef = useRef<number>(0);

  // Sync refs
  useEffect(() => { stateRef.current = gameState; }, [gameState]);
  useEffect(() => { playerXRef.current = playerX; }, [playerX]);
  useEffect(() => { objectsRef.current = gameObjects; }, [gameObjects]);

  // Cleanup effects
  useEffect(() => {
    if (effects.length > 0) {
      const timer = setTimeout(() => {
        setEffects(prev => prev.filter(e => Date.now() - e.id < 1000));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [effects]);

  const gameLoop = (time: number) => {
    if (!stateRef.current.isPlaying || stateRef.current.isPaused || stateRef.current.isGameOver) {
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Movement
    if (movementRef.current !== 0) {
      const speed = 12 * (deltaTime / 16); 
      const newX = playerXRef.current + (movementRef.current * speed);
      const clampedX = Math.max(0, Math.min(GAME_WIDTH - SHIP_WIDTH, newX));
      
      if (clampedX !== playerXRef.current) {
        setPlayerX(clampedX);
      }
    }

    // Spawn objects
    spawnTimerRef.current += deltaTime;
    const spawnRate = Math.max(500, 2000 - (stateRef.current.level * 100)); 
    
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

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = useCallback(() => {
    setGameState({ ...INITIAL_STATE, isPlaying: true });
    setGameObjects([]);
    setEffects([]);
    setPlayerX(GAME_WIDTH / 2 - SHIP_WIDTH / 2);
    lastTimeRef.current = performance.now();
    movementRef.current = 0;
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const setMovement = useCallback((direction: 'left' | 'right' | 'stop') => {
    if (direction === 'left') movementRef.current = -1;
    else if (direction === 'right') movementRef.current = 1;
    else movementRef.current = 0;
  }, []);

  const spawnObject = () => {
    const rand = Math.random();
    let type: GameObjectType = 'star';
    if (rand > 0.5) type = 'asteroid';
    else type = 'star';

    const object: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: Math.random() * (GAME_WIDTH - ITEM_SIZE),
      y: -ITEM_SIZE,
      speed: (Math.random() * 2 + 2) * stateRef.current.gameSpeed,
      width: ITEM_SIZE,
      height: ITEM_SIZE,
    };

    setGameObjects(prev => [...prev, object]);
  };

  const checkCollisions = () => {
    const shipRect = {
      x: playerXRef.current + 10,
      y: GAME_HEIGHT - SHIP_HEIGHT - 10,
      width: SHIP_WIDTH - 20,
      height: SHIP_HEIGHT - 20
    };

    const newObjects = objectsRef.current.filter(obj => {
      if (obj.y > GAME_HEIGHT) return false;

      const objRect = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
      
      const isColliding = (
        shipRect.x < objRect.x + objRect.width &&
        shipRect.x + shipRect.width > objRect.x &&
        shipRect.y < objRect.y + objRect.height &&
        shipRect.height + shipRect.y > objRect.y
      );

      if (isColliding) {
        handleCollision(obj);
        return false; 
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

    // Add visual effect
    const effectX = playerXRef.current + SHIP_WIDTH / 2 - 20; // Center effect on ship
    const effectY = GAME_HEIGHT - SHIP_HEIGHT / 2 - 20;

    switch (obj.type) {
      case 'star':
        newState.score += 10;
        setEffects(prev => [...prev, { id: Date.now(), type: 'score', x: effectX, y: effectY, text: '+10' }]);
        break;
      case 'asteroid':
        newState.lives -= 1;
        setEffects(prev => [...prev, { id: Date.now(), type: 'damage', x: effectX, y: effectY, text: '-1 ❤' }]);
        break;
    }

    // Level up
    const newLevel = Math.floor(newState.score / 1000) + 1;
    if (newLevel > newState.level) {
      newState.level = newLevel;
      newState.gameSpeed += 0.2;
    }

    // Game Over
    if (newState.lives <= 0) {
      newState.isGameOver = true;
      newState.isPlaying = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    setGameState(newState);
  };

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
    effects,
    startGame,
    pauseGame,
    resetGame,
    setMovement
  };
}
