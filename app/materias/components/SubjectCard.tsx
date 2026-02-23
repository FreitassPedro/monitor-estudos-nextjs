import { Subject } from "@/app/features/study/types";

export function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <div>
      <h2>{subject.name}</h2>
    </div>
  );
}