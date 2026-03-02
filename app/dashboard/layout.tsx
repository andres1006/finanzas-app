'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import LoginPage from '@/components/LoginPage';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [currentUser, setCurrentUser] = useState<'Andrés' | 'Mariana' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser === 'Andrés' || savedUser === 'Mariana') {
            setCurrentUser(savedUser);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (user: 'Andrés' | 'Mariana') => {
        setCurrentUser(user);
        localStorage.setItem('currentUser', user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        router.push('/');
    };

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/40">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <Header currentUser={currentUser} onLogout={handleLogout} />

                {/* Main Area */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
