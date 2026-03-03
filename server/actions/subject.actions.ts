"use server";

import { Subject } from "@/types/types";
import { prisma } from "@/lib/prisma";

// Id MOCK! não remova ainda. Vamos usar isso para testar a UI e depois integrar com autenticação real.
const userId = "440d0b38-58e0-4a56-9f37-96932cfbe3e1"

/**
 * Actions garante que os dados do banco não quebrem a UI
 ***/
export async function createSubjectAction(data: { name: string; color: string }) {
    const subject = await prisma.subject.create({
        data: {
            ...data,
            userId: userId,
        },
    });
    return subject;
}

export async function deleteSubjectAction(id: string) {
    await prisma.subject.delete({
        where: { id },
    });
}

export async function getSubjectsAction(): Promise<Subject[]> {
    const subjects = await prisma.subject.findMany({
        where: { userId }
    });
    return subjects;
}

export async function getSubjectsWithTopicsAction() {
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

