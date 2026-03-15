"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudyBlock } from "./mock-data";
import { DAY_NAMES, DAY_SHORT, formatDate, blockDurationMinutes, formatDuration } from "./planner-utils";
import { StudyBlockCard } from "./StudyBlockCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DayColumnProps {
  dayIndex: number;
  date: Date;
  blocks: StudyBlock[];
  isToday: boolean;
  onAddBlock: (dayIndex: number) => void;
  onEditBlock: (block: StudyBlock) => void;
  onDeleteBlock: (id: string) => void;
  onResizeBlock: (id: string, deltaMinutes: number) => void;
  onDragStart: (id: string) => void;
  onDrop: (blockId: string, targetDay: number) => void;
}

export function DayColumn({
  dayIndex,
  date,
  blocks,
  isToday,
  onAddBlock,
  onEditBlock,
  onDeleteBlock,
  onResizeBlock,
  onDragStart,
  onDrop,
}: DayColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dayMinutes = blocks.reduce((a, b) => a + blockDurationMinutes(b), 0);
  const isWeekend = dayIndex >= 5;

  return (
    <div className="flex flex-col min-w-0">
      {/* Day header */}
      <div
        className={cn(
          "mb-2 px-1 pb-2 border-b",
          isToday ? "border-foreground/20" : "border-border"
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <div>
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-widest",
                isToday ? "text-foreground" : "text-muted-foreground",
                isWeekend && !isToday && "text-muted-foreground/60"
              )}
            >
              <span className="hidden sm:inline">{DAY_NAMES[dayIndex]}</span>
              <span className="sm:hidden">{DAY_SHORT[dayIndex]}</span>
            </p>
            <p
              className={cn(
                "text-[10px] tabular-nums",
                isToday ? "text-foreground/70" : "text-muted-foreground/50"
              )}
            >
              {formatDate(date)}
            </p>
          </div>
          {isToday && (
            <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
          )}
        </div>

        {dayMinutes > 0 && (
          <Badge
            variant="secondary"
            className="mt-1.5 h-4 text-[10px] px-1.5 font-mono"
          >
            {formatDuration(dayMinutes)}
          </Badge>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "flex-1 flex flex-col gap-2 rounded-lg p-1.5 min-h-[280px] transition-colors duration-150",
          isDragOver
            ? "bg-accent/60 ring-1 ring-border"
            : "bg-muted/30"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const blockId = e.dataTransfer.getData("blockId");
          if (blockId) onDrop(blockId, dayIndex);
        }}
      >
        {blocks.length === 0 && (
          <p className="text-[10px] text-muted-foreground/40 text-center pt-4 select-none">
            Sem blocos
          </p>
        )}

        {blocks.map((block) => (
          <StudyBlockCard
            key={block.id}
            block={block}
            onDelete={onDeleteBlock}
            onEdit={onEditBlock}
            onResize={onResizeBlock}
            onDragStart={onDragStart}
          />
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="mt-auto w-full h-7 text-[11px] text-muted-foreground/50 hover:text-muted-foreground border border-dashed border-border/50 hover:border-border hover:bg-background"
          onClick={() => onAddBlock(dayIndex)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
