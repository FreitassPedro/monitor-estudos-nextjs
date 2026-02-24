import { NewSubjectForm } from "@/components/features/subject/SubjectForm";
import { getSubjectsAction } from "@/server/actions/subject.actions";
import { SubjectList } from "./SubjectList";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { useSubjectsOptions } from "@/hooks/useSubjects";


export default async function SubjectsPage() {

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(useSubjectsOptions);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold   text-foreground mb-6">Gerenciar Matérias</h1>
                <SubjectList />
            </div>
        </HydrationBoundary>
    );
};

