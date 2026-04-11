"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlockType, MOCK_BLOCKS, StudyBlock, SubjectColor } from "./components/mockData";
import { generateId } from "../teste/4/components/planner-utils";
import { parseTimeToMinutes } from "./utils";

const PLANNER_BLOCKS_STORAGE_KEY = "planner.blocks.v1";

export interface NewBlockForm {
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
    type: BlockType;
    color: SubjectColor;
    dayIndex: number;
}

const DEFAULT_FORM: NewBlockForm = {
    subject: "",
    topic: "",
    startTime: "09:00",
    endTime: "10:00",
    type: "exercise",
    color: "blue",
    dayIndex: 0,
};

export function minutesToTimeStr(minutes: number): string {
    const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes));
    const h = Math.floor(clamped / 60);
    const m = Math.round(clamped % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}



export function usePlannerState() {
    const [blocks, setBlocks] = useState<StudyBlock[]>(() => {
        if (typeof window === "undefined") return MOCK_BLOCKS;

        try {
            const raw = window.localStorage.getItem(PLANNER_BLOCKS_STORAGE_KEY);
            if (!raw) return MOCK_BLOCKS;

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return MOCK_BLOCKS;

            return parsed as StudyBlock[];
        } catch {
            return MOCK_BLOCKS;
        }
    });
    const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<NewBlockForm>(DEFAULT_FORM);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);

    // Used to detect single-click vs drag
    const dragMovedRef = useRef(false);

    const openAddModal = useCallback((dayIndex: number, startTime?: string) => {
        setEditingBlock(null);
        setForm((prev) => ({
            ...prev,
            dayIndex,
            startTime: startTime ?? "09:00",
            endTime: startTime
                ? minutesToTimeStr(parseTimeToMinutes(startTime) + 60)
                : "10:00",
        }));
        setModalOpen(true);
    }, []);

    const openEditBlock = useCallback((block: StudyBlock) => {
        setEditingBlock(block);
        setForm({
            subject: block.subject,
            topic: block.topic ?? "",
            startTime: block.startTime,
            endTime: block.endTime,
            type: block.type ?? "exercise",
            color: block.color,
            dayIndex: block.dayIndex,
        });
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingBlock(null);
    }, []);

    const removeBlock = useCallback((blockId: string) => {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    }, []);

    const saveBlock = useCallback(() => {
        if (editingBlock) {
            setBlocks((prev) => prev.map((b) => b.id === editingBlock.id ? { ...b, ...form } : b));
        } else {
            const newBlock: StudyBlock = {
                id: generateId(),
                subject: form.subject,
                topic: form.topic,
                startTime: form.startTime,
                endTime: form.endTime,
                color: form.color,
                dayIndex: form.dayIndex,
                type: form.type,
            };
            setBlocks((prev) => [...prev, newBlock]);
        }
        closeModal();
    }, [form, closeModal, editingBlock]);

    const deleteBlock = useCallback((blockId: string) => {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
        closeModal();
    }, [closeModal]);

    /**
     * Move a block to a new day + pixel offset within the timeline.
     * pixelTop: distance from top of timeline container (px).
     * timelineHeight: total height of the timeline (px).
     */
    const moveBlockByPixel = useCallback(
        (blockId: string, targetDay: number, pixelTop: number, hourHeights: number[]) => {
            setBlocks((prev) => {
                const block = prev.find((b) => b.id === blockId);
                if (!block) return prev;

                const startMinutes = parseTimeToMinutes(block.startTime);
                const endMinutes = parseTimeToMinutes(block.endTime);
                const duration = endMinutes - startMinutes;

                const newStart = pixelToMinutes(pixelTop, hourHeights);
                const snapped = snapToGrid(newStart, 15);
                const newEnd = snapped + duration;

                return prev.map((b) =>
                    b.id === blockId
                        ? {
                            ...b,
                            dayIndex: targetDay,
                            startTime: minutesToTimeStr(snapped),
                            endTime: minutesToTimeStr(newEnd),
                        }
                        : b
                );
            });
        },
        []
    );

    /**
     * Resize a block by setting a new end time from pixel position.
     */
    const resizeBlockByPixel = useCallback(
        (blockId: string, pixelBottom: number, hourHeights: number[]) => {
            console.log("resizeBlockByPixel", { blockId, pixelBottom });
            setBlocks((prev) => {
                const block = prev.find((b) => b.id === blockId);
                if (!block) return prev;

                const startMinutes = parseTimeToMinutes(block.startTime);
                const newEnd = pixelToMinutes(pixelBottom, hourHeights);
                const snapped = snapToGrid(newEnd, 15);

                if (snapped <= startMinutes + 15) return prev;

                return prev.map((b) =>
                    b.id === blockId
                        ? { ...b, endTime: minutesToTimeStr(snapped) }
                        : b
                );
            });
        },
        []
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(PLANNER_BLOCKS_STORAGE_KEY, JSON.stringify(blocks));
    }, [blocks]);

    return {
        blocks,
        form,
        setForm,
        draggedId,
        setDraggedId,
        dragMovedRef,
        resizingId,
        setResizingId,
        moveBlockByPixel,
        resizeBlockByPixel,
        editingBlock,
        modalOpen,
        removeBlock,
        openAddModal,
        openEditBlock,
        closeModal,
        saveBlock,
        deleteBlock,
    };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function snapToGrid(minutes: number, gridMinutes: number): number {
    return Math.round(minutes / gridMinutes) * gridMinutes;
}

export function pixelToMinutes(px: number, hourHeights: number[]): number {
    let remaining = Math.max(0, px);
    for (let hour = 0; hour < hourHeights.length; hour++) {
        const h = hourHeights[hour];
        if (remaining <= h) {
            return hour * 60 + (remaining / h) * 60;
        }
        remaining -= h;
    }
    return 24 * 60;
}