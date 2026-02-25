import { RecentSessions } from "./components/RecentSessions";
import { TodaySummary } from "./components/TodaySummary";

export default function DashboardPage() {

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p>Bem-vindo ao dashboard! Aqui você pode gerenciar seus estudos.</p>
            <TodaySummary />
            <RecentSessions  />
        </div>
    );
}