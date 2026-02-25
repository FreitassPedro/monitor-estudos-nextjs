"use server";

import { prisma } from "@/lib/prisma";

const include = {
    topic: {
        include: {
            subject: true,
        },
    },
} as const;

export async function getStudyLogsByDateAction({
    startDate,
    endDate,
    userId,
}: {
    startDate: Date;
    endDate: Date;
    userId: string;
}) {
    return prisma.studyLogs.findMany({
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
    // "use cache"; Não é possivel usar cache em client actions, e como essa função é usada em um componente server, ela não precisa ser cacheada. O React Query irá cuidar do cache no cliente.
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
    