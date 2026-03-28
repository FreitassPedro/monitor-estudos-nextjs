"use client";

import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";
import { getDay } from "date-fns";
import { Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { MOCK_BLOCKS, StudyBlock, SubjectColor } from "./mockData";
import { formatDuration } from "../page";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { COLOR_MAP, getDayName } from "../utils";

export function BlockFormModal({
    open,
    onCloseModal,
}: {
    open: boolean;
    onCloseModal: () => void;
}) {

    console.log("Modal open:", open);
    return (            
        <Dialog open={open} onOpenChange={(v) => !v && onCloseModal()}>
            <DialogContent>
                <p>Modal content goes here</p>
            </DialogContent>
        </Dialog>
    )
}



export function StudyBlockCard({ block }: { block: StudyBlock }) {
    const colors = COLOR_MAP[block.color];
    const size = 120; // Example size, you can calculate this based on duration

    return (
        <div
            className={cn(
                "relative group rounded-lg border select-none",
                "p-3 cursor-pointer hover:bg-primary/70 transition-colors",
                colors.bg,
            )}
            style={{ height: size }}
        >
            <h3 className="text-sm font-semibold">{block.subject}</h3>
            <h3 className="text-xs text-muted-foreground">{block.topic}</h3>
            <Pencil className="absolute top-1 right-1 w-3 h-3 text-muted-foreground" />
            <div className="flex items-center mt-1 text-muted-foreground">
                <Clock className="w-3 h-3 " />
                <p className="text-xs ">{block.startTime}-{block.endTime}</p>
            </div>
        </div>
    );
};

export function DayColumn({
    date,
    dayIndex,
    onAddBlock
}: { date: Date; dayIndex: number, onAddBlock: (dayIndex: number) => void }) {

    const blocks = useMemo(() => {
        return MOCK_BLOCKS.filter((block) => block.dayIndex === dayIndex)
    }, [dayIndex])

    const dayMinutes = useMemo(() => {
        return blocks.reduce((total, block) => {
            const start = parseInt(block.startTime.split(":")[0]) * 60 + parseInt(block.startTime.split(":")[1]);
            const end = parseInt(block.endTime.split(":")[0]) * 60 + parseInt(block.endTime.split(":")[1]);
            return total + (end - start);
        }, 0);
    }, [blocks])

    return (
        <div className="flex flex-col h-full min-w-0">
            <div className="px-2 py-2">
                <p className="text-md font-semibold text-primary">{getDayName(date)}</p>
                <p className="text-xs text-muted-foreground">{date.toLocaleDateString("pt-BR")}</p>
                <Badge variant={"secondary"}>
                    {formatDuration(dayMinutes)}
                </Badge>
            </div>
            <Separator className="my-2" />

            {/* Drop zone */}
            <div className="bg-muted/40 min-h-70 rounded-lg p-1.5 gap-2 flex flex-col h-full">
                {blocks ? blocks.map((block) => (
                    <StudyBlockCard key={block.id} block={block} />
                )) : (
                    <p className="text-center text-sm text-muted-foreground mt-4">Nenhum bloco planejado</p>
                )}
            </div>
            <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onAddBlock(dayIndex)}
            >
                Adicionar bloco
            </Button>
        </div>

    )
};
