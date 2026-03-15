import { useMemo } from "react";
import { DayColumn } from "./components/DayColumn";
import { getMondayOfCurrentWeek, getWeekDates } from "../teste/4/components/planner-utils";

export default function Page() {
    const monday = useMemo(() => getMondayOfCurrentWeek(), []);
    const weekDates = useMemo(() => getWeekDates(monday), [monday]);

    return (
        <main className="flex-1">

            <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, dayIndex) => (

                    <DayColumn key={dayIndex} date={date} />
                ))}
            </div>
        </main>
    )
}