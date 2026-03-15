"use client";

import { BookOpen, Clock, BarChart2 } from "lucide-react";
import type { WeekStats } from "./planner";
import { formatDuration } from "./planner-utils";
import { cn } from "@/lib/utils";

interface WeekStatsBarProps {
  stats: WeekStats;
  className?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  "Matemática": "bg-blue-400",
  "Física": "bg-amber-400",
  "História": "bg-rose-400",
  "Inglês": "bg-teal-400",
  "Química": "bg-emerald-400",
  "Geografia": "bg-violet-400",
  "Biologia": "bg-emerald-500",
  "Português": "bg-orange-400",
};

function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? "bg-muted-foreground/40";
}

export function WeekStatsBar({ stats, className }: WeekStatsBarProps) {
  const topSubjects = Object.entries(stats.subjectBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3",
        "border-b bg-muted/20 text-sm",
        className
      )}
    >
      {/* Total hours */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs">Total</span>
        <span className="font-semibold text-foreground text-xs tabular-nums">
          {formatDuration(stats.totalMinutes)}
        </span>
      </div>

      {/* Block count */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs">Blocos</span>
        <span className="font-semibold text-foreground text-xs">
          {stats.totalBlocks}
        </span>
      </div>

      {/* Per-subject breakdown */}
      {topSubjects.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          {topSubjects.map(([subject, minutes]) => (
            <div key={subject} className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full shrink-0", getSubjectColor(subject))} />
              <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
                {subject}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/70 tabular-nums">
                {formatDuration(minutes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
