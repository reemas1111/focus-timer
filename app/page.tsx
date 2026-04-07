"use client";

import { useState, useEffect, useCallback } from "react";
import Timer from "@/components/Timer";
import SummaryInput from "@/components/SummaryInput";
import History from "@/components/History";
import { Session, getSessions, saveSession, clearSessions } from "@/lib/storage";

type View = "timer" | "summary";

export default function Home() {
  const [view, setView] = useState<View>("timer");
  const [completedDuration, setCompletedDuration] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleTimerComplete = useCallback((duration: number) => {
    setCompletedDuration(duration);
    setView("summary");
  }, []);

  const handleSaveSummary = (summary: string) => {
    saveSession({
      date: new Date().toISOString(),
      duration: completedDuration,
      summary,
    });
    setSessions(getSessions());
    setView("timer");
  };

  const handleSkip = () => {
    setView("timer");
  };

  const handleClearHistory = () => {
    clearSessions();
    setSessions([]);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Focus Timer</h1>
      <p className="text-white/40 mb-10 text-sm">Work. Reflect. Repeat.</p>

      {view === "timer" ? (
        <Timer onComplete={handleTimerComplete} />
      ) : (
        <SummaryInput
          duration={completedDuration}
          onSave={handleSaveSummary}
          onCancel={handleSkip}
        />
      )}

      <History sessions={sessions} onClear={handleClearHistory} />
    </main>
  );
}
