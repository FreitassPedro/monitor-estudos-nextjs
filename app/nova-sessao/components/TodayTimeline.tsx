"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTodayStudyLogs } from "@/hooks/useStudyLogs";
import { useSubjectsMap } from "@/hooks/useSubjects";
import useSessionFormStore from "@/store/useSessionFormStore";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getLocalDateForToday } from "@/lib/utils";


const TimelineCardProps = {
    height: "72rem",
    spaceBetweenDays: "4rem",
}

const MIN_VISIBLE_SESSION_HEIGHT_PERCENT = 0.5;

const timeToPosition = (time: string | Date) => {
    // Extrai hora/minuto/segundo de Date, timestamp ISO ou formato HH:MM
    let hours: number, minutes: number, seconds = 0;

    if (time instanceof Date) {
        hours = time.getHours();
        minutes = time.getMinutes();
        seconds = time.getSeconds();
    } else if (time.includes('T')) {
        // Formato ISO: "2026-02-04T14:00:32.505Z"
        const date = new Date(time);
        hours = date.getHours();
        minutes = date.getMinutes();
        seconds = date.getSeconds();
    } else {
        // Formato HH:MM
        [hours, minutes] = time.split(':').map(Number);
    }

    const totalMinutes = hours * 60 + minutes + (seconds / 60);
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
    return timeToPosition(startTimeDate);
};

const calculateFinalHeight = (startTime: Date, endTime: Date) => {
    if (!startTime) {
        return 0;
    }

    if (!endTime) {
        endTime = new Date();
    }
    // Calculate height based on end_time if available, otherwise use duration_minutes
    let durationMinutes: number;
    let height: number;

    const strtT = startTime.getTime();
    const endT = endTime.getTime();
    const durationMs = endT - strtT;
    durationMinutes = durationMs / (1000 * 60);
    height = (durationMinutes / (24 * 60)) * 100;

    console.log({ startTime, endTime, durationMinutes, height });
    return Math.min(height, 100 - calculateTop(startTime));
}

const formatTimeFromTimestamp = (time: Date | string | undefined | null, includeSeconds = false) => {
    if (!time) return '--:--';
    const timeDate = typeof time === 'string' ? new Date(time) : time;
    if (isNaN(timeDate.getTime())) return '--:--';
    const hours = timeDate.getHours().toString().padStart(2, '0');
    const minutes = timeDate.getMinutes().toString().padStart(2, '0');
    const seconds = timeDate.getSeconds().toString().padStart(2, '0');

    if (includeSeconds) {
        return `${hours}:${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}`;
};
export function TodayTimeline() {

    const today = getLocalDateForToday();
    const { data: logs, isLoading } = useTodayStudyLogs();
    const { cronometer, selectedSubject, selectedTopic } = useSessionFormStore();

    const { data: subjectsMap } = useSubjectsMap();

    const latestLogRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [currentCard, setCurrentCard] = useState<{ startTime: Date | null, endTime: Date | null, top: number, height: number } | null>({
        startTime: null,
        endTime: null,
        top: 0,
        height: 0,
    });


    // Update current time every minute to move the "now" line in real time
    useEffect(() => {
        const updateCurrentTime = () => {
            setCurrentTime(new Date());
        };

        // Update immediately
        updateCurrentTime();

        // Update every second to keep the running card aligned with the "now" line.
        const intervalId = setInterval(updateCurrentTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Scroll to the latest log whenever logs change
    useEffect(() => {
        if (logs && logs.length > 0 && latestLogRef.current) {
            latestLogRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
        console.log(latestLogRef.current);

        console.log('Logs updated:', logs);
    }, [logs, latestLogRef]);

    // Update current session card position and height in real time
    useEffect(() => {
        if (!cronometer.isRunning && currentCard?.startTime && currentCard?.endTime) {
            setCurrentCard(prev => {
                if (!prev || !prev.startTime || !prev.endTime) return prev;
                const newHeight = calculateFinalHeight(prev.startTime, prev.endTime);
                return {
                    ...prev,
                    height: newHeight,
                };
            }
            );
            return;
        }


        // Ao iniciar, insira dados iniciais para o card
        if (cronometer.startTime && !currentCard?.startTime) {
            setCurrentCard({
                startTime: new Date(cronometer.startTime),
                endTime: currentTime,
                top: calculateTop(cronometer.startTime),
                height: 0,
            });
            return;
        }


        // Se o cronômetro estiver rodando, atualize a altura do card a cada segundo
        if (cronometer.isRunning && cronometer.startTime && currentCard?.startTime) {
            const intervalId = setInterval(() => {
                setCurrentCard(prev => {
                    if (!prev || !prev.startTime) return prev;
                    const newHeight = calculateFinalHeight(prev.startTime, currentTime);
                    console.log('Updating card height:', { newHeight, currentTime });
                    return {
                        ...prev,
                        endTime: currentTime,
                        height: newHeight,
                    };
                });
            }, 1000);

            return () => clearInterval(intervalId);
        }

        // Se o cronometro parar, defina a altura final do card com base no endTime
        if (!cronometer.isRunning && cronometer.startTime && currentCard?.startTime && !currentCard.endTime) {
            setCurrentCard(prev => {
                if (!prev || !prev.startTime) return prev;
                const newHeight = calculateFinalHeight(prev.startTime, new Date());
                return {
                    ...prev,
                    endTime: new Date(),
                    height: newHeight,
                };
            });
            return;
        }
    }, [cronometer.startTime, cronometer.isRunning, currentTime]);


    return (
        <div className="h-auto md:h-full md:min-h-0 md:overflow-hidden">
            <Card className="h-auto md:flex md:h-full md:min-h-0 md:flex-col md:overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-violet-500" />
                        Timeline do Dia - {today?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </CardTitle>
                    <CardDescription>
                        Visualize suas sessões de estudo ao longo do dia. A linha do tempo é atualizada em tempo real enquanto o cronômetro estiver ativo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-visible md:flex-1 md:min-h-0 md:overflow-y-auto">
                    <div className="">
                        <div className={`flex flex-row`} style={{ height: TimelineCardProps.height }}>
                            {/* Hour markers */}
                            <div className="flex flex-col text-xs  text-slate-500 space-y-0 sticky left-0 bg-card z-10" >
                                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                                    <div key={hour} className="flex-1 text-right pr-2 border-r border-slate-200">
                                        {`${hour.toString().padStart(2, '0')}:00`}
                                    </div>
                                ))}
                            </div>

                            {/* Timeline container */}
                            <div className="relative w-full bg-secondary rounded-lg overflow-hidden">
                                {/* Background lines */}
                                {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                                    <div
                                        key={hour}
                                        className="absolute left-0  right-0 border-t border-slate-200/40"
                                        style={{ top: `${(hour / 24) * 100}%` }}
                                    />
                                ))}

                                {logs?.map(log => {
                                    const subject = subjectsMap?.[log.topic.subjectId];
                                    // Find the log with latest end_time
                                    const latestLog = logs.reduce((latest, current) => {
                                        return new Date(current.end_time) > new Date(latest.end_time) ? current : latest;
                                    });


                                    return (
                                        <div
                                            key={log.id}
                                            ref={log.id === latestLog.id ? latestLogRef : null}
                                            className="absolute z-0 left-2 right-2 rounded-lg p-2 border-l-4 overflow-hidden cursor-pointer hover:scale-[1.01] hover:z-20 transition-all
                                    border-blue-500"
                                            style={{
                                                top: `${calculateTop(log.start_time)}%`,
                                                height: `${calculateFinalHeight(log.start_time, log.end_time)}%`,
                                                backgroundColor: `${subject?.color}33`,
                                                borderLeftColor: `${subject?.color}`,
                                            }}
                                        >
                                            <div className="flex justify-between h-full">
                                                <div>
                                                    <h4 className="font-semibold text-xs text-foreground truncate">{log.topic?.name}</h4>
                                                    <span className="text-xs text-muted-foreground truncate">{subject?.name}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1  flex-row justify-between">
                                                    <div className='flex flex-row items-center gap-1'>
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimeFromTimestamp(log.start_time)}
                                                    </div>
                                                    <div className='flex flex-row items-center gap-1'>
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimeFromTimestamp(log.end_time)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}


                                {/* Now hour line */}
                                <div
                                    className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 flex items-center transition-all animate-pulse duration-400 "
                                    style={{
                                        top: `${timeToPosition(currentTime)}%`
                                    }}
                                >
                                    <div className="absolute -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                    <div className="absolute -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="absolute -top-5 left-2 text-xs font-semibold text-red-500 bg-white px-1 rounded">
                                        {formatTimeFromTimestamp(currentTime, true)}
                                    </span>
                                </div>


                                {/* Current session card */}
                                {
                                    cronometer.startTime && currentCard?.startTime && currentCard?.endTime && (
                                        <div
                                            key={selectedSubject?.id ?? "pendingId" + '_current'}
                                            className={`absolute z-10 left-2 right-2 rounded-lg p-2 border-l-4 overflow-hidden cursor-pointer hover:scale-[1.01] hover:z-20 transition-all
                                    ${cronometer.isRunning ? 'border-red-500 animate-pulse duration-3000 border-b border-dotted' : 'border-green-500'}
                                    `}
                                            style={{
                                                top: `${calculateTop(currentCard?.endTime)}%`,
                                                height: `${calculateFinalHeight(currentCard?.startTime, currentCard?.endTime)}%`,
                                                backgroundColor: '#a1a1aa33',
                                                borderLeftColor: '#a1a1aa',
                                            }}
                                        >
                                            <div className="flex justify-between h-full">
                                                <div className="flex flex-col items-center justify-between gap-1">
                                                    <h4 className="font-semibold text-xs text-slate-900 truncate">{selectedTopic?.name ?? 'Topic not selected'}</h4>
                                                    <span className="text-xs text-slate-600 truncate">{selectedSubject?.name ?? 'Subject not selected'}</span>
                                                </div>
                                                <div className="text-xs text-slate-600 flex items-center gap-1 flex-row justify-between">
                                                    <div className='flex flex-row items-center gap-1'>
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimeFromTimestamp(currentCard?.startTime)}
                                                    </div>
                                                    <div className='flex flex-row items-center gap-1'>
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimeFromTimestamp(currentCard?.endTime, cronometer.isRunning)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}