/*
  Arquivo de MOCK
*/

interface Topic {
  id: string;
  name: string;
  status: "Fraca" | "Médio" | "Confiante";
}

export interface Pendency {
  id: string;
  text: string;
  resolved: boolean;
  createdAt: Date;
  topicId: string;
  studyLogId: string;
}

export const subjectMock: { id: string; name: string }[] = [
  { id: "1", name: "Computação" },
  { id: "2", name: "Biologia" },
  { id: "3", name: "Física" }
];

// --- Mock de Dados para Testes ---
// Programação/
//  Web/
//   REST/
//   API/
//  Java/
//   SPRING/
const topicMock: Topic[] = [
  { id: "1", name: "programação", status: "Médio" },
  { id: "3", name: "REST", status: "Fraca" },
  { id: "4", name: "API", status: "Confiante" },
  { id: "2", name: "Web", status: "Médio" },
  { id: "5", name: "Java", status: "Fraca" },
  { id: "6", name: "Spring", status: "Confiante" }
];

export interface TopicNode {
  id: string;
  name: string;
  children: TopicNode[];
};

export interface StudyLog {
  id: string;
  subjectId: string;
  topicId: string;
  notes?: string;
  durationMinutes: number;
  date: string; // ISO format
}



// ────────────────────────────────────────────────────────────
// Sample Data
// ────────────────────────────────────────────────────────────
export const SUBJECTS_MOCK: { id: string; name: string }[] = [
  { id: "1", name: "Computação" },
  { id: "2", name: "Biologia" },
  { id: "3", name: "Física" }
];

export const TOPICS_MOCK: TopicNode[] = [
  {
    id: "1",
    name: "Programação",
    children: [
      {
        id: "2",
        name: "Web",
        children: [
          { id: "3", name: "REST", children: [] },
          { id: "4", name: "API", children: [] }
        ]
      },
      { id: "5", name: "Java", children: [] },
      { id: "6", name: "Spring", children: [] }
    ]
  },
  {
    id: "7",
    name: "Biologia",
    children: [
      {
        id: "8",
        name: "Citologia",
        children: [
          { id: "9", name: "Célula Animal", children: [] },
          { id: "10", name: "Célula Vegetal", children: [] },
          {
            id: "11",
            name: "Divisão Celular",
            children: [
              { id: "12", name: "Mitose", children: [] },
              { id: "13", name: "Meiose", children: [] }
            ]
          }
        ]
      },
      {
        id: "14",
        name: "Genética",
        children: [
          { id: "15", name: "Mendelismo", children: [] },
        ]
      }
    ]
  },
  {
    id: "16",
    name: "Física",
    children: [
      {
        id: "17",
        name: "Física",
        children: [
          { id: "18", name: "Cinemática", children: [] },
          { id: "19", name: "Termodinâmica", children: [] },
          { id: "20", name: "Óptica", children: [] }
        ]
      }
    ]
  }
];

export const PENDENCIES_MOCK: Pendency[] = [
  { id: "1", text: "Rever conceitos de REST", resolved: false, createdAt: new Date("2026-03-10"), topicId: "3", studyLogId: "log1" },
  { id: "2", text: "Praticar mais exercícios de API", resolved: true, createdAt: new Date("2026-03-09"), topicId: "4", studyLogId: "log2" },
  { id: "3", text: "Rever sintaxe de Java", resolved: false, createdAt: new Date("2026-03-08"), topicId: "5", studyLogId: "log3" }
];

export const mockJsonTopicTree: { id: string; name: string; color: string, topics: TopicNode[] }[] = [
  {
    "id": "1",
    "name": "Computação",
    "color": "#4F46E5",
    "topics": [
      {
        "id": "1",
        "name": "Programação",
        "children": [
          {
            "id": "2",
            "name": "Web",
            "children": [
              { "id": "3", "name": "REST", "children": [] },
              { "id": "4", "name": "API", "children": [] }
            ]
          },
          { "id": "5", "name": "Java", "children": [] }
        ]
      },
    ]
  },
  {
    "id": "2",
    "name": "Biologia",
    "color": "#16A34A",
    "topics": [
      {
        "id": "6",
        "name": "Citologia",
        "children": [
          { "id": "7", "name": "Célula Animal", "children": [] },
          { "id": "9", "name": "Célula Vegetal", "children": [] },
          {
            "id": "10", "name": "Divisão Celular", "children": [
              { "id": "11", "name": "Mitose", "children": [] },
              { "id": "12", "name": "Meiose", "children": [] }
            ]
          }
        ]
      },
      {
        "id": "7",
        "name": "Genética",
        "children": [
          { "id": "13", "name": "Mendelismo", "children": [] },
        ]
      }
    ]
  },
  {
    "id": "3",
    "name": "Física",
    "color": "#DC2626",
    "topics": [
      {
        "id": "14",
        "name": "Física",
        "children": [
          {
            "id": "15", "name": "Cinemática", "children": []
          },
          { "id": "16", "name": "Termodinâmica", "children": [] },
          { "id": "17", "name": "Óptica", "children": [] }
        ]
      }
    ]
  }
];



export const mockStudyLogs: StudyLog[] = [
  { "id": "1", "subjectId": "1", "topicId": "1", "durationMinutes": 45, "date": "2026-03-11", notes: "Estudei conceitos básicos de programação e lógica." },
  { "id": "2", "subjectId": "1", "topicId": "2", "durationMinutes": 30, "date": "2026-03-10", notes: "Estudei fundamentos de web development." },
  { "id": "3", "subjectId": "1", "topicId": "2", "durationMinutes": 60, "date": "2026-03-09", notes: "Pratiquei conceitos de REST API." },
  { "id": "4", "subjectId": "1", "topicId": "3", "durationMinutes": 20, "date": "2026-03-08", notes: "Estudei introdução à programação." }
];

export const mockJsonDashboardStats = {
  "totalStudyMinutes": 320,
  "topSubjects": [
    { "topicId": "1", "topicName": "Programação", "totalMinutes": 320 },
    { "topicId": "2", "topicName": "Web", "totalMinutes": 200 },
    { "id": "5", "topicName": "Java", "totalMinutes": 120 }
  ],
  "recentLogs": [
    { "id": "101", "topicId": "4", "topicName": "API", "duration": 120, "date": "2026-03-11" },
    { "id": "102", "topicId": "3", "topicName": "REST", "duration": 80, "date": "2026-03-10" },
    { "id": "103", "topicId": "5", "topicName": "Java", "duration": 120, "date": "2026-03-09" }
  ]
};