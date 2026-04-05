"use client";

import { useCallback, useState } from "react";
import { BlockType, MOCK_BLOCKS, StudyBlock } from "./components/mockData";
import { generateId } from "../teste/4/components/planner-utils";
import { parseTimeToMinutes } from "./utils";

export interface NewBlockForm {
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
    type?: BlockType;
    dayIndex: number;
}
const DEFAULT_FORM: NewBlockForm = {
    subject: "",
    topic: "",
    startTime: "09:00",
    endTime: "10:00",
    type: "exercise",
    dayIndex: 0,
};

export function usePlannerState() {
    const [blocks, setBlocks] = useState<StudyBlock[]>(MOCK_BLOCKS);
    const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<NewBlockForm>(DEFAULT_FORM);

    const [draggedId, setDraggedId] = useState<string | null>(null);

    const openAddModal = useCallback((dayIndex: number) => {
        setEditingBlock(null);
        setForm((prev) => ({ ...prev, dayIndex }));
        setModalOpen(true);
    }, []);

    const openEditBlock = useCallback((block: StudyBlock) => {
        setEditingBlock(block);
        setForm({
            subject: block.subject,
            topic: block.topic ?? "",
            startTime: block.startTime,
            endTime: block.endTime,
            type: block.type,
            dayIndex: block.dayIndex,
        });
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingBlock(null);
    }, []);


    const saveBlock = useCallback(() => {
        console.log("Saving block with form data:", form);

        if (editingBlock) {
            setBlocks((prev) =>
                prev.map((blk) =>
                    blk.id === editingBlock.id
                        ? { ...blk, ...form, id: editingBlock.id } // Preserve ID on edit
                        : blk
                )
            );
        } else {
            const newBlock: StudyBlock = {
                id: generateId(),
                subject: form.subject,
                topic: form.topic,
                startTime: form.startTime,
                endTime: form.endTime,
                color: "blue",
                dayIndex: form.dayIndex,
                type: form.type,
            };
            setBlocks((prev) => [...prev, newBlock]);
        }

        closeModal();

    }, [form, closeModal, editingBlock]);

    const moveBlockToDay = useCallback((blockId: string, targetDay: number, targetHour: number) => {
        console.log(`Moving block ${blockId} to day ${targetDay} at hour ${targetHour}`);

        const currentBlock = blocks.find(b => b.id === blockId);
        if (!currentBlock) return;

        // Calcular a duração do bloco em minutos
        const startMinutes = parseTimeToMinutes(currentBlock.startTime);
        const endMinutes = parseTimeToMinutes(currentBlock.endTime);
        const durationMinutes = endMinutes - startMinutes;

        // Novo horário de início com base no targetHour
        const newStartMinutes = targetHour * 60; // targetHour é um número (ex: 9, 14, etc)
        const newEndMinutes = newStartMinutes + durationMinutes;

        // Converter minutos de volta para formato HH:MM
        const hoursStart = Math.floor(newStartMinutes / 60);
        const minutesStart = newStartMinutes % 60;
        const newStartStr = `${String(hoursStart).padStart(2, '0')}:${String(minutesStart).padStart(2, '0')}`;

        const hoursEnd = Math.floor(newEndMinutes / 60);
        const minutesEnd = newEndMinutes % 60;
        const newEndStr = `${String(hoursEnd).padStart(2, '0')}:${String(minutesEnd).padStart(2, '0')}`;

        const movedBlock = {
            ...currentBlock,
            dayIndex: targetDay,
            startTime: newStartStr,
            endTime: newEndStr,
        };

        setBlocks((prev) => prev.map(b => b.id === blockId ? movedBlock : b));
    }, [blocks]);

    return {
        blocks,
        form,
        setForm,
        draggedId,
        setDraggedId,
        moveBlockToDay,
        editingBlock,
        modalOpen,
        openAddModal,
        openEditBlock,
        closeModal,
        saveBlock,

    }
}