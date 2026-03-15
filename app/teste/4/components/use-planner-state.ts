"use client";

import { useState, useCallback } from "react";
import { StudyBlock, SubjectColor } from "./mock-data";
import { MOCK_BLOCKS } from "./mock-data";
import { generateId, timeToMinutes, minutesToTime, blockDurationMinutes } from "./planner-utils";

export interface NewBlockForm {
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  color: SubjectColor;
}

const DEFAULT_FORM: NewBlockForm = {
  subject: "",
  topic: "",
  startTime: "09:00",
  endTime: "10:00",
  color: "blue",
};

export function usePlannerState() {
  const [blocks, setBlocks] = useState<StudyBlock[]>(MOCK_BLOCKS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
  const [activeDay, setActiveDay] = useState<number>(0);
  const [form, setForm] = useState<NewBlockForm>(DEFAULT_FORM);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const openAddModal = useCallback((dayIndex: number) => {
    setActiveDay(dayIndex);
    setEditingBlock(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((block: StudyBlock) => {
    setActiveDay(block.dayIndex);
    setEditingBlock(block);
    setForm({
      subject: block.subject,
      topic: block.topic ?? "",
      startTime: block.startTime,
      endTime: block.endTime,
      color: block.color,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingBlock(null);
  }, []);

  const saveBlock = useCallback(() => {
    if (!form.subject.trim()) return;
    if (timeToMinutes(form.endTime) <= timeToMinutes(form.startTime)) return;

    if (editingBlock) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === editingBlock.id
            ? { ...b, ...form, topic: form.topic || undefined }
            : b
        )
      );
    } else {
      const newBlock: StudyBlock = {
        id: generateId(),
        subject: form.subject.trim(),
        topic: form.topic.trim() || undefined,
        startTime: form.startTime,
        endTime: form.endTime,
        color: form.color,
        dayIndex: activeDay,
      };
      setBlocks((prev) => [...prev, newBlock]);
    }
    closeModal();
  }, [form, editingBlock, activeDay, closeModal]);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const moveBlockToDay = useCallback((blockId: string, targetDay: number) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, dayIndex: targetDay } : b))
    );
  }, []);

  const resizeBlock = useCallback((blockId: string, deltaMinutes: number) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const currentDuration = blockDurationMinutes(b);
        const newDuration = Math.max(15, Math.min(480, currentDuration + deltaMinutes));
        const snapped = Math.round(newDuration / 15) * 15;
        return { ...b, endTime: minutesToTime(timeToMinutes(b.startTime) + snapped) };
      })
    );
  }, []);

  const blocksForDay = useCallback(
    (dayIndex: number) => blocks.filter((b) => b.dayIndex === dayIndex),
    [blocks]
  );

  return {
    blocks,
    form,
    setForm,
    modalOpen,
    editingBlock,
    activeDay,
    draggedId,
    setDraggedId,
    openAddModal,
    openEditModal,
    closeModal,
    saveBlock,
    deleteBlock,
    moveBlockToDay,
    resizeBlock,
    blocksForDay,
  };
}
