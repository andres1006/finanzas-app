import { LoginForm } from '@/components/auth/login-form';
import { Wallet } from 'lucide-react';

interface LoginPageProps {
    onLogin: (user: 'Andrés' | 'Mariana') => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left side - Illustration/Branding */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600" />
                <div className="relative z-20 flex items-center gap-3 text-lg font-medium">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                        <Wallet className="h-7 w-7" />
                    </div>
                    <span className="text-2xl font-bold">FinanzasApp</span>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            "Esta aplicación me ha ayudado a tener un mejor control de mis finanzas personales.
                            Ahora puedo visualizar mis gastos y ahorros de manera clara y sencilla."
                        </p>
                        <footer className="text-sm">Andrés</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                    <div className="flex flex-col space-y-2 text-center lg:hidden mb-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg mb-4">
                            <Wallet className="h-9 w-9 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                            FinanzasApp
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Control financiero personal
                        </p>
                    </div>

                    <LoginForm onLogin={onLogin} />

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Al continuar, aceptas nuestros{' '}
                        <a
                            href="#"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Términos de Servicio
                        </a>{' '}
                        y{' '}
                        <a
                            href="#"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Política de Privacidad
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
