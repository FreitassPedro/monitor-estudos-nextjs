"use client";

import { useMemo } from "react";
import { BlockFormModal, DayColumn } from "./components/DayColumn";
import { getMondayOfCurrentWeek, getWeekDates } from "../teste/4/components/planner-utils";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlannerState } from "./usePlannerState";

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/5">
            <div
                className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    progress >= 100 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" :
                        progress > 50 ? "bg-primary" : "bg-amber-500"
                )}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

export default function Page() {

    const {
        form,
        setForm,
        modalOpen,
        openAddModal,
        closeModal,
        openEditBlock
    } = usePlannerState();

    const monday = useMemo(() => getMondayOfCurrentWeek(), []);
    const weekDates = useMemo(() => getWeekDates(monday), [monday]);

    const GOALS: Record<string, number> = {
        "Matemática": 600,
        "Física": 300,
        "História": 200,
        "Inglês": 150,
        "Química": 300,
        "Geografia": 150,
    };

    const goalsEntries = Object.entries(GOALS).sort((a, b) => b[1] - a[1]);

    return (
        <main className="flex-1">
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
            <div className="grid grid-cols-7 gap-5 h-full px-6">
                {weekDates.map((date, dayIndex) => (
                    <DayColumn
                        key={dayIndex}
                        date={date}
                        dayIndex={dayIndex}
                        onAddBlock={openAddModal}
                        onEditBlock={openEditBlock}
                    />
                ))}
            </div>

            <aside className="">
                <h2 className="font-semibold mb-2">Matérias Dedicadas</h2>
                {/* Progress by subject and templates would go here */}
                <div className="space-y-2">


                    {
                        goalsEntries.map(([subject, goal]) => {

                            const progress = 30; // Example progress, you would calculate this based on actual data

                            return (
                                <div key={subject}>
                                    <div className="flex justify-between items-center font-semibold text-sm">
                                        <p>{subject}</p>
                                        <span className="text-xs">10h / {formatDuration(goal)}</span>
                                    </div>
                                    <ProgressBar progress={progress} />
                                </div>
                            )
                        })
                    }

                </div>
            </aside>
            <BlockFormModal
                open={modalOpen}
                form={form}
                onFormChange={(patch) => setForm({ ...form, ...patch })}
                onSave={() => { }} // Implement save logic
                onCloseModal={closeModal}
            />
        </main>
    )
}