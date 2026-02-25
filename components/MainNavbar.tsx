import { BookOpen, Plus, History, FolderOpen, CheckSquare, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BookOpen, isEnabled: true },
    { href: '/nova-sessao', label: 'Nova Sessão', icon: Plus, isEnabled: true },
    { href: '/historico', label: 'Histórico', icon: History, isEnabled: true },
    { href: '/materias', label: 'Matérias', icon: FolderOpen, isEnabled: true },
    { href: '/tarefas', label: 'Tarefas', icon: CheckSquare, isEnabled: false },
    { href: '/reviews', label: 'Revisões', icon: CalendarClock, isEnabled: false },
    { href: '/cycle-study', label: 'Ciclos', icon: CalendarClock, isEnabled: false },
];

export default function MainNavbar() {
    const location = typeof window !== 'undefined' ? window.location : { pathname: '' };

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
                                const isActive = location.pathname === item.href;

                                return (
                                    <Button variant="ghost" size="sm"
                                        key={item.href}
                                        className={cn(
                                            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                            !item.isEnabled && "pointer-events-none opacity-20 cursor-not-allowed"
                                        )}
                                    >
                                        <Link
                                            key={item.href}
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

                        <div className="flex md:hidden items-center gap-1">
                            {navItems.slice(0, 4).map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
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