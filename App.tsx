
import React, { useRef, useState } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import OrbVisualizer from './components/OrbVisualizer';
import HUD from './components/HUD';

const App: React.FC = () => {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handData = useHandTracking(videoRef, isSystemActive);

  const bootSystem = () => {
    setIsSystemActive(true);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none">
      {/* Background Camera Feed */}
      <video
        ref={videoRef}
        className={`fixed inset-0 object-cover w-full h-full grayscale opacity-40 transition-opacity duration-1000 scale-x-[-1] ${isSystemActive ? 'visible' : 'invisible'}`}
        playsInline
        muted
      />
      
      {/* Scanning Overlay Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(2,6,23,0.9)_100%)] z-0" />
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden opacity-10">
        <div className="absolute top-0 w-full h-[2px] bg-cyan-400 animate-[scan_4s_linear_infinite]" />
      </div>

      {/* Main 3D Orb */}
      {isSystemActive && <OrbVisualizer handData={handData} />}
      
      {/* HUD Layer */}
      {isSystemActive && <HUD handData={handData} />}

      {/* Boot Screen Overlay */}
      {!isSystemActive && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-64 h-64 relative mb-8">
            <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-pulse-border" />
            <div className="absolute inset-4 border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-32 bg-cyan-500/20 animate-[spin_3s_ease-in-out_infinite]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-cyan-500 text-[10px] tracking-[0.5em] font-mono translate-y-24">READY_FOR_UP_LINK</div>
            </div>
          </div>
          
          <button 
            onClick={bootSystem}
            className="group relative px-12 py-4 bg-transparent border border-cyan-500/50 hover:border-cyan-400 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative text-cyan-400 font-mono tracking-widest text-lg font-bold group-hover:text-cyan-200">
              BOOT SYSTEM
            </span>
          </button>
          
          <p className="mt-6 text-cyan-500/40 text-[10px] uppercase font-mono tracking-tighter max-w-xs text-center">
            Click to authorize camera biological scanning and initialize kinetic core v4.0.2
          </p>
        </div>
      )}

      {/* Hand Search Overlay */}
      {isSystemActive && !handData.isHandPresent && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
           <div className="text-cyan-400/50 text-sm animate-pulse tracking-[0.2em] uppercase font-mono">
             Searching for hand biological signature...
           </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          from { top: -5% }
          to { top: 105% }
        }
      `}</style>
    </div>
  );
};

export default App;
