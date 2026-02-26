import { prisma } from "@/lib/prisma";
import { createStudyLogAction, getStudyLogsByDateAction, getStudyLogsByDateRangeAction, getTodayStudyLogsAction, StudyLogInput } from "@/server/actions/studyLogs.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDay } from "date-fns";

const USER_ID = "8e4fba66-4d2e-4bb6-8200-c45db7a92f8e";


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
