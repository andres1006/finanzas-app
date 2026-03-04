'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, TrendingUp, Award, PlusCircle } from 'lucide-react';
import { MetaAhorro, calcularProgresoMeta, calcularDiasRestantes } from '@/lib/financeUtils';
import { Button } from '@/components/ui/button';
import AddSavingsModal from './AddSavingsModal';

interface SavingsGoalsProps {
  goals: MetaAhorro[];
  onGoalUpdate?: () => void;
}

export default function SavingsGoals({ goals, onGoalUpdate }: SavingsGoalsProps) {
  const [selectedGoal, setSelectedGoal] = useState<MetaAhorro | null>(null);

  const getMedal = (progress: number) => {
    if (progress >= 100) return { icon: '🏆', color: 'text-blue-400', label: 'Platinum' };
    if (progress >= 75) return { icon: '🥇', color: 'text-yellow-400', label: 'Gold' };
    if (progress >= 50) return { icon: '🥈', color: 'text-slate-300', label: 'Silver' };
    if (progress >= 25) return { icon: '🥉', color: 'text-amber-600', label: 'Bronze' };
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => {
        const progress = calcularProgresoMeta(goal);
        const dias = calcularDiasRestantes(goal.fechaLimite);
        const medal = getMedal(progress);

        return (
          <Card key={goal.id} className="relative overflow-hidden border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">{goal.nombre}</CardTitle>
              <Target className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ${goal.montoActual.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      de ${goal.montoObjetivo.toLocaleString('es-CO')}
                    </p>
                  </div>
                  {medal && (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl">{medal.icon}</span>
                      <span className={`text-[10px] font-bold uppercase ${medal.color}`}>{medal.label}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Progreso</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs">
                      <p className="font-medium">{dias} días</p>
                      <p className="text-muted-foreground uppercase text-[10px]">Restantes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs">
                      <p className="font-medium text-emerald-600">
                        {goal.prioridad}
                      </p>
                      <p className="text-muted-foreground uppercase text-[10px]">Prioridad</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full gap-2" 
                  variant="outline"
                  onClick={() => setSelectedGoal(goal)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Ahorrar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {selectedGoal && (
        <AddSavingsModal 
          goal={selectedGoal} 
          onClose={() => setSelectedGoal(null)}
          onSuccess={() => {
            setSelectedGoal(null);
            if (onGoalUpdate) onGoalUpdate();
          }}
        />
      )}
    </div>
  );
}
