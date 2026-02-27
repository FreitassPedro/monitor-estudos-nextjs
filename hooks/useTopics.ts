import { createTopic, getTopicsAction, getTopicsBySubjectAction } from "@/server/actions/topic.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    return useQuery({
        queryKey: ['topics'],
        queryFn: () => getTopicsAction(),
        select: (topics) => {
            const topicsMap: Record<string, string> = {};
            topics.forEach(topic => {
                topicsMap[topic.id] = topic.name;
            });
            return { topics, topicsMap};
        },
    });
}

export function useTopicsBySubject(subjectId?: string) {
    return useQuery(topicsBySubjectQueryOptions(subjectId));
}

export function useTopicsMap(subjectId?: string) {
    const { data } = useTopics();
    return data?.topicsMap || {};
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