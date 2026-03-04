'use client';

import CreditsManager from '@/components/CreditsManager';
import { useFinanceData } from '@/hooks/useFinanceData';

export default function CreditosPage() {
    const { credits, refresh } = useFinanceData();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Créditos</h2>
                <p className="text-muted-foreground">
                    Gestiona tus deudas y visualiza el progreso de tus pagos
                </p>
            </div>
            
            <CreditsManager credits={credits} onCreditsChange={async () => refresh()} />
        </div>
    );
}
