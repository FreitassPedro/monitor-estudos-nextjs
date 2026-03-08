import { Subject, Topic } from '@/types/types';
import { create } from 'zustand';

interface Cronometer {
    isRunning: boolean;
    seconds: number;
    startTime: Date | null;
    endTime: Date | null;
}

interface SessionFormState {
    selectedSubject?: Subject | undefined;
    selectedTopic?: Topic | undefined;
    cronometer: Cronometer;
    
    setSelectedSubject: (selectedSubject: Subject | undefined) => void;
    setSelectedTopic: (selectedTopic: Topic | undefined) => void;
    setCronometer: (cronometer: Cronometer) => void;
    updateCronometer: (partial: Partial<Cronometer>) => void;
    startTicking: () => void;
    stopTicking: () => void;
    resetCronometer: () => void;
}

let tickIntervalId: ReturnType<typeof setInterval> | null = null;

const useSessionFormStore = create<SessionFormState>((set, get) => ({
    selectedSubject: undefined,
    selectedTopic: undefined,
    cronometer: { isRunning: false, seconds: 0, startTime: null, endTime: null },
    
    setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
    setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
    setCronometer: (cronometer) => set({ cronometer }),
    updateCronometer: (partial) => set((state) => ({
        cronometer: { ...state.cronometer, ...partial }
    })),
    startTicking: () => {
        if (tickIntervalId) return;

        const tick = () => {
            const { cronometer } = get();
            if (!cronometer.startTime) return;
            const elapsed = Math.floor(
                (Date.now() - new Date(cronometer.startTime).getTime()) / 1000
            );
            set((state) => ({
                cronometer: { ...state.cronometer, seconds: elapsed }
            }));
        };

        tick();
        tickIntervalId = setInterval(tick, 1000);
    },
    stopTicking: () => {
        if (tickIntervalId) {
            clearInterval(tickIntervalId);
            tickIntervalId = null;
        }
    },
    resetCronometer: () => {
        if (tickIntervalId) {
            clearInterval(tickIntervalId);
            tickIntervalId = null;
        }
        set({
            cronometer: { isRunning: false, seconds: 0, startTime: null, endTime: null }
        });
    },
}));

export default useSessionFormStore;