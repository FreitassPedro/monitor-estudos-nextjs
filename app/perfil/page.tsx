"use client";

import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileStats } from "./components/ProfileStats";
import { StudyGoalCard } from "./components/StudyGoalCard";

export default function ProfilePage() {
    return (
        <div className="container mx-auto p-4 space-y-6 max-w-4xl">
            <h1 className="text-3xl font-bold">Perfil</h1>

            <ProfileHeader />

            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Estatísticas Gerais</h2>
                <ProfileStats />
            </div>

            <StudyGoalCard />
        </div>
    );
}
