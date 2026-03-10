"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjectsWithTopics } from "@/hooks/useSubjects";
import { SubjectCard } from "./components/SubjectCard";

export default function SubjectList() {
    const { data: subjects = [] } = useSubjectsWithTopics();

    if (!subjects || subjects.length === 0) {
        return (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Matérias Cadastradas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        Nenhuma matéria cadastrada
                    </p>
                </CardContent>
            </Card>
        );
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
