"use client";

import { TopicNode } from "@/types/types";
import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen } from "lucide-react";

interface TopicTreeSelectorProps {
    nodes: TopicNode[];
    selectedTopicId: string;
    onTopicSelect: (topicId: string) => void;
}

function TopicNodeItem({
    node,
    level,
    selectedTopicId,
    onTopicSelect,
}: {
    node: TopicNode;
    level: number;
    selectedTopicId: string;
    onTopicSelect: (topicId: string) => void;
}) {
    const hasChildren = node.children && node.children.length > 0;
    const [isCollapsed, setIsCollapsed] = useState(level > 1);

    const isSelected = selectedTopicId === node.id;

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    return (
        <>
            <div
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent text-foreground"
                }`}
                style={{ paddingLeft: `${level * 16 }px` }}
                onClick={() => onTopicSelect(node.id)}
            >
                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCollapse();
                        }}
                        className="flex items-center justify-center h-5 w-5 rounded hover:bg-accent/50 text-muted-foreground transition-colors shrink-0"
                    >
                        {isCollapsed ? (
                            <ChevronRight size={14} />
                        ) : (
                            <ChevronDown size={14} />
                        )}
                    </button>
                )}
                {!hasChildren && <div className="w-5" />}

                {hasChildren ? (
                    isCollapsed ? (
                        <Folder size={14} className="text-muted-foreground shrink-0" />
                    ) : (
                        <FolderOpen size={14} className="text-primary/60 shrink-0" />
                    )
                ) : (
                    <FileText size={14} className="text-muted-foreground/50 shrink-0" />
                )}

                <span className="text-sm font-medium flex-1 truncate">
                    {node.name}
                </span>
            </div>

            {!isCollapsed && hasChildren &&
                node.children.map((child) => (
                    <TopicNodeItem
                        key={child.id}
                        node={child}
                        level={level + 1}
                        selectedTopicId={selectedTopicId}
                        onTopicSelect={onTopicSelect}
                    />
                ))}
        </>
    );
}

export function TopicTreeSelector({
    nodes,
    selectedTopicId,
    onTopicSelect,
}: TopicTreeSelectorProps) {
    return (
        <div className="space-y-1">
            {nodes.map((node) => (
                <TopicNodeItem
                    key={node.id}
                    node={node}
                    level={0}
                    selectedTopicId={selectedTopicId}
                    onTopicSelect={onTopicSelect}
                />
            ))}
        </div>
    );
}
