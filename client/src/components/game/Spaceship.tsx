import { motion } from 'framer-motion';

interface SpaceshipProps {
  x: number;
}

export function Spaceship({ x }: SpaceshipProps) {
  return (
    <motion.div
      className="relative z-20 w-full h-full" // Size is now controlled by parent container
      initial={false}
      // Removed fixed style left/width/height as they are handled by parent wrapper now
    >
      <div className="relative w-full h-full group">
        {/* Engine Glow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[30%] h-[50%] bg-cyan-500 blur-lg opacity-80 animate-pulse" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[15%] h-[40%] bg-white blur-md" />
        
        {/* Ship Body - Using custom car SVG */}
        <img 
          src="/car.svg"
          alt="Spaceship"
          className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-110 md:scale-100"
        />
        
        {/* Shield Effect (optional visual) */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}
