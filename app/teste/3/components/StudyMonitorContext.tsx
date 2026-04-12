"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { TopicNode, Pendency, NOTES_MOCK, PENDENCIES_MOCK } from '../mock';
import { mockJsonDashboardStats, mockJsonTopicTree } from '../mock';

// ─── Context Value Type ───────────────────────────────────────────────────────
interface StudyMonitorContextValue {
  // State
  folderTree: { id: string; name: string; color: string; topics: TopicNode[] }[];
  detailNode: TopicNode | null;
  dashboardStats: typeof mockJsonDashboardStats;
  selectedTopicId: string | null;

  // Pendencies & Notes
  allPendencies: Pendency[];
  allNotes: Array<{
    id: string;
    topicId: string;
    content: string;
    createdAt: Date;
  }>;

  // Actions
  openDetailSheet: (node: TopicNode) => void;
  closeDetailSheet: () => void;
  selectTopic: (topicId: string) => void;
  clearFilter: () => void;
  addPendency: (topicId: string, pendency: Pendency) => void;
  removePendency: (pendencyId: string) => void;
  togglePendencyStatus: (pendencyId: string) => void;
  addNote: (topicId: string, noteContent: string) => void;
  removeNote: (noteId: string) => void;
}

// ─── Create Context ───────────────────────────────────────────────────────────
const StudyMonitorContext = createContext<StudyMonitorContextValue | undefined>(
  undefined
);

// ─── Provider Component ───────────────────────────────────────────────────────
export const StudyMonitorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [folderTree] = useState(mockJsonTopicTree);
  const [detailNode, setDetailNode] = useState<TopicNode | null>(null);
  const [dashboardStats] = useState(mockJsonDashboardStats);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [allPendencies, setAllPendencies] = useState<Pendency[]>(PENDENCIES_MOCK);
  const [allNotes, setAllNotes] = useState<
    Array<{
      id: string;
      topicId: string;
      content: string;
      createdAt: Date;
    }>
  >(NOTES_MOCK);

  // Actions
  const openDetailSheet = useCallback((node: TopicNode) => {
    setDetailNode(node);
  }, []);

  const closeDetailSheet = useCallback(() => {
    setDetailNode(null);
  }, []);

  const selectTopic = useCallback((topicId: string) => {
    setSelectedTopicId(topicId);
  }, []);

  const clearFilter = useCallback(() => {
    setSelectedTopicId(null);
  }, []);

  const addPendency = useCallback((topicId: string, pendency: Pendency) => {
    setAllPendencies((prev) => [...prev, pendency]);
  }, []);

  const removePendency = useCallback((pendencyId: string) => {
    setAllPendencies((prev) => prev.filter((p) => p.id !== pendencyId));
  }, []);

  const togglePendencyStatus = useCallback((pendencyId: string) => {
    setAllPendencies((prev) =>
      prev.map((p) =>
        p.id === pendencyId ? { ...p, resolved: !p.resolved } : p
      )
    );
  }, []);

  const addNote = useCallback((topicId: string, noteContent: string) => {
    const newNote = {
      id: `n${Date.now()}`,
      topicId,
      content: noteContent,
      createdAt: new Date(),
    };
    setAllNotes((prev) => [...prev, newNote]);
  }, []);

  const removeNote = useCallback((noteId: string) => {
    setAllNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const value: StudyMonitorContextValue = {
    folderTree,
    detailNode,
    dashboardStats,
    selectedTopicId,
    allPendencies,
    allNotes,
    openDetailSheet,
    closeDetailSheet,
    selectTopic,
    clearFilter,
    addPendency,
    removePendency,
    togglePendencyStatus,
    addNote,
    removeNote,
  };

  return (
    <StudyMonitorContext.Provider value={value}>
      {children}
    </StudyMonitorContext.Provider>
  );
};

// ─── Hook to use context ───────────────────────────────────────────────────────
export const useStudyMonitor = () => {
  const context = useContext(StudyMonitorContext);
  if (!context) {
    throw new Error(
      'useStudyMonitor deve ser usado dentro de StudyMonitorProvider'
    );
  }
  return context;
};
