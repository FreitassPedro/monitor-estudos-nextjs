"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudyLogsHistory } from "@/hooks/useStudyLogs";
import { getStudyLogDetailsAction, getStudyLogsByDateAction } from "@/server/actions/studyLogs.action";
import { useQuery } from "@tanstack/react-query";
import { addWeeks, endOfWeek, format, isSameWeek, startOfWeek, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    BookOpen,
    ChevronRight,
    Clock,
    FileText,
    Loader2,
    Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DateRange } from "./HistoryDateNav";

const USER_ID = "8e4fba66-4d2e-4bb6-8200-c45db7a92f8e";

type StudyLogFeedItem = Awaited<ReturnType<typeof getStudyLogsByDateAction>>[number];

const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
};



const LogDetailsDialog = ({ logId, isOpen, isOpenChange }: { logId: string; isOpen: boolean; isOpenChange: (isOpen: boolean) => void }) => {

    const { data: logDetails, isLoading } = useQuery({
        queryKey: ["studyLogs", "details", logId],
        queryFn: () => getStudyLogDetailsAction(logId),
        enabled: !!logId && isOpen,
        gcTime: 1000 * 60, // 1 minuto, depois destroi
    });

    if (!logId) return null;


    return (
        <Dialog open={isOpen} onOpenChange={isOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalhes da Sessão</DialogTitle>
                </DialogHeader>
                { isLoading ? (
                    <div className="flex items-center justify-center py-3 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                ) : null }

                {logDetails ? (
                    <>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Matéria</p>
                            <p className="whitespace-pre-line">{logDetails.topic.subject.name}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Tópico</p>
                            <p className="whitespace-pre-line">{logDetails.topic.name}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Anotações</p>
                            <p className="whitespace-pre-line">{logDetails.notes || 'Sem anotações'}</p>
                        </div>
                        <div className='space-y-2'>
                            <p className="text-sm text-muted-foreground">Duração</p>
                            <p>{formatMinutes(logDetails.duration_minutes)}</p>
                        </div>
                        <div className='space-y-2'>
                            <p className="text-sm text-muted-foreground">Horário</p>
                            <p>{new Date(logDetails.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(logDetails.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className='space-y-2'>
                            <p className="text-sm text-muted-foreground">Data</p>
                            <p>{format(new Date(logDetails.study_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Nenhum registro selecionado</p>
                )}
            </DialogContent>
        </Dialog>
    );
};
export function LogCard({ log }: { log: StudyLogFeedItem }) {
    const subject = log.topic.subject;
    const topic = log.topic;

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <>
            <div className="group flex items-start gap-4 p-4 bg-card border border-border/40 hover:border-border rounded-lg transition-all hover:shadow-sm">
                <div
                    className="w-1.5 h-full min-h-[3rem] rounded-full shrink-0"
                    style={{ backgroundColor: subject?.color || "#ccc" }}
                />

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-foreground truncate">
                            {subject?.name}
                            <span className="mx-2 text-muted-foreground font-normal" aria-hidden="true">
                                —
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-normal">
                                <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                {topic?.name}
                            </span>
                        </h4>
                        <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                            {new Date(log.start_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                            {" - "}
                            {new Date(log.end_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>

                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                        <span className="font-medium">Notas:</span>{" "}
                        {log.notes || "Sem anotações para esta sessão."}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-xs font-normal">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatMinutes(log.duration_minutes)}
                        </Badge>
                    </div>
                </div>

                <div className="flex gap-1 opacity-100 sm:opacity-30 sm:group-hover:opacity-100 transition-opacity">
                    {log.notes && (
                        <Button size="icon" variant="ghost" onClick={() => setIsDetailsOpen(true)} title="Ver anotações">
                            <FileText className="w-4 h-4 text-blue-500" />
                        </Button>
                    )}
                    <Button size="icon" variant="ghost" title="Excluir">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </div>
            <LogDetailsDialog logId={log.id} isOpen={isDetailsOpen} isOpenChange={setIsDetailsOpen} />
        </>
    );
}

export function DateGroup({
    dateKey,
    logs,
}: {
    dateKey: string;
    logs: StudyLogFeedItem[];
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const totalMinutes = logs.reduce(
        (sum, log) => sum + log.duration_minutes,
        0
    );
    const dateLabel = format(new Date(dateKey), "EEEE, dd 'de' MMMM", {
        locale: ptBR,
    });

    return (
        <div>
            <Card>
                <CardContent
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded((prev) => !prev)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                            <ChevronRight
                                size={18}
                                className={`${isExpanded ? "rotate-90" : "rotate-0"
                                    } transition-transform duration-300 ease-in-out`}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-foreground capitalize">
                                {dateLabel}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {logs.length} {logs.length === 1 ? "sessão" : "sessões"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatMinutes(totalMinutes)}
                    </div>
                </CardContent>
            </Card>

            {isExpanded && (
                <div className="mt-2 space-y-3">
                    {logs.map((log) => (
                        <LogCard key={log.id} log={log} />
                    ))}
                </div>
            )}
        </div>
    );
}

interface LogHistoryProps {
    range: DateRange;   
}

export function LogsHistory({ range }: LogHistoryProps) {
    const today = useMemo(() => new Date(), []);
    const initialStart = useMemo(
        () => startOfWeek(today, { weekStartsOn: 1 }),
        [today]
    );
    const [currentStart, setCurrentStart] = useState(initialStart);
    const isCurrentWeek = isSameWeek(today, currentStart, { weekStartsOn: 1 });
    const currentEnd = isCurrentWeek ? today : endOfWeek(currentStart, { weekStartsOn: 1 });

    const { data, status, error, isFetching } = useStudyLogsHistory(currentStart, currentEnd);

    const groupedLogs = useMemo(() => {
        const allLogs = data ?? [];
        return allLogs.reduce((acc, log) => {
            const dateKey = format(new Date(log.study_date), "yyyy-MM-dd");
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(log);
            return acc;
        }, {} as Record<string, StudyLogFeedItem[]>);
    }, [data]);

    const groupedEntries = Object.entries(groupedLogs);
    const weekLabel = `${format(currentStart, "dd MMM", {
        locale: ptBR,
    })} - ${format(currentEnd, "dd MMM", { locale: ptBR })}`;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                    Semana: <span className="font-medium text-foreground">{weekLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStart((prev) => subWeeks(prev, 1))}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStart((prev) => addWeeks(prev, 1))}
                        disabled={isCurrentWeek}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <ScrollArea className="h-[70vh] pr-2">
                {status === "error" && (
                    <div className="text-sm text-destructive">
                        {(error as Error).message}
                    </div>
                )}

                {isFetching && (
                    <div className="flex items-center justify-center py-3 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                )}

                {status === "success" && groupedEntries.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                        Nenhum registro encontrado.
                    </div>
                )}

                <div className="space-y-4">
                    {groupedEntries.map(([dateKey, logs]) => (
                        <DateGroup key={dateKey} dateKey={dateKey} logs={logs} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
} 