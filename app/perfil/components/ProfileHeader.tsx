"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfileStatsAction } from "@/server/actions/user.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRound, Mail } from "lucide-react";

export function ProfileHeader() {
    const user = useAuthStore((state) => state.user);
    const userId = user?.id;

    const { data: stats } = useQuery({
        queryKey: ["profile", "stats", userId],
        queryFn: () => getProfileStatsAction(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });

    const isStudying = stats?.studiedToday ?? false;

    const initials = user?.name
        ? user.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase()
        : user?.email?.[0]?.toUpperCase() ?? "?";

    return (
        <Card>
            <CardContent className="pt-6 pb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                            <span className="text-2xl font-bold text-primary">{initials}</span>
                        </div>
                        <span
                            className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-background ${
                                isStudying ? "bg-green-500" : "bg-muted-foreground/40"
                            }`}
                            title={isStudying ? "Estudou hoje" : "Não estudou hoje"}
                        />
                    </div>

                    {/* User info */}
                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h2 className="text-xl font-semibold">
                                {user?.name || "Usuário"}
                            </h2>
                            <Badge
                                variant={isStudying ? "default" : "secondary"}
                                className={
                                    isStudying
                                        ? "bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/20 w-fit mx-auto sm:mx-0"
                                        : "w-fit mx-auto sm:mx-0"
                                }
                            >
                                {isStudying ? "✦ Estudou hoje" : "Sem sessões hoje"}
                            </Badge>
                        </div>
                        {user?.email && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-center sm:justify-start">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{user.email}</span>
                            </div>
                        )}
                        {!user?.email && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-center sm:justify-start">
                                <UserRound className="h-3.5 w-3.5" />
                                <span>Perfil de usuário</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
