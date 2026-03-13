"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjectsWithTopics } from "@/hooks/useSubjects";
import { SubjectCard } from "./components/SubjectCard";
import { Button } from "@/components/ui/button";
import { FileText, Folder, FolderOpen, Plus, Settings, Trash2 } from "lucide-react";
import { useTopics, useTopicsTree } from "@/hooks/useTopics";
import { Fragment, useState } from "react";




function NodeRow({
    node,
    level,
}) {

    const hasChildren = node.children && node.children.length > 0;
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <>
            <tr>
                <td>
                    {hasChildren && (
                        <button>


                        </button>
                    )}

                </td>
                {/* Name */}
                <td className="py-2.5 pr-4 group">
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 opacity-5 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                        >
                            <Settings className="h-4 w-4 " />
                        </Button>
                    </div>
                </td>
            </tr>
            {
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

export default function SubjectList() {
    const { data: subjects = [], isLoading } = useSubjectsWithTopics();

    const { data: topicTree = [] } = useTopicsTree();
    
    if (isLoading) {
        return <SubjectsSkeleton />;
    }

    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-border bg-muted/40">
                    <th className="w-8" />
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tópico
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        Pendências
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        Logs
                    </th>
                </tr>
            </thead>
            <tbody>
                {subjects.map((subject) => (
                    <Fragment key={subject.id}>
                        <tr>
                            <td colSpan={4} className="py-2.5 px-4">
                                <div className="flex w-full items-center justify-between gap-6 "                                                    >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: subject.color }}
                                        />
                                        <span className="font-medium text-foreground">{subject.name}</span>
                                    </div>
                                    <div className="ml-6 flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                        >
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 opacity-90 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                        >
                                            <Settings className="h-4 w-4 " />
                                        </Button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {
                            topicTree
                                .filter((topic) => topic.subjectId === subject.id)
                                .map((topic) => (
                                    <NodeRow
                                        key={topic.id}
                                        node={topic}
                                        level={1}
                                    />
                                ))
                        }
                    </Fragment>
                ))}

            </tbody>
        </table>
    );
}
