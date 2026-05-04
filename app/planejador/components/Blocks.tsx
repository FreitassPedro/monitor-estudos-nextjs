import { useCallback, useMemo } from "react";
import { StudyBlock } from "./mockData";
import { COLOR_MAP, formatDuration, getBlockTimelineMetrics, parseTimeToMinutes } from "../utils";
import { CheckCircle2, Circle, Clock, GripVertical, MoreHorizontal, Pencil, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePlannerActions } from "./PlannerActionsContext";

interface BlockCardProps {
    block: StudyBlock;
    hourHeights: number[];
}

export function BlockCard({
    block,
    hourHeights,
}: BlockCardProps) {

    const {
        draggedId,
        resizingId,
        openEditBlock,
        removeBlock,
        handleDragStart,
        handleResizeStart,
        toggleBlockStatus,
    } = usePlannerActions();

    const colors = COLOR_MAP[block.color];
    const isDragging = draggedId === block.id;
    const isResizing = resizingId === block.id;

    const { topPx, heightPx } = useMemo(
        () => getBlockTimelineMetrics(block, hourHeights),
        [block, hourHeights]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest("[data-resize-handle]")) return;
            e.preventDefault();

            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            handleDragStart(block.id, offsetY);
        },
        [block.id, handleDragStart]
    );

    const durationMin = useMemo(() => {
        const s = parseTimeToMinutes(block.startTime);
        const e = parseTimeToMinutes(block.endTime);
        return e - s;
    }, [block.startTime, block.endTime]);

    const compact = heightPx < 48;

    return (
        <div
            className={cn(
                "absolute z-10 group rounded-lg border select-none left-1 right-1",
                "transition-shadow overflow-hidden flex flex-col",
                colors.bg,
                colors.border,
                isDragging
                    ? "opacity-40 shadow-lg ring-2 ring-primary/50 cursor-grabbing"
                    : isResizing
                        ? "shadow-md ring-2 ring-primary/30 cursor-ns-resize"
                        : "cursor-grab hover:shadow-md hover:z-20",
                block.status === "done" && "opacity-60 grayscale-[0.3]"
            )}
            style={{
                height: `${heightPx}px`,
                top: `${topPx}px`,
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={(e) => {
                e.stopPropagation();
                openEditBlock(block);
            }}
        >
            {/* Drag grip */}
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
                <GripVertical className="w-3 h-3" />
            </div>

            <div className={cn("flex flex-col flex-1 min-h-0", compact ? "px-2 py-0.5" : "px-2 py-1.5")}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleBlockStatus(block.id);
                    }}
                    className="absolute opacity-0 hover:opacity-100"
                >
                    {block.status === "done" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-current opacity-80" />
                    ) : (
                        <Circle className="w-3.5 h-3.5 text-current opacity-40 hover:opacity-80 transition-opacity" />
                    )}
                </button>

                <h3 className={cn("font-semibold truncate leading-tight text-xs", colors.text )}>
                    {block.subject}
                </h3>

                {!compact && block.topic && (
                    <p className="text-xs text-muted-foreground truncate leading-tight">{block.topic}</p>
                )}

                {!compact && (
                    <Badge
                        variant="outline"
                        className={cn("w-fit text-xs mt-0.5 py-0 px-1.5 h-4", colors.border)}
                    >
                        {block.type}
                    </Badge>
                )}

                <div className={cn("flex items-center gap-0.5 text-muted-foreground leading-tight", compact ? "mt-0" : "mt-auto")}>
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <p className="text-[10px] font-medium truncate">
                        {block.startTime}–{block.endTime}
                        {!compact && ` · ${formatDuration(durationMin)}`}
                    </p>
                </div>
            </div>

            {/* Options Button */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-6 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full"
                    >
                        <MoreHorizontal className="w-2.5 h-2.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive"
                            onClick={() => removeBlock(block.id)}
                        >
                            <Trash2Icon />
                            Trash
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>


            {/* Edit button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    openEditBlock(block);
                }}
            >
                <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
            </Button>

            {/* Resize handle */}
            <div
                data-resize-handle
                className={cn(
                    "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize",
                    "flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity"
                )}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("resize start", block.id);
                    handleResizeStart(block.id, e);
                }}
            >
                <div className="w-8 h-0.5 rounded-full bg-current opacity-50" />
            </div>
        </div>
    );
}
// ── Ghost block shown while dragging ────────────────────────────────────────

export function GhostBlock({
    topPx,
    heightPx,
    label,
}: {
    topPx: number;
    heightPx: number;
    label: string;
}) {
    return (
        <div
            className="absolute left-1 right-1 z-30 rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 pointer-events-none flex items-center justify-center"
            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
        >
            <p className="text-xs font-medium text-primary/70">{label}</p>
        </div>
    );
}