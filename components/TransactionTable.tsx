'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Transaccion } from '@/lib/financeUtils';
import { Calendar, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionTableProps {
    transactions: Transaccion[];
    onDelete: (id: string) => Promise<void>;
}

export default function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getTypeColor = (tipo: string) => {
        switch (tipo) {
            case 'Ingreso':
                return 'text-emerald-600 dark:text-emerald-400';
            case 'Gasto':
                return 'text-red-600 dark:text-red-400';
            case 'Abono Deuda':
                return 'text-blue-600 dark:text-blue-400';
            default:
                return '';
        }
    };

    const getTypeEmoji = (tipo: string) => {
        switch (tipo) {
            case 'Ingreso':
                return '💰';
            case 'Gasto':
                return '💸';
            case 'Abono Deuda':
                return '💳';
            default:
                return '📝';
        }
    };

    // Mostrar las últimas 15 transacciones
    const recentTransactions = [...transactions].reverse().slice(0, 15);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Últimos Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Fecha</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                                <TableHead className="hidden sm:table-cell">Usuario</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No hay transacciones registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentTransactions.map((transaction, index) => (
                                    <TableRow key={transaction.id || index}>
                                        <TableCell className="font-medium text-sm">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                {transaction.fecha}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{transaction.descripcion}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {getTypeEmoji(transaction.tipo)} {transaction.tipo}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {transaction.categoria}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="flex items-center gap-1 text-sm">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                {transaction.usuario}
                                            </div>
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${getTypeColor(transaction.tipo)}`}>
                                            {formatCurrency(transaction.monto)}
                                        </TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción eliminará permanentemente la transacción.
                                                            No podrás deshacer esta acción.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-red-600 hover:bg-red-700"
                                                            onClick={() => {
                                                                if (transaction.id) onDelete(transaction.id);
                                                            }}
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
