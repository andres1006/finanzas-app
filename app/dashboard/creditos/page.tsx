import CreditsManager from "@/components/CreditsManager";

export default function CreditsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Créditos</h2>
                <p className="text-muted-foreground">
                    Controla tus deudas, visualiza amortizaciones y simula pagos extraordinarios.
                </p>
            </div>
            
            <CreditsManager />
        </div>
    );
}
