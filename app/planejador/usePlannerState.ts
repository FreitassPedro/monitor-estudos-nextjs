"use client";

import { useCallback, useState } from "react";
import { StudyBlock } from "./components/mockData";


export function usePlannerState() {
    const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const openAddModal = useCallback((dayIndex: number) => {
        setModalOpen(true);
    }, []);


    return {
        modalOpen,
        openAddModal,
    }
}