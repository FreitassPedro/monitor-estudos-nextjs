"use client";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRecentLogsBySubjectAction, getRecentLogsByTopicAction } from "@/server/actions/studyLogs.action";
import useSessionFormStore from "@/store/useSessionFormStore";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight } from "lucide-react";
import React from "react";
import { parseDateAsLocal } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTopicsBySubject } from "@/hooks/useTopics";
import { Topic } from "@/types/types";

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
    const localDate = parseDateAsLocal(date);
    return (
        <Card className="p-3 space-y-2 bg-muted/50 border-none ">
            <div className="flex justify-between items-center">
                <div className="text-sm font-semibold text-foreground">
                    {name}
                </div>
                <div className="text-xs font-medium text-foreground">
                    <span>{localDate.toLocaleDateString('pt-BR')}</span>
                    -
                    <span className="text-muted-foreground">{daysAgo(localDate)}</span>
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
export const LogSection = ({ type }: { type: 'topic' | 'subject' }) => {

    const [isOpen, setIsOpen] = React.useState(true);
    const { selectedSubject, selectedTopic } = useSessionFormStore();

    const { data: topics = [] } = useTopicsBySubject(selectedSubject?.id);
    const [sidebarTopic, setSidebarTopic] = React.useState<Topic | null>(null);


    const recentLogs = useQuery({
        queryKey: ['studyLogs', type, 'recent', type === 'topic' ? sidebarTopic?.id : selectedSubject?.id],
        queryFn: () => {
            switch (type) {
                case 'topic':
                    return sidebarTopic?.id ? getRecentLogsByTopicAction(sidebarTopic.id) : Promise.resolve([]);

                case 'subject':
                    return selectedSubject?.id ? getRecentLogsBySubjectAction(selectedSubject.id) : Promise.resolve([]);

                default:
                    return Promise.resolve([]);
            }
        },
        enabled: type === 'subject' ? !!selectedSubject : !!sidebarTopic,
        staleTime: 1000 * 60 * 4, // 4 minuto
    });

    // Atualiza o tópico do sidebar quando o tópico selecionado na sessão mudar
    React.useEffect(() => {
        if (type !== 'topic') return;
        if (!selectedTopic) {
            setSidebarTopic(null);
            return;
        }

        setSidebarTopic(topics.find(topic => topic.id === selectedTopic.id) || null);
    }, [selectedTopic, topics, type]);
    if (type === 'topic' && !selectedTopic) {
        return null; // Não renderiza nada se for seção de tópico e nenhum tópico estiver selecionado
    }



    // Skeleton
    if (recentLogs.isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>Recentes: {type === "subject" ? selectedSubject?.name : ''}</span>
                </div>
                <Separator className="my-2" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-3 space-y-2 bg-muted/50 border-none ">
                        <div className="flex justify-between items-center">
                            <div className="h-4 bg-muted-foreground rounded w-1/3" />
                            <div className="h-3 bg-muted-foreground rounded w-1/4" />
                        </div>
                        <div className="h-3 bg-muted-foreground rounded w-full" />
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-3 transition-all duration-300 ease-in-out">

            <div className="flex flex-col items-center gap-2 text-sm font-semibold text-foreground">
                <div className="flex flex-row justify-between w-full items-center">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>Recentes: {type === "subject" ? selectedSubject?.name : ''}</span>
                    <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                        <ChevronRight
                            size={18}
                            onClick={() => setIsOpen(!isOpen)}
                            className={`${isOpen ? "rotate-90" : "rotate-0"
                                } transition-transform duration-300 ease-in-out`}

                        />
                    </div>
                </div>
                {type === 'topic' && (
                    <Select value={sidebarTopic?.id} defaultValue={sidebarTopic?.id} onValueChange={(value) => {
                        const selected = topics.find(t => t.id === value);
                        setSidebarTopic(selected || null);
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {topics?.map(topic => (
                                    <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>

                    </Select>
                )}
            </div>
            <Separator className="my-2" />

            {recentLogs.data && recentLogs.data.length > 0 ? (
                <LogsList
                    logs={recentLogs.data.map(log => ({
                        id: log.id,
                        name: log.topic.name,
                        date: log.study_date,
                        notes: log.notes ?? undefined,
                    }))}
                />
            ) : (
                <EmptyLog />
            )}
        </div>
    )
}
