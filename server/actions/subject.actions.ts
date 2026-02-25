"use server";

import { Subject } from "@/types/types";
import { prisma } from "@/lib/prisma";

/**
 * Actions garante que os dados do banco não quebrem a UI
 ***/
export async function getSubjectsAction(): Promise<Subject[]> {
    const subjects = await prisma.subject.findMany();
    return subjects;
}

export async function getSubjectsWithTopicsAction() {
    await new Promise(resolve => setTimeout(resolve, 100));
    const subject = await prisma.subject.findMany({
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

