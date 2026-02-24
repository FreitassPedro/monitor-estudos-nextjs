import { getSubjectsAction } from "@/server/actions/subject.actions";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Subject } from "../types/types";
import { indexSubjectById } from "@/server/normalizers/indexSubject";


const indexSubectsById = (subjects: Subject[]) => {
    return subjects.reduce((acc, subject) => {
        acc[subject.id] = subject;
        return acc;
    }, {} as Record<string, Subject>);
}
/***
 * Options
 * 
***/
export const useSubjectsOptions = queryOptions({
    queryKey: ["subjects"],
    queryFn: getSubjectsAction,
});

/***
 * Hooks
 * 
***/

export function useSubjectsMap() {
    return useQuery({
        ...useSubjectsOptions,
        select: (subjects) => indexSubjectById(subjects),
    });
};


export function useSubjects() {
    return useQuery(
        useSubjectsOptions
    );
}

export function useCreateSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newSubject: Omit<Subject, "id">) => {
            console.log("Creating subject with data:", newSubject);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
    });
}
