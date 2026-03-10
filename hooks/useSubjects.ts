import { createSubjectAction, getSubjectsAction, getSubjectsWithTopicsAction, updateSubjectAction } from "@/server/actions/subject.actions";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indexSubjectById } from "@/server/normalizers/indexSubject";
import { useAuthStore } from "@/store/useAuthStore";
/***
 * Options
 * 
***/
export const subjectsKeys = {
    all: ["subjects"] as const,
    byUser: (userId?: string) => ["subjects", userId] as const,
    withTopicsByUser: (userId?: string) => ["subjects", "with-topics", userId] as const,
};

export const useSubjectsOptions = (userId?: string) => queryOptions({
    queryKey: subjectsKeys.byUser(userId),
    queryFn: () => getSubjectsAction(userId!),
    enabled: !!userId,
});

export const useSubjectsWithTopicsOptions = (userId?: string) => queryOptions({
    queryKey: subjectsKeys.withTopicsByUser(userId),
    queryFn: () => getSubjectsWithTopicsAction(userId!),
    enabled: !!userId,
});

/***
 * Hooks
 * 
***/
export function useSubjectsMap() {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        ...useSubjectsOptions(userId),
        select: (subjects) => indexSubjectById(subjects),
    });
};


export function useSubjects() {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery(
        useSubjectsOptions(userId)
    );
}

export function useSubjectsWithTopics() {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery(useSubjectsWithTopicsOptions(userId));
}


export function useCreateSubject() {
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.user?.id);

    return useMutation({
        mutationFn: async (newSubject: { name: string; color: string }) => {
            if (!userId) {
                throw new Error("Usuário não selecionado");
            }
            return createSubjectAction({ ...newSubject, userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subjectsKeys.byUser(userId) });
            queryClient.invalidateQueries({ queryKey: subjectsKeys.withTopicsByUser(userId) });
        },
    });
}


export function useUpdateSubject() {
    const queryClient = useQueryClient();
    const userId = useAuthStore((state) => state.user?.id);

    return useMutation({
        mutationFn: async (updatedSubject: { id: string; name: string; color: string }) => {
            if (!userId) {
                throw new Error("Usuário não selecionado");
            }
            return updateSubjectAction({ ...updatedSubject, userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subjectsKeys.byUser(userId) });
            queryClient.invalidateQueries({ queryKey: subjectsKeys.withTopicsByUser(userId) });
        },
    });
}
