"use client";
import { useSubjects } from "@/hooks/useSubjects";
import { useTopicsMap } from "@/hooks/useTopics";


export function SubjectCard({ subjectId }: { subjectId: string }) {

    const { data: topicsMap } = useTopicsMap();
    console.log('topicsMap', topicsMap);

    const topics = 

    console.log('topics', topics);
    return (
        <div>
            <h2>Subject {subjectId}</h2>
            <ul>
                {topics && (
                    <li>{topics.name}</li>
                )}
            </ul>
        </div>
    );
}

export function SubjectList() {

    const { data: subjects } = useSubjects();

    return (
        <div>
            <h1>Materias</h1>
            {subjects?.map(subject => (
                <SubjectCard key={subject.id} subjectId={subject.id} />
            ))}
        </div>
    )
}
