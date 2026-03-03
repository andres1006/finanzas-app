'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Credito,
    Transaccion,
    calcularAmortizacion,
    calcularAhorroConPagoExtra,
    PagoAmortizacion
} from '@/lib/financeUtils';
import { CreditCard, Plus, Trash2, Calculator, TrendingDown, DollarSign, Calendar, Pencil, TrendingUp, History } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from '@/components/ui/checkbox';

export default function CreditsManager() {
    const [credits, setCredits] = useState<Credito[]>([]);
    const [loading, setLoading] = useState(true);
    const [openNew, setOpenNew] = useState(false);

    const [editingCredit, setEditingCredit] = useState<string | null>(null);

    // Formulario nuevo crédito
    const [newCredit, setNewCredit] = useState({
        nombre: '',
        montoTotal: '',
        saldoActual: '',
        tasaInteres: '',
        plazoMeses: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        tipoTasa: 'EA' as 'Mensual' | 'EA',
    });

    const [transactions, setTransactions] = useState<Transaccion[]>([]);

    // Detalle y Simulación
    const [selectedCredit, setSelectedCredit] = useState<Credito | null>(null);
    const [extraPayment, setExtraPayment] = useState('');
    const [simulationResult, setSimulationResult] = useState<{ ahorro: number, meses: number } | null>(null);

    // Abono
    const [abonoDialogOpen, setAbonoDialogOpen] = useState(false);
    const [abonoValue, setAbonoValue] = useState('');

    // Tabs
    const [activeTab, setActiveTab] = useState<'amortizacion' | 'historial'>('amortizacion');

    const fetchCredits = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/credits');
            if (res.ok) {
                const data = await res.json();
                setCredits(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar créditos');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/transactions');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCredits();
        fetchTransactions();
    }, []);

    const handleUpdate = async () => {
        if (!newCredit.nombre || !newCredit.montoTotal || !newCredit.tasaInteres) {
            toast.warning('Completa los campos requeridos');
            return;
        }

        try {
            const res = await fetch('/api/credits', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingCredit,
                    nombre: newCredit.nombre,
                    montoTotal: Number(newCredit.montoTotal),
                    saldoActual: newCredit.saldoActual ? Number(newCredit.saldoActual) : Number(newCredit.montoTotal),
                    tasaInteres: Number(newCredit.tasaInteres),
                    plazoMeses: Number(newCredit.plazoMeses),
                    fechaInicio: newCredit.fechaInicio,
                    tipoTasa: newCredit.tipoTasa,
                }),
            });

            if (res.ok) {
                toast.success('Crédito actualizado');
                setOpenNew(false);
                setEditingCredit(null);
                setNewCredit({ nombre: '', montoTotal: '', saldoActual: '', tasaInteres: '', plazoMeses: '', fechaInicio: new Date().toISOString().split('T')[0], tipoTasa: 'EA' });
                fetchCredits();
            }
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const handleCreate = async () => {
        if (editingCredit) {
            await handleUpdate();
            return;
        }

        if (!newCredit.nombre || !newCredit.montoTotal || !newCredit.tasaInteres) {
            toast.warning('Completa los campos requeridos');
            return;
        }

        try {
            const res = await fetch('/api/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: newCredit.nombre,
                    montoTotal: Number(newCredit.montoTotal),
                    saldoActual: newCredit.saldoActual ? Number(newCredit.saldoActual) : Number(newCredit.montoTotal),
                    tasaInteres: Number(newCredit.tasaInteres),
                    plazoMeses: Number(newCredit.plazoMeses),
                    fechaInicio: newCredit.fechaInicio,
                    tipoTasa: newCredit.tipoTasa,
                }),
            });

            if (res.ok) {
                toast.success('Crédito registrado');
                setOpenNew(false);
                setNewCredit({ nombre: '', montoTotal: '', saldoActual: '', tasaInteres: '', plazoMeses: '', fechaInicio: new Date().toISOString().split('T')[0], tipoTasa: 'EA' });
                fetchCredits();
            }
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    const handleEdit = (c: Credito, e: React.MouseEvent) => {
        e.stopPropagation();
        setNewCredit({
            nombre: c.nombre,
            montoTotal: c.montoTotal.toString(),
            saldoActual: c.saldoActual.toString(),
            tasaInteres: c.tasaInteres.toString(),
            plazoMeses: c.plazoMeses.toString(),
            fechaInicio: c.fechaInicio,
            tipoTasa: c.tipoTasa || 'EA',
        });
        setEditingCredit(c.id);
        setOpenNew(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar este crédito?')) return;

        const res = await fetch(`/api/credits?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success('Eliminado');
            fetchCredits();
            if (selectedCredit?.id === id) setSelectedCredit(null);
        }
    };

    const handleAddAbono = async () => {
        if (!selectedCredit || !abonoValue) return;

        const amount = Number(abonoValue);
        if (amount <= 0 || amount > selectedCredit.saldoActual) {
            toast.warning('Abono inválido. Verifica el monto.');
            return;
        }

        try {
            const newSaldo = selectedCredit.saldoActual - amount;

            const res = await fetch('/api/credits', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedCredit.id,
                    saldoActual: newSaldo
                }),
            });

            if (res.ok) {
                const fecha = new Date();
                const transactionData = {
                    Fecha: fecha.toISOString().split('T')[0],
                    Día: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()],
                    Tipo: 'Abono Deuda',
                    Categoría: 'Deudas',
                    Descripción: `Abono - ${selectedCredit.nombre}`,
                    Monto: amount,
                    Usuario: 'Andrés',
                };

                await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionData),
                });

                toast.success('Abono registrado con éxito');
                setAbonoDialogOpen(false);
                setAbonoValue('');

                setSelectedCredit({ ...selectedCredit, saldoActual: newSaldo });
                fetchCredits();
                fetchTransactions();
            }
        } catch (error) {
            toast.error('Error al registrar abono');
        }
    };

    const handleSimulate = () => {
        if (!selectedCredit || !extraPayment) return;
        const pago = Number(extraPayment);
        const resultado = calcularAhorroConPagoExtra({
            monto: selectedCredit.saldoActual,
            tasaAnual: selectedCredit.tasaInteres,
            plazoMeses: selectedCredit.plazoMeses // Ojo: esto asume plazo restante o total? 
            // Para simplicidad, asumimos que el cálculo usa el plazo restante estimado o el total si es nuevo.
            // financeUtils.ts calcularAmortizacion usa plazoMeses directo. 
            // Idealmente deberíamos calcular meses restantes.
        }, pago);
        setSimulationResult({
            ahorro: resultado.ahorroIntereses,
            meses: resultado.mesesAhorrados
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
    };

    // Generar tabla para el seleccionado
    const amortizacionTable = selectedCredit ? calcularAmortizacion({
        monto: selectedCredit.saldoActual,
        tasaAnual: selectedCredit.tasaInteres,
        plazoMeses: selectedCredit.plazoMeses,
        tipoTasa: selectedCredit.tipoTasa
    }) : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Créditos */}
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Mis Créditos</CardTitle>
                        <Dialog open={openNew} onOpenChange={(open) => {
                            setOpenNew(open);
                            if (!open) {
                                setEditingCredit(null);
                                setNewCredit({ nombre: '', montoTotal: '', saldoActual: '', tasaInteres: '', plazoMeses: '', fechaInicio: new Date().toISOString().split('T')[0], tipoTasa: 'EA' });
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button size="sm"><Plus className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingCredit ? 'Editar Crédito' : 'Nuevo Crédito'}</DialogTitle>
                                    <DialogDescription>{editingCredit ? 'Actualiza los detalles de tu deuda' : 'Registra los detalles de tu deuda'}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Nombre</Label>
                                        <Input value={newCredit.nombre} onChange={e => setNewCredit({ ...newCredit, nombre: e.target.value })} placeholder="Ej: Hipotecario" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Monto Total</Label>
                                            <Input type="number" value={newCredit.montoTotal} onChange={e => setNewCredit({ ...newCredit, montoTotal: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Saldo Actual</Label>
                                            <Input type="number" value={newCredit.saldoActual} onChange={e => setNewCredit({ ...newCredit, saldoActual: e.target.value })} placeholder="Igual a monto" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Tipo de Tasa</Label>
                                        <RadioGroup
                                            value={newCredit.tipoTasa}
                                            onValueChange={(val) => setNewCredit({ ...newCredit, tipoTasa: val as 'Mensual' | 'EA' })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="EA" id="tasa-ea" />
                                                <Label htmlFor="tasa-ea">Efectiva Anual (E.A)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Mensual" id="tasa-mensual" />
                                                <Label htmlFor="tasa-mensual">Mensual</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>{newCredit.tipoTasa === 'Mensual' ? 'Tasa Mensual (%)' : 'Tasa E.A (%)'}</Label>
                                            <Input type="number" step="0.01" value={newCredit.tasaInteres} onChange={e => setNewCredit({ ...newCredit, tasaInteres: e.target.value })} placeholder={newCredit.tipoTasa === 'Mensual' ? "Ej: 2.4" : "Ej: 12.5"} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Plazo (Meses)</Label>
                                            <Input type="number" value={newCredit.plazoMeses} onChange={e => setNewCredit({ ...newCredit, plazoMeses: e.target.value })} placeholder="60" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Fecha Inicio</Label>
                                        <Input type="date" value={newCredit.fechaInicio} onChange={e => setNewCredit({ ...newCredit, fechaInicio: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreate}>{editingCredit ? 'Actualizar' : 'Guardar'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
                        {!loading && credits.length === 0 && <p className="text-sm text-muted-foreground">No hay créditos registrados.</p>}
                        {credits.map(c => (
                            <div
                                key={c.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedCredit?.id === c.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                onClick={() => setSelectedCredit(c)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium">{c.nombre}</h4>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => handleEdit(c, e)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-destructive" onClick={(e) => handleDelete(c.id, e)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground flex justify-between">
                                    <span>Saldo: {formatCurrency(c.saldoActual)}</span>
                                    <span>{c.tasaInteres}% {c.tipoTasa === 'Mensual' ? 'Mensual' : 'EA'}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Detalle del Crédito */}
            <div className="lg:col-span-2 space-y-6">
                {selectedCredit ? (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    {selectedCredit.nombre}
                                </CardTitle>
                                <CardDescription>
                                    Plazo: {selectedCredit.plazoMeses} meses • Inicio: {selectedCredit.fechaInicio}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">Cuota Mensual Aprox</div>
                                        <div className="text-xl font-bold">
                                            {formatCurrency(amortizacionTable[0]?.pagoTotal || 0)}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">Total Intereses</div>
                                        <div className="text-xl font-bold text-orange-600">
                                            {formatCurrency(amortizacionTable.reduce((acc, curr) => acc + curr.interes, 0))}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">Saldo Pendiente</div>
                                        <div className="text-xl font-bold text-primary">
                                            {formatCurrency(selectedCredit.saldoActual)}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar & Actions */}
                                <div className="mb-6 space-y-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">Progreso de Pago</div>
                                            <div className="text-2xl font-bold tracking-tight">
                                                {selectedCredit.montoTotal > 0 ? Math.round(((selectedCredit.montoTotal - selectedCredit.saldoActual) / selectedCredit.montoTotal) * 100) : 0}%
                                            </div>
                                        </div>

                                        <Dialog open={abonoDialogOpen} onOpenChange={setAbonoDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full sm:w-auto">
                                                    <TrendingUp className="h-4 w-4" /> Ingresar Abono
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Ingresar Abono a {selectedCredit.nombre}</DialogTitle>
                                                    <DialogDescription>
                                                        Registra un pago para reducir el saldo actual de tu deuda. Esto se guardará en tu historial de transacciones.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                                                        <span className="text-sm font-medium text-slate-600">Saldo Pendiente:</span>
                                                        <span className="text-sm font-bold text-slate-800">{formatCurrency(selectedCredit.saldoActual)}</span>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Monto a Abonar</Label>
                                                        <Input
                                                            type="number"
                                                            value={abonoValue}
                                                            onChange={e => setAbonoValue(e.target.value)}
                                                            placeholder="Ej: 500000"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setAbonoDialogOpen(false)}>Cancelar</Button>
                                                    <Button onClick={handleAddAbono} className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmar Abono</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${Math.max(0, Math.min(100, ((selectedCredit.montoTotal - selectedCredit.saldoActual) / selectedCredit.montoTotal) * 100))}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Tabs for Amortización vs Historial */}
                                <div className="flex gap-4 mb-4 border-b">
                                    <button
                                        className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'amortizacion' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => setActiveTab('amortizacion')}
                                    >
                                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Proyección</span>
                                    </button>
                                    <button
                                        className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'historial' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => setActiveTab('historial')}
                                    >
                                        <span className="flex items-center gap-2"><History className="h-4 w-4" /> Historial de Abonos</span>
                                    </button>
                                </div>

                                {activeTab === 'amortizacion' ? (
                                    <ScrollArea className="h-[300px] border rounded-md">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted sticky top-0">
                                                <tr>
                                                    <th className="p-2 text-left">Mes</th>
                                                    <th className="p-2 text-right">Cuota</th>
                                                    <th className="p-2 text-right">Interés</th>
                                                    <th className="p-2 text-right">Capital</th>
                                                    <th className="p-2 text-right">Saldo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {amortizacionTable.map((row) => (
                                                    <tr key={row.mes} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                        <td className="p-2 text-left font-medium">{row.mes}</td>
                                                        <td className="p-2 text-right">{formatCurrency(row.pagoTotal)}</td>
                                                        <td className="p-2 text-right text-orange-600">{formatCurrency(row.interes)}</td>
                                                        <td className="p-2 text-right text-emerald-600">{formatCurrency(row.capital)}</td>
                                                        <td className="p-2 text-right text-muted-foreground">{formatCurrency(row.saldoRestante)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </ScrollArea>
                                ) : (
                                    <ScrollArea className="h-[300px] border rounded-md">
                                        {transactions.filter(t => t.tipo === 'Abono Deuda' && t.descripcion.includes(selectedCredit.nombre)).length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full min-h-[200px]">
                                                <History className="h-10 w-10 mb-3 opacity-20" />
                                                <p>No hay abonos registrados para este crédito.</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted sticky top-0">
                                                    <tr>
                                                        <th className="p-2 text-left">Fecha</th>
                                                        <th className="p-2 text-right">Monto Abonado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions
                                                        .filter(t => t.tipo === 'Abono Deuda' && t.descripcion.includes(selectedCredit.nombre))
                                                        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                                        .map((txn) => (
                                                            <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                                <td className="p-2 text-left text-muted-foreground">{txn.fecha}</td>
                                                                <td className="p-2 text-right font-medium text-emerald-600">{formatCurrency(txn.monto)}</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>

                        {/* Simulador */}
                        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10">
                            <CardHeader>
                                <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                    <Calculator className="h-5 w-5" /> Simulador de Abono a Capital
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row items-end gap-4">
                                    <div className="grid gap-2 flex-1 w-full">
                                        <Label>Si abono extra hoy:</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-8"
                                                type="number"
                                                placeholder="5.000.000"
                                                value={extraPayment}
                                                onChange={(e) => setExtraPayment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleSimulate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Calcular Ahorro
                                    </Button>
                                </div>

                                {simulationResult && (
                                    <div className="mt-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="p-4 bg-white dark:bg-card rounded-lg border border-emerald-100 shadow-sm">
                                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                                <TrendingDown className="h-4 w-4" /> Ahorro en Intereses
                                            </div>
                                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                                {formatCurrency(simulationResult.ahorro)}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-card rounded-lg border border-emerald-100 shadow-sm">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Calendar className="h-4 w-4" /> Tiempo Reducido
                                            </div>
                                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                                {simulationResult.meses} meses
                                            </div>
                                            <div className="text-xs text-muted-foreground">aprox. {Math.round(simulationResult.meses / 12 * 10) / 10} años</div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl text-center text-muted-foreground min-h-[400px]">
                        <CreditCard className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Selecciona un crédito</h3>
                        <p>Haz clic en un crédito de la lista para ver su tabla de amortización y simular pagos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
