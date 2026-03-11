"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Target, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

const MOCK_STUDY_GOAL =
    "Passar no concurso do CEBRASPE 2025 para Analista Judiciário e garantir uma boa classificação no ENEM para medicina.";

export function StudyGoalCard() {
    const [goal, setGoal] = useState(MOCK_STUDY_GOAL);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");

    const startEditing = () => {
        setDraft(goal);
        setEditing(true);
    };

    const cancelEditing = () => setEditing(false);

    const save = () => {
        setGoal(draft.trim() || goal);
        setEditing(false);
        toast.success("Objetivo atualizado!");
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-green-500/10">
                            <Target className="h-4 w-4 text-green-500" />
                        </div>
                        <CardTitle className="text-base">Meu Objetivo</CardTitle>
                    </div>
                    {!editing && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEditing}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {editing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value.slice(0, 500))}
                            placeholder="Ex: Passar no concurso X, aprender programação..."
                            rows={3}
                            className="resize-none text-sm"
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground text-right">{draft.length}/500</p>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={save} className="gap-1.5">
                                <Check className="h-3.5 w-3.5" />
                                Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing} className="gap-1.5">
                                <X className="h-3.5 w-3.5" />
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-foreground leading-relaxed">{goal}</p>
                )}
            </CardContent>
        </Card>
    );
}

