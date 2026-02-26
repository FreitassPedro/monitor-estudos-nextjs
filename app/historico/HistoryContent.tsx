"use client";

import { useState } from "react";
import { DateRange, HistoryDateNav } from "./components/HistoryDateNav";
import { RangeDayTimeline } from "./components/RangeDayTimeline";
import { LogsHistory } from "./components/LogsHistory";


export function HistoryContent() {
  const [range, setRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(),
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <HistoryDateNav range={range} setRange={setRange} />
      <RangeDayTimeline range={range} />
      <LogsHistory />
    </div>
  )
}
