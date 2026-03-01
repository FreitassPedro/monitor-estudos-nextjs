"use client";
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';

import { type DateRange as CalendarDateRange } from "react-day-picker";

import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import useSearchRangeStore from '@/store/useSearchRangeStore';

export type RangeType = 'day' | 'week' | 'month' | 'custom';

export function HistoryDateNav() {

    const { startDate, endDate, setRange } = useSearchRangeStore();
    const range = { startDate, endDate };

    const [isOpenPicker, setIsOpenPicker] = useState(false);
    const [pickingRange, setPickingRange] = useState<CalendarDateRange>({ from: range.startDate, to: range.endDate });
    const [rangeType, setRangeType] = useState<RangeType>('day');

    const handleRangeTypeChange = (type: string) => {
        const newType = type as RangeType;
        setRangeType(newType);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (type) {
            case 'day':
                setRange({ startDate: today, endDate: today });
                break;
            case 'week':
                setIsOpenPicker(false);
                setRange({
                    startDate: startOfWeek(today, { weekStartsOn: 0 }),
                    endDate: endOfWeek(today, { weekStartsOn: 0 }),
                });
                break;
            case 'month':
                setIsOpenPicker(false);
                setRange({
                    startDate: startOfMonth(today),
                    endDate: endOfMonth(today),
                });
                break;
            case 'custom':
                setIsOpenPicker(true);
                break;
        }
    };

    const navigate = (direction: -1 | 1) => {
        const { startDate } = range;
        let newStart: Date;
        let newEnd: Date;

        switch (rangeType) {
            case 'day':
                newStart = direction === 1 ? addDays(startDate, 1) : subDays(startDate, 1);
                newEnd = newStart;
                break;
            case 'week':
                newStart = direction === 1 ? addWeeks(startDate, 1) : subWeeks(startDate, 1);
                newEnd = endOfWeek(newStart, { weekStartsOn: 0 });
                break;
            case 'month':
                newStart = direction === 1 ? addMonths(startDate, 1) : subMonths(startDate, 1);
                newEnd = endOfMonth(newStart);
                break;
        }

        setRange({ startDate: newStart, endDate: newEnd });
    };

    const getDisplayLabel = () => {
        const { startDate, endDate } = range;

        switch (rangeType) {
            case 'day':
                return format(startDate, "d 'de' MMMM, yyyy", { locale: ptBR });
            case 'week':
                return `${format(startDate, 'd MMM', { locale: ptBR })} – ${format(endDate, "d MMM, yyyy", { locale: ptBR })}`;
            case 'month':
                return format(startDate, "MMMM 'de' yyyy", { locale: ptBR });
            default:
                return `${format(startDate, 'd MMM yyyy', { locale: ptBR })} – ${format(endDate, 'd MMM yyyy', { locale: ptBR })}`;
        }
    };


    const onPickingCalendarChange = (selected: CalendarDateRange | undefined) => {
        // Clear calendar first
        console.log("Picking range changed:", selected);
        if (!selected) {
            setPickingRange(undefined);
            return;
        }

        // Pick first date
        if (!selected?.from && !selected.to) {
            setPickingRange({ from: selected.from, to: undefined });
            return;
        }

        // Pick second date
        if (selected?.from && !selected.to) {
            setPickingRange({ from: selected.from, to: selected.to });
            return;
        }

        // close Calendar and trigger onRangeChange
        if (pickingRange?.from && pickingRange?.to) {
            setRange({ startDate: pickingRange.from, endDate: pickingRange.to });
            setPickingRange(undefined);
            setIsOpenPicker(false);
        }
    };


    const isToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(range.startDate);
        start.setHours(0, 0, 0, 0);
        return start.getTime() === today.getTime() && rangeType === 'day';
    };

    const handleOpenCalendarPicker = () => {
        setIsOpenPicker(true);
    }


    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-card border rounded-lg">
            <Tabs value={rangeType} onValueChange={handleRangeTypeChange}>
                <TabsList >
                    <TabsTrigger className='cursor-pointer' value="day">Dia</TabsTrigger>
                    <TabsTrigger className='cursor-pointer' value="week">Semana</TabsTrigger>
                    <TabsTrigger className='cursor-pointer' value="month">Mês</TabsTrigger>
                    <TabsTrigger className='cursor-pointer bg-primary/40 text-secondary' value="custom">
                        <div onClick={handleOpenCalendarPicker} className=''>
                            Personalizado
                        </div>
                    </TabsTrigger>
                </TabsList>
                {isOpenPicker && (
                    <div className="absolute z-10">
                        <Card className="mx-auto w-fit p-0">
                            <CardContent className="p-0">
                                <Calendar
                                    mode="range"
                                    defaultMonth={range.startDate}
                                    selected={pickingRange}
                                    onSelect={setPickingRange}
                                    required
                                />
                            </CardContent>
                            <Button variant="secondary" size="sm" className="m-2" onClick={() => {
                                setRange({ startDate: pickingRange?.from || range.startDate, endDate: pickingRange?.to || range.endDate });
                                setIsOpenPicker(false);
                            }}>
                                Buscar
                                <Search className="h-4 w-4" />
                            </Button>
                        </Card>
                    </div>
                )}
            </Tabs>

            <div className="flex items-center gap-1.5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="h-8 w-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium  justify-center">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{getDisplayLabel()}</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(1)}
                    className="h-8 w-8"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {!isToday() && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-1 h-7 text-xs"
                        onClick={() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            setRange({ startDate: today, endDate: today });
                        }}
                    >
                        Retornar Hoje
                    </Button>
                )}
            </div>
        </div >
    );
}
