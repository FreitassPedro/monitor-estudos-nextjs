"use client";
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudyLogs } from '@/hooks/useStudyLogs';
import { type StudyLog } from '@/types/studyLog';
import type { DateRange } from '../HistoryDateNav';

interface StudyHeatmapProps {
  range: DateRange;
  onSelectDate: (date: Date) => void;
}

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
  return days;
};

const getHeatmapColor = (minutes: number) => {
  if (minutes === 0) return 'bg-zinc-100 dark:bg-zinc-800';
  if (minutes < 60) return 'bg-emerald-200 dark:bg-emerald-900';
  if (minutes < 120) return 'bg-emerald-400 dark:bg-emerald-700';
  if (minutes < 180) return 'bg-emerald-500 dark:bg-emerald-600';
  return 'bg-emerald-700 dark:bg-emerald-500';
};

const getHeatmapTextColor = (minutes: number) => {
  if (minutes >= 120) return 'text-white';
  return 'text-foreground';
};

const formatTime = (minutes: number) => {
  if (minutes === 0) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function StudyHeatmap({ range, onSelectDate }: StudyHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const { data: allLogs = [] } = useStudyLogs();

  // Build a map: "YYYY-MM-DD" -> total minutes for the displayed month
  const minutesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    allLogs.forEach((log: StudyLog) => {
      const dateStr = typeof log.study_date === 'string'
        ? (log.study_date as string).split('T')[0]
        : new Date(log.study_date).toISOString().split('T')[0];
      map[dateStr] = (map[dateStr] || 0) + log.duration_minutes;
    });
    return map;
  }, [allLogs]);

  const getMinutesForDate = (date: Date | null) => {
    if (!date) return 0;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return minutesByDate[key] || 0;
  };

  const days = getDaysInMonth(currentMonth);

  const changeMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  const isInRange = (date: Date | null) => {
    if (!date) return false;
    const d = date.getTime();
    const start = new Date(range.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range.endDate);
    end.setHours(23, 59, 59, 999);
    return d >= start.getTime() && d <= end.getTime();
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Monthly total for the displayed month
  const monthTotal = useMemo(() => {
    let total = 0;
    days.forEach(d => { total += getMinutesForDate(d); });
    return total;
  }, [days, minutesByDate]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-violet-500" />
          Calendário de Atividades
        </CardTitle>
        <CardDescription>
          {monthTotal > 0
            ? `${formatTime(monthTotal)} estudados em ${currentMonth.toLocaleDateString('pt-BR', { month: 'long' })}`
            : 'Clique em um dia para ver detalhes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm capitalize">
              {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-[10px] font-medium text-muted-foreground pb-1">
                {day}
              </div>
            ))}

            {/* Day cells */}
            {days.map((date, index) => {
              const minutes = getMinutesForDate(date);
              const inRange = isInRange(date);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => date && onSelectDate(date)}
                  disabled={!date}
                  className={`
                    aspect-square rounded-md transition-all text-[11px] font-medium
                    flex items-center justify-center relative
                    ${date ? getHeatmapColor(minutes) : 'bg-transparent'}
                    ${date ? getHeatmapTextColor(minutes) : ''}
                    ${inRange ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                    ${today ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-background' : ''}
                    ${date ? 'hover:scale-110 cursor-pointer' : ''}
                  `}
                  title={date ? `${date.getDate()}/${date.getMonth() + 1} — ${formatTime(minutes)}` : ''}
                >
                  {date?.getDate()}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t">
            <span className="text-[10px] text-muted-foreground">Menos</span>
            <div className="flex gap-1">
              {[0, 60, 120, 180, 240].map((mins, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-sm ${getHeatmapColor(mins)}`} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">Mais</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
