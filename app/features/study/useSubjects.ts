import { getSubjects } from "@/app/server/actions/study-actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Subject } from "./types";
import { indexSubjectById } from "@/app/server/normalizers/indexSubject";


export function useSubjectsMap() {
    return useQuery({
        queryKey: ["subjects"],
        queryFn: () => getSubjects(),
        select: indexSubjectById
    })
}

export function useSubjects() {
    return useQuery({
        queryKey: ["subjects"],
        queryFn: getSubjects,
    });
}

