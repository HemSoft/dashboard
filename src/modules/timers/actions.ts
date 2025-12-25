"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  FetchTimersResult,
  Timer,
  TimerInput,
  TimerUpdateInput,
  UpdateResult,
} from "./types";
import { syncTimerState } from "./types";

/**
 * Get all timers for the current user, with state synced
 */
export async function getTimers(): Promise<FetchTimersResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { timers: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("timers" as never)
    .select("*")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching timers:", error);
    return { timers: [], error: error.message };
  }

  const timers: Timer[] = (data ?? []).map((row: {
    id: string;
    user_id: string;
    name: string;
    duration_seconds: number;
    remaining_seconds: number;
    state: string;
    end_time: string | null;
    enable_completion_color: boolean;
    completion_color: string;
    enable_alarm: boolean;
    alarm_sound: string;
    display_order: number;
    created_at: string;
    updated_at: string;
  }) => {
    const timer: Timer = {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      durationSeconds: row.duration_seconds,
      remainingSeconds: row.remaining_seconds,
      state: row.state as Timer["state"],
      endTime: row.end_time ? new Date(row.end_time) : null,
      enableCompletionColor: row.enable_completion_color,
      completionColor: row.completion_color,
      enableAlarm: row.enable_alarm,
      alarmSound: row.alarm_sound,
      displayOrder: row.display_order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
    // Sync state on load to handle cross-device accuracy
    return syncTimerState(timer);
  });

  return { timers };
}

/**
 * Create a new timer
 */
// Validation constants
const MAX_NAME_LENGTH = 100;
const MAX_DURATION_SECONDS = 86400; // 24 hours
const MIN_DURATION_SECONDS = 1;

export async function createTimer(
  input: TimerInput
): Promise<UpdateResult & { id?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate name
  const trimmedName = input.name?.trim();
  if (!trimmedName) {
    return { success: false, error: "Timer name is required" };
  }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { success: false, error: `Timer name must be ${MAX_NAME_LENGTH} characters or less` };
  }

  // Validate duration
  if (!Number.isFinite(input.durationSeconds) || input.durationSeconds < MIN_DURATION_SECONDS) {
    return { success: false, error: "Duration must be at least 1 second" };
  }
  if (input.durationSeconds > MAX_DURATION_SECONDS) {
    return { success: false, error: "Duration cannot exceed 24 hours" };
  }

  // Get the highest display_order to add new timer at the end
  const { data: existingTimers } = await supabase
    .from("timers" as never)
    .select("display_order")
    .eq("user_id", user.id)
    .order("display_order", { ascending: false })
    .limit(1);

  const maxOrder = (existingTimers?.[0] as { display_order: number } | undefined)?.display_order ?? -1;

  const { data, error } = await supabase
    .from("timers" as never)
    .insert({
      user_id: user.id,
      name: trimmedName,
      duration_seconds: input.durationSeconds,
      remaining_seconds: input.durationSeconds,
      state: "stopped",
      enable_completion_color: input.enableCompletionColor ?? true,
      completion_color: input.completionColor ?? "#4CAF50",
      enable_alarm: input.enableAlarm ?? true,
      alarm_sound: input.alarmSound ?? "default",
      display_order: maxOrder + 1,
    } as never)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating timer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/timers");
  revalidatePath("/");
  return { success: true, id: (data as { id: string }).id };
}

/**
 * Update an existing timer
 */
const VALID_TIMER_STATES = ["stopped", "running", "paused", "completed"] as const;

function validateName(name: string | undefined): string | undefined {
  if (name === undefined) return undefined;
  const trimmedName = name.trim();
  if (!trimmedName) return "Timer name cannot be empty";
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return `Timer name must be ${MAX_NAME_LENGTH} characters or less`;
  }
  return undefined;
}

function validateDuration(durationSeconds: number | undefined): string | undefined {
  if (durationSeconds === undefined) return undefined;
  if (!Number.isFinite(durationSeconds) || durationSeconds < MIN_DURATION_SECONDS) {
    return "Duration must be at least 1 second";
  }
  if (durationSeconds > MAX_DURATION_SECONDS) {
    return "Duration cannot exceed 24 hours";
  }
  return undefined;
}

function validateRemainingSeconds(remainingSeconds: number | undefined): string | undefined {
  if (remainingSeconds === undefined) return undefined;
  if (!Number.isFinite(remainingSeconds) || remainingSeconds < 0) {
    return "Remaining seconds must be non-negative";
  }
  return undefined;
}

function validateState(state: string | undefined): string | undefined {
  if (state === undefined) return undefined;
  if (!VALID_TIMER_STATES.includes(state as typeof VALID_TIMER_STATES[number])) {
    return "Invalid timer state";
  }
  return undefined;
}

function validateDisplayOrder(displayOrder: number | undefined): string | undefined {
  if (displayOrder === undefined) return undefined;
  if (!Number.isFinite(displayOrder) || displayOrder < 0) {
    return "Display order must be non-negative";
  }
  return undefined;
}

/**
 * Validate timer update input fields
 * Returns error message if validation fails, undefined if valid
 */
function validateTimerUpdateInput(input: TimerUpdateInput): string | undefined {
  return (
    validateName(input.name) ??
    validateDuration(input.durationSeconds) ??
    validateRemainingSeconds(input.remainingSeconds) ??
    validateState(input.state) ??
    validateDisplayOrder(input.displayOrder)
  );
}

/**
 * Build update data object from input
 */
function buildTimerUpdateData(input: TimerUpdateInput): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.durationSeconds !== undefined) updateData.duration_seconds = input.durationSeconds;
  if (input.remainingSeconds !== undefined) updateData.remaining_seconds = input.remainingSeconds;
  if (input.state !== undefined) updateData.state = input.state;
  if (input.endTime !== undefined) updateData.end_time = input.endTime ? input.endTime.toISOString() : null;
  if (input.enableCompletionColor !== undefined) updateData.enable_completion_color = input.enableCompletionColor;
  if (input.completionColor !== undefined) updateData.completion_color = input.completionColor;
  if (input.enableAlarm !== undefined) updateData.enable_alarm = input.enableAlarm;
  if (input.alarmSound !== undefined) updateData.alarm_sound = input.alarmSound;
  if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder;
  return updateData;
}

export async function updateTimer(
  id: string,
  input: TimerUpdateInput
): Promise<UpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const validationError = validateTimerUpdateInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const updateData = buildTimerUpdateData(input);

  const { error } = await supabase
    .from("timers" as never)
    .update(updateData as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating timer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/timers");
  revalidatePath("/");
  return { success: true };
}

/**
 * Delete a timer
 */
export async function deleteTimer(id: string): Promise<UpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("timers" as never)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting timer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/timers");
  revalidatePath("/");
  return { success: true };
}

/**
 * Start a timer
 */
export async function startTimer(id: string): Promise<UpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get current timer to calculate end_time
  const { data: timer, error: fetchError } = await supabase
    .from("timers" as never)
    .select("remaining_seconds")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !timer) {
    return { success: false, error: "Timer not found" };
  }

  const remainingSeconds = (timer as { remaining_seconds: number }).remaining_seconds;
  const endTime = new Date(Date.now() + remainingSeconds * 1000);

  return updateTimer(id, {
    state: "running",
    endTime,
  });
}

/**
 * Pause a timer
 */
export async function pauseTimer(
  id: string,
  remainingSeconds: number
): Promise<UpdateResult> {
  return updateTimer(id, {
    state: "paused",
    remainingSeconds,
    endTime: null,
  });
}

/**
 * Reset a timer
 */
export async function resetTimer(id: string): Promise<UpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get the original duration
  const { data: timer, error: fetchError } = await supabase
    .from("timers" as never)
    .select("duration_seconds")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !timer) {
    return { success: false, error: "Timer not found" };
  }

  const durationSeconds = (timer as { duration_seconds: number }).duration_seconds;

  return updateTimer(id, {
    state: "stopped",
    remainingSeconds: durationSeconds,
    endTime: null,
  });
}
