"use client";

import React, { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { IntroComposition } from './intro-composition';

const DURATION_IN_FRAMES = 110; // ~3.5 seconds
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

    // Optional: Update on resize (though typically splash screens are short-lived)
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
      // If seen, do nothing (keep isVisible false)
      window.removeEventListener('resize', handleResize);
      return;
    }

    // If not seen, show it and mark as seen
    setIsVisible(true);
    setShouldRender(true);
    sessionStorage.setItem("vocab-intro-seen", "true");
    
    // Start fade-out animation
    const animationDurationMs = (DURATION_IN_FRAMES / FPS) * 1000;
    
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, animationDurationMs);

    // Unmount from DOM after fade-out transition (1s)
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
      window.removeEventListener('resize', handleResize);
    }, animationDurationMs + 1000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Prevent hydration mismatch
  if (!mounted || !shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black transition-opacity duration-1000 ease-in-out flex items-center justify-center ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
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