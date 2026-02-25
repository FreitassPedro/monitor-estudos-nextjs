import { Suspense } from "react";
import SubjectList from "./SubjectList";
import { NewSubject } from "./components/NewSubject";

export default function MateriasPage() {

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Gerenciar Matérias</h1>
            <NewSubject />
            <Suspense fallback={<p>Carregando matérias...</p>}>
                <SubjectList />
            </Suspense>
        </div>
    );
}
