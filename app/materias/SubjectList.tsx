import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjectsAction, getSubjectsWithTopicsAction } from "@/server/actions/subject.actions";
import { SubjectCard } from "./components/SubjectCard";

const userId = "8e4fba66-4d2e-4bb6-8200-c45db7a92f8e"

export default async function SubjectList() {
    const subjects = await getSubjectsWithTopicsAction();

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
