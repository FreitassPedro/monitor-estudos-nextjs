"use client";

import { HistoryDateNav } from "./components/HistoryDateNav";
import { TimelineLogs } from "./components/TimelineLogs";
import { LogsHistory } from "./components/LogsHistory";
import { SummaryCards } from "./components/SummaryCards";
import { HistoryCharts } from "./components/HistoryCharts";


export function HistoryContent() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <HistoryDateNav />
      <SummaryCards />
      <HistoryCharts />
      <TimelineLogs />
      <LogsHistory />
    </div>
  )
}
