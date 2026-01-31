"use client";

import React, { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { IntroComposition } from './intro-composition';

// Duration: ~4 seconds (120 frames @ 30fps)
// Gives enough time for the shimmer to pass (ends at frame 90) and then fade out (90-110).
const DURATION_IN_FRAMES = 120; 
const FPS = 30;

export default function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    setMounted(true);
    
    // Set initial dimensions to window size
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);

    // Check if we've already shown the intro in this session
    const hasSeenIntro = sessionStorage.getItem("vocab-intro-seen");

    if (hasSeenIntro) {
      return;
    }

    // Start Sequence
    setIsVisible(true);
    setShouldRender(true);
    sessionStorage.setItem("vocab-intro-seen", "true");
    
    // The composition handles its own internal opacity fade from frame 90-110.
    // We just need to remove the DOM element after the video finishes.
    const animationDurationMs = (DURATION_IN_FRAMES / FPS) * 1000;
    
    // Add a small buffer (100ms) to ensure we don't cut off the very end
    const removeTimer = setTimeout(() => {
      setIsVisible(false); // Triggers CSS transition to 0 opacity
      
      // Give CSS transition time to finish before unmounting
      setTimeout(() => {
        setShouldRender(false);
      }, 500); 
      
    }, animationDurationMs);

    return () => {
      clearTimeout(removeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!mounted || !shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      style={{
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transition: 'opacity 0.5s ease-out'
      }}
    >
      <div className="w-full h-full">
        <Player
          component={IntroComposition}
          durationInFrames={DURATION_IN_FRAMES}
          fps={FPS}
          compositionWidth={dimensions.width}
          compositionHeight={dimensions.height}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black' // Force black background on player too
          }}
          inputProps={{}}
          autoPlay
          loop={false}
          controls={false}
        />
      </div>
    </div>
  );
}