"use client";

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
import { MOCK_PROFILE_STATS } from "../mockData";

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
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium truncate pr-1">{label}</p>
                    <div className={`p-1.5 rounded-md ${bg} shrink-0`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                </div>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
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

export function ProfileStats() {
    const stats = MOCK_PROFILE_STATS;

    const cards: StatCardProps[] = [
        {
            label: "Horas Estudadas",
            value: formatDuration(stats.totalMinutes),
            icon: Clock,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        },
        {
            label: "Sessões",
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
            value: `${stats.currentStreak} dias`,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            label: "Média / Sessão",
            value: formatDuration(stats.avgSessionMinutes),
            icon: Timer,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            label: "Recorde",
            value: formatDuration(stats.longestSessionMinutes),
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Matéria Favorita",
            value: stats.topSubject.name,
            subtitle: formatDuration(stats.topSubject.totalMinutes),
            dotColor: stats.topSubject.color,
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map((card) => (
                <StatCard key={card.label} {...card} />
            ))}
        </div>
    );
}

