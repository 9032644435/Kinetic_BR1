
import React, { useState, useEffect, useRef } from 'react';
import { HandData } from '../types';

interface HUDProps {
  handData: HandData;
}

const LOVE_QUOTES = [
  "I love how your prefrontal cortex processes my mistakes in 4K but buffers when I ask where you want to eat.",
  "Your executive function is a marvel; you manage to make being 'ready in 5 minutes' sound like a scientific fact.",
  "Your neural pathways are the only labyrinth I don't mind getting lost in... for at least an hour.",
  "Our cognitive synchrony is peak biological engineering. It's a shame it only applies to making fun of Netflix shows.",
  "Your brain is my favorite supercomputer, mostly because of the adorable way it glitches when you're hungry.",
  "I'm convinced your amygdala is just a tiny version of you holding a 'Not Today' sign.",
  "Your logic is so advanced that it occasionally transcends the boundaries of reality and basic physics.",
  "If your brain had a 'skip intro' button for your morning mood, I still wouldn't press it. I like the drama.",
  "You are the only person whose cognitive dissonance I find charmingly decorative.",
  "My heart rate increases by 15% when you look at me with that specific 'you're wrong' neural firing pattern."
];

const HUMOR_QUOTES = [
  "Your cognitive dissonance is a marvel of evolution; being wrong has never looked so terrifyingly confident.",
  "I'm not saying you're difficult, I'm just saying your neural processing requires a much higher electricity bill.",
  "Your patience is like a data stream: high latency, low bandwidth, and prone to crashing without warning.",
  "If sarcasm was a neurotransmitter, your brain would be classified as a renewable energy source.",
  "Your logical reasoning is like a circular buffer that completely forgot where its starting pointer was.",
  "I love that your default 'listening' mode is actually just you calculating your next counter-argument.",
  "Your memory is fascinating; you remember a comment I made in 2019 but forgot the trash exists.",
  "Your brain's 'selective hearing' filter is truly the gold standard of military-grade encryption.",
  "Watching you try to decide on a restaurant is like watching a deep-learning AI collapse under its own weight.",
  "Your ability to ignore my valid points is a masterclass in neural-filtering technology."
];

const HUD: React.FC<HUDProps> = ({ handData }) => {
  const { landmarks, pinchDistance, pinchRotation, isHandPresent, score, activeGesture } = handData;
  const wrist = landmarks?.[0];
  
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  
  // No-repetition logic refs
  const loveIndices = useRef<number[]>([]);
  const humorIndices = useRef<number[]>([]);

  const getNextQuote = (type: 'LOVE' | 'HUMOR') => {
    const list = type === 'LOVE' ? LOVE_QUOTES : HUMOR_QUOTES;
    const indicesRef = type === 'LOVE' ? loveIndices : humorIndices;

    if (indicesRef.current.length === 0) {
      // Refill and shuffle
      indicesRef.current = Array.from({ length: list.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
    }

    const nextIndex = indicesRef.current.pop()!;
    return list[nextIndex];
  };

  useEffect(() => {
    if (activeGesture === 'RIGHT_EXPAND') {
      setActiveQuote(getNextQuote('LOVE'));
    } else if (activeGesture === 'LEFT_EXPAND') {
      setActiveQuote(getNextQuote('HUMOR'));
    } else if (activeGesture === 'NONE' && pinchDistance < 0.3) {
      setActiveQuote(null);
    }
  }, [activeGesture, pinchDistance]);

  // Convert rotation to degrees for the HUD
  const rotationDeg = (pinchRotation * (180 / Math.PI)).toFixed(0);

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 font-mono z-20 overflow-hidden">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="text-cyan-400 text-xs tracking-widest border-l-2 border-cyan-500 pl-2">
            GESTURE_ANALYSIS: {activeGesture === 'NONE' ? 'STABLE' : 'CRITICAL_INTENT'}
          </div>
          <div className="text-white text-2xl font-black">
            KINETIC_CORE <span className="text-cyan-500">v4.1.0</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 text-right">
          <div className={`bg-slate-900/80 px-4 py-1 border rounded transition-all duration-300 ${activeGesture === 'RIGHT_EXPAND' ? 'border-pink-500 text-pink-400 scale-110 shadow-[0_0_15px_rgba(236,72,153,0.4)]' : activeGesture === 'LEFT_EXPAND' ? 'border-amber-500 text-amber-400 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-cyan-500/50 text-cyan-400'}`}>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
              {activeGesture === 'RIGHT_EXPAND' ? 'MODE: NEURO_AFFECTION' : activeGesture === 'LEFT_EXPAND' ? 'MODE: NEURAL_CRITIQUE' : (isHandPresent ? 'BIO_LINK_ACTIVE' : 'SIGNAL_LOST')}
            </span>
          </div>
          <div className="text-[9px] text-cyan-500/40 mt-1">TWIST_OFFSET: {rotationDeg}°</div>
        </div>
      </div>

      {/* Quote Override Display */}
      {activeQuote && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-8 z-30">
          <div className={`p-8 border-l-8 bg-slate-950/90 backdrop-blur-xl animate-[glitch_0.3s_ease-out] shadow-2xl ${activeGesture === 'RIGHT_EXPAND' ? 'border-pink-500 text-pink-200' : 'border-amber-500 text-amber-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] uppercase tracking-[0.4em] opacity-60">
                {activeGesture === 'RIGHT_EXPAND' ? 'Transmitting Love Protocol...' : 'Executing Sarcastic Humour...'}
              </div>
              <div className="text-[10px] opacity-40">PKC_OVERRIDE_ACTIVE</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold leading-tight tracking-tight italic font-serif">
              "{activeQuote}"
            </div>
            <div className="mt-6 h-1 w-full bg-white/5 overflow-hidden">
               <div className={`h-full animate-[progress_3s_linear_infinite] ${activeGesture === 'RIGHT_EXPAND' ? 'bg-pink-500' : 'bg-amber-500'}`} style={{width: '30%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Center Reticle */}
      {isHandPresent && wrist && (
        <div 
          className={`absolute border-2 rounded-full flex items-center justify-center transition-all duration-300 ${activeGesture === 'RIGHT_EXPAND' ? 'border-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.5)]' : activeGesture === 'LEFT_EXPAND' ? 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)]' : 'border-cyan-500/30'}`}
          style={{
            left: `${(1 - wrist.x) * 100}%`,
            top: `${wrist.y * 100}%`,
            width: `${120 + pinchDistance * 220}px`,
            height: `${120 + pinchDistance * 220}px`,
            transform: `translate(-50%, -50%) rotate(${rotationDeg}deg)`,
          }}
        >
          <div className="absolute inset-0 border-t border-current opacity-30"></div>
          <div className="absolute -top-8 text-[9px] text-current font-bold uppercase tracking-widest">{activeGesture !== 'NONE' ? activeGesture : 'SEARCHING'}</div>
          
          {/* Rotation Markers */}
          <div className="w-1 h-3 bg-current absolute top-0"></div>
          <div className="w-1 h-3 bg-current absolute bottom-0"></div>
          <div className="h-1 w-3 bg-current absolute left-0"></div>
          <div className="h-1 w-3 bg-current absolute right-0"></div>
        </div>
      )}

      {/* Bottom Interface */}
      <div className="flex justify-between items-end">
        <div className="grid grid-cols-2 gap-x-16">
          <div>
            <div className="text-cyan-500/50 text-[10px] uppercase mb-1 tracking-widest">Neural Expansion</div>
            <div className="flex items-baseline gap-3">
              <div className="text-white text-5xl font-black">{(pinchDistance * 100).toFixed(0)}</div>
              <div className="text-cyan-500/30 text-xs">INDEX</div>
            </div>
            <div className="h-1.5 w-48 bg-slate-900 mt-2 border border-white/5 relative overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${activeGesture === 'RIGHT_EXPAND' ? 'bg-pink-500' : activeGesture === 'LEFT_EXPAND' ? 'bg-amber-500' : 'bg-cyan-400'}`}
                  style={{ width: `${pinchDistance * 100}%` }}
                />
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <div className="text-cyan-500/50 text-[10px] uppercase mb-1 tracking-widest">Cognitive State</div>
            <div className={`text-xl font-bold uppercase transition-colors duration-300 ${activeGesture === 'RIGHT_EXPAND' ? 'text-pink-400' : activeGesture === 'LEFT_EXPAND' ? 'text-amber-400' : 'text-white'}`}>
              {activeGesture === 'RIGHT_EXPAND' ? 'THETA_ELEVATED' : activeGesture === 'LEFT_EXPAND' ? 'BETA_CRITICAL' : 'ALPHA_STABLE'}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-2">
           <div className="text-[8px] text-cyan-500/30 uppercase font-bold">Hemisphere_Activity_Stream</div>
           <div className="flex gap-1.5 h-12 items-end">
              {[...Array(24)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 transition-all duration-300 ${activeGesture === 'RIGHT_EXPAND' ? 'bg-pink-500' : activeGesture === 'LEFT_EXPAND' ? 'bg-amber-500' : 'bg-cyan-500/20'}`}
                  style={{ height: `${Math.random() * 100}%`, opacity: 0.3 + Math.random() * 0.7 }}
                />
              ))}
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes glitch {
          0% { transform: translate(3px, 0px) skew(2deg); opacity: 0.8; }
          20% { transform: translate(-3px, 0px) skew(-2deg); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(3px, 1px); }
          100% { transform: translate(0, 0); opacity: 1; }
        }
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default HUD;
