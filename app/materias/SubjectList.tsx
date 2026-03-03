import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjectsAction, getSubjectsWithTopicsAction } from "@/server/actions/subject.actions";
import { SubjectCard } from "./components/SubjectCard";

const userId = "440d0b38-58e0-4a56-9f37-96932cfbe3e1"

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
