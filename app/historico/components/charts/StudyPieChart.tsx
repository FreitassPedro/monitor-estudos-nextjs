"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

const formatTime = (minutes: number) => {
    if (minutes === 0) return '0min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

interface StudyPieChartProps {
    data: {
        name: string;
        value: number;
        sessions: number;
        color?: string;
    }[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const entry = payload[0].payload;
        return (
            <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                </p>
                <p className="text-muted-foreground mt-1">{formatTime(entry.value)}</p>
                <p className="text-muted-foreground">
                    {entry.sessions} {entry.sessions === 1 ? 'sessão' : 'sessões'}
                </p>
            </div>
        );
    }
    return null;
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x} y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export const StudyPieChart = ({ data }: StudyPieChartProps) => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const hasData = sorted.length > 0 && sorted.some(d => d.value > 0);
    const totalMinutes = sorted.reduce((sum, s) => sum + s.value, 0);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-cyan-500" />
                    Distribuição por Matéria
                </CardTitle>
                <CardDescription>Tempo dedicado a cada área</CardDescription>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                        Sem dados para exibir neste período
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={sorted}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    innerRadius={50}
                                    outerRadius={85}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {sorted.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="space-y-2 mt-3">
                            {sorted.map((subject, index) => {
                                const percentage = totalMinutes > 0
                                    ? ((subject.value / totalMinutes) * 100).toFixed(0)
                                    : '0';
                                return (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <span
                                            className="w-3 h-3 rounded-sm shrink-0"
                                            style={{ backgroundColor: subject.color }}
                                        />
                                        <span className="flex-1 truncate font-medium">{subject.name}</span>
                                        <span className="text-muted-foreground tabular-nums text-xs">
                                            {formatTime(subject.value)}
                                        </span>
                                        <span className="text-muted-foreground tabular-nums text-xs w-8 text-right">
                                            {percentage}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};