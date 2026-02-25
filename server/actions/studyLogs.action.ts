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

export async function getTodayStudyLogsAction(userId: string) {
    "use cache";
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
    