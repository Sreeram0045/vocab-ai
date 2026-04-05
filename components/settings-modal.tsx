"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-background/95 backdrop-blur-xl border-border shadow-2xl p-0 overflow-hidden rounded-3xl [&>button[data-slot=dialog-close]]:cursor-pointer">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black tracking-tight">Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground font-light">
            Customize your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Appearance</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  theme === "light"
                    ? "bg-foreground/5 border-foreground/20 shadow-lg"
                    : "bg-transparent border-transparent hover:bg-foreground/5"
                }`}
              >
                <div className={`p-2 rounded-full ${theme === "light" ? "bg-amber-500/10 text-amber-500" : "text-muted-foreground"}`}>
                  <Sun size={20} />
                </div>
                <span className={`text-xs font-medium ${theme === "light" ? "text-foreground" : "text-muted-foreground"}`}>Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  theme === "dark"
                    ? "bg-foreground/5 border-foreground/20 shadow-lg"
                    : "bg-transparent border-transparent hover:bg-foreground/5"
                }`}
              >
                <div className={`p-2 rounded-full ${theme === "dark" ? "bg-indigo-500/10 text-indigo-400" : "text-muted-foreground"}`}>
                  <Moon size={20} />
                </div>
                <span className={`text-xs font-medium ${theme === "dark" ? "text-foreground" : "text-muted-foreground"}`}>Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  theme === "system"
                    ? "bg-foreground/5 border-foreground/20 shadow-lg"
                    : "bg-transparent border-transparent hover:bg-foreground/5"
                }`}
              >
                <div className={`p-2 rounded-full ${theme === "system" ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}`}>
                  <Monitor size={20} />
                </div>
                <span className={`text-xs font-medium ${theme === "system" ? "text-foreground" : "text-muted-foreground"}`}>System</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pb-6"></div>
      </DialogContent>
    </Dialog>
  );
}
