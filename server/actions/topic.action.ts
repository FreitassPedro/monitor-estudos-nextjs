"use server";

import { prisma } from "@/lib/prisma";
import { Topic } from "@/types/types";

export async function getTopics(userId: string): Promise<Topic[]> {
    await new Promise(resolve => setTimeout(resolve, 20)); // Simula delay
    const topics = prisma.topic.findMany({
        where: {
            subject: {
                userId: userId
            }
        }
    });
    return topics;
}


export async function getTopicsBySubjectAction(subjectId: string): Promise<Topic[]> {
    return prisma.topic.findMany({
        where: { subjectId },
    });
}

export async function createTopic(name: string, subjectId: string): Promise<Topic> {
    const newTopic = await prisma.topic.create({
        data: {
            name,
            subjectId,
        },
    });
    return newTopic;
}