import { Subject, Topic } from '@/types/types';
import { create } from 'zustand';


interface SessionFormState {
    selectedSubject?: Subject | undefined;
    selectedTopic?: Topic | undefined;
    setSelectedSubject: (selectedSubject: Subject | undefined) => void;
    setSelectedTopic: (selectedTopic: Topic | undefined) => void;
}

const useSessionFormStore = create<SessionFormState>((set) => ({
    selectedSubject: undefined,
    selectedTopic: undefined,
    setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
    setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
}));

export default useSessionFormStore;