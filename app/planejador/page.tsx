"use client";

import { useMemo } from "react";
import { BlockFormModal, DayColumn } from "./components/DayColumn";
import { getMondayOfCurrentWeek, getWeekDates } from "../teste/4/components/planner-utils";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlannerState } from "./usePlannerState";
import { SidebarTools } from "./components/SidebarTools";

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
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



    return (
        <div className="flex flex-col h-screen overflow-hidden ">

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
                        <div className="grid grid-cols-7 gap-4 h-full px-6 min-w-250">
                            {weekDates.map((date, dayIndex) => (
                                <DayColumn
                                    key={dayIndex}
                                    blocks={blocks.filter(block => block.dayIndex === dayIndex)}
                                    date={date}
                                    dayIndex={dayIndex}
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