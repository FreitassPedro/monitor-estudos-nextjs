"use client";
import React, { Suspense } from "react";
import { SessionSidebar } from "./components/SessionSidebar";
import { StudySessionForm } from "./components/StudySessionForm";
import { TodayTimeline } from "./components/TodayTimeline";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";

export default function NovaSessaoPage() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div >
            <div className="flex flex-row min-h-screen my-4">
                <main className="flex-1 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                    <StudySessionForm />
                    <Suspense fallback={<div className="p-4">Carregando timeline...</div>}>
                        <TodayTimeline />
                    </Suspense>
                </main>
                {/* Sidebar - Hidden on mobile, visible on lg+ */}
                <aside className={`
                    fixed lg:static bottom-0 left-0 right-0 top-auto lg:top-auto
                    w-full lg:w-72 h-auto lg:h-screen
                    bg-card border-t lg:border-t-0 lg:border-l border-border
                    flex flex-col
                    transform transition-transform duration-300
                    lg:translate-y-0 lg:z-0 z-40
                    ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
                `}>
                    <div className='lg:hidden flex items-center justify-between p-4 border-b border-border'>
                        <h3 className="text-sm font-semibold">Histórico da Matéria</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <SessionSidebar />
                </aside>
                <Button
                    variant="outline"
                    size="icon"
                    className='lg:hidden fixed bottom-6 right-6 w-12 h-12 z-50 rounded-full shadow-lg'
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <History className="w-12 h-12" />
                </Button>

            </div>
        </div>
    );
}