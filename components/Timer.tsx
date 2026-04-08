"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TimerProps {
  onComplete: (duration: number) => void;
}

export default function Timer({ onComplete }: TimerProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const totalSecondsRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  const playAlarm = useCallback(() => {
    try {
      const ctx = new AudioContext();
      audioRef.current = ctx;

      // Play 3 rounds of alarm beeps (loud, unmissable)
      const frequencies = [880, 1100, 880];
      for (let round = 0; round < 3; round++) {
        frequencies.forEach((freq, i) => {
          const delay = round * 1.2 + i * 0.3;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = "square";
          gain.gain.value = 0.5;
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.2);
        });
      }
    } catch {
      // Audio not available
    }
  }, []);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playAlarm();

          if (Notification.permission === "granted") {
            new Notification("Focus Timer", {
              body: "Time's up! Summarize what you accomplished.",
            });
          }

          const duration = totalSecondsRef.current / 60;
          setTimeout(() => onComplete(duration), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onComplete, playAlarm]);

  const startTimer = (minutes: number) => {
    setSelectedMinutes(minutes);
    const total = minutes * 60;
    totalSecondsRef.current = total;
    setSecondsLeft(total);
    setIsRunning(true);

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const handleCustomStart = () => {
    const mins = parseFloat(customMinutes);
    if (mins > 0 && mins <= 120) {
      startTimer(mins);
    }
  };

  const togglePause = () => setIsRunning((prev) => !prev);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(0);
    setSelectedMinutes(null);
    setCustomMinutes("");
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = totalSecondsRef.current > 0
    ? (totalSecondsRef.current - secondsLeft) / totalSecondsRef.current
    : 0;

  // SVG circle parameters
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Timer Display */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 280 280">
          {/* Background circle */}
          <circle
            cx="140" cy="140" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-white/10"
          />
          {/* Progress circle */}
          <circle
            cx="140" cy="140" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-orange-500 transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="text-center z-10">
          <span className="text-6xl font-mono font-bold text-white tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          {selectedMinutes && (
            <p className="text-sm text-white/50 mt-2">{selectedMinutes} min block</p>
          )}
        </div>
      </div>

      {/* Controls */}
      {!selectedMinutes ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => startTimer(15)}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl transition-colors text-lg"
            >
              15 min
            </button>
            <button
              onClick={() => startTimer(30)}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl transition-colors text-lg"
            >
              30 min
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Custom"
              min="1"
              max="120"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomStart()}
              className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center placeholder-white/40 focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleCustomStart}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Start
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={togglePause}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
          >
            {isRunning ? "Pause" : "Resume"}
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
