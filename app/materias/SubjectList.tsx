"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteSubject, useSubjectsWithTopics } from "@/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen, Plus, Trash2 } from "lucide-react";
import { useCreateTopic, useTopicsMap, useTopicsTree } from "@/hooks/useTopics";
import { Topic, TopicNode } from "@/types/types";
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { NewTopicDialog } from "../nova-sessao/components/NewTopicDialog";



function NodeRow({
    node,
    level,
}: {
    node: TopicNode;
    level: number;
}) {
    const { data: topicsMap } = useTopicsMap();
    const createTopic = useCreateTopic();

    const hasChildren = node.children && node.children.length > 0;
    const [isCollapsed, setIsCollapsed] = useState(level > 1 ? true : false);

    const [newTopicName, setNewTopicName] = useState("");
    const [isOpenDialog, setIsOpenDialog] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const parentTopic: Topic | null = topicsMap?.[node?.parentId || ""] || null;

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    }

    const getCreateTopicErrorMessage = (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message.toLowerCase() : "";

        if (
            errorMessage.includes("unique constraint") ||
            errorMessage.includes("parentid") ||
            errorMessage.includes("duplicate")
        ) {
            setErrorMessage("Já existe um tópico com esse nome neste nível. Selecione outro nome.");
            return "Ja existe um topico com esse nome neste nivel. Selecione outro nome.";
        }

        return "Erro ao criar topico.";
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const topicName = newTopicName.trim();

        if (!topicName || topicName.length === 0) {
            toast.error("Informe um nome para o topico.");
            return;
        }

        try {
            await createTopic.mutateAsync({ name: topicName, subjectId: node.subjectId, parentId: node.id });
            setNewTopicName("");
            setIsOpenDialog(false);

            toast.success(`Topico "${topicName}" criado!`);
        } catch (error) {
            console.error("Erro ao criar tópico:", error);
            toast.error(getCreateTopicErrorMessage(error));

        }
    }

    return (
        <>
            <tr className="group border-b border-muted hover:bg-muted/30 transition-colors">
                <td className="">
                    {hasChildren && (
                        <button onClick={toggleCollapse}
                            className={`flex items-center justify-center h-5 w-5 rounded hover:bg-accent text-muted-foreground transition-colors `}
                            style={{ marginLeft: `${level * 12}px` }}
                        >
                            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                        </button>
                    )}
                </td>
                {/* Name */}
                <td className="py-2 group">
                    <div
                        className="flex items-center gap-2 text-sm"
                        style={{ paddingLeft: `${level * 16}px` }}
                    >
                        {hasChildren
                            ? isCollapsed
                                ? <Folder size={13} className="text-muted-foreground shrink-0" />
                                : <FolderOpen size={13} className="text-primary/60 shrink-0" />
                            : <FileText size={13} className="text-muted-foreground/50 shrink-0" />
                        }
                        <span className={`text-foreground ${level === 0 ? 'font-medium' : ''}`}>{node.name}</span>
                        {/* New Children topic dialog */}
                        <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 opacity-90 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                >
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent >
                                <DialogHeader>
                                    <DialogTitle>Novo tópico em &quot;{node.name}&quot;</DialogTitle>
                                    <DialogDescription></DialogDescription>
                                </DialogHeader>
                                <div><p>Tópico pai {parentTopic?.name}</p></div>
                                <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <Label htmlFor="topic-name">Nome do tópico</Label>
                                        <Input
                                            id="topic-name"
                                            placeholder="Ex: Equações diferenciais"
                                            value={newTopicName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTopicName(e.target.value)}
                                            autoFocus
                                        />
                                        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setIsOpenDialog(false)}>Cancelar</Button>
                                        <Button type="submit">Criar</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </td>
            </tr>
            {
                !isCollapsed && hasChildren &&
                node.children.map((child) => (
                    <NodeRow
                        key={child.id}
                        node={child}
                        level={level + 1}
                    />

                ))
            }


        </>
    );
}

export const SubjectsSkeleton = () => {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Matérias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-200 rounded" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
function SubjectItem({ subject, topicTree }: {
    subject: { id: string; name: string; color: string };
    topicTree: TopicNode[];
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const deleteSubject = useDeleteSubject();

    const handleDelete = async () => {
        try {
            await deleteSubject.mutateAsync(subject.id);
            toast.info("Matéria removida com sucesso.");
        } catch {
            toast.error("Erro ao remover matéria.");
        }
    };

    return (
        <Fragment key={subject.id}>
            <tr className="border-l border-r border-b-2 select-none bg-muted/40 " style={{ borderColor: subject.color }}>
                <td colSpan={4} className="py-2.5 px-4">
                    <div className="flex w-full items-center justify-between gap-6">
                        <button onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`flex items-center justify-center h-5 w-5 rounded hover:bg-accent text-muted-foreground transition-colors `}
                        >
                            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                        </button>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: subject.color }}
                            />
                            <span className="font-medium text-foreground">{subject.name}</span>
                        </div>
                        <div className="ml-6 flex items-center gap-2">
                            <NewTopicDialog
                                subjectId={subject.id}
                                parentId={null}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                    >
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                </td>
            </tr>
            {!isCollapsed &&
                topicTree.map((topic) => (
                    <NodeRow
                        key={topic.id}
                        node={topic}
                        level={1}
                    />
                ))
            }
        </Fragment>
    );
};

export default function SubjectList() {
    const { data: subjects = [], isLoading } = useSubjectsWithTopics();

    const { data: topicTree = [] } = useTopicsTree();


    if (isLoading) {
        return <SubjectsSkeleton />;
    }

    return (
        <table className="w-full text-sm ">
            <thead>
                <tr className="border-b border-border bg-muted/40">
                    <th className="w-8" />
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tópico
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        {/* Pendências /*}
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        {/* logs */}
                    </th>
                </tr>
            </thead>
            <tbody>
                {subjects.map((subject) => (
                    <SubjectItem
                        key={subject.id}
                        subject={subject}
                        topicTree={topicTree}
                    />
                ))}
            </tbody>
        </table>
    );
}
