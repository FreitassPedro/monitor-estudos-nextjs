import { getTopics } from "@/server/actions/topic.action";
import { useQuery } from "@tanstack/react-query";

export function useTopics() {
    return useQuery({
        queryKey: ['topics'],
        queryFn: getTopics,
    });
}

export function useTopicById(topicId: string) {
    return useQuery({
        queryKey: ['topics', topicId],
        queryFn: getTopics,
        select: (topics) => topics.find((topic) => topic.id === topicId),
    });
}

export function useTopicsMap() {
    return useQuery({
        queryKey: ['topics'],
        queryFn: getTopics,
        select: (topics) => {
            return topics.reduce((acc, topic) => {
                acc[topic.id] = topic;
                return acc;
            }
            , {} as Record<string, { id: string, name: string, subjectId: string }>);
        }
    });
}