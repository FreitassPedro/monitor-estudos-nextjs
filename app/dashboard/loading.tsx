import { TodaySummarySkeleton, RecentSessionsSkeleton, SkeletonBoxComponent } from "./components/Skeletons";

export default function DashboardLoading() {
    return (
        <div className="container mx-auto p-4 space-y-6">
            <SkeletonBoxComponent className="h-9 w-36" />
            <SkeletonBoxComponent className="h-4 w-72" />
            <TodaySummarySkeleton />
            <RecentSessionsSkeleton />
        </div>
    );
}
