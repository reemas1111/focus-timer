"use client";

import { Session } from "@/lib/storage";

interface HistoryProps {
  sessions: Session[];
  onClear: () => void;
}

export default function History({ sessions, onClear }: HistoryProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto mt-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white/80">Session History</h3>
        <button
          onClick={onClear}
          className="text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="space-y-3">
        {sessions.map((session) => {
          const date = new Date(session.date);
          const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

          return (
            <div
              key={session.id}
              className="p-4 bg-white/5 border border-white/10 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-md">
                  {session.duration} min
                </span>
                <span className="text-xs text-white/40">
                  {dateStr} at {timeStr}
                </span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{session.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
