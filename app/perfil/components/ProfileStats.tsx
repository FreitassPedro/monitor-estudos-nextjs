"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfileStatsAction } from "@/server/actions/user.actions";
import { Card, CardContent } from "@/components/ui/card";
import {
    BookOpen,
    Clock,
    CalendarDays,
    Flame,
    Timer,
    TrendingUp,
    Trophy,
    Layers,
} from "lucide-react";

const formatDuration = (minutes: number) => {
    if (minutes === 0) return "0min";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    subtitle?: string;
    dotColor?: string;
}

function StatCard({ label, value, icon: Icon, color, bg, subtitle, dotColor }: StatCardProps) {
    return (
        <Card>
            <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-md ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                </div>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
                {subtitle && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        {dotColor && (
                            <span
                                className="w-2 h-2 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: dotColor }}
                            />
                        )}
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function SkeletonStatCard() {
    return (
        <Card>
            <CardContent className="pt-4 pb-4 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-muted rounded-md" />
                    <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="h-7 w-24 bg-muted rounded" />
            </CardContent>
        </Card>
    );
}

export function ProfileStats() {
    const userId = useAuthStore((state) => state.user?.id);

    const { data: stats, isLoading } = useQuery({
        queryKey: ["profile", "stats", userId],
        queryFn: () => getProfileStatsAction(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const cards: StatCardProps[] = [
        {
            label: "Horas Estudadas",
            value: formatDuration(stats.totalMinutes),
            icon: Clock,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        },
        {
            label: "Sessões Totais",
            value: stats.totalSessions.toString(),
            icon: BookOpen,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
        },
        {
            label: "Dias Estudados",
            value: stats.totalDays.toString(),
            icon: CalendarDays,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Sequência Atual",
            value: `${stats.currentStreak} dia${stats.currentStreak !== 1 ? "s" : ""}`,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            label: "Média por Sessão",
            value: formatDuration(stats.avgSessionMinutes),
            icon: Timer,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            label: "Sessão mais Longa",
            value: formatDuration(stats.longestSession),
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Matéria Favorita",
            value: stats.topSubject?.name ?? "—",
            subtitle: stats.topSubject ? formatDuration(stats.topSubject.totalMinutes) : undefined,
            dotColor: stats.topSubject?.color,
            icon: Trophy,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
        },
        {
            label: "Matérias",
            value: stats.subjectsCount.toString(),
            icon: Layers,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {cards.map((card) => (
                <StatCard key={card.label} {...card} />
            ))}
        </div>
    );
}
