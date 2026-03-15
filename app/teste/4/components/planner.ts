export type SubjectColor =
  | "emerald"
  | "blue"
  | "amber"
  | "rose"
  | "violet"
  | "orange"
  | "teal"
  | "pink";

export interface StudyBlock {
  id: string;
  subject: string;
  topic?: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: SubjectColor;
  dayIndex: number;  // 0 = Monday ... 6 = Sunday
}

export interface DayData {
  dayIndex: number;
  blocks: StudyBlock[];
}

export interface WeekStats {
  totalMinutes: number;
  totalBlocks: number;
  subjectBreakdown: Record<string, number>; // subject -> minutes
}
