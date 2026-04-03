"use client";

import { useMemo } from "react";
import { BlockFormModal, DayColumn } from "./components/DayColumn";
import { getMondayOfCurrentWeek, getWeekDates } from "../teste/4/components/planner-utils";
import { Clock } from "lucide-react";
import { usePlannerState } from "./usePlannerState";
import { SidebarTools } from "./components/SidebarTools";
import { buildHourHeights } from "./utils";

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function formatHourLabel(hour: number) {
    return `${String(hour).padStart(2, "0")}:00`;
}


export default function Page() {

    const {
        blocks,
        form,
        setForm,
        modalOpen,
        openAddModal,
        closeModal,
        openEditBlock,
        saveBlock,
    } = usePlannerState();

    const monday = useMemo(() => getMondayOfCurrentWeek(), []);
    const weekDates = useMemo(() => getWeekDates(monday), [monday]);
    const hourHeights = useMemo(() => buildHourHeights(blocks), [blocks]);
    const timelineHeightPx = useMemo(
        () => hourHeights.reduce((total, height) => total + height, 0),
        [hourHeights]
    );

    const hourOffsets = useMemo(() => {
        return hourHeights.map((_, index) => {
            return hourHeights.slice(0, index).reduce((total, height) => total + height, 0);
        });
    }, [hourHeights]);



    return (
        <div className="flex flex-col h-screen">

            {/* ── Header ── */}
            <div className="border bg-secondary/60 flex items-center px-4 py-2">
                <div>
                    <div className="flex items-center">
                        <Clock size={16} />
                        <span>Tempo Total:</span>
                    </div>

                    <p className="">
                        {formatDuration(350)} {/* Example duration */}
                    </p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* ── Main planner ── */}
                <div className="flex flex-1 min-w-0 rounded-4xl bg-background border border-muted m-4 p-4 flex-col">

                    {/* ── Week grid ── */}
                    <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-4 h-full px-6 min-w-295">
                            <div className="flex flex-col min-w-0 pt-24">
                                <div
                                    className="relative rounded-lg text-xs text-muted-foreground"
                                    style={{ height: `${timelineHeightPx}px` }}
                                >
                                    {hourOffsets.map((top, hour) => (
                                        <div
                                            key={hour}
                                            className="absolute left-0 right-0 border-t border-muted/50 flex items-center gap-1 px-2"
                                            style={{ top: `${top}px` }}
                                        >
                                            {formatHourLabel(hour)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {weekDates.map((date, dayIndex) => (
                                <DayColumn
                                    key={dayIndex}
                                    blocks={blocks.filter(block => block.dayIndex === dayIndex)}
                                    date={date}
                                    dayIndex={dayIndex}
                                    hourHeights={hourHeights}
                                    timelineHeightPx={timelineHeightPx}
                                    onAddBlock={openAddModal}
                                    onEditBlock={openEditBlock}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <SidebarTools />

            </div>
            <BlockFormModal
                open={modalOpen}
                form={form}
                onFormChange={(patch) => setForm({ ...form, ...patch })}
                onSave={saveBlock}
                onCloseModal={closeModal}
            />
        </div>
    )
}