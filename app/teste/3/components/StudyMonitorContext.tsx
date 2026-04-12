"use client";
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { TopicNode, Pendency, NOTES_MOCK, PENDENCIES_MOCK, mockStudyLogs } from '../mock';
import { mockJsonDashboardStats, mockJsonTopicTree } from '../mock';

interface StudyMonitorNote {
  id: string;
  topicId: string;
  content: string;
  createdAt: Date;
}

// ─── UI Context ───────────────────────────────────────────────────────────────
interface StudyMonitorUIContextValue {
  detailNode: TopicNode | null;
  selectedTopicId: string | null;
  openDetailSheet: (node: TopicNode) => void;
  closeDetailSheet: () => void;
  selectTopic: (topicId: string) => void;
  clearFilter: () => void;
}

// ─── Data Context ─────────────────────────────────────────────────────────────
interface StudyMonitorDataContextValue {
  folderTree: { id: string; name: string; color: string; topics: TopicNode[] }[];
  dashboardStats: typeof mockJsonDashboardStats;

  allPendencies: Pendency[];
  allNotes: StudyMonitorNote[];
  pendenciesByTopic: Record<string, Pendency[]>;
  notesByTopic: Record<string, StudyMonitorNote[]>;
  logsByTopic: Record<string, typeof mockStudyLogs>;
  pendingCountByTopic: Record<string, number>;
  logsCountByTopic: Record<string, number>;

  addPendency: (topicId: string, pendency: Pendency) => void;
  removePendency: (pendencyId: string) => void;
  togglePendencyStatus: (pendencyId: string) => void;
  addNote: (topicId: string, noteContent: string) => void;
  removeNote: (noteId: string) => void;
}

const StudyMonitorUIContext = createContext<StudyMonitorUIContextValue | undefined>(undefined);
const StudyMonitorDataContext = createContext<StudyMonitorDataContextValue | undefined>(undefined);

export const StudyMonitorUIProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [detailNode, setDetailNode] = useState<TopicNode | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

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

  const value = useMemo<StudyMonitorUIContextValue>(() => ({
    detailNode,
    selectedTopicId,
    openDetailSheet,
    closeDetailSheet,
    selectTopic,
    clearFilter,
  }), [
    detailNode,
    selectedTopicId,
    openDetailSheet,
    closeDetailSheet,
    selectTopic,
    clearFilter,
  ]);

  return (
    <StudyMonitorUIContext.Provider value={value}>
      {children}
    </StudyMonitorUIContext.Provider>
  );
};

export const StudyMonitorDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [folderTree] = useState(mockJsonTopicTree);
  const [dashboardStats] = useState(mockJsonDashboardStats);
  const [allPendencies, setAllPendencies] = useState<Pendency[]>(PENDENCIES_MOCK);
  const [allNotes, setAllNotes] = useState<StudyMonitorNote[]>(NOTES_MOCK);

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

  const pendenciesByTopic = useMemo(() => {
    return allPendencies.reduce<Record<string, Pendency[]>>((acc, pendency) => {
      if (!acc[pendency.topicId]) {
        acc[pendency.topicId] = [];
      }
      acc[pendency.topicId].push(pendency);
      return acc;
    }, {});
  }, [allPendencies]);

  const notesByTopic = useMemo(() => {
    return allNotes.reduce<Record<string, StudyMonitorNote[]>>((acc, note) => {
      if (!acc[note.topicId]) {
        acc[note.topicId] = [];
      }
      acc[note.topicId].push(note);
      return acc;
    }, {});
  }, [allNotes]);

  const logsByTopic = useMemo(() => {
    return mockStudyLogs.reduce<Record<string, typeof mockStudyLogs>>((acc, log) => {
      if (!acc[log.topicId]) {
        acc[log.topicId] = [];
      }
      acc[log.topicId].push(log);
      return acc;
    }, {});
  }, []);

  const pendingCountByTopic = useMemo(() => {
    return allPendencies.reduce<Record<string, number>>((acc, pendency) => {
      if (!pendency.resolved) {
        acc[pendency.topicId] = (acc[pendency.topicId] ?? 0) + 1;
      }
      return acc;
    }, {});
  }, [allPendencies]);

  const logsCountByTopic = useMemo(() => {
    return mockStudyLogs.reduce<Record<string, number>>((acc, log) => {
      acc[log.topicId] = (acc[log.topicId] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const value: StudyMonitorDataContextValue = useMemo(() => ({
    folderTree,
    dashboardStats,
    allPendencies,
    allNotes,
    pendenciesByTopic,
    notesByTopic,
    logsByTopic,
    pendingCountByTopic,
    logsCountByTopic,
    addPendency,
    removePendency,
    togglePendencyStatus,
    addNote,
    removeNote,
  }), [
    folderTree,
    dashboardStats,
    allPendencies,
    allNotes,
    pendenciesByTopic,
    notesByTopic,
    logsByTopic,
    pendingCountByTopic,
    logsCountByTopic,
    addPendency,
    removePendency,
    togglePendencyStatus,
    addNote,
    removeNote,
  ]);

  return (
    <StudyMonitorDataContext.Provider value={value}>
      {children}
    </StudyMonitorDataContext.Provider>
  );
};

export const StudyMonitorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <StudyMonitorDataProvider>
      <StudyMonitorUIProvider>
        {children}
      </StudyMonitorUIProvider>
    </StudyMonitorDataProvider>
  );
};

export const useStudyMonitorUI = () => {
  const context = useContext(StudyMonitorUIContext);
  if (!context) {
    throw new Error(
      'useStudyMonitorUI deve ser usado dentro de StudyMonitorUIProvider'
    );
  }
  return context;
};

export const useStudyMonitorData = () => {
  const context = useContext(StudyMonitorDataContext);
  if (!context) {
    throw new Error(
      'useStudyMonitorData deve ser usado dentro de StudyMonitorDataProvider'
    );
  }
  return context;
};

export const useStudyMonitor = () => {
  const ui = useStudyMonitorUI();
  const data = useStudyMonitorData();
  if (!ui || !data) {
    throw new Error(
      'useStudyMonitor deve ser usado dentro de StudyMonitorProvider'
    );
  }
  return { ...data, ...ui };
};
