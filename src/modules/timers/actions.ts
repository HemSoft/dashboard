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
      name: input.name,
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

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.durationSeconds !== undefined)
    updateData.duration_seconds = input.durationSeconds;
  if (input.remainingSeconds !== undefined)
    updateData.remaining_seconds = input.remainingSeconds;
  if (input.state !== undefined) updateData.state = input.state;
  if (input.endTime !== undefined)
    updateData.end_time = input.endTime ? input.endTime.toISOString() : null;
  if (input.enableCompletionColor !== undefined)
    updateData.enable_completion_color = input.enableCompletionColor;
  if (input.completionColor !== undefined)
    updateData.completion_color = input.completionColor;
  if (input.enableAlarm !== undefined)
    updateData.enable_alarm = input.enableAlarm;
  if (input.alarmSound !== undefined)
    updateData.alarm_sound = input.alarmSound;
  if (input.displayOrder !== undefined)
    updateData.display_order = input.displayOrder;

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
