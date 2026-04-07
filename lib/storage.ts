export interface Session {
  id: string;
  date: string;
  duration: number; // minutes
  summary: string;
}

const STORAGE_KEY = "focus-timer-sessions";

export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSession(session: Omit<Session, "id">): Session {
  const sessions = getSessions();
  const newSession: Session = { ...session, id: crypto.randomUUID() };
  sessions.unshift(newSession);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return newSession;
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}
