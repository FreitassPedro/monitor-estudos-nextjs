"use client";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRecentLogsBySubjectAction, getRecentLogsByTopicAction } from "@/server/actions/studyLogs.action";
import useSessionFormStore from "@/store/useSessionFormStore";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronDown } from "lucide-react";
import React from "react";

const diffInDays = (date1: Date, date2: Date) => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


const daysAgo = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = diffInDays(today, date);
    if (diff === 0) return "Hoje";
    if (diff === 1) return "Ontem";
    return `${diff} dias atrás`;
}

export const LogCard = ({ name, date, notes }: { name: string; date: Date | string; notes?: string }) => {
    return (
        <Card className="p-3 space-y-2 bg-muted/50 border-none ">
            <div className="flex justify-between items-center">
                <div className="text-sm font-semibold text-foreground">
                    {name}
                </div>
                <div className="text-xs font-medium text-foreground">
                    <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
                    -
                    <span className="text-muted-foreground">{daysAgo(new Date(date))}</span>
                </div>
            </div>
            {notes && <div className="text-xs text-muted-foreground whitespace-pre-line">{notes}</div>}
        </Card>
    )
};

export const EmptyLog = () => {
    return (
        <div className="p-3 space-y-2 border-none bg-muted/5 text-center">
            <div className="text-xs text-muted-foreground">Comece uma nova sessão para visualizar aqui</div>
        </div>
    )
}
interface LogsListProps {
    logs: Array<{ id: string; name: string; date: Date; notes?: string }>;
}
export const LogsList = ({ logs }: LogsListProps) => {
    return (
        <div className="space-y-3">
            {logs.map((log) => (
                <LogCard
                    key={log.id}
                    name={log.name}
                    date={log.date}
                    notes={log.notes}
                />
            ))}
        </div>
    )
}
export const LogSection = ({ type, title }: { type: 'topic' | 'subject', title: string; }) => {

    const [isOpen, setIsOpen] = React.useState(true);
    const { selectedSubject, selectedTopic } = useSessionFormStore();

    const recentLogs = useQuery({
        queryKey: ['study_logs', type, 'recent', type === 'topic' ? selectedTopic?.id : selectedSubject?.id],
        queryFn: () => type === 'topic' ? getRecentLogsByTopicAction(selectedTopic!.id) : getRecentLogsBySubjectAction(selectedSubject!.id),
        enabled: (type === 'topic' && !!selectedTopic) || (type === 'subject' && !!selectedSubject),
        staleTime: 1000 * 60 * 4, // 4 minuto
    });


    if (!recentLogs.data || recentLogs.data.length === 0) {
        return (
            <div className="space-y-3 transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>Recentes de: {title}</span>
                    <span>NÃO CARREGOU</span>
                </div>
                <Separator className="my-2" />
                <EmptyLog />
            </div>
        )
    }

    if (recentLogs.isLoading) {
        return (
            <div className="space-y-3 transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>Recentes de: {title}</span>
                    <span>CARREGANDO...</span>
                </div>
                <Separator className="my-2" />
                <EmptyLog />
            </div>
        )
    }

    return (
        <div className="space-y-3 transition-all duration-300 ease-in-out">

            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span>{title}</span> aa
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform bg-background ${isOpen ? '' : '-rotate-90'}`}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ cursor: 'pointer' }}
                />
            </div>
            <Separator className="my-2" />
            {isOpen ? (
                <LogsList logs={recentLogs.data.map(log => ({
                    id: log.id,
                    name: log.topic.name,
                    date: log.study_date,
                    notes: log.notes ?? undefined,
                }))} />
            ) : (<EmptyLog />)}
        </div>
    )
}
