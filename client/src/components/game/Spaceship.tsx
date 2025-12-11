import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { SHIP_WIDTH, SHIP_HEIGHT } from '../../lib/game-types';

interface SpaceshipProps {
  x: number;
}

export function Spaceship({ x }: SpaceshipProps) {
  return (
    <motion.div
      className="absolute bottom-4 z-20"
      style={{ 
        left: x,
        width: SHIP_WIDTH,
        height: SHIP_HEIGHT,
      }}
      initial={false}
      animate={{ x: 0 }} // We control 'left' directly for performance in loop, but motion helps with smooth entry if needed
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative w-full h-full group">
        {/* Engine Glow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-8 bg-cyan-500 blur-lg opacity-80 animate-pulse" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-6 bg-white blur-md" />
        
        {/* Ship Body - Using Lucide Rocket but styled */}
        <Rocket 
          className="w-full h-full text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] fill-cyan-950" 
          strokeWidth={1.5}
        />
        
        {/* Shield Effect (optional visual) */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}
