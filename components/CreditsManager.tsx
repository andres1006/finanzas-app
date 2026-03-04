'use client';

import { Credito } from '@/lib/financeUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreditsManagerProps {
    credits: Credito[];
    onCreditsChange: () => Promise<void>;
}

export default function CreditsManager({ credits, onCreditsChange }: CreditsManagerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestión de Créditos</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Módulo de créditos cargado con {credits.length} registros.</p>
            </CardContent>
        </Card>
    );
}
