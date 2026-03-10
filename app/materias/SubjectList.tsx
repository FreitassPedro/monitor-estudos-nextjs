"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjectsWithTopics } from "@/hooks/useSubjects";
import { SubjectCard } from "./components/SubjectCard";

export const SubjectsSkeleton = () => {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Matérias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-200 rounded" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function SubjectList() {
    const { data: subjects = [], isLoading } = useSubjectsWithTopics();

    if (isLoading) {
        return <SubjectsSkeleton />;
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Matérias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {subjects.map((subject) => (
                        <SubjectCard
                            key={subject.id}
                            subject={subject}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
