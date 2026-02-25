"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTopic } from "@/hooks/useTopics";
import { Topic } from "@/types/types";
import {  useSubjectsMap } from "@/hooks/useSubjects";

interface Props {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    subjectId: string;
    onTopicCreated: (topic: Topic) => void;
}

export function NewTopicDialog({ isOpen, onOpenChange, subjectId, onTopicCreated }: Props) {
    const [name, setName] = useState("");
    const createTopic = useCreateTopic();

    const { data: subjects } = useSubjectsMap();
    const subject = subjects?.[subjectId];

    if (!subject) return null;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            const topic = await createTopic.mutateAsync({ name: name.trim(), subjectId: subject!.id });
            toast.success(`Tópico "${topic.name}" criado!`);
            onTopicCreated(topic);
            setName("");
            onOpenChange(false);
        } catch {
            toast.error("Erro ao criar tópico.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo tópico em &quot;{subject.name}&quot;</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="topic-name">Nome do tópico</Label>
                        <Input
                            id="topic-name"
                            placeholder="Ex: Equações diferenciais"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createTopic.isPending || !name.trim()}>
                            {createTopic.isPending ? "Criando..." : "Criar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
