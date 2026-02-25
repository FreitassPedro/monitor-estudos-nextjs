"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Settings, Trash2 } from "lucide-react";

interface Subject {
    id: string;
    name: string;
    color: string;
    topics: Topic[];
}

interface Topic {
    id: string;
    name: string;
}

interface SubjectCardProps {
    subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {

    const handleDelete = async () => {
        // Implementation for delete would go here as a Server Action
        console.log("Delete", subject.id);
    };

    return (
        <Card className="">
            <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                    />
                    <span className="font-medium text-foreground">{subject.name}</span>
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Adicionar tópico"
                    >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        title="Excluir matéria"
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                    >
                        <Settings className="h-4 w-4 " />
                    </Button>
                </div>
            </CardContent>
            {subject.topics.length > 0 && (
                <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {subject.topics.map((topic) => (
                        <span
                            key={topic.id}
                            className="text-xs bg-muted px-2 py-1 rounded"
                        >
                            {topic.name}
                        </span>
                    ))}
                </div>
            )}
        </Card>
    );
}
