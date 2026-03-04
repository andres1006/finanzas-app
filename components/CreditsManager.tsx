'use client';

import { useState } from 'react';
import { Credito } from '@/lib/financeUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, History } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CreditsManagerProps {
    credits: Credito[];
    onCreditsChange: () => Promise<void>;
}

export default function CreditsManager({ credits, onCreditsChange }: CreditsManagerProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {credits.map((credit) => {
                    const saldoTotal = credit.montoTotal || 0;
                    const saldoActual = credit.saldoActual || 0;
                    const progress = saldoTotal > 0 ? ((saldoTotal - saldoActual) / saldoTotal) * 100 : 0;
                    
                    return (
                        <Card key={credit.id} className="relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2 uppercase text-[10px]">
                                        {credit.usuario || 'Andrés'}
                                    </Badge>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-lg">{credit.nombre}</CardTitle>
                                <CardDescription>Tasa: {credit.tasaInteres}%</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-muted-foreground">Saldo Actual</span>
                                        <span>${saldoActual.toLocaleString('es-CO')}</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>{progress.toFixed(1)}% Pagado</span>
                                        <span>Total: ${saldoTotal.toLocaleString('es-CO')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button size="sm" variant="outline" className="text-xs h-8">
                                        <History className="mr-2 h-3 w-3" /> Historial
                                    </Button>
                                    <Button size="sm" className="text-xs h-8">
                                        <Plus className="mr-2 h-3 w-3" /> Abono
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {credits.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No tienes créditos registrados.</p>
                </div>
            )}
        </div>
    );
}
