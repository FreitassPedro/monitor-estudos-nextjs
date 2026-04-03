"use client";

import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";

import { Calendar, Clock, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { BlockType, StudyBlock } from "./mockData";
import { formatDuration } from "../page";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { COLOR_MAP, getBlockTimelineMetrics, getDayName } from "../utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";



export function BlockFormModal({
    open,
    form,
    onCloseModal,
    onSave,
    onFormChange
}: {
    open: boolean;
    form: Partial<StudyBlock>;
    onCloseModal: () => void;
    onSave: () => void;
    onFormChange: (patch: Partial<StudyBlock>) => void;
}) {

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCloseModal()}>
            <DialogContent>
                <DialogHeader>
                    <h2 className="text-lg font-semibold">Adicionar bloco de estudo</h2>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <Label>
                        Matéria
                    </Label>
                    <Input
                        id="subject"
                        placeholder="Ex: Matemática"
                        value={form.subject}
                        onChange={(e) => onFormChange({ subject: e.target.value })}
                    />

                    <Label>
                        Tópico
                    </Label>
                    <Input
                        placeholder="Ex: Cálculo - Derivadas"
                        value={form.topic}
                        onChange={(e) => onFormChange({ topic: e.target.value })}
                    />
                    <Label>
                        Tipo
                    </Label>
                    <Input
                        placeholder="Ex: Estudo, Prática, Revisão..."
                        value={form.type}
                        onChange={(e) => onFormChange({ type: e.target.value as BlockType })}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Inicio</Label>
                            <Input
                                type="time"
                                value={form.startTime}
                                onChange={(e) => onFormChange({ startTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Fim</Label>
                            <Input
                                type="time"
                                value={form.endTime}
                                onChange={(e) => onFormChange({ endTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCloseModal}>Cancelar</Button>
                    <Button onClick={onSave}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}



interface StudyBlockCardProps {
    block: StudyBlock;
    hourHeights: number[];
    onEdit: (block: StudyBlock) => void;
    onDragStart: (id: string) => void;
}
export function StudyBlockCard({
    block,
    hourHeights,
    onEdit,
    onDragStart,
}: StudyBlockCardProps) {

    const colors = COLOR_MAP[block.color];
    const { topPx, heightPx } = useMemo(
        () => getBlockTimelineMetrics(block, hourHeights),
        [block, hourHeights]
    );

    return (
        <div
            className={cn(
                "absolute z-0 group rounded-lg border select-none left-2 right-2",
                "px-2 py-1.5 cursor-pointer hover:bg-primary/70 transition-colors overflow-hidden flex flex-col justify-start",
                colors.bg,
            )}
            style={{
                height: `${heightPx}px`,
                top: `${topPx}px`
            }}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("blockId", block.id);
                onDragStart(block.id);
            }}

        >
            <h3 className="text-sm font-semibold truncate leading-tight">{block.subject}</h3>
            {block.topic && <h3 className="text-xs text-muted-foreground truncate leading-tight">{block.topic}</h3>}
            <Badge variant="outline" className="w-fit text-xs">
                {block.type}
            </Badge>
            <Button
                variant="ghost" size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center rounded-full p-0.5"
                onClick={(e) => { e.stopPropagation(); onEdit(block); }}
            >
                <Pencil className="w-3 h-3 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-0.5 mt-auto text-muted-foreground leading-tight">
                <Clock className="w-2.5 h-2.5 shrink-0" />
                <p className="text-xs truncate">{block.startTime}-{block.endTime}</p>
            </div>
        </div>
    );
};

export function DayColumn({
    blocks,
    date,
    dayIndex,
    hourHeights,
    timelineHeightPx,
    onAddBlock,
    onEditBlock,
    onDrop,
    onDragStart,
}: {
    blocks: StudyBlock[];
    date: Date;
    dayIndex: number;
    hourHeights: number[];
    timelineHeightPx: number;
    onAddBlock: (dayIndex: number) => void;
    onEditBlock: (block: StudyBlock) => void;
    onDrop: (blockId: string, dayIndex: number) => void;
    onDragStart: (blockId: string) => void;
}) {
    const [isDragOver, setIsDragOver] = useState(false);


    const dayMinutes = useMemo(() => {
        return blocks.reduce((total, block) => {
            const start = parseInt(block.startTime.split(":")[0]) * 60 + parseInt(block.startTime.split(":")[1]);
            const end = parseInt(block.endTime.split(":")[0]) * 60 + parseInt(block.endTime.split(":")[1]);
            return total + (end - start);
        }, 0);
    }, [blocks])

    const hourOffsets = useMemo(() => {
        return hourHeights.map((_, index) => {
            return hourHeights.slice(0, index).reduce((total, height) => total + height, 0);
        });
    }, [hourHeights]);

    return (
        <div className="flex flex-col min-w-0">
            <div className="px-2 py-2">
                <p className="text-md font-semibold text-primary">{getDayName(date)}</p>
                <p className="text-xs text-muted-foreground">{date.toLocaleDateString("pt-BR")}</p>
                <Badge variant={"secondary"}>
                    {formatDuration(dayMinutes)}
                </Badge>
            </div>
            <Separator className="my-2" />

            {/* Drop zone */}
            <div
                className="relative flex-1 flex flex-col gap-3 rounded-xl p-2  transition-all duration-200 bg-muted/10 hover:bg-muted/20"
                style={{ height: `${timelineHeightPx}px` }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const blockId = e.dataTransfer.getData("blockId");
                    if (blockId) onDrop(blockId, dayIndex);
                }}
            >
                {hourOffsets.map((top, hour) => (
                    <div key={hour}
                        className="absolute left-0 right-0 border-t border-muted/50"
                        style={{ top: `${top}px` }}
                    />
                ))}

                {blocks.length > 0 ? blocks.map((block: StudyBlock) => (
                    <StudyBlockCard
                        key={block.id}
                        block={block}
                        hourHeights={hourHeights}
                        onEdit={onEditBlock}
                        onDragStart={onDragStart}
                    />
                )) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-20 pointer-events-none select-none">
                        <Calendar className="w-8 h-8 mb-2" />
                        <p className="text-[10px] font-medium">Vazio</p>
                    </div>)}

                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-auto w-full font-bol tracking-tight rounded-lg space-x-2
                        text-muted-foreground/40 border border-dashed border-border/50 hover:text-primary hover:bg-primary/10 hover:border-primary/50
                    "
                    onClick={() => onAddBlock(dayIndex)}
                >
                    <Plus className="w-3.5 h-3.5 " />
                    ADICIONAR
                </Button>
            </div>

        </div>

    )
};
