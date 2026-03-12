"use server";


import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Topic } from "@/types/types";

export async function getTopicsAction(userId: string): Promise<Topic[]> {
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
    try {
        return await prisma.topic.create({
            data: {
                name,
                subjectId,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error(`Erro ao criar tópico: ${name} já existe nesta matéria.`);
        }
        throw new Error("Erro desconhecido ao criar tópico");
    }
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

    try {
        return await prisma.topic.update({
            where: { id: topicId },
            data: { name },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new Error(`Erro ao atualizar tópico: ${name} já existe nesta matéria.`);
            }

            if (error.code === 'P2025') {
                throw new Error(`Erro ao atualizar tópico: tópico com id ${topicId} não encontrado.`);
            }
        }
        throw new Error("Erro desconhecido ao atualizar tópico");
    }
}