"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Mail } from "lucide-react";
import { MOCK_PROFILE_STATS, MOCK_STUDIED_TODAY } from "../mockData";

export function ProfileHeader() {
    const user = useAuthStore((state) => state.user);

    const initials = user?.name
        ? user.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase()
        : user?.email?.[0]?.toUpperCase() ?? "?";

    const streak = MOCK_PROFILE_STATS.currentStreak;

    return (
        <Card className="overflow-hidden">
            {/* Color bar accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-primary to-cyan-500" />
            <CardContent className="pt-6 pb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-primary flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white">{initials}</span>
                        </div>
                        <span
                            className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-background ${
                                MOCK_STUDIED_TODAY ? "bg-green-500" : "bg-muted-foreground/40"
                            }`}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h2 className="text-xl font-semibold">{user?.name || "Usuário"}</h2>
                            <Badge
                                variant="secondary"
                                className={
                                    MOCK_STUDIED_TODAY
                                        ? "bg-green-500/15 text-green-600 border border-green-500/30 w-fit mx-auto sm:mx-0"
                                        : "w-fit mx-auto sm:mx-0"
                                }
                            >
                                {MOCK_STUDIED_TODAY ? "✦ Estudou hoje" : "Sem sessões hoje"}
                            </Badge>
                        </div>

                        {user?.email && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-center sm:justify-start">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{user.email}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 text-sm font-medium text-orange-500 justify-center sm:justify-start">
                            <Flame className="h-4 w-4" />
                            <span>
                                {streak} dia{streak !== 1 ? "s" : ""} em sequência
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

