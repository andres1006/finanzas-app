'use client';

import { Transaccion, calcularProyecciones, filtrarPorMes, calcularCambioMensual, agruparPorMes } from '@/lib/financeUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MonthlyAnalysisProps {
    transactions: Transaccion[];
}

export default function MonthlyAnalysis({ transactions }: MonthlyAnalysisProps) {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    
    const actual = filtrarPorMes(transactions, mesActual, anioActual);
    const gastosActual = actual.filter(t => t.tipo === 'Gasto').reduce((s, t) => s + t.monto, 0);
    const ingresosActual = actual.filter(t => t.tipo === 'Ingreso').reduce((s, t) => s + t.monto, 0);
    
    const proyecciones = calcularProyecciones(transactions);
    const superavit = ingresosActual - gastosActual;
    const variacionGasto = calcularCambioMensual(gastosActual, 0); // Placeholder comparison logic

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Proyección de Gasto</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${proyecciones.proyectado.toLocaleString('es-CO')}</div>
                        <p className="text-xs text-muted-foreground">
                            Basado en ${proyecciones.promedioDiario.toLocaleString('es-CO')} / día
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Superávit Actual</CardTitle>
                        {superavit >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${superavit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${superavit.toLocaleString('es-CO')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {superavit >= 0 ? 'Felicidades, estás ahorrando' : 'Estás gastando más de lo que ganas'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Análisis de Tendencias</CardTitle>
                    <CardDescription>Comparativa con periodos anteriores y proyecciones.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center border-dashed border-2 rounded-lg text-muted-foreground">
                    Gráficos de tendencia en desarrollo... 🦾
                </CardContent>
            </Card>
        </div>
    );
}
