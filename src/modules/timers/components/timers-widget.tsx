import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Timer as TimerIcon } from "lucide-react";
import Link from "next/link";
import { getTimers } from "../actions";
import type { Timer } from "../types";
import { formatTime } from "../types";

function EmptyTimersView() {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-muted-foreground mb-3">No timers configured</p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/timers">Create Timer</Link>
      </Button>
    </div>
  );
}

function TimersSummaryView({ timers, nextTimer }: { timers: Timer[]; nextTimer: Timer | null }) {
  if (nextTimer) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Currently running:</div>
            <div className="text-sm font-medium">{nextTimer.name}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums">
              {formatTime(nextTimer.remainingSeconds)}
            </div>
            <div className="text-xs text-muted-foreground">remaining</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center py-2">
        <div className="text-sm text-muted-foreground">
          {timers.length} timer{timers.length !== 1 ? "s" : ""} ready
        </div>
      </div>
    </div>
  );
}

function TimersContent({ timers, error }: { timers: Timer[]; error: string | undefined }) {
  if (timers.length === 0 && !error) {
    return <EmptyTimersView />;
  }

  if (timers.length > 0) {
    const runningTimers = timers.filter((t) => t.state === "running");
    const nextTimer = runningTimers.length > 0 ? runningTimers[0] : null;
    return <TimersSummaryView timers={timers} nextTimer={nextTimer} />;
  }

  return null;
}

export async function TimerWidget() {
  const { timers, error } = await getTimers();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-start gap-2">
          <TimerIcon className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Timers</CardTitle>
              {timers.length > 0 && (
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {timers.length}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Countdown timers & alerts
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/timers">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive mb-4">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <TimersContent timers={timers} error={error} />
      </CardContent>
    </Card>
  );
}
