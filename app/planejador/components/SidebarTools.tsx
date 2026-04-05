import { cn } from "@/lib/utils";
import { formatDuration } from "../page";

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

export function SidebarTools() {
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
        <aside className="w-64 border-l bg-muted/10 flex flex-col h-full p-4">
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
    )
}