"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useSubjects } from "@/hooks/useSubjects";
import { useTopicsBySubject } from "@/hooks/useTopics";
import { useCreateStudyLog } from "@/hooks/useStudyLogs";
import { StudyLogInput } from "@/server/actions/studyLogs.action";
import { Subject } from "@/types/types";
import { NewTopicDialog } from "./NewTopicDialog";

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

// --- Form State ---

interface FormData {
    subject: Subject | null;
    topicId: string;
    topicName: string;
    material_type: string;
    study_date: Date | undefined;
    start_time: Date | undefined;
    end_time: Date | undefined;
    notes: string;
}

const emptyForm = (): FormData => ({
    subject: null,
    topicId: "",
    topicName: "",
    material_type: "",
    study_date: undefined,
    start_time: undefined,
    end_time: undefined,
    notes: "",
});

// --- Component ---

export function StudySessionForm() {
    const router = useRouter();

    const [form, setForm] = useState<FormData>(emptyForm);
    const [isCronometerRunning, setIsCronometerRunning] = useState(false);
    const [cronometerTime, setCronometerTime] = useState(0);
    const [cronometerStartTime, setCronometerStartTime] = useState<number | null>(null);
    const [timeRegisterType, setTimeRegisterType] = useState<"manual" | "cronometer">("manual");
    const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
    const [endTimeError, setEndTimeError] = useState<string | null>(null);

    const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
    const { data: topics = [], isLoading: loadingTopics } = useTopicsBySubject(form.subject?.id);
    const createStudyLog = useCreateStudyLog(); 

    // Cronometer tick
    useEffect(() => {
        if (!isCronometerRunning || !cronometerStartTime) return;
        const interval = window.setInterval(() => {
            setCronometerTime(Math.floor((Date.now() - cronometerStartTime) / 1000));
        }, 1000);
        return () => window.clearInterval(interval);
    }, [isCronometerRunning, cronometerStartTime]);

    // Warn on unsaved data
    useEffect(() => {
        const isDirty =
            !!form.subject ||
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

    // --- Handlers ---

    const handleSubjectChange = (subjectId: string) => {
        const subject = subjects.find(s => s.id === subjectId) ?? null;
        setForm(prev => ({ ...prev, subject, topicId: "", topicName: "" }));
    };

    const handleTopicChange = (topicId: string) => {
        const topic = topics.find(t => t.id === topicId);
        setForm(prev => ({ ...prev, topicId, topicName: topic?.name ?? "" }));
    };

    const handleTimeInput = (field: "start_time" | "end_time", value: string) => {
        if (!value) {
            setForm(prev => ({ ...prev, [field]: undefined }));
            return;
        }
        const [hours, minutes] = value.split(":");
        const date = new Date();
        date.setHours(+hours, +minutes, 0, 0);
        setForm(prev => ({ ...prev, [field]: date }));
    };

    const setCurrentTime = (field: "start_time" | "end_time") => {
        setForm(prev => ({ ...prev, [field]: new Date() }));
    };

    const toggleCronometer = () => {
        const now = new Date();
        if (!isCronometerRunning) {
            setCronometerStartTime(now.getTime());
            setCronometerTime(0);
            setForm(prev => ({ ...prev, start_time: now, end_time: undefined }));
            setIsCronometerRunning(true);
        } else {
            setIsCronometerRunning(false);
            setForm(prev => ({ ...prev, end_time: now }));
        }
    };

    const resetCronometer = () => {
        setIsCronometerRunning(false);
        setCronometerTime(0);
        setCronometerStartTime(null);
        setForm(prev => ({ ...prev, start_time: undefined, end_time: undefined }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEndTimeError(null);

        if (!form.subject) {
            toast.error("Selecione uma matéria.");
            return;
        }
        if (!form.topicId) {
            toast.error("Selecione um tópico.");
            return;
        }
        if (!form.start_time || !form.end_time) {
            toast.error("Informe o horário de início e fim.");
            return;
        }

        const durationMinutes = calcDurationMinutes(form.start_time, form.end_time);
        if (durationMinutes <= 0) {
            setEndTimeError("A hora de fim deve ser maior que a hora de início.");
            toast.error("A hora de fim deve ser maior que a hora de início.");
            return;
        }

        const data: StudyLogInput = {
            topic_id: form.topicId,
            study_date: form.study_date,
            start_time: form.start_time,
            end_time: form.end_time,
            duration_minutes: durationMinutes,
            notes: form.notes || undefined,
        };

        try {
            await createStudyLog.mutateAsync(data);
            toast.success("Sessão de estudo registrada!");
            setForm(emptyForm());
            resetCronometer();
            router.push("/");
        } catch {
            toast.error("Erro ao registrar sessão.");
        }
    };

    const duration = calcDurationMinutes(form.start_time, form.end_time);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Nova Sessão de Estudo</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">

                        {/* Matéria */}
                        <div className="space-y-2">
                            <Label>Matéria</Label>
                            <div className="flex items-center gap-2">
                                <Select value={form.subject?.id ?? ""} onValueChange={handleSubjectChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione uma matéria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingSubjects ? (
                                            <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                        ) : subjects.length === 0 ? (
                                            <SelectItem value="empty" disabled>Nenhuma matéria cadastrada</SelectItem>
                                        ) : (
                                            subjects.map(subject => (
                                                <SelectItem key={subject.id} value={subject.id}>
                                                    <span className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full inline-block shrink-0"
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
                                    className="shrink-0"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Tópico */}
                        <div className="space-y-2">
                            <Label>Conteúdo Estudado</Label>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={form.topicId}
                                    onValueChange={handleTopicChange}
                                    disabled={!form.subject}
                                >
                                    <SelectTrigger className="w-full" disabled={!form.subject}>
                                        <SelectValue
                                            placeholder={
                                                !form.subject
                                                    ? "Selecione uma matéria primeiro"
                                                    : "Selecione um tópico"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingTopics ? (
                                            <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                        ) : topics.length === 0 ? (
                                            <SelectItem value="empty" disabled>Nenhum tópico cadastrado</SelectItem>
                                        ) : (
                                            topics.map(topic => (
                                                <SelectItem key={topic.id} value={topic.id}>
                                                    {topic.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setNewTopicDialogOpen(true)}
                                    className="shrink-0"
                                    disabled={!form.subject}
                                >
                                    <Plus className="h-4 w-4" />
                                    Novo tópico
                                </Button>
                            </div>
                        </div>

                        {/* Tipo de material */}
                        <div className="space-y-2">
                            <Label htmlFor="material_type">Tipo de material (opcional)</Label>
                            <Input
                                id="material_type"
                                placeholder="Ex: Livro, Vídeo, Artigo..."
                                value={form.material_type}
                                onChange={e => setForm(prev => ({ ...prev, material_type: e.target.value }))}
                            />
                        </div>

                        {/* Modo de registro do tempo */}
                        <div className="space-y-2">
                            <Label>Registrar Tempo de Estudo</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={timeRegisterType === "manual" ? "default" : "outline"}
                                    onClick={() => setTimeRegisterType("manual")}
                                >
                                    Manualmente
                                </Button>
                                <Button
                                    type="button"
                                    variant={timeRegisterType === "cronometer" ? "default" : "outline"}
                                    onClick={() => setTimeRegisterType("cronometer")}
                                >
                                    Cronometrar
                                </Button>
                            </div>
                        </div>

                        {/* Cronômetro */}
                        {timeRegisterType === "cronometer" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cronômetro de Estudo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="text-3xl font-mono">
                                            {formatCronometerTime(cronometerTime)}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={isCronometerRunning ? "outline" : "default"}
                                                onClick={toggleCronometer}
                                            >
                                                {isCronometerRunning ? "Parar" : "Iniciar"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={resetCronometer}
                                                disabled={isCronometerRunning}
                                            >
                                                Resetar
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Data e Horários */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-1/3 lg:w-1/4 space-y-2">
                                <Label htmlFor="study_date">Data</Label>
                                <Input
                                    id="study_date"
                                    type="date"
                                    value={form.study_date ? formatDate(form.study_date) : ""}
                                    onChange={e => {
                                        const d = new Date(e.target.value + "T00:00:00");
                                        setForm(prev => ({ ...prev, study_date: d }));
                                    }}
                                />
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Hora Início</Label>
                                    <div className="flex items-center">
                                        <Input
                                            id="start_time"
                                            type="time"
                                            disabled={timeRegisterType === "cronometer"}
                                            value={formatTime(form.start_time)}
                                            onChange={e => handleTimeInput("start_time", e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            onClick={() => setCurrentTime("start_time")}
                                            title="Hora atual"
                                            className="shrink-0"
                                        >
                                            <Clock className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">Hora Fim</Label>
                                    <div className="flex items-center">
                                        <Input
                                            id="end_time"
                                            type="time"
                                            disabled={timeRegisterType === "cronometer"}
                                            value={formatTime(form.end_time)}
                                            onChange={e => handleTimeInput("end_time", e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentTime("end_time")}
                                            title="Hora atual"
                                            className="shrink-0"
                                        >
                                            <Clock className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {endTimeError && (
                                        <p className="text-sm text-destructive">{endTimeError}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Duração calculada */}
                        {duration > 0 && (
                            <div className="p-3 bg-accent/50 rounded text-sm">
                                <span className="text-muted-foreground">Duração: </span>
                                <span className="font-medium text-foreground">
                                    {Math.floor(duration / 60)}h {duration % 60}min
                                </span>
                            </div>
                        )}

                        {/* Anotações */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Anotações (opcional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Resumo, pontos-chave, dúvidas..."
                                rows={4}
                                value={form.notes}
                                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>

                        {/* Ações */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createStudyLog.isPending}
                                className="flex-1"
                            >
                                {createStudyLog.isPending ? "Salvando..." : "Registrar Sessão"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {form.subject && (
                <NewTopicDialog
                    isOpen={newTopicDialogOpen}
                    onOpenChange={setNewTopicDialogOpen}
                    subject={form.subject}
                    onTopicCreated={topic => {
                        setForm(prev => ({ ...prev, topicId: topic.id, topicName: topic.name }));
                    }}
                />
            )}
        </>
    );
}