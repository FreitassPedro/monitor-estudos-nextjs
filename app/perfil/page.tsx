"use client";

import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileStats } from "./components/ProfileStats";
import { StudyGoalCard } from "./components/StudyGoalCard";
import { ObjectivesCard } from "./components/ObjectivesCard";
import { FriendsCard } from "./components/FriendsCard";

export default function ProfilePage() {
    return (
        <div className="container mx-auto p-4 space-y-5 max-w-4xl">
            <h1 className="text-2xl font-bold">Perfil</h1>

            <ProfileHeader />

            <ProfileStats />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ObjectivesCard />
                <FriendsCard />
            </div>

            <StudyGoalCard />
        </div>
    );
}

