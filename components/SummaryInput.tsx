"use client";

import { useState, useRef, useCallback } from "react";

interface SummaryInputProps {
  duration: number;
  onSave: (summary: string) => void;
  onCancel: () => void;
}

export default function SummaryInput({ duration, onSave, onCancel }: SummaryInputProps) {
  const [summary, setSummary] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = summary;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + transcript;
        } else {
          interim = transcript;
        }
      }
      setSummary(finalTranscript + (interim ? " " + interim : ""));
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [summary]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSave = () => {
    if (summary.trim()) {
      onSave(summary.trim());
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 animate-fade-in">
      <div className="text-center">
        <div className="text-5xl mb-3">&#9200;</div>
        <h2 className="text-2xl font-bold text-white">Time&apos;s Up!</h2>
        <p className="text-white/50 mt-1">
          {duration} minute block complete. What did you accomplish?
        </p>
      </div>

      {/* Speech-to-text button */}
      {speechSupported && (
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
            isListening
              ? "bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
              : "bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          {isListening ? "Stop Recording" : "Speak Summary"}
        </button>
      )}

      {/* Text area */}
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Type or speak your summary..."
        rows={4}
        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 resize-none text-base"
      />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!summary.trim()}
          className="px-8 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors"
        >
          Save Summary
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
