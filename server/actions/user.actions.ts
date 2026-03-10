"use server";

import { prisma } from "@/lib/prisma";

export async function getUsersAction() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: {
            name: 'asc',
        },
    });
    return users;
}

export async function getUserByIdAction(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            studyGoal: true,
        },
    });
    return user;
}

export async function updateStudyGoalAction(userId: string, studyGoal: string) {
    const trimmed = studyGoal.trim().slice(0, 500);
    return prisma.user.update({
        where: { id: userId },
        data: { studyGoal: trimmed },
        select: {
            id: true,
            name: true,
            email: true,
            studyGoal: true,
        },
    });
}

export type ProfileStats = {
    totalMinutes: number;
    totalSessions: number;
    totalDays: number;
    avgSessionMinutes: number;
    longestSession: number;
    currentStreak: number;
    topSubject: {
        id: string;
        name: string;
        color: string;
        totalMinutes: number;
    } | null;
    studiedToday: boolean;
    subjectsCount: number;
};

export async function getProfileStatsAction(userId: string): Promise<ProfileStats> {
    type BasicStats = {
        totalMinutes: bigint | null;
        totalSessions: bigint;
        longestSession: number | null;
        totalDays: bigint;
    };

    const basicStatsResult = await prisma.$queryRaw<BasicStats[]>`
        SELECT
            COALESCE(SUM(sl."duration_minutes"), 0) AS "totalMinutes",
            COUNT(sl.id) AS "totalSessions",
            MAX(sl."duration_minutes") AS "longestSession",
            COUNT(DISTINCT sl."study_date") AS "totalDays"
        FROM "StudyLogs" sl
        INNER JOIN "Topic" t ON t.id = sl."topicId"
        INNER JOIN "Subject" s ON s.id = t."subjectId"
        WHERE s."userId" = ${userId}
    `;

    const basicStats = basicStatsResult[0];
    const totalMinutes = Number(basicStats?.totalMinutes ?? 0);
    const totalSessions = Number(basicStats?.totalSessions ?? 0);
    const longestSession = basicStats?.longestSession ?? 0;
    const totalDays = Number(basicStats?.totalDays ?? 0);
    const avgSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    type TopSubjectResult = {
        id: string;
        name: string;
        color: string;
        totalMinutes: bigint;
    };

    const topSubjectResult = await prisma.$queryRaw<TopSubjectResult[]>`
        SELECT
            s.id,
            s.name,
            s.color,
            SUM(sl."duration_minutes") AS "totalMinutes"
        FROM "Subject" s
        INNER JOIN "Topic" t ON t."subjectId" = s.id
        INNER JOIN "StudyLogs" sl ON sl."topicId" = t.id
        WHERE s."userId" = ${userId}
        GROUP BY s.id, s.name, s.color
        ORDER BY "totalMinutes" DESC
        LIMIT 1
    `;

    const topSubjectData = topSubjectResult[0];
    const topSubject = topSubjectData
        ? {
              id: topSubjectData.id,
              name: topSubjectData.name,
              color: topSubjectData.color,
              totalMinutes: Number(topSubjectData.totalMinutes),
          }
        : null;

    // Study streak: count consecutive days ending today (or yesterday)
    type StudyDateResult = { study_date: Date };
    const studyDates = await prisma.$queryRaw<StudyDateResult[]>`
        SELECT DISTINCT sl."study_date"
        FROM "StudyLogs" sl
        INNER JOIN "Topic" t ON t.id = sl."topicId"
        INNER JOIN "Subject" s ON s.id = t."subjectId"
        WHERE s."userId" = ${userId}
        ORDER BY sl."study_date" DESC
    `;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const studyDateSet = new Set(
        studyDates.map((d) => {
            const dt = new Date(d.study_date);
            dt.setHours(0, 0, 0, 0);
            return dt.toISOString().slice(0, 10);
        })
    );

    const studiedToday = studyDateSet.has(today.toISOString().slice(0, 10));

    let streak = 0;
    const streakStart = studiedToday ? today : yesterday;
    const cursor = new Date(streakStart);
    while (studyDateSet.has(cursor.toISOString().slice(0, 10))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    const subjectsCount = await prisma.subject.count({
        where: { userId },
    });

    return {
        totalMinutes,
        totalSessions,
        totalDays,
        avgSessionMinutes,
        longestSession,
        currentStreak: streak,
        topSubject,
        studiedToday,
        subjectsCount,
    };
}
