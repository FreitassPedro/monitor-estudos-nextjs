import { createTopic, getTopicsAction, getTopicsBySubjectAction, deleteTopicAction, updateTopicAction } from "@/server/actions/topic.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";

/// ********************
//
// Options
//
// ********************
export const topicsBySubjectQueryOptions = (subjectId?: string) => ({
    queryKey: ['topics', 'by-subject', subjectId],
    queryFn: () => getTopicsBySubjectAction(subjectId!),
    enabled: !!subjectId,
});

export function useTopics() {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        queryKey: ['topics', userId],
        queryFn: () => getTopicsAction(userId!),
        enabled: !!userId,
        select: (topics) => {
            const topicsMap: Record<string, typeof topics[number]> = {};
            topics.forEach(topic => {
                topicsMap[topic.id] = topic;
            });
            return { topics, topicsMap};
        },
    });
}

export function useTopicsBySubject(subjectId?: string) {
    return useQuery(topicsBySubjectQueryOptions(subjectId));
}

export function useTopicsMap() {
    const { data } = useTopics();
    return { data: data?.topicsMap };
}

export function useCreateTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, subjectId }: { name: string; subjectId: string }) =>
            createTopic(name, subjectId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['topics', 'subject', variables.subjectId] });
        },
    });
}

export function useDeleteTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (topicId: string) => deleteTopicAction(topicId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] });
        },
    });
}

export function useUpdateTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ topicId, name }: { topicId: string; name: string }) =>
            updateTopicAction(topicId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] });
        },
    });
}