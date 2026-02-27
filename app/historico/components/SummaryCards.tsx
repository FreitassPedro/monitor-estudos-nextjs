import { useStudyLogsHistory } from "@/hooks/useStudyLogs";
import { DateRange } from "./HistoryDateNav";
import { useMemo } from "react";
import { BookOpen, Clock, Icon, Timer, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSubjectsMap } from "@/hooks/useSubjects";
import { useTopicsBySubject, useTopicsMap } from "@/hooks/useTopics";


const formatDuration = (minutes: number) => {
    if (minutes === 0) return '0min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

interface CardInfo {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    subtitle?: string;
    dotColor?: string;
}
export const SummaryCard = ({ card }: { card: CardInfo }) => {
    const Icon = card.icon;

    return (
        <Card key={card.label} >
            <CardContent>
                <div className="flex items-center gap-2 ">
                    <div className={`p-1.5 rounded-md ${card.bg}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
                    {card.subtitle && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            {card.dotColor && (
                                <span
                                    className="w-2 h-2 rounded-full inline-block"
                                    style={{ backgroundColor: card.dotColor }}
                                />
                            )}
                            {card.subtitle}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface SummaryCardProps {
    range: DateRange;
}
export function SummaryCards({ range }: SummaryCardProps) {

    const { data, status, error, isLoading } = useStudyLogsHistory(range.startDate, range.endDate);

    const { data: subjectsMap } = useSubjectsMap();
    const { data: topicsMap } = useTopicsMap();

    const stats = useMemo(() => {
        const logs = data ?? [];
        if (logs.length === 0) {
            return { totalMinutes: 0, totalSessions: 0, avgSession: 0, longestSession: 0, topSubject: null, topSubjectMinutes: 0 };
        }

        let totalMinutes = 0;
        let longestSession = 0;

        const subjectMinutes: Record<string, number> = {};

        logs.forEach(log => {
            totalMinutes += log.duration_minutes;

            if (log.duration_minutes > longestSession) {
                longestSession = log.duration_minutes;
            }

            const topic = topicsMap?.[log.topicId];

            if (topic) {
                const subjectId = topic.subjectId;
                subjectMinutes[subjectId] = (subjectMinutes[subjectId] || 0) + log.duration_minutes;
            }
        });


        const totalSessions = logs.length;
        const avgSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;


        let topSubjectId: string | null = null;
        let topSubjectMinutes = 0;
        Object.entries(subjectMinutes).forEach(([id, mins]) => {
            if (mins > topSubjectMinutes) {
                topSubjectId = id;
                topSubjectMinutes = mins;
            }
        });

        const topSubject = topSubjectId && subjectsMap ? subjectsMap?.[topSubjectId] : null;

        return { totalMinutes, totalSessions, avgSession, longestSession, topSubject, topSubjectMinutes };
    }, [data, subjectsMap, topicsMap]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Renderiza 5 cartões falsos piscando */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="animate-pulse">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-muted rounded-md" />
                                <div className="h-3 w-16 bg-muted rounded" />
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="h-6 w-20 bg-muted rounded" />
                                <div className="h-3 w-24 bg-muted/50 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const cards = [
        {
            label: 'Tempo Total',
            value: formatDuration(stats.totalMinutes),
            icon: Clock,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10',
        },
        {
            label: 'Sessões',
            value: stats.totalSessions.toString(),
            icon: BookOpen,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
        },
        {
            label: 'Média / Sessão',
            value: formatDuration(stats.avgSession),
            icon: Timer,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
        },
        {
            label: 'Sessão mais Longa',
            value: formatDuration(stats.longestSession),
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Matéria Destaque',
            value: stats.topSubject?.name || '—',
            subtitle: stats.topSubject ? formatDuration(stats.topSubjectMinutes) : undefined,
            icon: Trophy,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            dotColor: stats.topSubject?.color,
        },
    ];

    if (error) {
        return (
            <div className="text-red-500">
                Erro ao carregar os dados: {(error as Error).message}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cards.map((card) =>
                <SummaryCard key={card.label} card={card} />
            )}
        </div>
    );
}
