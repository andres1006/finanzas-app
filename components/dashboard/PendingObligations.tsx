'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaccion } from '@/lib/financeUtils';
import Link from 'next/link';

interface PendingObligationsProps {
    transactions: Transaccion[];
}

export default function PendingObligations({ transactions }: PendingObligationsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Obligaciones Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Mostrando obligaciones pendientes basadas en {transactions.length} transacciones.</p>
                <Link href="/dashboard/planeacion" className="text-primary underline text-sm">
                    Ir a planeación
                </Link>
            </CardContent>
        </Card>
    );
}
