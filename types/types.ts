export interface Subject {
    id: string;
    name: string;
    color: string;
}

export interface Topic {
    id: string;
    name: string;
    subjectId: string;
}

export interface StudyLog {
    id: string;
    start_time: string | Date;
    end_time: string | Date;
    notes?: string | null;
    topicId: string;
    duration: number;
}


export interface SessionForm {
    subject?: Subject;
    topic?: Topic;
    startTime?: string;
    endTime?: string;
    notes?: string;
}