"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { getSubjectsWithTopicsAction } from "@/server/actions/subject.actions";
import { SubjectCard } from "./components/SubjectCard";

export default function SubjectList() {
    const userId = useAuthStore((state) => state.user?.id);
    const { data: subjects = [] } = useQuery({
        queryKey: ["subjects", "with-topics", userId],
        queryFn: () => getSubjectsWithTopicsAction(userId!),
        enabled: !!userId,
    });

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
