"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { revalidateNews } from "../actions";

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function getElapsedText(loadedAt: number): string {
  const ms = Date.now() - loadedAt;
  if (ms < 5000) {
    return "just now";
  }
  return formatElapsed(ms);
}

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadedAt, setLoadedAt] = useState<number>(() => Date.now());
  const [elapsed, setElapsed] = useState(() => getElapsedText(Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedText(loadedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [loadedAt]);

  function handleRefresh() {
    startTransition(async () => {
      await revalidateNews();
      router.refresh();
      setLoadedAt(Date.now());
      setElapsed("just now");
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">
        {isPending ? "Loading..." : `Loaded ${elapsed}`}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isPending}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
