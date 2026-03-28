import { getDay } from "date-fns";
import { SubjectColor } from "./components/mockData";

export function getDayName(date: Date): string {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return days[getDay(date)];
}
export const COLOR_MAP: Record<
    SubjectColor,
    { bg: string; text: string; border: string; badge: string }
> = {
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-800 dark:text-emerald-200",
        border: "border-emerald-200 dark:border-emerald-800",
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    },
    blue: {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        text: "text-blue-800 dark:text-blue-200",
        border: "border-blue-200 dark:border-blue-800",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    amber: {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-800 dark:text-amber-200",
        border: "border-amber-200 dark:border-amber-800",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
    rose: {
        bg: "bg-rose-50 dark:bg-rose-950/40",
        text: "text-rose-800 dark:text-rose-200",
        border: "border-rose-200 dark:border-rose-800",
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    },
    violet: {
        bg: "bg-violet-50 dark:bg-violet-950/40",
        text: "text-violet-800 dark:text-violet-200",
        border: "border-violet-200 dark:border-violet-800",
        badge: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    },
    orange: {
        bg: "bg-orange-50 dark:bg-orange-950/40",
        text: "text-orange-800 dark:text-orange-200",
        border: "border-orange-200 dark:border-orange-800",
        badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    },
    teal: {
        bg: "bg-teal-50 dark:bg-teal-950/40",
        text: "text-teal-800 dark:text-teal-200",
        border: "border-teal-200 dark:border-teal-800",
        badge: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    },
    pink: {
        bg: "bg-pink-50 dark:bg-pink-950/40",
        text: "text-pink-800 dark:text-pink-200",
        border: "border-pink-200 dark:border-pink-800",
        badge: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    },
};

