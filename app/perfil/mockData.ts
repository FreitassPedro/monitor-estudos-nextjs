// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ObjectiveType = "Concurso" | "Vestibular" | "Certificação" | "Outro";

export interface MockObjective {
    id: string;
    type: ObjectiveType;
    name: string;
    emoji: string;
    progress: number; // 0–100
    targetDate: string;
}

export interface MockFriend {
    id: string;
    name: string;
    initials: string;
    color: string;
    isStudying: boolean;
    currentSubject?: string;
    streak: number;
}

export interface MockProfileStats {
    totalMinutes: number;
    totalSessions: number;
    totalDays: number;
    currentStreak: number;
    avgSessionMinutes: number;
    longestSessionMinutes: number;
    topSubject: {
        name: string;
        color: string;
        totalMinutes: number;
    };
    subjectsCount: number;
}

// ─────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────

export const MOCK_PROFILE_STATS: MockProfileStats = {
    totalMinutes: 14_400,       // 240 h
    totalSessions: 186,
    totalDays: 93,
    currentStreak: 12,
    avgSessionMinutes: 77,
    longestSessionMinutes: 240,
    topSubject: {
        name: "Direito Constitucional",
        color: "#6366f1",
        totalMinutes: 4_200,   // 70 h
    },
    subjectsCount: 7,
};

export const MOCK_STUDIED_TODAY = true;

export const MOCK_OBJECTIVES: MockObjective[] = [
    {
        id: "o1",
        type: "Concurso",
        name: "CEBRASPE — Analista 2025",
        emoji: "🏛️",
        progress: 62,
        targetDate: "Nov 2025",
    },
    {
        id: "o2",
        type: "Vestibular",
        name: "ENEM 2025",
        emoji: "🎓",
        progress: 38,
        targetDate: "Nov 2025",
    },
    {
        id: "o3",
        type: "Certificação",
        name: "OAB — 1ª Fase",
        emoji: "⚖️",
        progress: 75,
        targetDate: "Ago 2025",
    },
];

export const MOCK_FRIENDS: MockFriend[] = [
    {
        id: "f1",
        name: "Ana Silva",
        initials: "AS",
        color: "#10b981",
        isStudying: true,
        currentSubject: "Matemática",
        streak: 8,
    },
    {
        id: "f2",
        name: "Carlos Mendes",
        initials: "CM",
        color: "#6366f1",
        isStudying: false,
        streak: 3,
    },
    {
        id: "f3",
        name: "Julia Santos",
        initials: "JS",
        color: "#f59e0b",
        isStudying: true,
        currentSubject: "Química",
        streak: 21,
    },
    {
        id: "f4",
        name: "Rafael Lima",
        initials: "RL",
        color: "#ec4899",
        isStudying: true,
        currentSubject: "Direito Penal",
        streak: 5,
    },
    {
        id: "f5",
        name: "Bruna Costa",
        initials: "BC",
        color: "#14b8a6",
        isStudying: false,
        streak: 0,
    },
];
