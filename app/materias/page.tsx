

import { Subject } from "../features/study/types";
import { useSubjects, useSubjectsMap } from "../features/study/useSubjects";
import { getSubjects } from "../server/actions/study-actions";
import { SubjectCard } from "./components/SubjectCard";

export default async function MateriasPage() {

  const subjects = await getSubjects();

  return (
    <div>
      <h1>Materias</h1>
      {subjects?.map((subject) => (
        <SubjectCard key={subject.id} subject={subject} />
      ))}

    </div>
  );
}

