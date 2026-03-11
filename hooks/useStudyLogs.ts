import { createStudyLogAction, deleteStudyLogAction, getStudyLogsByDateAction, getSummaryStatsAction, getTodayStudyLogsAction, StudyLogInput, updateStudyLogAction, UpdateStudyLogInput } from "@/server/actions/studyLogs.action";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDay } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";

export const studyLogsByDateQUeryOptions = (startDate: Date, endDate: Date, userId?: string) => ({
    queryKey: ["studyLogs", "range", getDay(startDate), getDay(endDate), userId],
    queryFn: () => getStudyLogsByDateAction({ startDate, endDate, userId: userId! }),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutos
});

export const summaryStatsQueryOptions = (startDate: Date, endDate: Date, userId?: string) => ({
    queryKey: ["summaryStats", "range", getDay(startDate), getDay(endDate), userId],
    queryFn: () => getSummaryStatsAction(startDate, endDate, userId!),
    enabled: !!startDate && !!endDate && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
});

export function useCreateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StudyLogInput) => createStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
            queryClient.invalidateQueries({ queryKey: ["summaryStats"] });
            queryClient.invalidateQueries({ queryKey: ["charts"] });
        },
    });
}

export function useUpdateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateStudyLogInput) => updateStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
            queryClient.invalidateQueries({ queryKey: ["summaryStats"] });
            queryClient.invalidateQueries({ queryKey: ["charts"] });
        },
    });
}

export function useDeleteStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteStudyLogAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
            queryClient.invalidateQueries({ queryKey: ["summaryStats"] });
            queryClient.invalidateQueries({ queryKey: ["charts"] });
        },
    });
}

export function useStudyLogsHistory(startDate: Date, endDate: Date) {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        ...studyLogsByDateQUeryOptions(startDate, endDate, userId),
        enabled: !!userId,
    });
}


export function useTodayStudyLogs() {
    const userId = useAuthStore((state) => state.user?.id);
    // Compute the local date string on the client to avoid UTC offset issues on the server.
    // The server runs in UTC+0 but Brazilian users are UTC-3; without the local date,
    // queries made after 21:00 local time would return the wrong day.
    // Note: toISOString() returns UTC date and must NOT be used here.
    const localDateStr = useMemo(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }, []);

    return useQuery({
        queryKey: ["studyLogs", "today", userId],
        queryFn: () => getTodayStudyLogsAction(userId!, localDateStr),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

export function useStudyLogsRange(startDate: Date, endDate: Date) {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        ...studyLogsByDateQUeryOptions(startDate, endDate, userId),
        enabled: !!userId,
    });
}

export function useSummaryStats(startDate: Date, endDate: Date) {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        ...summaryStatsQueryOptions(startDate, endDate, userId),
        enabled: !!userId,
    });
}
