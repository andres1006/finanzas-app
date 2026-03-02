'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agruparPorCategoria } from '@/lib/financeUtils';
import { Transaccion } from '@/lib/financeUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface FinanceChartsProps {
    transactions: Transaccion[];
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function FinanceCharts({ transactions }: FinanceChartsProps) {
    // Datos para gráfica de categorías
    const categoryData = agruparPorCategoria(transactions);

    // Datos para gráfica de ingresos vs gastos
    const ingresos = transactions
        .filter(t => t.tipo === 'Ingreso')
        .reduce((acc, curr) => acc + curr.monto, 0);

    const gastos = transactions
        .filter(t => t.tipo === 'Gasto')
        .reduce((acc, curr) => acc + curr.monto, 0);

    const abonosDeuda = transactions
        .filter(t => t.tipo === 'Abono Deuda')
        .reduce((acc, curr) => acc + curr.monto, 0);

    const summaryData = [
        { name: 'Ingresos', value: ingresos },
        { name: 'Gastos', value: gastos },
        { name: 'Abonos Deuda', value: abonosDeuda },
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gráficas Financieras</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        No hay datos suficientes para mostrar gráficas
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfica de Resumen */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={summaryData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                            <Tooltip
                                formatter={(value) => {
                                    if (typeof value === 'number') return formatCurrency(value);
                                    return value;
                                }}
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Gráfica de Gastos por Categoría */}
            <Card>
                <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                    {categoryData.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            No hay gastos registrados
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ categoria, percent }: any) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="monto"
                                    nameKey="categoria"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => {
                                        if (typeof value === 'number') return formatCurrency(value);
                                        return value;
                                    }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
