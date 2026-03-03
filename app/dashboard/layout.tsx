'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import LoginPage from '@/components/LoginPage';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, login, logout, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return null;
    }

    if (!user) {
        return <LoginPage onLogin={login} />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/40">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header currentUser={user} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
