import { prisma } from "@/lib/prisma";
import { Topic } from "@/types/types";

export async function getTopics(): Promise<Topic[]> {
    await new Promise(resolve => setTimeout(resolve, 20)); // Simula delay
    const topics = prisma.topic.findMany();
    return topics;
}