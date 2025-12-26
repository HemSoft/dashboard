export type TimerState = "stopped" | "running" | "paused" | "completed";

export interface Timer {
  id: string;
  userId: string;
  name: string;
  durationSeconds: number;
  remainingSeconds: number;
  state: TimerState;
  endTime: Date | null;
  enableCompletionColor: boolean;
  completionColor: string;
  enableAlarm: boolean;
  alarmSound: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimerInput {
  name: string;
  durationSeconds: number;
  enableCompletionColor?: boolean;
  completionColor?: string;
  enableAlarm?: boolean;
  alarmSound?: string;
}

export interface TimerUpdateInput {
  name?: string;
  durationSeconds?: number;
  remainingSeconds?: number;
  state?: TimerState;
  endTime?: Date | null;
  enableCompletionColor?: boolean;
  completionColor?: string;
  enableAlarm?: boolean;
  alarmSound?: string;
  displayOrder?: number;
}

export interface FetchTimersResult {
  timers: Timer[];
  error?: string;
}

export interface UpdateResult {
  success: boolean;
  error?: string;
}

export const TIMER_PRESETS = [
  { label: "5m", seconds: 300 },
  { label: "15m", seconds: 900 },
  { label: "30m", seconds: 1800 },
  { label: "1h", seconds: 3600 },
] as const;

/**
 * Format seconds into a human-readable time string (MM:SS or HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Parse a time string (MM:SS or HH:MM:SS) into seconds
 * Returns null if the format is invalid
 */
export function parseTime(timeStr: string): number | null {
  const trimmed = timeStr.trim();
  const parts = trimmed.split(":");

  if (parts.length < 2 || parts.length > 3) {
    return null;
  }

  const numbers = parts.map((p) => {
    // Check for decimal points or non-integer values
    if (p.includes(".")) {
      return null;
    }
    const num = parseInt(p, 10);
    return isNaN(num) || num < 0 ? null : num;
  });

  if (numbers.some((n) => n === null)) {
    return null;
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    // HH:MM:SS
    [hours, minutes, seconds] = numbers as number[];
  } else {
    // MM:SS
    [minutes, seconds] = numbers as number[];
  }

  // Validate ranges
  if (minutes >= 60 || seconds >= 60) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Calculate remaining seconds for a running timer based on end_time
 */
export function calculateRemainingSeconds(
  endTime: Date | null,
  state: TimerState
): number | null {
  if (!endTime || state !== "running") {
    return null;
  }

  const now = new Date();
  const remaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Sync timer state - recalculates remaining_seconds for running timers
 */
export function syncTimerState(timer: Timer): Timer {
  if (timer.state === "running" && timer.endTime) {
    const remaining = calculateRemainingSeconds(timer.endTime, timer.state);
    if (remaining !== null) {
      if (remaining === 0) {
        return {
          ...timer,
          state: "completed",
          remainingSeconds: 0,
          endTime: null,
        };
      }
      return {
        ...timer,
        remainingSeconds: remaining,
      };
    }
  }
  return timer;
}

/**
 * Get progress percentage (0-100)
 */
export function getProgress(timer: Timer): number {
  if (timer.durationSeconds === 0) return 0;
  return ((timer.durationSeconds - timer.remainingSeconds) / timer.durationSeconds) * 100;
}
