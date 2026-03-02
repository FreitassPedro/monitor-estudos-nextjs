"use server";

import { prisma } from "@/lib/prisma";
import { Topic } from "@/types/types";

const userId = "8e4fba66-4d2e-4bb6-8200-c45db7a92f8e";
export async function getTopicsAction(userId?: string): Promise<Topic[]> {
    await new Promise(resolve => setTimeout(resolve, 20)); // Simula delay
    const topics = prisma.topic.findMany({
        where: {
            subject: {
                userId: userId || userId // Use default userId if not provided
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

export async function deleteTopicAction(topicId: string): Promise<void> {
    // Verifica se existem StudyLogs vinculadas ao tópico
    const studyLogsCount = await prisma.studyLogs.count({
        where: { topicId },
    });

    if (studyLogsCount > 0) {
        throw new Error(
            `Não é possível excluir este tópico pois existem ${studyLogsCount} registro(s) de estudo vinculado(s). Delete os registros primeiro.`
        );
    }

    await prisma.topic.delete({
        where: { id: topicId },
    });
}

export async function updateTopicAction(topicId: string, name: string): Promise<Topic> {
    const updatedTopic = await prisma.topic.update({
        where: { id: topicId },
        data: { name },
    });
    return updatedTopic;
}