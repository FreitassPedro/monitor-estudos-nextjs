"use client";

import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";

import { Clock, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { BlockType, StudyBlock } from "./mockData";
import { formatDuration } from "../page";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { calculateheight, calculateTop, COLOR_MAP, getDayName } from "../utils";
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



export function StudyBlockCard({
    block,
    onEdit
}: { block: StudyBlock; onEdit: (block: StudyBlock) => void }) {

    const colors = COLOR_MAP[block.color];

    const top = useMemo(() => calculateTop(block.startTime), [block.startTime]);
    const height = useMemo(() => calculateheight(block.startTime, block.endTime), [block.startTime, block.endTime]);

    return (
        <div
            className={cn(
                "absolute z-0 group rounded-lg border select-none",
                "p-3 cursor-pointer hover:bg-primary/70 transition-colors",
                colors.bg,
            )}
            style={{
                height: `${height}%`,
                top: `${top}%`
            }}
        >
            <h3 className="text-sm font-semibold">{block.subject}</h3>
            <h3 className="text-xs text-muted-foreground">{block.topic}</h3>
            <Badge variant="outline">
                {block.type}
            </Badge>
            <Button
                variant="ghost" size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onEdit(block); }}
            >
                <Pencil className="absolute top-1 right-1 w-3 h-3 text-muted-foreground" />
            </Button>
            <div className="flex items-center mt-1 text-muted-foreground">
                <Clock className="w-3 h-3 " />
                <p className="text-xs ">{block.startTime}-{block.endTime}</p>
            </div>
        </div>
    );
};

export function DayColumn({
    blocks,
    date,
    dayIndex,
    onAddBlock,
    onEditBlock,
}: {
    blocks: StudyBlock[];
    date: Date;
    dayIndex: number;
    onAddBlock: (dayIndex: number) => void;
    onEditBlock: (block: StudyBlock) => void;
}) {

    const hourHeightPx = 64;
    const timelineHeightPx = hourHeightPx * 24;


    const dayMinutes = useMemo(() => {
        return blocks.reduce((total, block) => {
            const start = parseInt(block.startTime.split(":")[0]) * 60 + parseInt(block.startTime.split(":")[1]);
            const end = parseInt(block.endTime.split(":")[0]) * 60 + parseInt(block.endTime.split(":")[1]);
            return total + (end - start);
        }, 0);
    }, [blocks])

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
                className="relative flex flex-col rounded-lg bg-muted/20 p-1.5"
                style={{ height: `${timelineHeightPx}px` }}
            >
                {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                    <div key={hour}
                        className="absolute left-0 right-0 border-t border-muted/50"
                        style={{ top: `${(hour / 24) * 100}%` }}
                    />
                ))}

                {blocks ? blocks.map((block: StudyBlock) => (
                    <StudyBlockCard
                        key={block.id}
                        block={block}
                        onEdit={onEditBlock}
                    />
                )) : (
                    <p className="text-center text-sm text-muted-foreground mt-4">Nenhum bloco planejado</p>
                )}

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
