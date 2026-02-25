import { createSubjectAction, getSubjectsAction } from "@/server/actions/subject.actions";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Subject } from "../types/types";
import { indexSubjectById } from "@/server/normalizers/indexSubject";

const userId = "8e4fba66-4d2e-4bb6-8200-c45db7a92f8e"

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
        mutationFn: async (newSubject: { name: string; color: string }) => {
            return createSubjectAction(newSubject);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
    });
}
