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
    incrementSeconds: () => void;
    resetCronometer: () => void;
}

const useSessionFormStore = create<SessionFormState>((set) => ({
    selectedSubject: undefined,
    selectedTopic: undefined,
    cronometer: { isRunning: false, seconds: 0, startTime: null, endTime: null },
    
    setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
    setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
    setCronometer: (cronometer) => set({ cronometer }),
    updateCronometer: (partial) => set((state) => ({
        cronometer: { ...state.cronometer, ...partial }
    })),
    incrementSeconds: () => set((state) => ({
        cronometer: { ...state.cronometer, seconds: state.cronometer.seconds + 1 }
    })),
    resetCronometer: () => set({
        cronometer: { isRunning: false, seconds: 0, startTime: null, endTime: null }
    }),
}));

export default useSessionFormStore;