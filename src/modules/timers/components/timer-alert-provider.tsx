"use client";

import { useEffect, useRef, useState } from "react";
import type { Timer } from "../types";

/**
 * TimerAlertProvider listens for timer-complete events and triggers
 * audio alerts via Web Audio API and optional browser notifications.
 */
export function TimerAlertProvider() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== "undefined" && "AudioContext" in window) {
      audioContextRef.current = new AudioContext();
    }

    // Check notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Listen for timer completion events
    const handleTimerComplete = (event: Event) => {
      const customEvent = event as CustomEvent<{ timer: Timer }>;
      const timer = customEvent.detail.timer;

      if (timer.enableAlarm) {
        playAlarmSound();
      }

      // Show browser notification if permitted
      if (notificationPermission === "granted") {
        new Notification(`Timer Complete: ${timer.name}`, {
          body: "Your timer has finished!",
          icon: "/icon.svg",
          tag: `timer-${timer.id}`,
        });
      }
    };

    window.addEventListener("timer-complete", handleTimerComplete);

    return () => {
      window.removeEventListener("timer-complete", handleTimerComplete);
      audioContextRef.current?.close();
    };
  }, [notificationPermission]);

  /**
   * Play a simple alarm tone using Web Audio API
   */
  const playAlarmSound = () => {
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
  };

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
          <button
            onClick={requestNotificationPermission}
            className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Enable
          </button>
        </div>
      </div>
    );
  }

  return null;
}
