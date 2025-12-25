"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Timer } from "../types";

/**
 * TimerAlertProvider listens for timer-complete events and triggers
 * audio alerts via Web Audio API and optional browser notifications.
 */
export function TimerAlertProvider() {
  const audioContextRef = useRef<AudioContext | null>(null);
  // Initialize notification permission directly from the API
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(() => {
      if (typeof window !== "undefined" && "Notification" in window) {
        return Notification.permission;
      }
      return "default";
    });

  /**
   * Play a simple alarm tone using Web Audio API
   */
  const playAlarmSound = useCallback(() => {
    const context = audioContextRef.current;
    if (!context) return;

    try {
      // Create a simple beep tone (440Hz for 0.5s, repeated 3 times)
      for (let i = 0; i < 3; i++) {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.value = 440; // A4 note
        oscillator.type = "sine";

        // Envelope for smoother sound
        const startTime = context.currentTime + i * 0.7;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
      }
    } catch (error) {
      console.error("Error playing alarm sound:", error);
    }
  }, []);

  useEffect(() => {
    // Initialize Web Audio API
    let audioContext: AudioContext | null = null;
    if (typeof window !== "undefined" && "AudioContext" in window) {
      audioContext = new AudioContext();
      audioContextRef.current = audioContext;
    }

    // Listen for timer completion events
    const handleTimerComplete = (event: Event) => {
      const customEvent = event as CustomEvent<{ timer: Timer }>;
      const timer = customEvent.detail.timer;

      // Play audio if enabled
      if (timer.enableAlarm) {
        playAlarmSound();
      }

      // Show browser notification if permitted (independent of audio setting)
      if (notificationPermission === "granted") {
        new Notification(`Timer Complete: ${timer.name}`, {
          body: "Your timer has finished!",
          tag: `timer-${timer.id}`,
        });
      }
    };

    window.addEventListener("timer-complete", handleTimerComplete);

    return () => {
      window.removeEventListener("timer-complete", handleTimerComplete);
      // Safely close AudioContext if it exists and isn't already closed
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {
          // Ignore errors during cleanup
        });
      }
      audioContextRef.current = null;
    };
  }, [notificationPermission, playAlarmSound]);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Show notification permission prompt if not yet decided
  if (notificationPermission === "default") {
    return (
      <div className="rounded-lg border bg-muted p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable Notifications</p>
            <p className="text-xs text-muted-foreground">
              Get notified when your timers complete
            </p>
          </div>
          <Button size="sm" onClick={requestNotificationPermission}>
            Enable
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
