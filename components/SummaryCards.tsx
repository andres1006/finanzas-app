'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { calcularProyecciones } from '@/lib/financeUtils';
import { Transaccion } from '@/lib/financeUtils';
import { TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardsProps {
    transactions: Transaccion[];
}

export default function SummaryCards({ transactions }: SummaryCardsProps) {
    const { totalIngresos, totalGastos, totalAbonosDeuda, balance } =
        calcularProyecciones(transactions);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const cards = [
        {
            title: 'Total Ingresos',
            value: totalIngresos,
            icon: TrendingUp,
            description: "+20.1% vs mes anterior", // Placeholder for now, or calculate if data available
            trend: "up"
        },
        {
            title: 'Total Gastos',
            value: totalGastos,
            icon: TrendingDown,
            description: "+4% vs mes anterior",
            trend: "down"
        },
        {
            title: 'Abonos a Deudas',
            value: totalAbonosDeuda,
            icon: CreditCard,
            description: "12% del total de gastos",
        },
        {
            title: 'Balance',
            value: balance,
            icon: Wallet,
            description: balance >= 0 ? "Finanzas saludables" : "Atención requerida",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(card.value)}</div>
                            <p className="text-xs text-muted-foreground">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
