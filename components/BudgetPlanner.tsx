'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Transaccion } from '@/lib/financeUtils';
import { Plus, Trash2, Calendar, CheckCircle2, Circle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type TemplateItem = {
    id: string;
    concepto: string;
    montoEstimado: number;
    categoria: string;
    diaSugerido: number;
};

interface BudgetPlannerProps {
    transactions: Transaccion[];
    onTransactionAdded: () => void;
}

export default function BudgetPlanner({ transactions, onTransactionAdded }: BudgetPlannerProps) {
    const [templates, setTemplates] = useState<TemplateItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemOpen, setNewItemOpen] = useState(false);

    // Formulario nuevo item
    const [newItem, setNewItem] = useState({
        concepto: '',
        montoEstimado: '',
        categoria: 'Vivienda',
        diaSugerido: '1',
    });

    // Cargar plantilla
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/budget/template');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar plantilla');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Agregar nuevo item a plantilla
    const handleAddItem = async () => {
        if (!newItem.concepto || !newItem.montoEstimado) {
            toast.warning('Completa los campos requeridos');
            return;
        }

        try {
            const res = await fetch('/api/budget/template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concepto: newItem.concepto,
                    montoEstimado: Number(newItem.montoEstimado),
                    categoria: newItem.categoria,
                    diaSugerido: Number(newItem.diaSugerido),
                }),
            });

            if (res.ok) {
                toast.success('Gasto recurrente agregado');
                setNewItemOpen(false);
                setNewItem({ concepto: '', montoEstimado: '', categoria: 'Vivienda', diaSugerido: '1' });
                fetchTemplates();
            }
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    // Eliminar item de plantilla
    const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar este gasto recurrente de la plantilla?')) return;

        try {
            const res = await fetch(`/api/budget/template?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Eliminado correctamente');
                fetchTemplates();
            }
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    // Ejecutar pago (Crear transacción)
    const handlePay = async (item: TemplateItem) => {
        try {
            const fecha = new Date();
            // Ajustar al día actual
            const fechaStr = fecha.toISOString().split('T')[0];

            // Calcular día de la semana
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const diaNombre = dias[fecha.getDay() === 6 ? 0 : fecha.getDay() + 1]; // Ajuste simple

            const transactionData = {
                Fecha: fechaStr,
                Día: diaNombre, // La API lo recalcula igual
                Tipo: 'Gasto',
                Categoría: item.categoria,
                Descripción: item.concepto,
                Monto: item.montoEstimado,
                Usuario: 'Andrés', // Default por ahora o sacar de contexto
            };

            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData),
            });

            if (res.ok) {
                toast.success(`Pago registrado: ${item.concepto}`);
                onTransactionAdded(); // Recargar transacciones para actualizar estado
            } else {
                throw new Error('Falló al guardar');
            }
        } catch (error) {
            toast.error('Error al registrar el pago');
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
    };

    // Verificar si ya está pagado en este mes
    // Lógica: Buscar en transacciones del mes actual si existe una con la misma descripción (aprox)
    const isPaid = (item: TemplateItem) => {
        return transactions.some(t =>
            t.descripcion.toLowerCase().trim() === item.concepto.toLowerCase().trim() &&
            t.tipo === 'Gasto'
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Planeación Mensual
                    </CardTitle>
                    <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Gasto Fijo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Agregar Gasto Recurrente</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Concepto</Label>
                                    <Input
                                        className="col-span-3"
                                        value={newItem.concepto}
                                        onChange={e => setNewItem({ ...newItem, concepto: e.target.value })}
                                        placeholder="Ej: Internet, Arriendo..."
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Monto</Label>
                                    <Input
                                        className="col-span-3"
                                        type="number"
                                        value={newItem.montoEstimado}
                                        onChange={e => setNewItem({ ...newItem, montoEstimado: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Categoría</Label>
                                    <Select
                                        value={newItem.categoria}
                                        onValueChange={v => setNewItem({ ...newItem, categoria: v })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Vivienda">Vivienda</SelectItem>
                                            <SelectItem value="Alimentación">Alimentación</SelectItem>
                                            <SelectItem value="Transporte">Transporte</SelectItem>
                                            <SelectItem value="Servicios">Servicios</SelectItem>
                                            <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
                                            <SelectItem value="Salud">Salud</SelectItem>
                                            <SelectItem value="Educación">Educación</SelectItem>
                                            <SelectItem value="Deudas">Deudas</SelectItem>
                                            <SelectItem value="Ahorro">Ahorro</SelectItem>
                                            <SelectItem value="Varios">Varios</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddItem}>Guardar Plantilla</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Cargando plantilla...</div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No tienes gastos recurrentes configurados.
                            <br />
                            Agrega uno para empezar tu planeación.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {templates.map(item => {
                                const pagado = isPaid(item);
                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${pagado ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20' : 'bg-card'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => !pagado && handlePay(item)}
                                                disabled={pagado}
                                                className={`transition-colors ${pagado ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                                                title={pagado ? "Pagado" : "Marcar como pagado"}
                                            >
                                                {pagado ? (
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                ) : (
                                                    <Circle className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </button>
                                            <div>
                                                <div className={`font-medium ${pagado ? 'text-muted-foreground line-through' : ''}`}>
                                                    {item.concepto}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.categoria} • Est. {formatCurrency(item.montoEstimado)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {pagado && (
                                                <div className="text-xs font-medium text-emerald-600 px-2 py-1 bg-emerald-100 rounded-full dark:bg-emerald-900/50 dark:text-emerald-400">
                                                    PAGADO
                                                </div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={(e) => handleDeleteItem(item.id, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
