import { createStudyLogAction, getStudyLogsByDateAction, getTodayStudyLogsAction, StudyLogInput } from "@/server/actions/studyLogs.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDay } from "date-fns";

const USER_ID = "440d0b38-58e0-4a56-9f37-96932cfbe3e1";


export const studyLogsByDateQUeryOptions = (startDate: Date, endDate: Date) => ({
    queryKey: ["studyLogs", "range", getDay(startDate), getDay(endDate)],
    queryFn: () => getStudyLogsByDateAction({ startDate, endDate, userId: USER_ID }),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutos
});

export function useCreateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StudyLogInput) => createStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
        },
    });
}

export function useStudyLogsHistory(startDate: Date, endDate: Date) {
    return useQuery(studyLogsByDateQUeryOptions(startDate, endDate));
}


export function useTodayStudyLogs(userId?: string) {
    return useQuery({
        queryKey: ["studyLogs", "today"],
        queryFn: () => getTodayStudyLogsAction(userId || USER_ID),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

export function useStudyLogsRange(startDate: Date, endDate: Date) {
    return useQuery(studyLogsByDateQUeryOptions(startDate, endDate));
}
