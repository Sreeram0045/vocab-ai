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

  useEffect(() => {
    setMounted(true);
    
    // Check if we've already shown the intro in this session
    const hasSeenIntro = sessionStorage.getItem("vocab-intro-seen");

    if (hasSeenIntro) {
      // If seen, do nothing (keep isVisible false)
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
    }, animationDurationMs + 1000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
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
       {/* Max-width wrapper to keep content from getting too huge on ultra-wide screens if needed, 
           but cover is fine. */}
      <div className="w-full h-full max-w-[100vw] max-h-[100vh] aspect-video">
        <Player
          component={IntroComposition}
          durationInFrames={DURATION_IN_FRAMES}
          fps={FPS}
          compositionWidth={1920}
          compositionHeight={1080}
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