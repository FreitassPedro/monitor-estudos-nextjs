"use client";

import { useRef, useState, useCallback } from "react";
import { GripVertical, X, Pencil, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudyBlock } from "./mock-data";
import { COLOR_MAP, blockDurationMinutes, formatDuration } from "./planner-utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


interface StudyBlockCardProps {
  block: StudyBlock;
  onDelete: (id: string) => void;
  onEdit: (block: StudyBlock) => void;
  onResize: (id: string, deltaMinutes: number) => void;
  onDragStart: (id: string) => void;
}

export function StudyBlockCard({
  block,
  onDelete,
  onEdit,
  onResize,
  onDragStart,
}: StudyBlockCardProps) {
  const colors = COLOR_MAP[block.color];
  const duration = blockDurationMinutes(block);
  // ~1.8px per minute, min 56px
  const minHeight = Math.max(56, duration * 1.8);
  const isCompact = minHeight < 80;

  const resizeRef = useRef<{ startY: number; startDuration: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeRef.current = { startY: e.clientY, startDuration: duration };

      const handleMouseMove = (me: MouseEvent) => {
        if (!resizeRef.current) return;
        const delta = Math.round((me.clientY - resizeRef.current.startY) / 1.8 / 15) * 15;
        const newDuration = Math.max(15, resizeRef.current.startDuration + delta);
        onResize(block.id, newDuration - resizeRef.current.startDuration);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        resizeRef.current = null;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [block.id, duration, onResize]
  );

  const handleTouchResizeStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      resizeRef.current = { startY: e.touches[0].clientY, startDuration: duration };

      const handleTouchMove = (te: TouchEvent) => {
        if (!resizeRef.current) return;
        const delta = Math.round((te.touches[0].clientY - resizeRef.current.startY) / 1.8 / 15) * 15;
        const newDuration = Math.max(15, resizeRef.current.startDuration + delta);
        onResize(block.id, newDuration - resizeRef.current.startDuration);
      };

      const handleTouchEnd = () => {
        setIsResizing(false);
        resizeRef.current = null;
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };

      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);
    },
    [block.id, duration, onResize]
  );

  return (
    <div
      className={cn(
        "relative group rounded-lg border select-none transition-shadow",
        "hover:shadow-sm",
        colors.bg,
        colors.border,
        colors.text,
        isResizing && "shadow-md ring-2 ring-inset ring-current/20"
      )}
      style={{ minHeight }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("blockId", block.id);
        onDragStart(block.id);
      }}
    >
      {/* Drag handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-3 h-3" />
      </div>

      <div className="px-3 pt-2 pb-5">
        {/* Subject + actions */}
        <div className="flex items-start justify-between gap-1">
          <p className={cn("font-medium leading-tight text-xs truncate", isCompact ? "text-[11px]" : "text-xs")}>
            {block.subject}
          </p>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-current/10"
                  onClick={(e) => { e.stopPropagation(); onEdit(block); }}
                >
                  <Pencil className="w-2.5 h-2.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-current/10"
                  onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remover</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Topic */}
        {!isCompact && block.topic && (
          <p className="text-[11px] opacity-70 truncate mt-0.5 leading-tight">
            {block.topic}
          </p>
        )}

        {/* Time */}
        {!isCompact && (
          <div className="flex items-center gap-1 mt-1.5 opacity-65">
            <Clock className="w-2.5 h-2.5 shrink-0" />
            <span className="text-[10px] font-mono">
              {block.startTime}–{block.endTime}
            </span>
            <span className="text-[10px] opacity-70 ml-auto">
              {formatDuration(duration)}
            </span>
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-4 flex items-center justify-center",
          "cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity",
          isResizing && "opacity-100"
        )}
        onMouseDown={handleResizeMouseDown}
        onTouchStart={handleTouchResizeStart}
      >
        <div className="w-6 h-0.5 rounded-full bg-current opacity-30" />
      </div>
    </div>
  );
}
