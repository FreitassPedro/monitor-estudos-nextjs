import { Subject } from "@/app/features/study/types";

export function indexSubjectById(subhects: Subject[]): Record<string, Subject> {
    return subhects.reduce((acc, subject) => {
        acc[subject.id] = subject;
        return acc;
    }, {} as Record<string, Subject>);
}