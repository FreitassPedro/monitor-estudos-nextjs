"use client";

import { ProductivityByPeriod } from "./charts/ProductivityByPeriod";
import { StudyAreaChart } from "./charts/StudyAreaChart";
import { StudyHeatmap } from "./charts/StudyHeatmap";
import { StudyPieChart } from "./charts/StudyPieChart";
import { useQuery } from "@tanstack/react-query";
import { getAreaChartACtion, getPieChartDataAction } from "@/server/actions/charts.action";


export const HistoryCharts = ({ range }: { range: { startDate: Date; endDate: Date } }) => {
    // Derived: pie chart data

    const dataPieChart = useQuery({
        queryKey: ['charts', 'pie', range.startDate, range.endDate],
        queryFn: () => getPieChartDataAction(range.startDate, range.endDate),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    const dataAreaChart = useQuery({
        queryKey: ['charts', 'area', range.startDate, range.endDate],
        queryFn: () => getAreaChartACtion(range.startDate, range.endDate),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <StudyAreaChart data={dataAreaChart.data ?? {}} />
                <StudyPieChart data={dataPieChart.data ?? []} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {/* <ProductivityByPeriod logs={logs} /> */}
                {/* <StudyHeatmap range={range} onSelectDate={() => { }} /> */}
            </div>
        </>
    );
}