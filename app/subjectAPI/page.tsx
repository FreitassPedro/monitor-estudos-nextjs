import { NewSubjectForm } from "@/components/features/subject/SubjectForm";

import { getSubjectsAction, getSubjectsWithTopicsAction } from "@/server/actions/subject.actions";
import { getTopics } from "@/server/actions/topic.action";

export default async function SubjectPageAPI() {
    const subjects = await getSubjectsWithTopicsAction();

    console.log("Fetched subjects:", subjects);

    return (
        <div>Subject API Page

            <h1>Subjects</h1>
            <ul>
                {subjects.map(subject => (
                    <li key={subject.id}>{subject.name}
                        <ul>
                            {subject.topics.map(topic => (
                                <li key={topic.id}>{topic.name}</li>
                            ))}
                        </ul>
                    </li>

                ))}
            </ul>
            <NewSubjectForm />

        </div >

    );

}