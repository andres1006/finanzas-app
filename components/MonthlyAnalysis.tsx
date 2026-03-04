'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Transaccion, agruparPorMes, filtrarPorMes, calcularCambioMensual, agruparPorCategoria } from '@/lib/financeUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

interface MonthlyAnalysisProps {
    transactions: Transaccion[];
}

export default function MonthlyAnalysis({ transactions }: MonthlyAnalysisProps) {
    const datosMensuales = useMemo(() => agruparPorMes(transactions), [transactions]);

    // Mes actual por defecto (Marzo 2026)
    const mesActual = new Date().toISOString().substring(0, 7);
    const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);

    const transaccionesMes = useMemo(
        () => filtrarPorMes(transactions, mesSeleccionado),
        [transactions, mesSeleccionado]
    );

    const datosMesActual = datosMensuales.find(d => d.mes === mesSeleccionado);
    const datosMesAnterior = datosMensuales.find((d, i) => {
        const indexActual = datosMensuales.findIndex(m => m.mes === mesSeleccionado);
        return i === indexActual + 1;
    });

    const cambios = datosMesActual && datosMesAnterior
        ? calcularCambioMensual(datosMesActual, datosMesAnterior)
        : { ingresos: 0, gastos: 0, balance: 0 };

    const topGastos = useMemo(() => {
        const categorias = agruparPorCategoria(transaccionesMes);
        return categorias.sort((a, b) => b.monto - a.monto).slice(0, 5);
    }, [transaccionesMes]);

    // Datos para gráfica de tendencia (últimos 6 meses)
    const datosTendencia = useMemo(() => {
        return datosMensuales.slice(0, 6).reverse().map(d => {
            const [y, m] = d.mes.split('-').map(Number);
            return {
                mes: new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'short' }),
                Ingresos: d.ingresos,
                Gastos: d.gastos,
                Balance: d.balance,
            };
        });
    }, [datosMensuales]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    return (
        <div className="space-y-6">
            {/* Selector de Mes */}
            <Card className="shadow-lg border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Análisis Mensual</CardTitle>
                                <CardDescription>Compara tus finanzas mes a mes</CardDescription>
                            </div>
                        </div>
                        <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
                            <SelectTrigger className="w-[200px] h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {datosMensuales.map(d => (
                                    <SelectItem key={d.mes} value={d.mes}>
                                        {(() => {
                                            const [y, m] = d.mes.split('-').map(Number);
                                            return new Date(y, m - 1, 1).toLocaleDateString('es-CO', {
                                                month: 'long',
                                                year: 'numeric'
                                            });
                                        })()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            {/* Tarjetas de Resumen Mensual */}
            {datosMesActual && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Ingresos del Mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(datosMesActual.ingresos)}
                            </div>
                            {datosMesAnterior && (
                                <div className={`text-xs flex items-center gap-1 mt-1 ${cambios.ingresos >= 0 ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                    {cambios.ingresos >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {formatPercentage(cambios.ingresos)} vs mes anterior
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Gastos del Mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(datosMesActual.gastos)}
                            </div>
                            {datosMesAnterior && (
                                <div className={`text-xs flex items-center gap-1 mt-1 ${cambios.gastos <= 0 ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                    {cambios.gastos >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {formatPercentage(cambios.gastos)} vs mes anterior
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Balance del Mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${datosMesActual.balance >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                                }`}>
                                {formatCurrency(datosMesActual.balance)}
                            </div>
                            {datosMesAnterior && (
                                <div className={`text-xs flex items-center gap-1 mt-1 ${cambios.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                    {cambios.balance >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {formatPercentage(cambios.balance)} vs mes anterior
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Gráfica de Tendencia */}
            <Card>
                <CardHeader>
                    <CardTitle>Tendencia (Últimos 6 Meses)</CardTitle>
                </CardHeader>
                <CardContent>
                    {datosTendencia.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={datosTendencia}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="mes" className="text-xs" />
                                <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                                <Tooltip
                                    formatter={(value) => {
                                        if (typeof value === 'number') return formatCurrency(value);
                                        return value;
                                    }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2} />
                                <Line type="monotone" dataKey="Balance" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            No hay suficientes datos para mostrar tendencia
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top 5 Gastos del Mes */}
            <Card className="shadow-lg border-0">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Top 5 Gastos del Mes</CardTitle>
                            <CardDescription>Categorías con mayor gasto</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    {topGastos.length > 0 ? (
                        <div className="space-y-4">
                            {topGastos.map((cat, index) => (
                                <div key={cat.categoria}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <Badge variant={index === 0 ? 'destructive' : index === 1 ? 'warning' : 'secondary'} className="w-7 h-7 rounded-full p-0 flex items-center justify-center">
                                                {index + 1}
                                            </Badge>
                                            <span className="font-semibold text-gray-700">{cat.categoria}</span>
                                        </div>
                                        <span className="font-bold text-red-600">
                                            {formatCurrency(cat.monto)}
                                        </span>
                                    </div>
                                    {index < topGastos.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No hay gastos registrados este mes
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
