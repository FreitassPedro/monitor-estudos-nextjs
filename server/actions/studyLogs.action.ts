"use server";

import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

const include = {
    topic: {
        include: {
            subject: true,
        },
    },
} as const;


export async function getStudyLogsFeedAction({
    cursor,
    userId,
    fromDate,
}: {
    cursor?: string;
    userId: string;
    fromDate?: Date | string;
}) {
    const limit = 10;

    // Normalizar data para evitar problemas de timezone ao comparar com @db.Date
    const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
    if (parsedFromDate) {
        parsedFromDate.setHours(0, 0, 0, 0);
    }

    const baseWhere = {
        topic: {
            subject: {
                userId: userId,
            },
        },
    } as const;

    const where = {
        ...(parsedFromDate
            ? {
                study_date: {
                    gte: parsedFromDate,
                },
            }
            : {}),
        ...baseWhere,
    } as const;

    let logs = await prisma.studyLogs.findMany({
        take: limit + 1, // Buscar um a mais para verificar se há mais páginas
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        where,
        orderBy: [
            { study_date: "desc" },
            { start_time: "desc" },
            { id: "desc" },
        ],
        include,
    });

    if (!cursor && parsedFromDate && logs.length === 0) {
        logs = await prisma.studyLogs.findMany({
            take: limit + 1,
            orderBy: [
                { study_date: "desc" },
                { start_time: "desc" },
                { id: "desc" },
            ],
            where: baseWhere,
            include,
        });
    }

    let nextCursor: string | undefined = undefined;

    if (logs.length > limit) {
        const nextItem = logs.pop(); // Remove o item extra
        nextCursor = nextItem?.id; // Define o cursor para a próxima página
    }

    return { logs, nextCursor };
}

export async function getStudyLogsByDateAction({
    startDate,
    endDate,
    userId,
}: {
    startDate: Date;
    endDate: Date;
    userId: string;
}) {
    // Normalizar datas para evitar problemas de timezone ao comparar com @db.Date
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    return prisma.studyLogs.findMany({
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
        include,
    });
}

export async function getStudyLogDetailsAction(logId: string) {
    return prisma.studyLogs.findUnique({
        where: {
            id: logId,
        },
        include:
        {
            topic: {
                include: {
                    subject: true,
                },
            },
        }
    });
}


export async function getStudyLogsByDateRangeAction(startDate: Date, endDate: Date) {
    // Normalizar datas para evitar problemas de timezone ao comparar com @db.Date
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    return prisma.studyLogs.findMany({
        where: {
            study_date: {
                gte: normalizedStart,
                lte: normalizedEnd,
            },
        },
        include,
    });
}
export interface StudyLogInput {
    topic_id: string;
    study_date: Date;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    notes?: string;
}

export async function createStudyLogAction(data: StudyLogInput) {
    return prisma.studyLogs.create({
        data: {
            topicId: data.topic_id,
            study_date: data.study_date,
            start_time: data.start_time,
            end_time: data.end_time,
            duration_minutes: data.duration_minutes,
            notes: data.notes,
        },
        include,
    });
}

export async function getTodayStudyLogsAction(userId: string) {
    "use server";
    // 1. Dizemos ao Next.js: "Aguarde a requisição chegar. Isso não é estático."
    await connection();
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return prisma.studyLogs.findMany({
        where: {
            study_date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            topic: {
                subject: {
                    userId: userId,
                },
            },
        },
        include,
    });
}

export async function getRecentLogsByTopicAction(topicId: string) {
    return prisma.studyLogs.findMany({
        where: {
            topicId: topicId,
        },
        include: {
            topic: {
                select: {
                    name: true,
                }
            }
        },
        orderBy: {
            study_date: 'desc',
        },
        take: 3,
    });
}

export async function getRecentLogsBySubjectAction(subjectId: string) {
    return prisma.studyLogs.findMany({
        where: {
            topic: {
                subjectId: subjectId,
            },
        },
        include: {
            topic: {
                select: {
                    name: true,
                }
            }
        },
        orderBy: {
            study_date: 'desc',
        },
        take: 3,
    });
}