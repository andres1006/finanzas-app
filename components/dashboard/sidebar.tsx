import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    LayoutDashboard,
    TrendingUp,
    Calendar,
    Target,
    CreditCard,
    PiggyBank,
    Wallet,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        color: 'text-emerald-500',
    },
    {
        label: 'Análisis',
        icon: TrendingUp,
        href: '/dashboard/analisis',
        color: 'text-blue-500',
    },
    {
        label: 'Planeación',
        icon: Calendar,
        href: '/dashboard/planeacion',
        color: 'text-indigo-500',
    },
    {
        label: 'Metas',
        icon: Target,
        href: '/dashboard/metas',
        color: 'text-purple-500',
    },
    {
        label: 'Créditos',
        icon: CreditCard,
        href: '/dashboard/creditos',
        color: 'text-orange-500',
    },
    {
        label: 'Inversiones',
        icon: PiggyBank,
        href: '/dashboard/inversiones',
        color: 'text-pink-500',
        disabled: true,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <TooltipProvider delayDuration={0}>
            <div
                className={cn(
                    "relative flex h-full flex-col border-r bg-white transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-[70px]" : "w-64"
                )}
            >
                {/* Toggle Button */}
                <div className="absolute -right-3 top-7 z-20">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6 rounded-full border shadow-sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-3 w-3" />
                        ) : (
                            <ChevronLeft className="h-3 w-3" />
                        )}
                    </Button>
                </div>

                {/* Logo / Header */}
                <div className={cn(
                    "flex h-16 items-center border-b px-4",
                    isCollapsed ? "justify-center" : "gap-2"
                )}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-lg font-bold">FinanzasApp</span>
                            <span className="truncate text-xs text-muted-foreground">Andrés</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-4">
                    <div className="space-y-2 px-2">
                        {!isCollapsed && (
                            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 transition-opacity">
                                Navegación
                            </p>
                        )}

                        {routes.map((route) => (
                            <div key={route.href}>
                                {isCollapsed ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={route.disabled ? '#' : route.href}
                                                className={cn(
                                                    'flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted',
                                                    route.disabled && 'pointer-events-none opacity-50',
                                                    pathname === route.href && 'bg-muted text-primary'
                                                )}
                                            >
                                                <route.icon className="h-4 w-4" />
                                                <span className="sr-only">{route.label}</span>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            {route.label}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Link
                                        href={route.disabled ? '#' : route.href}
                                        className={cn(
                                            'block',
                                            route.disabled && 'pointer-events-none opacity-50'
                                        )}
                                    >
                                        <Button
                                            variant={pathname === route.href ? 'secondary' : 'ghost'}
                                            className="w-full justify-start gap-3"
                                        >
                                            <route.icon className="h-4 w-4" />
                                            <span className="font-medium">{route.label}</span>
                                            {route.disabled && (
                                                <span className="ml-auto text-xs text-muted-foreground">Próximamente</span>
                                            )}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2 px-2">
                        {!isCollapsed && (
                            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Configuración
                            </p>
                        )}

                        {isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <Settings className="h-4 w-4" />
                                        <span className="sr-only">Ajustes</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Ajustes</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button variant="ghost" className="w-full justify-start gap-3">
                                <Settings className="h-4 w-4" />
                                <span className="font-medium">Ajustes</span>
                            </Button>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="border-t p-4">
                        <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs font-semibold">💡 Consejo</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Registra tus gastos diariamente para un mejor control
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
