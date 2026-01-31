import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing
} from 'remotion';
import { AuroraBackground } from './aurora-background';

// Grain texture for cinematic feel
const NoiseOverlay = () => (
    <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
    />
);

const LogoText = ({ frame, fps, width }: { frame: number, fps: number, width: number }) => {
    // 1. "Vocabul" Entrance
    const entrance = spring({
        frame: frame - 10,
        fps,
        config: { damping: 200, stiffness: 100, mass: 3 }, 
    });

    const translateY = interpolate(entrance, [0, 1], [40, 0]);
    const blur = interpolate(entrance, [0, 1], [50, 0]);
    const opacity = interpolate(entrance, [0, 1], [0, 1]);
    
    // 2. "AI" Reveal
    // Starts at 35. 
    const aiStart = 35;
    const aiSpring = spring({ frame: frame - aiStart, fps, config: { stiffness: 80, damping: 20 } });
    
    const aiOpacity = interpolate(frame, [aiStart, aiStart + 15], [0, 1], { extrapolateRight: 'clamp' });
    const aiX = interpolate(aiSpring, [0, 1], [-20, 0]); // Slide out from "l"
    const aiBlur = interpolate(aiSpring, [0, 1], [10, 0]);

    // 3. OPTICAL RE-CENTERING (The Camera Pan)
    const isMobile = width < 768;
    const shiftAmount = isMobile ? -15 : -30;
    const reCenterShift = interpolate(
        aiSpring,
        [0, 1],
        [0, shiftAmount]
    );

    // 4. Shimmer Effect
    const shimmerProgress = interpolate(
        frame,
        [65, 105],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
    );
    const gradientPosition = interpolate(shimmerProgress, [0, 1], [-100, 200]);

    // 5. Footer Reveal
    const footerOpacity = interpolate(
        frame,
        [55, 75],
        [0, 0.5],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <div className="relative flex flex-col items-center justify-center h-full w-full overflow-visible">
            
            {/* MAIN TEXT GROUP - Animates LEFT to re-center */}
            <div 
                className="relative z-10 flex items-center justify-center"
                style={{
                    transform: `translateX(${reCenterShift}px)`
                }}
            >
                {/* ANCHOR TEXT: Vocabul */}
                <h1 
                    className="text-5xl sm:text-7xl md:text-9xl font-black text-white leading-none tracking-tighter relative"
                    style={{
                        transform: `translateY(${translateY}px)`,
                        filter: `blur(${blur}px)`,
                        opacity: opacity,
                        // Metallic Gradient
                        backgroundImage: `linear-gradient(110deg, #555 30%, #fff 45%, #fff 55%, #555 70%)`,
                        backgroundSize: '250% 100%',
                        backgroundPosition: `${gradientPosition}% 0%`,
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    Vocabul
                    
                    {/* "AI" - Now absolutely positioned relative to the word, but perfectly matched in style */}
                    <span 
                        className="absolute left-full top-0 h-full ml-2 md:ml-4 flex items-end pb-1 md:pb-1.5" // Aligns baselines perfectly
                        style={{
                            opacity: aiOpacity,
                            transform: `translateX(${aiX}px)`,
                            filter: `blur(${aiBlur}px)`,
                            width: '300px', // Reserve ample width to prevent clipping
                        }}
                    >
                        <span
                            className="text-4xl sm:text-6xl md:text-8xl font-black italic"
                            style={{
                                // Same Metallic Gradient
                                backgroundImage: `linear-gradient(to bottom right, #fff, #999)`,
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                // Subtle Emerald Glow
                                filter: 'drop-shadow(0 0 25px rgba(16,185,129,0.25))',
                                paddingRight: '50px' // Internal padding to prevent italic clip
                            }}
                        >
                            AI
                        </span>
                    </span>
                </h1>
            </div>

            {/* FOOTER - Stays centered on screen (doesn't move with the logo shift) */}
            <div 
                className="absolute bottom-16 md:bottom-24 text-white text-xs md:text-sm tracking-[0.3em] font-light uppercase opacity-0"
                style={{
                    opacity: footerOpacity,
                    transform: `translateY(${interpolate(frame, [55, 75], [10, 0], { extrapolateRight: 'clamp' })}px)`
                }}
            >
                Crafted with <span className="text-emerald-500 font-bold mx-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">Passion</span>
            </div>
        </div>
    );
}

export const IntroComposition = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Global Fade Out
  const opacity = interpolate(
    frame,
    [100, 120],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      
      {/* 0. MAGICAL SHADER BACKGROUND */}
      <AbsoluteFill style={{ zIndex: 0 }}>
        <AuroraBackground frame={frame} />
      </AbsoluteFill>

      <AbsoluteFill 
        className="flex items-center justify-center z-10"
        style={{ opacity }}
      >
        <LogoText frame={frame} fps={fps} width={width} />
        
        {/* Cinematic Curtain */}
        <div 
            className="absolute top-0 left-0 w-full bg-black z-20"
            style={{ 
                height: `${interpolate(spring({ frame, fps, config: { damping: 20, mass: 2 } }), [0, 1], [50, 0])}%`
            }} 
        />
        <div 
            className="absolute bottom-0 left-0 w-full bg-black z-20"
            style={{ 
                height: `${interpolate(spring({ frame, fps, config: { damping: 20, mass: 2 } }), [0, 1], [50, 0])}%`
            }} 
        />

        <NoiseOverlay />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
