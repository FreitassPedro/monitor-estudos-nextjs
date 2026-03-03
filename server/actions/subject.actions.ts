"use server";

import { Subject } from "@/types/types";
import { prisma } from "@/lib/prisma";

/**
 * Actions garante que os dados do banco não quebrem a UI
 ***/
export async function createSubjectAction(data: { name: string; color: string; userId: string }) {
    const subject = await prisma.subject.create({
        data: {
            name: data.name,
            color: data.color,
            userId: data.userId,
        },
    });
    return subject;
}

export async function updateSubjectAction(data: { id: string; name: string; color: string; userId: string }) {
    const updateResult = await prisma.subject.updateMany({
        where: {
            id: data.id,
            userId: data.userId,
        },
        data: {
            name: data.name,
            color: data.color,
        },
    });

    if (updateResult.count === 0) {
        throw new Error("Matéria não encontrada para atualização");
    }

    const updatedSubject = await prisma.subject.findUnique({
        where: { id: data.id },
    });

    if (!updatedSubject) {
        throw new Error("Matéria não encontrada após atualização");
    }

    return updatedSubject;
}


export async function deleteSubjectAction(id: string) {
    await prisma.subject.delete({
        where: { id },
    });
}

export async function getSubjectsAction(userId: string): Promise<Subject[]> {
    const subjects = await prisma.subject.findMany({
        where: { userId }
    });
    return subjects;
}

export async function getSubjectsWithTopicsAction(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const subject = await prisma.subject.findMany({
        where: { userId },
        include: {
            topics: {
                include: {
                    studyLogs: false, // Evita carregar os studyLogs
                },
            },
        },
    });
    return subject;
}

