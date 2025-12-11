import { GameObject } from '../../lib/game-types';
import { Star, Diamond, Zap, Skull, ShieldAlert, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

interface FallingObjectProps {
  object: GameObject;
}

export function FallingObject({ object }: FallingObjectProps) {
  const { type } = object;

  const getIcon = () => {
    switch (type) {
      case 'star': return <Star className="text-yellow-400 fill-yellow-400/50 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />;
      case 'crystal': return <Diamond className="text-purple-400 fill-purple-400/50 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]" />;
      case 'bonus': return <Zap className="text-green-400 fill-green-400/50 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />;
      case 'asteroid': return <Disc className="text-red-500 fill-red-900 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />;
      case 'enemy': return <Skull className="text-red-500 fill-red-950 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]" />;
      case 'blackhole': return <div className="w-full h-full rounded-full bg-black border-2 border-violet-800 shadow-[0_0_15px_rgba(139,92,246,1)] animate-spin" />;
      default: return <Star />;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ rotate: type === 'asteroid' ? 360 : 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-full h-full p-1"
      >
        {getIcon()}
      </motion.div>
    </div>
  );
}
