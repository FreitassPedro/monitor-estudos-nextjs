import { createTopic, getTopicsBySubjectAction } from "@/server/actions/topic.action";
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

// useTopics, useTopicById, useTopicsMap are unused since getTopics now requires userId.
// Use useTopicsBySubject instead.
export function useTopicsBySubject(subjectId?: string) {
    return useQuery(topicsBySubjectQueryOptions(subjectId));
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