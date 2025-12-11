import { Button } from '@/components/ui/button';
import { Rocket, Star, ShieldAlert } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="font-display text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-2 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          SPACE COLLECTOR
        </h1>
        <p className="text-cyan-200/70 font-display tracking-widest text-lg">
          SURVIVE THE COSMOS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-2xl w-full px-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col items-center text-center">
          <Rocket className="w-8 h-8 text-cyan-400 mb-2" />
          <h3 className="font-bold text-cyan-100 mb-1">Move</h3>
          <p className="text-sm text-gray-400">Use Arrow Keys or Mouse to pilot your ship</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col items-center text-center">
          <Star className="w-8 h-8 text-yellow-400 mb-2" />
          <h3 className="font-bold text-cyan-100 mb-1">Collect</h3>
          <p className="text-sm text-gray-400">Grab Stars & Crystals for points</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col items-center text-center">
          <ShieldAlert className="w-8 h-8 text-red-500 mb-2" />
          <h3 className="font-bold text-cyan-100 mb-1">Avoid</h3>
          <p className="text-sm text-gray-400">Dodge Asteroids & Enemy Ships</p>
        </div>
      </div>

      <Button 
        onClick={onStart}
        size="lg"
        className="font-display text-xl px-12 py-8 bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.6)] transition-all hover:scale-105 border-none"
      >
        LAUNCH MISSION
      </Button>
    </div>
  );
}
