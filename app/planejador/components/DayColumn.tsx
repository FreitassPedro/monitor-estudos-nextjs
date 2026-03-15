export function StudyBlockCard() {
    return (
        <div className="bg-blue-100 text-blue-800 border border-blue-200 rounded-lg p-2 relative">
            <h3 className="text-sm font-semibold">Matemática - Álgebra</h3>
            <p className="text-xs mt-1">Duração: 1h30m</p>
        </div>
    );
};
export function DayColumn({ date }: { date: Date }) {
    return (

        <div className="flex flex-col">
            <div >
                <p>{date.toLocaleDateString()}</p>
            </div>

            {/* Drop zone */}
            <div className="bg-muted/40 min-h-[280px] rounded-lg p-1.5">
                <p className="text-muted-foreground/40 ">Sem blocos</p>
                <StudyBlockCard />
            </div>
        </div>

    )
};
