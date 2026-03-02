'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Transaccion } from '@/lib/financeUtils';
import {
    Plus,
    Trash2,
    Calendar,
    CheckCircle2,
    CalendarX,
    Check,
    TrendingUp,
    ChevronRight
} from 'lucide-react';
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

export type PlanItem = {
    id: string;
    concepto: string;
    montoEstimado: number;
    montoPagado: number;
    categoria: string;
    diaSugerido: number;
    estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADO';
    fechaLimite?: string;
};

interface BudgetPlannerProps {
    transactions: Transaccion[];
    onTransactionAdded: () => void;
    month?: string;
}

export default function BudgetPlanner({ transactions, onTransactionAdded, month }: BudgetPlannerProps) {
    const [items, setItems] = useState<PlanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemOpen, setNewItemOpen] = useState(false);

    // States for editing estimated amount
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // States for partial payments (abonos)
    const [abonoId, setAbonoId] = useState<string | null>(null);
    const [abonoValue, setAbonoValue] = useState('');

    // Formulario nuevo item
    const [newItem, setNewItem] = useState({
        concepto: '',
        montoEstimado: '',
        categoria: 'Vivienda',
        diaSugerido: '1',
    });

    const router = useRouter();
    const targetMonth = month || new Date().toISOString().substring(0, 7);

    // Cargar ítems del plan (Planeación_Gastos)
    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/budget/plan?month=${targetMonth}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar planeación');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [targetMonth]);

    // Forzar creación de plan desde plantilla
    const handleCreateFromTemplate = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/budget/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_from_template',
                    month: targetMonth
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Plan cargado');
                fetchItems();
            } else {
                toast.error('Error al cargar plantilla');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // Agregar nuevo item a plantilla y plan del mes
    const handleAddItem = async () => {
        if (!newItem.concepto || !newItem.montoEstimado) {
            toast.warning('Completa los campos requeridos');
            return;
        }

        try {
            // Guardar en el plan del mes directamente
            const res = await fetch('/api/budget/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_item',
                    month: targetMonth,
                    item: {
                        concepto: newItem.concepto,
                        montoEstimado: Number(newItem.montoEstimado),
                        categoria: newItem.categoria,
                        diaSugerido: Number(newItem.diaSugerido),
                    }
                }),
            });

            if (res.ok) {
                toast.success('Gasto agregado al plan');
                setNewItemOpen(false);
                setNewItem({ concepto: '', montoEstimado: '', categoria: 'Vivienda', diaSugerido: '1' });
                fetchItems();
            }
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    // Actualizar monto de un item en el plan
    const handleUpdateAmount = async (id: string, newAmount: number) => {
        try {
            const res = await fetch('/api/budget/plan', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    montoEstimado: newAmount
                }),
            });

            if (res.ok) {
                setEditingId(null);
                toast.success('Monto actualizado');
                fetchItems();
            }
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const handleAddAbono = async () => {
        if (!abonoId || !abonoValue) return;

        try {
            const amount = Number(abonoValue);
            const res = await fetch('/api/budget/plan', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: abonoId,
                    abono: amount
                }),
            });

            if (res.ok) {
                const item = items.find(i => i.id === abonoId);

                // También crear la transacción
                if (item) {
                    const fecha = new Date();
                    const transactionData = {
                        Fecha: fecha.toISOString().split('T')[0],
                        Día: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()],
                        Tipo: 'Gasto',
                        Categoría: item.categoria,
                        Descripción: `${item.concepto} (Abono)`,
                        Monto: amount,
                        Usuario: 'Andrés',
                    };

                    await fetch('/api/transactions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(transactionData),
                    });
                }

                setAbonoId(null);
                setAbonoValue('');
                toast.success('Abono registrado');
                onTransactionAdded();
                fetchItems();
                router.refresh();
            }
        } catch (error) {
            toast.error('Error al registrar abono');
        }
    };

    const handleMarkAsComplete = async (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const remaining = item.montoEstimado - (item.montoPagado || 0);

        try {
            // Marcarlo como pagado totalmente al igualar montoPagado con montoEstimado
            const res = await fetch('/api/budget/plan', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    montoPagado: item.montoEstimado
                }),
            });

            if (res.ok) {
                // Generar transacción por el excedente si lo hay
                if (remaining > 0) {
                    const fecha = new Date();
                    const transactionData = {
                        Fecha: fecha.toISOString().split('T')[0],
                        Día: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()],
                        Tipo: 'Gasto',
                        Categoría: item.categoria,
                        Descripción: `${item.concepto} (Pago completo)`,
                        Monto: remaining,
                        Usuario: 'Andrés',
                    };

                    await fetch('/api/transactions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(transactionData),
                    });
                    onTransactionAdded();
                }

                toast.success('Gasto marcado como completado');
                fetchItems();
                router.refresh();
            }
        } catch (error) {
            toast.error('Error al completar el gasto');
        }
    };

    // Eliminar item de planeación
    const handleDeleteItem = async (id: string) => {
        if (!confirm('¿Eliminar este gasto de la planeación?')) return;

        try {
            const res = await fetch(`/api/budget/plan?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Eliminado');
                fetchItems();
                router.refresh();
            }
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-md overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Planeación del Presupuesto
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8 rounded-full border-slate-200 text-slate-700 hover:bg-slate-100"
                            onClick={handleCreateFromTemplate}
                            disabled={loading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            <span className="hidden sm:inline">Cargar Listado Predefinido</span>
                        </Button>
                        <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-1 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Agregar Cargo Fijo</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Agregar Gasto Fijo</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="concepto">Concepto</Label>
                                        <Input
                                            id="concepto"
                                            placeholder="Arriendo, Internet, etc."
                                            value={newItem.concepto}
                                            onChange={(e) => setNewItem({ ...newItem, concepto: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="monto">Monto Estimado</Label>
                                        <Input
                                            id="monto"
                                            type="number"
                                            placeholder="0"
                                            value={newItem.montoEstimado}
                                            onChange={(e) => setNewItem({ ...newItem, montoEstimado: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="categoria">Categoría</Label>
                                        <Select
                                            value={newItem.categoria}
                                            onValueChange={(val) => setNewItem({ ...newItem, categoria: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Vivienda">Vivienda</SelectItem>
                                                <SelectItem value="Servicios">Servicios</SelectItem>
                                                <SelectItem value="Alimentación">Alimentación</SelectItem>
                                                <SelectItem value="Transporte">Transporte</SelectItem>
                                                <SelectItem value="Créditos">Créditos</SelectItem>
                                                <SelectItem value="Suscripciones">Suscripciones</SelectItem>
                                                <SelectItem value="Otros">Otros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="dia">Día Sugerido de Pago</Label>
                                        <Select
                                            value={newItem.diaSugerido}
                                            onValueChange={(val) => setNewItem({ ...newItem, diaSugerido: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Día" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 31 }, (_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                        Día {i + 1}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddItem} className="w-full bg-indigo-600">Guardar Gasto</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando presupuesto...</div>
                        ) : items.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground bg-slate-50/50">
                                <CalendarX className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                <p className="font-medium text-slate-600">No hay gastos planeados para este mes</p>
                                <p className="text-xs mb-4">Manten el control de tus finanzas cargando tu base mensual.</p>
                                <Button variant="outline" size="sm" onClick={handleCreateFromTemplate} className="rounded-full">
                                    Cargar desde Plantilla
                                </Button>
                            </div>
                        ) : (
                            items.map((item) => {
                                const percent = Math.min(100, ((item.montoPagado || 0) / item.montoEstimado) * 100);
                                const isPaid = (item.montoPagado || 0) >= item.montoEstimado;

                                return (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {isPaid ? <CheckCircle2 className="h-6 w-6" /> : <div className="text-xs font-bold">{item.diaSugerido}</div>}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-slate-800 truncate">{item.concepto}</h4>
                                                    <div className="text-right">
                                                        {editingId === item.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <Input
                                                                    size={8}
                                                                    autoFocus
                                                                    className="h-7 w-24 py-0 text-sm"
                                                                    value={editValue}
                                                                    onChange={e => setEditValue(e.target.value)}
                                                                    onKeyDown={e => e.key === 'Enter' && handleUpdateAmount(item.id, parseFloat(editValue))}
                                                                />
                                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateAmount(item.id, parseFloat(editValue))}>
                                                                    <Check className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="cursor-pointer hover:text-indigo-600 font-bold text-slate-900 transition-colors" onClick={() => { setEditingId(item.id); setEditValue(item.montoEstimado.toString()); }}>
                                                                {formatCurrency(item.montoEstimado)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 uppercase tracking-wider font-semibold">{item.categoria}</span>
                                                    <span>Pagado: {formatCurrency(item.montoPagado || 0)}</span>
                                                </div>

                                                <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full transition-all duration-500 ${isPaid ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 transition-opacity">
                                                {!isPaid && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                        title="Completar pago exacto"
                                                        onClick={() => handleMarkAsComplete(item.id)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                                                    title="Hacer un abono"
                                                    onClick={() => { setAbonoId(item.id); setAbonoValue(''); }}
                                                >
                                                    <TrendingUp className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!abonoId} onOpenChange={() => setAbonoId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registrar Abono / Pago Parcial</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-700">
                                {items.find(i => i.id === abonoId)?.concepto}
                            </h3>
                            <div className="flex justify-between mt-2 text-xs">
                                <span>Estimado: {formatCurrency(items.find(i => i.id === abonoId)?.montoEstimado || 0)}</span>
                                <span>Pagado hoy: {formatCurrency(items.find(i => i.id === abonoId)?.montoPagado || 0)}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="abono">Monto a pagar ahora</Label>
                            <Input
                                id="abono"
                                type="number"
                                placeholder="Ingresa el monto"
                                value={abonoValue}
                                onChange={e => setAbonoValue(e.target.value)}
                                autoFocus
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                Esto se sumará al monto ya pagado y generará un gasto en tus transacciones.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAbonoId(null)}>Cancelar</Button>
                        <Button onClick={handleAddAbono} className="bg-indigo-600">Confirmar Pago</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
