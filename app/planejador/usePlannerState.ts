"use client";

import { useCallback, useState } from "react";
import { BlockType, MOCK_BLOCKS, StudyBlock } from "./components/mockData";
import { generateId } from "../teste/4/components/planner-utils";

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

    const moveBlockToDay = useCallback((blockId: string, targetDay: number) => {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;

        setBlocks((prev) =>
            prev.map((b) => b.id === blockId ? { ...b, dayIndex: targetDay } : b)
        );
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