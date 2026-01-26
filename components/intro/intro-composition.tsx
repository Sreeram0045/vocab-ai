import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  random
} from 'remotion';

const Scanlines = () => {
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

const Vignette = () => {
  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    />
  );
};

const GlitchText = ({ text, color, offset, frame }: { text: string, color: string, offset: number, frame: number }) => {
  const shakeX = random(frame + offset) * 4 - 2;
  const shakeY = random(frame + offset + 100) * 2 - 1;
  const opacity = random(frame + offset + 200) > 0.9 ? 0.8 : 1; // Occasional flicker

  return (
    <div
      className="font-black tracking-tighter text-6xl md:text-8xl whitespace-nowrap text-center"
      style={{
        color: color,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        opacity: opacity,
        mixBlendMode: 'screen',
        filter: 'blur(0.5px)',
        gridArea: '1 / 1', // Stack all instances in the same grid cell
      }}
    >
      {text}
    </div>
  );
};

const HeartPulse = ({ frame }: { frame: number }) => {
    // A digital/pixelated heart beat
    const beat = Math.sin(frame / 3) * 0.1 + 1;
    const glitch = random(frame) > 0.95 ? 1.2 : 1;
    
    return (
        <div 
            style={{ 
                transform: `scale(${beat * glitch})`,
                textShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.4)'
            }}
            className="text-red-500 text-8xl md:text-9xl mt-8 font-sans text-center leading-none"
        >
            ♥
        </div>
    )
}

export const IntroComposition = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // CRT Turn On Animation
  const turnOnDuration = 20;
  
  // Turn Off Animation (at the end)
  const turnOffStart = 90;
  
  // Logic to control the "Screen" clip path (The CRT opening/closing effect)
  const progress = frame;
  let clipPath = 'inset(0 0 0 0)'; // Full screen default
  
  if (progress < 10) {
      // Expanding width, tiny height (The white line)
      const w = interpolate(progress, [0, 10], [50, 0], { extrapolateRight: 'clamp' });
      clipPath = `inset(49.8% ${w}% 49.8% ${w}%)`;
  } else if (progress < 20) {
      // Expanding height, full width
      const h = interpolate(progress, [10, 20], [49.8, 0], { extrapolateRight: 'clamp' });
      clipPath = `inset(${h}% 0 ${h}% 0)`;
  } else if (progress > turnOffStart) {
      // Collapsing height
      const h = interpolate(progress, [turnOffStart, turnOffStart + 10], [0, 49.8], { extrapolateRight: 'clamp' });
      // Collapsing width
      const w = interpolate(progress, [turnOffStart + 10, turnOffStart + 15], [0, 50], { extrapolateRight: 'clamp' });
      
      if (progress < turnOffStart + 10) {
           clipPath = `inset(${h}% 0 ${h}% 0)`;
      } else {
           clipPath = `inset(49.8% ${w}% 49.8% ${w}%)`;
      }
  }

  // The white dot animation at the very end
  const showDot = frame > turnOffStart + 14 && frame < turnOffStart + 18;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      
      {/* The CRT Screen Container */}
      <AbsoluteFill 
        style={{ 
            clipPath,
            backgroundColor: '#101010',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}
      >
        {/* Content */}
        <div className="flex flex-col items-center justify-center relative w-full h-full p-4">
            {/* RGB Split Text Effect - Using CSS Grid for perfect stacking/centering */}
            <div className="grid place-items-center w-full relative">
                <GlitchText text="MADE WITH" color="red" offset={0} frame={frame} />
                <GlitchText text="MADE WITH" color="lime" offset={2} frame={frame} />
                <GlitchText text="MADE WITH" color="blue" offset={4} frame={frame} />
            </div>

            <HeartPulse frame={frame} />
        </div>

        {/* CRT Overlay Effects */}
        <Scanlines />
        <Vignette />
        
        {/* Subtle Noise/Grain */}
        <AbsoluteFill 
            style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
                opacity: 0.15,
                transform: `translate(${random(frame) * 10}px, ${random(frame + 1) * 10}px)`,
                pointerEvents: 'none'
            }} 
        />
        
        {/* Screen Reflection/Gloss */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

      </AbsoluteFill>
      
      {/* White dot at the very end when screen collapses */}
      {showDot && (
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_20px_20px_rgba(255,255,255,0.8)] z-50 transform -translate-x-1/2 -translate-y-1/2" />
      )}

    </AbsoluteFill>
  );
};
