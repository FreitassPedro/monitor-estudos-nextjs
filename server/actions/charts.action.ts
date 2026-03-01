"use server";

import { prisma } from "@/lib/prisma";


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

export async function getPieChartDataAction(startDate: Date, endDate: Date): Promise<PieChartResponse> {
    const logs = await prisma.studyLogs.findMany({
        where: {
            study_date: {
                gte: startDate,
                lte: endDate,
            },
            topic: {
                subject: {
                    userId: userId,
                },
            },

        },
        include: {
            topic: {
                include: {
                    subject: true,
                },
            },
        },
    });

    const grouped: Record<string, PieChartData> = {};

    logs.forEach(log => {
        const subject = log.topic.subject;
        const name = subject?.name || 'Desconecido';

        if (!grouped[name]) grouped[name] = { name, value: 0, sessions: 0, color: subject?.color || '#888888' };

        grouped[name].value += log.duration_minutes;
        grouped[name].sessions += 1;
    });

    const dataArray = Object.values(grouped);
    const sorted = dataArray.sort((a, b) => b.value - a.value);
    const totalMinutes = sorted.reduce((sum, item) => sum + item.value, 0);
    const hasData = sorted.length > 0 && sorted.some(d => d.value > 0);

    return {
        data: sorted,
        totalMinutes,
        hasData
    };
}


export async function getAreaChartACtion(startDate: Date, endDate: Date) {

    const logs = await prisma.studyLogs.findMany({
        where: {
            study_date: {
                gte: startDate,
                lte: endDate,
            },
            topic: {
                subject: {
                    userId: userId,
                },
            },
        },
        include: {
            topic: {
                include: {
                    subject: true,
                },
            },
        },
    });


    const chart: Record<string, {
        totalMinutes: number;
        materia: { minutes: number; name: string; color?: string, }[]
    }> = {};

    const materiasAux: Record<string, { name: string; color?: string, minutes: number }> = {};

    logs.forEach(log => {
        const logDate = log.study_date.toDateString();
        if (!chart[logDate]) {
            chart[logDate] = { totalMinutes: 0, materia: [] };
        }

        chart[logDate].totalMinutes += log.duration_minutes;
        const subject = log.topic.subject;

        if (!materiasAux[subject.id]) {
            materiasAux[subject.id] = {
                name: subject.name,
                color: subject.color,
                minutes: log.duration_minutes,
            };
        } else {
            materiasAux[subject.id].minutes += log.duration_minutes;
        }

    });

    // Agora preenchemos o array de matérias para cada dia
    Object.keys(chart).forEach(date => {
        chart[date].materia = Object.values(materiasAux);
    });

    return chart;
}