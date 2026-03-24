"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Circle,
    Plus,
    Network,
    BookOpen,
    RotateCcw,
    Pencil,
    FileText,

} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useSubjects } from "@/hooks/useSubjects";
import { useTopicsMap, useTopicsTree } from "@/hooks/useTopics";
import { useCreateStudyLog } from "@/hooks/useStudyLogs";
import { StudyLogInput } from "@/server/actions/studyLogs.action";
import { NewTopicDialog } from "./NewTopicDialog";
import { TopicTreeSelector } from "./TopicTreeSelector";
import { TopicNode } from "@/types/types";
import useSessionFormStore from "@/store/useSessionFormStore";
import useCronometerStore from "@/store/useCronometerStore";
import { getLocalDateForToday } from "@/lib/utils";
import { Cronometer } from "./Cronometer";

// --- Helpers ---

const calcDurationMinutes = (start?: Date, end?: Date): number => {
    if (!start || !end) return 0;
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
};

const getFormSubmitError = (form: FormData): string | null => {
    console.log("Validating form:", form);
    if (!form.subjectId) return "Selecione uma matéria.";
    if (!form.topicId) return "Selecione um tópico.";
    if (!form.study_date) return "Informe a data de estudo.";
    if (!form.start_time || !form.end_time) return "Informe o horário de início e fim.";

    const durationMinutes = calcDurationMinutes(form.start_time, form.end_time);
    if (durationMinutes <= 0) {
        return "A hora de fim deve ser maior que a hora de início.";
    }

    return null;
};

const getTopicTreeForSubject = (
    topicsTree: TopicNode[],
    subjectId: string
): TopicNode[] => {
    return topicsTree?.filter((node) => node.subjectId === subjectId) || [];
};

// --- Form State ---

interface FormData {
    subjectId: string;
    topicId: string;
    material_type: string;
    study_date: Date | undefined;
    start_time: Date | undefined;
    end_time: Date | undefined;
    notes: string;
}

const emptyForm: FormData = {
    subjectId: "",
    topicId: "",
    material_type: "",
    study_date: getLocalDateForToday(),
    start_time: undefined,
    end_time: undefined,
    notes: "",
};

type StudyMode = "leitura" | "revisao" | "exercicios" | "resumo";

const STUDY_MODES: { value: StudyMode; label: string; icon: React.ReactNode }[] = [
    { value: "leitura", label: "Leitura", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { value: "revisao", label: "Revisão", icon: <RotateCcw className="h-3.5 w-3.5" /> },
    { value: "exercicios", label: "Exercícios", icon: <Pencil className="h-3.5 w-3.5" /> },
    { value: "resumo", label: "Resumo", icon: <FileText className="h-3.5 w-3.5" /> },
];


// --- Component ---

export function StudySessionForm() {
    const router = useRouter();
    const createStudyLog = useCreateStudyLog();

    const topicsMap = useTopicsMap();
    const sessionForm = useSessionFormStore((state) => state.form);

    const updateSelectionForm = useSessionFormStore((state) => state.updateForm);
    const resetSelectionForm = useSessionFormStore((state) => state.resetForm);

    const [selectionForm, setSelectionForm] = useState<FormData>(emptyForm);

    const isCronometerRunning = useCronometerStore((state) => state.cronometer.isRunning);
    const resetCronometer = useCronometerStore((state) => state.resetCronometer);

    const { data: topicsTree = [], isLoading: loadingTopicsTree } = useTopicsTree();
    const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();

    const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
    const [topicTreePopoverOpen, setTopicTreePopoverOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // New UI-only state
    const [studyMode, setStudyMode] = useState<StudyMode>("leitura");


    const currentSubjectTopics = useMemo(
        () => getTopicTreeForSubject(topicsTree, selectionForm.subjectId),
        [topicsTree, selectionForm.subjectId]
    );

    // Time/date fields are controlled by Cronometer via Zustand store.
    const submitForm = useMemo<FormData>(
        () => ({
            ...selectionForm,
            start_time: sessionForm.start_time,
            end_time: sessionForm.end_time,
            study_date: sessionForm.study_date ?? selectionForm.study_date,
        }),
        [selectionForm, sessionForm.start_time, sessionForm.end_time, sessionForm.study_date]
    );


    // Warn on unsaved data
    useEffect(() => {
        const isDirty =
            !!selectionForm.subjectId ||
            !!selectionForm.topicId ||
            !!selectionForm.notes ||
            !!selectionForm.start_time ||
            !!selectionForm.end_time ||
            isCronometerRunning;

        if (!isDirty) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "Você tem uma sessão de estudo em andamento. Deseja realmente sair?";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [selectionForm, isCronometerRunning]);

    // Keep store IDs as the single global source for subject/topic selection.
    useEffect(() => {
        updateSelectionForm({
            subjectId: selectionForm.subjectId,
            topicId: selectionForm.topicId,
        });
    }, [selectionForm.subjectId, selectionForm.topicId, updateSelectionForm]);

    // --- Handlers ---

    const handleSubjectChange = (subjectId: string) => {
        setSelectionForm((prev) => ({ ...prev, subjectId, topicId: "" }));
        updateSelectionForm({ subjectId, topicId: "" });
    };

    const handleTopicChange = (topicId: string) => {
        setTopicTreePopoverOpen(false);
        setSelectionForm((prev) => ({ ...prev, topicId }));
        updateSelectionForm({ topicId });
    };

    const getSelectedTopicName = (): string => {
        if (!selectionForm.topicId) return "Selecione um tópico";

        const topic = topicsMap[selectionForm?.topicId];

        return topic ? topic.name : "Tópico desconhecido";
    };


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting form:", submitForm);

        const submitError = getFormSubmitError(submitForm);
        if (submitError) {
            toast.error(submitError);
            return;
        }

        const studyDate = submitForm.study_date!;
        const startTime = submitForm.start_time!;
        const endTime = submitForm.end_time!;
        const durationMinutes = calcDurationMinutes(submitForm.start_time, submitForm.end_time);

        const data: StudyLogInput = {
            topic_id: submitForm.topicId,
            study_date: studyDate,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: durationMinutes,
            notes: submitForm.notes || undefined,
        };


        try {
            setIsSubmitting(true);
            await createStudyLog.mutateAsync(data);
            toast.success("Sessão de estudo registrada!");
            setSelectionForm(emptyForm);
            resetSelectionForm();
            resetCronometer();
            router.push("/");
        } catch {
            setIsSubmitting(false);
            toast.error("Erro ao registrar sessão.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormReadyToSubmit = !getFormSubmitError(submitForm);

    return (
        <>
            <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background py-8 px-4">
                <form onSubmit={onSubmit} className="max-w-5xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                Nova Sessão de Estudo
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Registre e acompanhe seu progresso de aprendizado
                            </p>
                        </div>
                        {isCronometerRunning && (
                            <Badge variant="destructive" className="animate-pulse gap-1.5 px-3 py-1 text-xs font-medium">
                                <span className="h-1.5 w-1.5 rounded-full bg-white inline-block" />
                                Cronômetro ativo
                            </Badge>
                        )}
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1  gap-6">

                        {/* LEFT COLUMN — Subject, Topic, Material, Notes */}
                        <div className="space-y-5">
                            <Card className="shadow-lg border-border/60 bg-card/80 backdrop-blur-sm">
                                <CardHeader className="border-b border-border/40">
                                    <CardTitle className="text-base font-semibold flex  items-center gap-2 text-foreground">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        Conteúdo Estudado
                                    </CardTitle>
                                    <CardDescription></CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">

                                    {/* Matéria */}
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-foreground/80">Matéria</Label>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Select value={selectionForm.subjectId} onValueChange={handleSubjectChange}>
                                                <SelectTrigger className="min-w-0 flex-1 focus-visible:ring-primary/40 bg-background/60">
                                                    <SelectValue placeholder="Selecione uma matéria" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSubjects ? (
                                                        <SelectItem value="loading" disabled>
                                                            Carregando...
                                                        </SelectItem>
                                                    ) : subjects.length === 0 ? (
                                                        <SelectItem value="empty" disabled>
                                                            Nenhuma matéria cadastrada
                                                        </SelectItem>
                                                    ) : (
                                                        subjects.map((subject) => (
                                                            <SelectItem key={subject.id} value={subject.id}>
                                                                <span className="flex items-center gap-2">
                                                                    <span
                                                                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                                                        style={{ backgroundColor: subject.color }}
                                                                    />
                                                                    {subject.name}
                                                                </span>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => router.push("/materias")}
                                                title="Cadastrar matéria"
                                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Tópico */}
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-foreground/80">Tópico Estudado</Label>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <Dialog
                                                    open={topicTreePopoverOpen}
                                                    onOpenChange={setTopicTreePopoverOpen}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            type="button"
                                                            className={`w-full  justify-between font-normal bg-background/60 hover:bg-background/80 focus-visible:ring-primary/40 ${!selectionForm.topicId ? "text-muted-foreground" : "text-foreground"
                                                                }`}
                                                            disabled={!selectionForm.subjectId || loadingTopicsTree}
                                                        >
                                                            <span className="truncate">{getSelectedTopicName()}</span>
                                                            <Network className="h-3.5 w-3.5 ml-2 shrink-0 text-muted-foreground" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Selecione um tópico</DialogTitle>
                                                        </DialogHeader>
                                                        {loadingTopicsTree ? (
                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                Carregando tópicos...
                                                            </div>
                                                        ) : currentSubjectTopics.length === 0 ? (
                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                Nenhum tópico cadastrado
                                                            </div>
                                                        ) : (
                                                            <div className="max-h-96 overflow-y-auto">
                                                                <TopicTreeSelector
                                                                    nodes={currentSubjectTopics}
                                                                    selectedTopicId={selectionForm.topicId}
                                                                    onTopicSelect={handleTopicChange}
                                                                />
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setNewTopicDialogOpen(true)}
                                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                                disabled={!selectionForm.subjectId}
                                                title="Novo tópico"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Tipo de material */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-foreground/80">
                                            Modo de Estudo
                                        </Label>
                                        <RadioGroup
                                            value={studyMode}
                                            onValueChange={(v) => setStudyMode(v as StudyMode)}
                                            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                                        >
                                            {STUDY_MODES.map((mode) => (
                                                <div key={mode.value} className="relative">
                                                    <RadioGroupItem
                                                        value={mode.value}
                                                        id={`mode-${mode.value}`}
                                                        className="sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={`mode-${mode.value}`}
                                                        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-3 cursor-pointer text-xs font-medium transition-all select-none
                                                            ${studyMode === mode.value
                                                                ? "border-primary bg-primary/10 text-primary"
                                                                : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                                                            }`}
                                                    >
                                                        {mode.icon}
                                                        {mode.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    {/* Anotações */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes" className="text-sm font-medium text-foreground/80">
                                            Anotações{" "}
                                            <span className="text-muted-foreground font-normal">(opcional)</span>
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Resumo, pontos-chave, dúvidas..."
                                            rows={4}
                                            value={selectionForm.notes}
                                            className="bg-background/60 focus-visible:ring-primary/40 resize-none"
                                            onChange={(e) =>
                                                setSelectionForm((prev) => ({ ...prev, notes: e.target.value }))
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Time tracking */}
                        <div className="space-y-4">
                            <Cronometer />

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    disabled={createStudyLog.isPending || !isFormReadyToSubmit}
                                    className="w-full font-semibold h-11 shadow-md"
                                    size="lg"
                                >
                                    {createStudyLog.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <Circle className="h-4 w-4 animate-spin" />
                                            Salvando...
                                        </span>
                                    ) : (
                                        "Registrar Sessão"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="w-full text-muted-foreground hover:text-foreground"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </form >
            </div >

            {/* Dialogs */}
            {
                selectionForm.subjectId && (
                    <NewTopicDialog
                        isOpen={newTopicDialogOpen}
                        onOpenChange={setNewTopicDialogOpen}
                        subjectId={selectionForm.subjectId}
                        onTopicCreated={(topic) => {
                            setSelectionForm((prev) => ({ ...prev, topicId: topic.id }));
                        }}
                    />
                )
            }

            {/* Submitting Overlay */}
            {
                isSubmitting && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Card className="shadow-xl border-border/60">
                            <CardContent className="flex items-center gap-3 px-8 py-5">
                                <Circle className="animate-spin h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Registrando sessão...</span>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        </>
    );
}