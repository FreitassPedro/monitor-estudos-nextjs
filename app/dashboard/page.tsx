import { Suspense } from "react";
import { RecentSessions } from "./components/RecentSessions";
import { TodaySummary } from "./components/TodaySummary";
import { TodayTimeline } from "../nova-sessao/components/TodayTimeline";
import { TodaySummarySkeleton, RecentSessionsSkeleton } from "./components/Skeletons";

export default function DashboardPage() {

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p>Bem-vindo ao dashboard! Aqui você pode gerenciar seus estudos.</p>
            <Suspense fallback={<TodaySummarySkeleton />}>
                <TodaySummary />
            </Suspense>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="h-max">
                    <RecentSessions />
                </div>
                    <TodayTimeline />


            </div>
        </div>
    );
}