'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MetaAhorro, calcularProgresoMeta, calcularAhorroMensualNecesario } from '@/lib/financeUtils';
import { Target, TrendingUp, Calendar, AlertCircle, Plus, Medal, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface SavingsGoalsProps {
    goals: MetaAhorro[];
    onGoalsChange: () => Promise<void>;
}

export default function SavingsGoals({ goals, onGoalsChange }: SavingsGoalsProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newGoal, setNewGoal] = useState({
        nombre: '',
        montoObjetivo: '',
        montoActual: '',
        fechaLimite: '',
        prioridad: 'Media',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newGoal.nombre || !newGoal.montoObjetivo || !newGoal.fechaLimite) {
            toast.warning('Completa los campos requeridos');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newGoal,
                    montoObjetivo: Number(newGoal.montoObjetivo),
                    montoActual: Number(newGoal.montoActual) || 0,
                }),
            });

            if (!res.ok) throw new Error('Error al crear meta');

            toast.success('Meta creada exitosamente');
            setOpen(false);
            setNewGoal({
                nombre: '',
                montoObjetivo: '',
                montoActual: '',
                fechaLimite: '',
                prioridad: 'Media',
            });
            await onGoalsChange();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la meta');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getPrioridadColor = (prioridad: string) => {
        switch (prioridad) {
            case 'Alta':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
            case 'Media':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30';
            case 'Baja':
                return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30';
            default:
                return '';
        }
    };

    const getDiasRestantes = (fechaLimite: string) => {
        const hoy = new Date();
        const limite = new Date(fechaLimite);
        const diff = limite.getTime() - hoy.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Mis Metas
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Gestiona tus objetivos financieros
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Nueva Meta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Crear Nueva Meta</DialogTitle>
                                <DialogDescription>
                                    Define un objetivo de ahorro claro y alcanzable.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre de la Meta</Label>
                                    <Input
                                        id="nombre"
                                        value={newGoal.nombre}
                                        onChange={(e) => setNewGoal({ ...newGoal, nombre: e.target.value })}
                                        placeholder="Ej: Vacaciones, Carro..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="montoObjetivo">Monto Objetivo</Label>
                                        <Input
                                            id="montoObjetivo"
                                            type="number"
                                            value={newGoal.montoObjetivo}
                                            onChange={(e) => setNewGoal({ ...newGoal, montoObjetivo: e.target.value })}
                                            placeholder="$$$"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="montoActual">Ahorro Actual</Label>
                                        <Input
                                            id="montoActual"
                                            type="number"
                                            value={newGoal.montoActual}
                                            onChange={(e) => setNewGoal({ ...newGoal, montoActual: e.target.value })}
                                            placeholder="$$$ (Opcional)"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fechaLimite">Fecha Límite</Label>
                                        <Input
                                            id="fechaLimite"
                                            type="date"
                                            value={newGoal.fechaLimite}
                                            onChange={(e) => setNewGoal({ ...newGoal, fechaLimite: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="prioridad">Prioridad</Label>
                                        <Select
                                            value={newGoal.prioridad}
                                            onValueChange={(val) => setNewGoal({ ...newGoal, prioridad: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Alta">Alta</SelectItem>
                                                <SelectItem value="Media">Media</SelectItem>
                                                <SelectItem value="Baja">Baja</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Guardando...' : 'Crear Meta'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
            </Card>

            {/* Metas */}
            {goals.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                        <Target className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No tienes metas registradas</h3>
                        <p className="text-muted-foreground mb-4">Empieza creando una nueva meta de ahorro.</p>
                        <Button variant="outline" onClick={() => setOpen(true)}>Crear mi primera meta</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {goals.map((meta) => {
                        const progreso = calcularProgresoMeta(meta);
                        const ahorroMensual = calcularAhorroMensualNecesario(meta);
                        const diasRestantes = getDiasRestantes(meta.fechaLimite);
                        const montoFaltante = meta.montoObjetivo - meta.montoActual;

                        return (
                            <Card key={meta.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl">{meta.nombre}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadColor(meta.prioridad)}`}>
                                                    Prioridad {meta.prioridad}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">
                                                {progreso.toFixed(0)}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">Completado</div>
                                        </div>
                                    </div>
                                    {/* Medallas / Gamificación */}
                                    <div className="flex gap-2 mt-4">
                                        <div className={`p-1.5 rounded-full border transition-all duration-500 ${progreso >= 25 ? "bg-amber-100 border-amber-200 text-amber-700 opacity-100 scale-110 shadow-sm" : "bg-gray-50 border-gray-100 text-gray-300 opacity-40 grayscale"}`} title="Bronce (25%)">
                                            <Medal className="h-5 w-5" />
                                        </div>
                                        <div className={`p-1.5 rounded-full border transition-all duration-500 ${progreso >= 50 ? "bg-slate-100 border-slate-200 text-slate-600 opacity-100 scale-110 shadow-sm" : "bg-gray-50 border-gray-100 text-gray-300 opacity-40 grayscale"}`} title="Plata (50%)">
                                            <Medal className="h-5 w-5" />
                                        </div>
                                        <div className={`p-1.5 rounded-full border transition-all duration-500 ${progreso >= 75 ? "bg-yellow-100 border-yellow-200 text-yellow-700 opacity-100 scale-110 shadow-sm" : "bg-gray-50 border-gray-100 text-gray-300 opacity-40 grayscale"}`} title="Oro (75%)">
                                            <Medal className="h-5 w-5" />
                                        </div>
                                        <div className={`p-1.5 rounded-full border transition-all duration-500 ${progreso >= 100 ? "bg-indigo-100 border-indigo-200 text-indigo-700 opacity-100 scale-110 shadow-sm" : "bg-gray-50 border-gray-100 text-gray-300 opacity-40 grayscale"}`} title="Platino (100%)">
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Barra de Progreso */}
                                    <div className="space-y-2">
                                        <Progress value={progreso} className="h-3" />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {formatCurrency(meta.montoActual)}
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(meta.montoObjetivo)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Información */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <TrendingUp className="h-3 w-3" />
                                                Ahorro Mensual Necesario
                                            </div>
                                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(ahorroMensual)}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <AlertCircle className="h-3 w-3" />
                                                Monto Faltante
                                            </div>
                                            <div className="text-lg font-bold">
                                                {formatCurrency(montoFaltante)}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                Días Restantes
                                            </div>
                                            <div className={`text-lg font-bold ${diasRestantes < 30 ? 'text-red-600 dark:text-red-400' :
                                                diasRestantes < 90 ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                {diasRestantes} días
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fecha Límite */}
                                    <div className="pt-2 border-t">
                                        <div className="text-xs text-muted-foreground">
                                            Fecha límite: {new Date(meta.fechaLimite).toLocaleDateString('es-CO', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
