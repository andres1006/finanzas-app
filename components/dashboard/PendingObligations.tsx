'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaccion } from '@/lib/financeUtils';
import Link from 'next/link';
import { PlanItem } from '@/components/BudgetPlanner';

interface PendingObligationsProps {
    transactions: Transaccion[];
}

export default function PendingObligations({ transactions }: PendingObligationsProps) {
    const [items, setItems] = useState<PlanItem[]>([]);
    const [loading, setLoading] = useState(true);

    const currentMonth = new Date().toISOString().substring(0, 7);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const currentMonth = new Date().toISOString().substring(0, 7);
                const res = await fetch(`/api/budget/plan?month=${currentMonth}`);
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, []);

    const pendingItems = items.filter(item => (item.montoPagado || 0) < item.montoEstimado);
    const sortedItems = [...pendingItems].sort((a, b) => a.diaSugerido - b.diaSugerido);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    return (
        <Card className="shadow-sm border-none bg-indigo-600 text-white overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90 text-white">
                    <Clock className="h-4 w-4" />
                    Gastos Pendientes
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-xs opacity-70">Cargando...</div>
                ) : sortedItems.length === 0 ? (
                    <div className="text-xs opacity-70 py-2">¡Todo al día! 🎉</div>
                ) : (
                    <div className="space-y-3">
                        {sortedItems.slice(0, 3).map((item) => {
                            const percent = Math.min(100, ((item.montoPagado || 0) / item.montoEstimado) * 100);
                            return (
                                <div key={item.id} className="group">
                                    <div className="flex justify-between items-start mb-1 text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-semibold truncate max-w-[120px]">{item.concepto}</span>
                                            <span className="text-[10px] opacity-70">Día {item.diaSugerido}</span>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="font-bold">{formatCurrency(item.montoEstimado - (item.montoPagado || 0))}</span>
                                            {(item.montoPagado || 0) > 0 && (
                                                <span className="text-[9px] opacity-60">Faltan de {formatCurrency(item.montoEstimado)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-400 transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {sortedItems.length > 3 && (
                            <div className="text-[10px] text-center pt-1 opacity-70 italic">
                                + {sortedItems.length - 3} más por pagar
                            </div>
                        )}
                        <Link href="/dashboard/planeacion" className="block pt-2">
                            <Button size="sm" variant="secondary" className="w-full h-8 text-[10px] gap-1 bg-white/10 hover:bg-white/20 text-white border-none">
                                Ir a Pagar <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
