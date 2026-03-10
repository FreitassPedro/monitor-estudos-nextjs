"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserByIdAction, updateStudyGoalAction } from "@/server/actions/user.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Target, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export function StudyGoalCard() {
    const userId = useAuthStore((state) => state.user?.id);
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");

    const { data: userData, isLoading } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => getUserByIdAction(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10,
    });

    const mutation = useMutation({
        mutationFn: (goal: string) => updateStudyGoalAction(userId!, goal),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", userId] });
            setEditing(false);
            toast.success("Objetivo atualizado!");
        },
        onError: () => {
            toast.error("Erro ao salvar objetivo.");
        },
    });

    const startEditing = () => {
        setDraft(userData?.studyGoal ?? "");
        setEditing(true);
    };

    const cancelEditing = () => setEditing(false);

    const save = () => {
        mutation.mutate(draft.trim());
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-green-500/10">
                            <Target className="h-4 w-4 text-green-500" />
                        </div>
                        <CardTitle className="text-base">Objetivo de Estudo</CardTitle>
                    </div>
                    {!editing && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEditing}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                ) : editing ? (
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
                            <Button
                                size="sm"
                                onClick={save}
                                disabled={mutation.isPending}
                                className="gap-1.5"
                            >
                                <Check className="h-3.5 w-3.5" />
                                Salvar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                disabled={mutation.isPending}
                                className="gap-1.5"
                            >
                                <X className="h-3.5 w-3.5" />
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : userData?.studyGoal ? (
                    <p className="text-sm text-foreground leading-relaxed">{userData.studyGoal}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        Nenhum objetivo definido. Clique no lápis para adicionar.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
