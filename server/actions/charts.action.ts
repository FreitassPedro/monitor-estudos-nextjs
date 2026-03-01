"use server";

import { AreaChartData } from "@/app/historico/components/charts/StudyAreaChart";
import { prisma } from "@/lib/prisma";
import { formatDateKey } from "@/lib/utils";


const userId = "8e4fba66-4d2e-4bb6-8200-c45db7a92f8e";

export type PieChartData = {
    name: string;
    value: number;
    sessions: number;
    color?: string;
}

export type PieChartResponse = {
    data: PieChartData[];
    totalMinutes: number;
    hasData: boolean;
}

export type HeatmapMonthResponse = {
    monthLabel: string;
    monthTotalMinutes: number;
    minutesByDate: Record<string, number>;
};

export async function getPieChartDataAction(startDate: Date, endDate: Date): Promise<PieChartResponse> {
    // Normalizar datas para evitar problemas de timezone
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    const aggregated = await prisma.studyLogs.groupBy({
        by: ['topicId'],
        where: {
            study_date: {
                gte: normalizedStart,
                lte: normalizedEnd,
            },
            topic: {
                subject: {
                    userId: userId,
                },
            },
        },
        _sum: {
            duration_minutes: true,
        },
        _count: true,
    });

    // Fetch subject info for each topic
    const topicIds = aggregated.map(agg => agg.topicId);
    const topics = await prisma.topic.findMany({
        where: { id: { in: topicIds } },
        include: { subject: true },
    });

    const topicMap = new Map(topics.map(t => [t.id, t]));

    const data = aggregated
        .map(agg => {
            const topic = topicMap.get(agg.topicId);
            const subject = topic?.subject;
            return {
                name: subject?.name || 'Desconhecido',
                value: agg._sum.duration_minutes || 0,
                sessions: agg._count,
                color: subject?.color || '#888888',
            };
        })
        .sort((a, b) => b.value - a.value);

    const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);
    const hasData = data.length > 0 && data.some(d => d.value > 0);

    return {
        data,
        totalMinutes,
        hasData,
    };
}


export async function getAreaChartACtion(startDate: Date, endDate: Date) {
    // Normalizar datas para evitar problemas de timezone
    // Quando comparamos com @db.Date, precisamos garantir que estamos comparando apenas a data
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    // Aggregate by study_date and topic with subject relationship
    const aggregated = await prisma.studyLogs.groupBy({
        by: ['study_date', 'topicId'],
        where: {
            study_date: {
                gte: normalizedStart,
                lte: normalizedEnd,
            },
            topic: {
                subject: {
                    userId: userId,
                },
            },
        },
        _sum: {
            duration_minutes: true,
        },
    });

    // Fetch necessary topic/subject info
    const topicIds = [...new Set(aggregated.map(agg => agg.topicId))];
    const topics = await prisma.topic.findMany({
        where: { id: { in: topicIds } },
        include: { subject: true },
    });

    const topicMap = new Map(topics.map(t => [t.id, t]));

    // Build chart structure grouped by date
    const chart: AreaChartData = {};

    aggregated.forEach(agg => {
        // formatDateKey agora usa UTC internamente, lidando corretamente com @db.Date
        const dateKey = formatDateKey(agg.study_date);
        const minutes = agg._sum.duration_minutes || 0;

        if (!chart[dateKey]) {
            chart[dateKey] = { totalMinutes: 0, materia: [] };
        }

        chart[dateKey].totalMinutes += minutes;

        const topic = topicMap.get(agg.topicId);
        const subject = topic?.subject;

        if (subject) {
            chart[dateKey].materia.push({
                name: subject.name,
                color: subject.color,
                minutes,
            });
        }
    });

    return chart;
}

export async function getHeatmapMonthDataAction(monthDate: Date): Promise<HeatmapMonthResponse> {
    const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0);
    const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const aggregated = await prisma.studyLogs.groupBy({
        by: ['study_date'],
        where: {
            study_date: {
                gte: startDate,
                lte: endDate,
            },
            topic: {
                subject: {
                    userId,
                },
            },
        },
        _sum: {
            duration_minutes: true,
        },
    });

    const minutesByDate: Record<string, number> = {};
    let monthTotalMinutes = 0;

    aggregated.forEach((agg) => {
        // formatDateKey agora usa UTC internamente, lidando corretamente com @db.Date
        const key = formatDateKey(agg.study_date);
        const minutes = agg._sum.duration_minutes || 0;
        minutesByDate[key] = minutes;
        monthTotalMinutes += minutes;
    });

    return {
        monthLabel: monthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        monthTotalMinutes,
        minutesByDate,
    };
}