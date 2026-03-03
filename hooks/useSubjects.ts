import { createSubjectAction, getSubjectsAction } from "@/server/actions/subject.actions";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Subject } from "../types/types";
import { indexSubjectById } from "@/server/normalizers/indexSubject";

const userId = "440d0b38-58e0-4a56-9f37-96932cfbe3e1"

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


export function useUpdateSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updatedSubject: { id: string; name: string; color: string }) => {
            return createSubjectAction(updatedSubject);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
    });
}
