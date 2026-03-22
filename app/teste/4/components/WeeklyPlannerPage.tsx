"use client";



import { useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { usePlannerState } from "./use-planner-state";
import {
  getMondayOfCurrentWeek,
  getWeekDates,
  formatDate,
  computeWeekStats,
} from "./planner-utils";
import { DayColumn } from "./DayColumn";
import { BlockFormModal } from "./BlockFormModal";
import { WeekStatsBar } from "./WeekStatsBar";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function WeeklyPlannerPage() {
  const {
    blocks,
    form,
    setForm,
    modalOpen,
    editingBlock,
    activeDay,
    openAddModal,
    openEditModal,
    closeModal,
    saveBlock,
    deleteBlock,
    moveBlockToDay,
    resizeBlock,
    blocksForDay,
    setDraggedId,
  } = usePlannerState();

  const monday = useMemo(() => getMondayOfCurrentWeek(), []);
  const weekDates = useMemo(() => getWeekDates(monday), [monday]);
  const todayIndex = useMemo(() => {
    const dateString = "2026-03-15T03:02:22.279Z";
    const today = new Date(dateString);
    const todayDay = today.getDay();
    // Convert: Sun=0 → 6, Mon=1 → 0, ..., Sat=6 → 5
    return todayDay === 0 ? 6 : todayDay - 1;
  }, []);

  const stats = useMemo(() => computeWeekStats(blocks), [blocks]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* ── Top header ── */}
        <header className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <h1 className="text-sm font-semibold tracking-tight">
              Planejador Semanal
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums px-1">
              {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </header>

        {/* ── Stats bar ── */}
        <WeekStatsBar stats={stats} />

        {/* ── Week grid ── */}
        <main className="flex-1 overflow-auto p-3">
          <div className="grid grid-cols-7 gap-2 min-w-[560px] h-full">
            {weekDates.map((date, dayIndex) => (
              <DayColumn
                key={dayIndex}
                dayIndex={dayIndex}
                date={date}
                blocks={blocksForDay(dayIndex)}
                isToday={dayIndex === todayIndex}
                onAddBlock={openAddModal}
                onEditBlock={openEditModal}
                onDeleteBlock={deleteBlock}
                onResizeBlock={resizeBlock}
                onDragStart={setDraggedId}
                onDrop={moveBlockToDay}
              />
            ))}
          </div>
        </main>

        {/* ── Add/Edit modal ── */}
        <BlockFormModal
          open={modalOpen}
          isEditing={!!editingBlock}
          activeDay={activeDay}
          form={form}
          onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSave={saveBlock}
          onClose={closeModal}
        />
      </div>
    </TooltipProvider>
  );
}
