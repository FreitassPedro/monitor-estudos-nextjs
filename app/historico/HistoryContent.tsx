"use client";

import { useState } from "react";
import { DateRange, HistoryDateNav } from "./components/HistoryDateNav";
import { RangeDayTimeline } from "./components/RangeDayTimeline";


export function HistoryContent() {
  const [range, setRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(),
  });

  return (
    <>
      <HistoryDateNav range={range} setRange={setRange} />
      <RangeDayTimeline range={range} />
    </>
  )
}
