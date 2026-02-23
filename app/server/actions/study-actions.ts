"use server";

import { Subject, Topic, StudyLog } from "@/app/features/study/types";
import { prisma } from "@/lib/prisma";

import { findSubjects } from "@/lib/db";

export async function getSubjects(): Promise<Subject[]> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    const subjects = await findSubjects();
    return subjects;
}

export async function getTopics(): Promise<Topic[]> {
    return prisma.topic.findMany();
}

export async function getLogsByDate(startDate: Date, endDate: Date): Promise<StudyLog[]> {
    return prisma.topicLog.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        }
    });
}