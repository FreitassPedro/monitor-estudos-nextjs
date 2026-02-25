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
import { Subject, Topic } from "@/types/types";

interface Props {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    subject: Subject;
    onTopicCreated: (topic: Topic) => void;
}

export function NewTopicDialog({ isOpen, onOpenChange, subject, onTopicCreated }: Props) {
    const [name, setName] = useState("");
    const createTopic = useCreateTopic();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            const topic = await createTopic.mutateAsync({ name: name.trim(), subjectId: subject.id });
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
