'use client';

import { UserNav } from './user-nav';
import { Badge } from '@/components/ui/badge';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
    currentUser: 'Andrés' | 'Mariana';
    onLogout: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
    return (
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
            {/* Search */}
            <div className="flex-1">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar transacciones..."
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                        3
                    </Badge>
                </Button>

                {/* User Menu */}
                <UserNav currentUser={currentUser} onLogout={onLogout} />
            </div>
        </header>
    );
}
