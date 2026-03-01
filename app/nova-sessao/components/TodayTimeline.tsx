"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTodayStudyLogs } from "@/hooks/useStudyLogs";
import useSessionFormStore from "@/store/useSessionFormStore";
import { Clock } from "lucide-react";


const TimelineCardProps = {
    height: "72rem",
    spaceBetweenDays: "4rem",
}

const timeToPosition = (time: string) => {
    // Extrai hora e minuto do timestamp ISO ou formato HH:MM
    let hours: number, minutes: number;

    if (time.includes('T')) {
        // Formato ISO: "2026-02-04T14:00:32.505Z"
        const date = new Date(time);
        hours = date.getHours();
        minutes = date.getMinutes();
    } else {
        // Formato HH:MM
        [hours, minutes] = time.split(':').map(Number);
    }

    const totalMinutes = hours * 60 + minutes;
    const dayStart = 0 * 60;
    const dayEnd = 24 * 60;
    return ((totalMinutes - dayStart) / (dayEnd - dayStart)) * 100;
};

const calculateTop = (startTime: Date) => {
    if (!startTime) {
        return 0;
    }
    const startTimeDate = new Date(startTime);
    if (isNaN(startTimeDate.getTime())) {
        return 0;
    }
    return timeToPosition(startTimeDate.getHours().toString().padStart(2, '0') + ':' + startTimeDate.getMinutes().toString().padStart(2, '0'));
};

const calculateFinalHeight = (startTime: Date, endTime: Date | null) => {
    if (!startTime) {
        return 0;
    }
    const startTimeDate = new Date(startTime);
    if (isNaN(startTimeDate.getTime())) {
        return 0;
    }
    // Calculate height based on end_time if available, otherwise use duration_minutes
    let durationMinutes: number;
    let height: number;
    if (endTime) {
        const strtT = new Date(startTime).getTime();
        const endT = new Date(endTime).getTime();
        const durationMs = endT - strtT;
        durationMinutes = durationMs / (1000 * 60);
        height = (durationMinutes / (24 * 60)) * 100;
    }
    else {
        // Use static duration_minutes as fallback
        height = (30 / (24 * 60)) * 100;
    }
    // Prevent card from overflowing container
    return Math.min(height, 100 - calculateTop(startTime));
}

const formatTimeFromTimestamp = (time: Date | string | undefined | null) => {
    if (!time) return '--:--';
    const timeDate = typeof time === 'string' ? new Date(time) : time;
    if (isNaN(timeDate.getTime())) return '--:--';
    const hours = timeDate.getHours().toString().padStart(2, '0');
    const minutes = timeDate.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
};
export function TodayTimeline() {

    const today = new Date();
    const { data: logs } = useTodayStudyLogs();
    const { cronometer, selectedSubject, selectedTopic } = useSessionFormStore();

    console.log("Teste Cronometer Load:", cronometer);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-violet-500" />
                    Timeline do Dia - {today?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </CardTitle>
                <CardDescription>
                    Visualize suas sessões de estudo ao longo do dia. A linha do tempo é atualizada em tempo real enquanto o cronômetro estiver ativo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className={`flex flex-row`} style={{ height: TimelineCardProps.height }}>
                    {/* Hour markers */}
                    <div className="flex flex-col text-xs text-slate-500 space-y-0" >
                        {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                            <div key={hour} className="flex-1 text-right pr-2 border-r border-slate-200">
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </div>
                        ))}
                    </div>

                    {/* Timeline container */}
                    <div className="relative w-full bg-slate-50 rounded-lg overflow-hidden">
                        {/* Background lines */}
                        {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                            <div
                                key={hour}
                                className="absolute left-0 right-0 border-t border-slate-200"
                                style={{ top: `${(hour / 24) * 100}%` }}
                            />
                        ))}


                        {cronometer.startTime && selectedSubject && selectedTopic && (
                            <div
                                key={selectedSubject.id + '_current'}
                                className={`absolute z-10 left-2 right-2 rounded-lg p-2 border-l-4 overflow-hidden cursor-pointer hover:scale-[1.01] hover:z-20 transition-all
                                    ${cronometer.isRunning ? 'border-red-500 animate-pulse duration-3000 border-b border-dotted' : 'border-green-500'}
                                    `}
                                style={{
                                    top: `${calculateTop(cronometer.startTime)}%`,
                                    height: `${calculateFinalHeight(cronometer.startTime, cronometer.endTime)}%`,
                                    backgroundColor: '#a1a1aa33',
                                    borderLeftColor: '#a1a1aa',
                                }}
                            >
                                <div className="flex justify-between h-full">
                                    <div>
                                        <h4 className="font-semibold text-xs text-slate-900 truncate">{selectedTopic?.name}</h4>
                                        <span className="text-xs text-slate-600 truncate">{selectedSubject.name}</span>
                                    </div>
                                    <div className="text-xs text-slate-600 flex items-center gap-1  flex-row justify-between">
                                        <div className='flex flex-row items-center gap-1'>
                                            <Clock className="w-3 h-3" />
                                            {formatTimeFromTimestamp(cronometer.startTime)}
                                        </div>
                                        <div className='flex flex-row items-center gap-1'>
                                            <Clock className="w-3 h-3" />
                                            {formatTimeFromTimestamp(cronometer.endTime)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}