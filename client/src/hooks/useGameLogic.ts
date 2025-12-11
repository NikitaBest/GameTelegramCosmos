import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameObject, GameObjectType, GameEffect, GAME_WIDTH, GAME_HEIGHT, SHIP_WIDTH, SHIP_HEIGHT, ITEM_SIZE } from '../lib/game-types';
import { haptic } from '../lib/telegram';

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

    // Comet (asteroid) is larger than other objects
    const isComet = type === 'asteroid';
    const objectSize = isComet ? ITEM_SIZE * 1.8 : ITEM_SIZE; // Comet is 1.8x larger

    const object: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: Math.random() * (GAME_WIDTH - objectSize),
      y: -objectSize,
      speed: (Math.random() * 2 + 2) * stateRef.current.gameSpeed,
      width: objectSize,
      height: objectSize,
    };

    setGameObjects(prev => [...prev, object]);
  };

  const checkCollisions = () => {
    // Ship position - focus on upper part for catching
    const shipY = GAME_HEIGHT - SHIP_HEIGHT; // Top of ship
    const shipTopY = shipY; // Top edge of ship
    const shipBottomY = GAME_HEIGHT; // Bottom of ship
    const shipCollisionWidth = SHIP_WIDTH * 0.7; // 70% of ship width for more precise collision
    const shipCollisionHeight = SHIP_HEIGHT * 0.6; // 60% of ship height for catching (upper part)
    
    const shipRect = {
      x: playerXRef.current + (SHIP_WIDTH - shipCollisionWidth) / 2,
      y: shipTopY, // Start from top of ship
      width: shipCollisionWidth,
      height: shipCollisionHeight
    };

    const newObjects = objectsRef.current.filter(obj => {
      // Remove objects that are off screen
      if (obj.y > GAME_HEIGHT) return false;

      const objBottom = obj.y + obj.height;
      const objTop = obj.y;
      const objCenterY = obj.y + obj.height / 2;
      
      // IMPORTANT: Only catch objects that are in the upper part of ship's collision zone
      // Object's center should be in the range from ship's top to ship's middle
      const catchingZoneTop = shipTopY - obj.height; // Allow some space above ship
      const catchingZoneBottom = shipTopY + shipCollisionHeight; // Up to middle of ship
      
      // Skip if object is too far below the catching zone (already passed)
      if (objTop > catchingZoneBottom + 15) {
        // Object has passed below the catching zone - don't catch it
        return true; // Keep object, it's already below
      }
      
      // Skip if object is too far above
      if (objBottom < catchingZoneTop) {
        return true; // Keep object, it's too far above
      }

      // More precise collision box for objects - smaller than visual size
      const objectCollisionScale = obj.type === 'asteroid' ? 0.75 : 0.6; // Comets slightly larger collision, stars smaller
      const objCollisionWidth = obj.width * objectCollisionScale;
      const objCollisionHeight = obj.height * objectCollisionScale;
      const objCenterX = obj.x + obj.width / 2;
      
      const objRect = { 
        x: objCenterX - objCollisionWidth / 2,
        y: objCenterY - objCollisionHeight / 2,
        width: objCollisionWidth,
        height: objCollisionHeight
      };
      
      // Check horizontal overlap (ship and object must overlap horizontally)
      const horizontalOverlap = (
        shipRect.x < objRect.x + objRect.width &&
        shipRect.x + shipRect.width > objRect.x
      );
      
      // Check vertical overlap (object must be in ship's catching zone)
      const verticalOverlap = (
        shipRect.y < objRect.y + objRect.height &&
        shipRect.height + shipRect.y > objRect.y
      );
      
      // Additional check: object's center should be in the catching zone
      const isInCatchingZone = objCenterY >= catchingZoneTop && objCenterY <= catchingZoneBottom;
      
      const isColliding = horizontalOverlap && verticalOverlap && isInCatchingZone;

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
        haptic.light(); // Light haptic feedback for collecting star
        break;
      case 'asteroid':
        newState.lives -= 1;
        setEffects(prev => [...prev, { id: Date.now(), type: 'damage', x: effectX, y: effectY, text: '-1 ❤' }]);
        haptic.medium(); // Medium haptic feedback for damage
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
      haptic.error(); // Error haptic feedback for game over
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
