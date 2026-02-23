export interface Subject {
    id: string;
    name: string;
}

export interface Topic {
    id: string;
    name: string;
    subjectId: string;
}

export interface StudyLog {
    id: string;
    topicId: string;
    duration: number;
}
