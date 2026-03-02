'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, DollarSign, Tag, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionFormProps {
    onSubmit: (data: FormData) => Promise<void>;
    loading: boolean;
}

export interface FormData {
    Tipo: 'Gasto' | 'Ingreso' | 'Abono Deuda';
    Categoría: string;
    Descripción: string;
    Monto: string;
    Usuario: 'Andrés' | 'Mariana';
    Fecha: string;
}

export default function TransactionForm({ onSubmit, loading }: TransactionFormProps) {
    const [formData, setFormData] = useState<FormData>({
        Tipo: 'Gasto',
        Categoría: 'Hogar',
        Descripción: '',
        Monto: '',
        Usuario: 'Andrés',
        Fecha: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.Descripción || !formData.Monto || !formData.Fecha) {
            toast.warning('Por favor completa todos los campos requeridos');
            return;
        }

        try {
            await onSubmit(formData);
            toast.success('Transacción guardada exitosamente');

            // Reset form
            setFormData({
                ...formData,
                Descripción: '',
                Monto: '',
                Fecha: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error(error);
            toast.error('Hubo un error al guardar la transacción');
        }
    };

    return (
        <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <PlusCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    Registrar Movimiento
                </CardTitle>
                <CardDescription>
                    Agrega un nuevo ingreso, gasto o abono a deuda
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fila 1: Fecha y Tipo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fecha" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-emerald-600" />
                                Fecha
                            </Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={formData.Fecha}
                                onChange={(e) => setFormData({ ...formData, Fecha: e.target.value })}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tipo" className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-emerald-600" />
                                Tipo de Movimiento
                            </Label>
                            <Select
                                value={formData.Tipo}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, Tipo: value as FormData['Tipo'] })
                                }
                            >
                                <SelectTrigger id="tipo" className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Gasto">💸 Gasto</SelectItem>
                                    <SelectItem value="Ingreso">💰 Ingreso</SelectItem>
                                    <SelectItem value="Abono Deuda">💳 Abono Deuda</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Fila 2: Usuario y Categoría */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="usuario" className="flex items-center gap-2">
                                <span className="text-lg">👤</span>
                                Usuario
                            </Label>
                            <Select
                                value={formData.Usuario}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, Usuario: value as FormData['Usuario'] })
                                }
                            >
                                <SelectTrigger id="usuario" className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Andrés">👨 Andrés</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoria" className="flex items-center gap-2">
                                <span className="text-lg">📁</span>
                                Categoría
                            </Label>
                            <Select
                                value={formData.Categoría}
                                onValueChange={(value) => setFormData({ ...formData, Categoría: value })}
                            >
                                <SelectTrigger id="categoria" className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hogar">🏠 Hogar</SelectItem>
                                    <SelectItem value="Alimentación">🍔 Alimentación</SelectItem>
                                    <SelectItem value="Transporte">🚗 Transporte</SelectItem>
                                    <SelectItem value="Deudas">💳 Deudas</SelectItem>
                                    <SelectItem value="Entretenimiento">🎮 Entretenimiento</SelectItem>
                                    <SelectItem value="Salud">⚕️ Salud</SelectItem>
                                    <SelectItem value="Educación">📚 Educación</SelectItem>
                                    <SelectItem value="Otros">📦 Otros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    {/* Fila 3: Monto y Descripción */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="monto" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                Monto (COP)
                            </Label>
                            <Input
                                id="monto"
                                type="number"
                                placeholder="50,000"
                                value={formData.Monto}
                                onChange={(e) => setFormData({ ...formData, Monto: e.target.value })}
                                min="0"
                                step="1000"
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descripcion" className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-600" />
                                Descripción
                            </Label>
                            <Input
                                id="descripcion"
                                placeholder="Ej: Compra de mercado en Éxito"
                                value={formData.Descripción}
                                onChange={(e) => setFormData({ ...formData, Descripción: e.target.value })}
                                className="h-11"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Botón de Submit */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-base shadow-lg"
                        size="lg"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        {loading ? 'Guardando...' : 'Guardar Transacción'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
