"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Users } from "lucide-react";
import { MOCK_FRIENDS } from "../mockData";

export function FriendsCard() {
    const studying = MOCK_FRIENDS.filter((f) => f.isStudying);
    const offline = MOCK_FRIENDS.filter((f) => !f.isStudying);
    const sorted = [...studying, ...offline];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-cyan-500/10">
                            <Users className="h-4 w-4 text-cyan-500" />
                        </div>
                        <CardTitle className="text-base">Amigos</CardTitle>
                    </div>
                    {studying.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                            {studying.length} estudando
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {sorted.map((friend) => (
                    <div
                        key={friend.id}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                            friend.isStudying ? "bg-green-500/5" : "bg-muted/30"
                        }`}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: friend.color }}
                            >
                                {friend.initials}
                            </div>
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                                    friend.isStudying ? "bg-green-500" : "bg-muted-foreground/30"
                                }`}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{friend.name}</p>
                            {friend.isStudying && friend.currentSubject ? (
                                <p className="text-xs text-green-600 truncate">
                                    Estudando {friend.currentSubject}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">Offline</p>
                            )}
                        </div>

                        {/* Streak */}
                        {friend.streak > 0 && (
                            <div className="flex items-center gap-0.5 text-xs text-orange-500 shrink-0">
                                <Flame className="h-3 w-3" />
                                <span>{friend.streak}</span>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
