"use client";

import { useEffect } from "react";

export default function ClearIntroState() {
  useEffect(() => {
    // Clear the intro seen flag when visiting the login page
    // This ensures the intro plays again after a fresh login flow
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vocab-intro-seen");
      }
    } catch (e) {
      console.error("Failed to clear intro state", e);
    }
  }, []);

  return null;
}
