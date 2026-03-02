'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

interface LoginFormProps {
    onLogin: (user: 'Andrés' | 'Mariana') => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const [selectedUser, setSelectedUser] = useState<'Andrés' | 'Mariana'>('Andrés');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validPasswords: Record<string, string> = {
            'Andrés': 'andres123',
            'Mariana': 'mariana123',
        };

        if (password === validPasswords[selectedUser]) {
            onLogin(selectedUser);
        } else {
            setError('Contraseña incorrecta');
            setPassword('');
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
                <CardDescription>
                    Ingresa tus credenciales para acceder a tu cuenta
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user">Usuario</Label>
                        <Select value={selectedUser} onValueChange={(value) => setSelectedUser(value as 'Andrés' | 'Mariana')}>
                            <SelectTrigger id="user">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Andrés">
                                    <div className="flex items-center gap-2">
                                        <span>👨</span>
                                        <span>Andrés</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Mariana">
                                    <div className="flex items-center gap-2">
                                        <span>👩</span>
                                        <span>Mariana</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Button type="submit" className="w-full">
                        Iniciar sesión
                    </Button>
                </form>
            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col space-y-4 pt-6">
                <div className="text-sm text-muted-foreground text-center">
                    <p className="font-medium mb-2">Credenciales de prueba:</p>
                    <div className="space-y-1">
                        <p>👨 Andrés: <code className="bg-muted px-1 py-0.5 rounded">andres123</code></p>
                        <p>👩 Mariana: <code className="bg-muted px-1 py-0.5 rounded">mariana123</code></p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
