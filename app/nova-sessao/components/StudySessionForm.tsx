"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Circle,
    ClockArrowUp,
    Plus,
    Network,
    Timer,
    Play,
    Square,
    BookOpen,
    RotateCcw,
    Pencil,
    FileText,

} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { useTopicsTree } from "@/hooks/useTopics";
import { useCreateStudyLog } from "@/hooks/useStudyLogs";
import { StudyLogInput } from "@/server/actions/studyLogs.action";
import { NewTopicDialog } from "./NewTopicDialog";
import { TopicTreeSelector } from "./TopicTreeSelector";
import { TopicNode } from "@/types/types";
import useSessionFormStore from "@/store/useSessionFormStore";
import { usePageTitleWithCronometer } from "@/hooks/usePageTitleWithCronometer";
import { getLocalDateForToday } from "@/lib/utils";

// --- Helpers ---

const padTwo = (n: number) => n.toString().padStart(2, "0");

const formatCronometerTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${padTwo(hrs)}:${padTwo(mins)}:${padTwo(secs)}`;
};

const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
};

const formatTime = (date?: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
};

const calcDurationMinutes = (start?: Date, end?: Date): number => {
    if (!start || !end) return 0;
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
};

const getFormSubmitError = (form: FormData): string | null => {
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

const findTopicInTreeById = (
    nodes: TopicNode[],
    topicId: string
): TopicNode | undefined => {
    for (const node of nodes) {
        if (node.id === topicId) return node;
        const found = findTopicInTreeById(node.children, topicId);
        if (found) return found;
    }
    return undefined;
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

function CronometerTitleSync() {
    const isRunning = useSessionFormStore((state) => state.cronometer.isRunning);
    const seconds = useSessionFormStore((state) => state.cronometer.seconds);

    usePageTitleWithCronometer({
        isRunning,
        seconds,
        baseTitle: "Nova Sessão de Estudo",
    });

    return null;
}

function CronometerTimeDisplay({ isRunning }: { isRunning: boolean }) {
    const seconds = useSessionFormStore((state) => state.cronometer.seconds);

    return (
        <div className="relative flex flex-col items-center">
            <span
                className={`text-4xl font-mono font-semibold tracking-tight transition-colors ${isRunning ? "text-foreground" : "text-muted-foreground"
                    }`}
            >
                {formatCronometerTime(seconds)}
            </span>
        </div>
    );
}

// --- Component ---

export function StudySessionForm() {
    const router = useRouter();

    const [form, setForm] = useState<FormData>(emptyForm);
    const setSelectedSubject = useSessionFormStore((state) => state.setSelectedSubject);
    const setSelectedTopic = useSessionFormStore((state) => state.setSelectedTopic);
    const selectedSubject = useSessionFormStore((state) => state.selectedSubject);
    const selectedTopic = useSessionFormStore((state) => state.selectedTopic);
    const isCronometerRunning = useSessionFormStore((state) => state.cronometer.isRunning);
    const cronometerStartTime = useSessionFormStore((state) => state.cronometer.startTime);
    const cronometerEndTime = useSessionFormStore((state) => state.cronometer.endTime);
    const updateCronometer = useSessionFormStore((state) => state.updateCronometer);
    const resetCronometer = useSessionFormStore((state) => state.resetCronometer);
    const startTicking = useSessionFormStore((state) => state.startTicking);
    const stopTicking = useSessionFormStore((state) => state.stopTicking);

    const [timeRegisterType, setTimeRegisterType] = useState<"manual" | "cronometer">("manual");
    const { data: topicsTree = [], isLoading: loadingTopicsTree } = useTopicsTree();

    const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
    const [topicTreePopoverOpen, setTopicTreePopoverOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [endTimeError, setEndTimeError] = useState<string | null>(null);

    // New UI-only state
    const [studyMode, setStudyMode] = useState<StudyMode>("leitura");

    const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();

    const currentSubjectTopics = useMemo(
        () => getTopicTreeForSubject(topicsTree, form.subjectId),
        [topicsTree, form.subjectId]
    );
    const createStudyLog = useCreateStudyLog();

    // Warn on unsaved data
    useEffect(() => {
        const isDirty =
            !!form.subjectId ||
            !!form.topicId ||
            !!form.notes ||
            !!form.start_time ||
            !!form.end_time ||
            isCronometerRunning;

        if (!isDirty) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "Você tem uma sessão de estudo em andamento. Deseja realmente sair?";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [form, isCronometerRunning]);

    // Update Global State
    useEffect(() => {
        if (!form.subjectId) {
            if (selectedSubject) setSelectedSubject(undefined);
            if (selectedTopic) setSelectedTopic(undefined);
            return;
        }

        const foundSubject = subjects.find((s: { id: string }) => s.id === form.subjectId);

        if (foundSubject && foundSubject.id !== selectedSubject?.id) {
            setSelectedSubject(foundSubject);
            if (selectedTopic) setSelectedTopic(undefined);
            return;
        }

        if (!foundSubject && selectedSubject) {
            setSelectedSubject(undefined);
        }
    }, [
        form.subjectId,
        setSelectedSubject,
        setSelectedTopic,
        subjects,
        selectedSubject,
        selectedSubject?.id,
        selectedTopic,
        selectedTopic?.id,
    ]);

    // 
    useEffect(() => {
        if (!form.topicId) {
            if (selectedTopic) setSelectedTopic(undefined);
            return;
        }

        const foundTopic = findTopicInTreeById(currentSubjectTopics, form.topicId);
        if (foundTopic && foundTopic.id !== selectedTopic?.id) {
            setSelectedTopic(foundTopic);
            return;
        }

        if (!foundTopic && selectedTopic) {
            setSelectedTopic(undefined);
        }
    }, [form.topicId, currentSubjectTopics, selectedTopic, selectedTopic?.id, setSelectedTopic]);

    // --- Handlers ---

    const handleSubjectChange = (subjectId: string) => {
        setForm((prev) => ({ ...prev, subjectId, topicId: "" }));
    };

    const handleTopicChange = (topicId: string) => {
        setTopicTreePopoverOpen(false);
        setForm((prev) => ({ ...prev, topicId }));
    };

    const getSelectedTopicName = (): string => {
        if (!form.topicId) return "Selecione um tópico";

        const findTopicInTree = (
            nodes: typeof currentSubjectTopics
        ): (typeof currentSubjectTopics)[0] | undefined => {
            for (const node of nodes) {
                if (node.id === form.topicId) return node;
                const found = findTopicInTree(node.children);
                if (found) return found;
            }
            return undefined;
        };

        return findTopicInTree(currentSubjectTopics)?.name || "Tópico selecionado";
    };

    const handleTimeInput = (field: "start_time" | "end_time", value: string) => {
        if (!value) {
            setForm((prev) => ({ ...prev, [field]: undefined }));
            return;
        }
        const [hours, minutes] = value.split(":");
        const date = new Date();
        date.setHours(+hours, +minutes, 0, 0);
        setForm((prev) => ({ ...prev, [field]: date }));
        updateCronometer({
            startTime: field === "start_time" ? date : cronometerStartTime,
            endTime: field === "end_time" ? date : cronometerEndTime,
        });
    };

    const setCurrentTime = (field: "start_time" | "end_time") => {
        setForm((prev) => ({ ...prev, [field]: new Date() }));
    };

    const toggleCronometer = () => {
        const now = new Date();
        if (!isCronometerRunning) {
            updateCronometer({ isRunning: true, startTime: now, endTime: null });
            startTicking();
            setForm((prev) => ({ ...prev, start_time: now, end_time: undefined }));
        } else {
            stopTicking();
            updateCronometer({ isRunning: false, endTime: now });
            setForm((prev) => ({ ...prev, end_time: now }));
        }
    };

    const handleResetCronometer = () => {
        resetCronometer();
        setForm((prev) => ({ ...prev, start_time: undefined, end_time: undefined }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEndTimeError(null);

        const submitError = getFormSubmitError(form);
        if (submitError) {
            if (submitError === "A hora de fim deve ser maior que a hora de início.") {
                setEndTimeError(submitError);
            }
            toast.error(submitError);
            return;
        }

        const studyDate = form.study_date!;
        const startTime = form.start_time!;
        const endTime = form.end_time!;
        const durationMinutes = calcDurationMinutes(form.start_time, form.end_time);

        const data: StudyLogInput = {
            topic_id: form.topicId,
            study_date: studyDate,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: durationMinutes,
            notes: form.notes || undefined,
        };


        try {
            setIsSubmitting(true);
            await createStudyLog.mutateAsync(data);
            toast.success("Sessão de estudo registrada!");
            setForm(emptyForm);
            resetCronometer();
            router.push("/");
        } catch {
            setIsSubmitting(false);
            toast.error("Erro ao registrar sessão.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const duration = calcDurationMinutes(form.start_time, form.end_time);
    const isFormReadyToSubmit = !getFormSubmitError(form);

    return (
        <>
            <CronometerTitleSync />
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
                                        <div className="flex items-center gap-2">
                                            <Select value={form.subjectId} onValueChange={handleSubjectChange}>
                                                <SelectTrigger className="w-full focus-visible:ring-primary/40 bg-background/60">
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
                                        <div className="flex items-center gap-2">
                                            <Dialog
                                                open={topicTreePopoverOpen}
                                                onOpenChange={setTopicTreePopoverOpen}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        type="button"
                                                        className={`w-full justify-between font-normal bg-background/60 hover:bg-background/80 focus-visible:ring-primary/40 ${!form.topicId ? "text-muted-foreground" : "text-foreground"
                                                            }`}
                                                        disabled={!form.subjectId || loadingTopicsTree}
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
                                                                selectedTopicId={form.topicId}
                                                                onTopicSelect={handleTopicChange}
                                                            />
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setNewTopicDialogOpen(true)}
                                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                                disabled={!form.subjectId}
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
                                            value={form.notes}
                                            className="bg-background/60 focus-visible:ring-primary/40 resize-none"
                                            onChange={(e) =>
                                                setForm((prev) => ({ ...prev, notes: e.target.value }))
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Time tracking */}
                        <div className="space-y-4">
                            <Card className="shadow-lg border-border/60 bg-card/80 backdrop-blur-sm">

                                <CardContent className="space-y-3">

                                    {/* Time Mode Tabs */}
                                    <Tabs
                                        value={timeRegisterType}
                                        onValueChange={(v) => setTimeRegisterType(v as "manual" | "cronometer")}
                                    >
                                        <TabsList className="w-full grid grid-cols-2 bg-muted/50">
                                            <TabsTrigger
                                                value="manual"
                                                disabled={isCronometerRunning}
                                                title={isCronometerRunning ? "Pare o cronômetro para registrar manualmente" : undefined}
                                                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                            >
                                                <ClockArrowUp className="h-3.5 w-3.5" />
                                                Manual
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="cronometer"
                                                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                            >
                                                <Timer className="h-3.5 w-3.5" />
                                                Cronômetro
                                            </TabsTrigger>
                                        </TabsList>

                                        {/* Cronometer Panel */}
                                        <TabsContent value="cronometer" className="mt-4">
                                            <div className={`flex flex-col items-center gap-5 py-4 rounded-xl transition-all ${isCronometerRunning
                                                ? "ring-2 ring-primary/30 bg-primary/5"
                                                : "bg-muted/20"
                                                }`}>
                                                {/* Time Display */}
                                                <CronometerTimeDisplay isRunning={isCronometerRunning} />

                                                {/* Controls */}
                                                <div className="flex gap-2 w-full px-4">
                                                    <Button
                                                        type="button"

                                                        onClick={toggleCronometer}
                                                        className={`flex-1 gap-2 transition-all 
                                                            ${isCronometerRunning ?
                                                                "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            }`}
                                                    >
                                                        {isCronometerRunning ? (
                                                            <>
                                                                <Square className="fill-current" />
                                                                Parar
                                                            </>

                                                        ) : (
                                                            <>
                                                                <Play className="fill-current" />
                                                                Iniciar
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"

                                                        onClick={handleResetCronometer}
                                                        disabled={isCronometerRunning}
                                                        title="Resetar"
                                                        className="shrink-0 text-muted-foreground hover:text-foreground"
                                                    >
                                                        Resetar
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Empty tab content for manual — times below are always shown */}
                                        <TabsContent value="manual" className="mt-0" />
                                    </Tabs>



                                    {/* Start / End Time */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Hora Início */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="start_time" className="text-sm font-medium text-foreground/80">
                                                Início
                                            </Label>
                                            <div className="flex gap-1">
                                                <Input
                                                    id="start_time"
                                                    type="time"
                                                    disabled={timeRegisterType === "cronometer"}
                                                    value={formatTime(form.start_time)}
                                                    className="bg-background/60 focus-visible:ring-primary/40 min-w-0"
                                                    onChange={(e) => handleTimeInput("start_time", e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setCurrentTime("start_time")}
                                                    disabled={timeRegisterType === "cronometer"}
                                                    title="Hora atual"
                                                    className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                                                >
                                                    <ClockArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Hora Fim */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="end_time" className="text-sm font-medium text-foreground/80">
                                                Fim
                                            </Label>
                                            <div className="flex gap-1">
                                                <Input
                                                    id="end_time"
                                                    type="time"
                                                    disabled={timeRegisterType === "cronometer"}
                                                    value={formatTime(form.end_time)}
                                                    className={`bg-background/60 focus-visible:ring-primary/40 min-w-0 ${endTimeError ? "border-destructive ring-destructive/30" : ""
                                                        }`}
                                                    onChange={(e) => handleTimeInput("end_time", e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setCurrentTime("end_time")}
                                                    disabled={timeRegisterType === "cronometer"}
                                                    title="Hora atual"
                                                    className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                                                >
                                                    <ClockArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            {endTimeError && (
                                                <p className="text-xs text-destructive leading-tight">{endTimeError}</p>
                                            )}
                                        </div>
                                    </div>



                                    {/* Duration Badge */}
                                    {duration > 0 && (
                                        <div className="flex items-center justify-between rounded-lg bg-primary/8 border border-primary/20 px-4 py-2.5">
                                            <span className="text-xs text-muted-foreground font-medium">Duração calculada</span>
                                            <span className="text-sm font-semibold text-primary tabular-nums">
                                                {Math.floor(duration / 60) > 0 && `${Math.floor(duration / 60)}h `}
                                                {duration % 60}min
                                            </span>
                                        </div>
                                    )}

                                    {/* Date */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="study_date" className="text-sm font-medium text-foreground/80">
                                            Data
                                        </Label>
                                        <Input
                                            id="study_date"
                                            type="date"
                                            value={form.study_date ? formatDate(form.study_date) : ""}
                                            className="bg-background/60 focus-visible:ring-primary/40"
                                            onChange={(e) => {
                                                const [year, month, day] = e.target.value.split("-").map(Number);
                                                const d = new Date(year, month - 1, day);
                                                setForm((prev) => ({ ...prev, study_date: d }));
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

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
                form.subjectId && (
                    <NewTopicDialog
                        isOpen={newTopicDialogOpen}
                        onOpenChange={setNewTopicDialogOpen}
                        subjectId={form.subjectId}
                        onTopicCreated={(topic) => {
                            setForm((prev) => ({ ...prev, topicId: topic.id }));
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