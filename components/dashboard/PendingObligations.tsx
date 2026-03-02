'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaccion } from '@/lib/financeUtils';
import Link from 'next/link';
import { TemplateItem as PlanItem } from '@/components/BudgetPlanner';

interface PendingObligationsProps {
    transactions: Transaccion[];
}

export default function PendingObligations({ transactions }: PendingObligationsProps) {
    const [pendingItems, setPendingItems] = useState<PlanItem[]>([]);
    const [loading, setLoading] = useState(true);

    const currentMonth = new Date().toISOString().substring(0, 7);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                // Fetch plan for current month
                const res = await fetch(`/api/budget/plan?month=${currentMonth}`);
                if (res.ok) {
                    const plan: PlanItem[] = await res.json();

                    // Filter items that are NOT in transactions
                    // Matching criteria: Same description (fuzzy)
                    const unpaid = plan.filter(item => {
                        return !transactions.some(t =>
                            t.descripcion.toLowerCase().trim() === item.concepto.toLowerCase().trim() &&
                            t.tipo === 'Gasto'
                        );
                    });

                    setPendingItems(unpaid);
                }
            } catch (error) {
                console.error('Error fetching pending obligations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (transactions) {
            fetchPlan();
        }
    }, [transactions, currentMonth]);

    if (loading || pendingItems.length === 0) return null;

    return (
        <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    Obligaciones Pendientes ({new Date().toLocaleDateString('es-CO', { month: 'long' })})
                </CardTitle>
            </CardHeader>
            <CardContent className="py-2 pb-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        {pendingItems.slice(0, 3).map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span>{item.concepto}</span>
                                <span className="font-semibold tabular-nums">
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.montoEstimado)}
                                </span>
                            </div>
                        ))}
                        {pendingItems.length > 3 && (
                            <div className="text-xs text-muted-foreground pt-1">
                                + {pendingItems.length - 3} más...
                            </div>
                        )}
                    </div>
                    <Link href="/dashboard/planeacion" className="block">
                        <Button size="sm" variant="secondary" className="w-full h-8 text-xs gap-1">
                            Ir a Pagar <ArrowRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
