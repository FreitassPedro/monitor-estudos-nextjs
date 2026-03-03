"use client";

import { BookOpen, Plus, History, FolderOpen, CheckSquare, CalendarClock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BookOpen, isEnabled: true },
    { href: '/nova-sessao', label: 'Nova Sessão', icon: Plus, isEnabled: true },
    { href: '/historico', label: 'Histórico', icon: History, isEnabled: true },
    { href: '/materias', label: 'Matérias', icon: FolderOpen, isEnabled: true },
    { href: '/', label: 'Tarefas', icon: CheckSquare, isEnabled: false },
    { href: '/', label: 'Revisões', icon: CalendarClock, isEnabled: false },
    { href: '/', label: 'Ciclos', icon: CalendarClock, isEnabled: false },
];

export default function MainNavbar() {
    const pathname = usePathname();
    const { user, clearUser } = useAuthStore();

    return (
        <header>
            <nav className="border-b border-border bg-card">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <span className="text-xl font-semibold text-foreground text-nowrap">Monitor de Estudos</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                if (!item.isEnabled) {
                                    return (
                                        <Button variant="ghost" size="sm" key={item.label} disabled className=" cursor-not-allowed opacity-20">
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    );
                                }

                                return (
                                    <Button variant="ghost" size="sm"
                                        key={item.label}
                                        className={cn(
                                            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                            !item.isEnabled && "pointer-events-none opacity-20 cursor-not-allowed"
                                        )}
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-1 px-3 py-2",
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </div>

                        {user && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground hidden sm:inline">
                                    {user.name || user.email}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearUser()}
                                    title="Trocar usuário"
                                >
                                    <User className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex md:hidden items-center gap-1">
                            {navItems.slice(0, 4).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "p-2 transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav >
        </header>
    )
};
