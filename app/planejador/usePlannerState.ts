"use client";

import { useCallback, useState } from "react";
import { StudyBlock } from "./components/mockData";
import { generateId } from "../teste/4/components/planner-utils";

export interface NewBlockForm {
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
}

export function usePlannerState() {
    const [blocks, setBlocks] = useState<StudyBlock[]>([]);
    const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<NewBlockForm>({
        subject: "",
        topic: "",
        startTime: "09:00",
        endTime: "10:00",
    });

    const openAddModal = useCallback((dayIndex: number) => {
        setModalOpen(true);
    }, []);

    const openEditBlock = useCallback((block: StudyBlock) => {
        setEditingBlock(block);
        setForm({
            subject: block.subject,
            topic: block.topic ?? "",
            startTime: block.startTime,
            endTime: block.endTime,
        });
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingBlock(null);
    }, []);


    const saveBlock = useCallback(() => {

        const newBlock: StudyBlock = {
            id: generateId(),
            subject: form.subject,
            topic: form.topic,
            startTime: form.startTime,
            endTime: form.endTime,
            color: "blue",
            dayIndex: 0,
        };
        setBlocks((prev) => [...prev, newBlock]);
        closeModal();


    }, [form, closeModal]);

    return {
        form,
        setForm,
        editingBlock,
        modalOpen,
        openAddModal,
        openEditBlock,
        closeModal,
        saveBlock,

    }
}