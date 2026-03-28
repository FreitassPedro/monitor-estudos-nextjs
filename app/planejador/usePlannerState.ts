"use client";

import { useCallback, useState } from "react";
import { StudyBlock } from "./components/mockData";

export interface NewBlockForm {
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
}

export function usePlannerState() {
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

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingBlock(null);
    }, []);

    return {
        form,
        setForm,
        modalOpen,
        openAddModal,
        closeModal,

    }
}