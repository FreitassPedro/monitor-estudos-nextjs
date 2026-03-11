"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
import { MOCK_OBJECTIVES } from "../mockData";

const objectiveColors: Record<string, { bar: string; badge: string }> = {
    Concurso: { bar: "bg-violet-500", badge: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
    Vestibular: { bar: "bg-cyan-500", badge: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
    Certificação: { bar: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    Outro: { bar: "bg-muted-foreground", badge: "bg-muted text-muted-foreground border-border" },
};

export function ObjectivesCard() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-violet-500/10">
                        <Flag className="h-4 w-4 text-violet-500" />
                    </div>
                    <CardTitle className="text-base">Objetivos</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {MOCK_OBJECTIVES.map((obj) => {
                    const colors = objectiveColors[obj.type] ?? objectiveColors.Outro;
                    return (
                        <div key={obj.id} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base">{obj.emoji}</span>
                                    <span className="text-sm font-medium truncate">{obj.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge
                                        variant="outline"
                                        className={`text-xs px-1.5 py-0 border ${colors.badge}`}
                                    >
                                        {obj.type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono w-8 text-right">
                                        {obj.progress}%
                                    </span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${colors.bar} transition-all`}
                                    style={{ width: `${obj.progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Meta: {obj.targetDate}</p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
