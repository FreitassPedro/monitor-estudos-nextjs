import { RecentSessions } from "./components/RecentSessions";
import { TodaySummary } from "./components/TodaySummary";

export default function DashboardPage() {

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard! Here you can manage your subjects and topics.</p>
            <TodaySummary />
            <RecentSessions />
        </div>
    );
}