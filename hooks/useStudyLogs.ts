import { createStudyLogAction, StudyLogInput } from "@/server/actions/studyLogs.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StudyLogInput) => createStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
        },
    });
}
