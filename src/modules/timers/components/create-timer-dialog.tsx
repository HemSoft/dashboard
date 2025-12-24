"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { createTimer } from "../actions";
import { TIMER_PRESETS } from "../types";

interface CreateTimerDialogProps {
  onCreated?: () => void;
}

export function CreateTimerDialog({ onCreated }: CreateTimerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePresetClick = (seconds: number) => {
    setDurationSeconds(seconds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await createTimer({
      name: name.trim(),
      durationSeconds,
    });

    if (result.success) {
      setName("");
      setDurationSeconds(300);
      setOpen(false);
      onCreated?.();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Timer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Timer</DialogTitle>
          <DialogDescription>
            Set up a countdown timer with custom duration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timer-name">Timer Name</Label>
            <Input
              id="timer-name"
              placeholder="e.g., Break time, Meeting"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {TIMER_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant={
                    durationSeconds === preset.seconds ? "default" : "outline"
                  }
                  onClick={() => handlePresetClick(preset.seconds)}
                  className="w-full"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration-minutes">Duration (minutes)</Label>
            <Input
              id="duration-minutes"
              type="number"
              min="1"
              max="1440"
              value={Math.floor(durationSeconds / 60)}
              onChange={(e) =>
                setDurationSeconds(Math.max(1, parseInt(e.target.value) || 1) * 60)
              }
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              Create Timer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
