import React from 'react';
import type { BudgetToggles } from '../hooks/useModulosOrchestration';

interface PostulacionWidgetProps {
    budgetToggles: BudgetToggles;
    budgetValues: { equipos: number; materiales: number; vinculacion: number };
    toggleBudget: (key: keyof BudgetToggles) => void;
    currentBudgetTotal: number;
    budgetPct: number;
}

export const PostulacionWidget: React.FC<PostulacionWidgetProps> = ({
    budgetToggles,
    budgetValues,
    toggleBudget,
    currentBudgetTotal,
    budgetPct
}) => {
    return (
        <div className="h-full flex flex-col gap-3">

            {/* Header del widget */}
            <div className="flex justify-between items-center border-b border-border-thin/40 pb-2 text-[10px] font-mono text-text-dim">
                <span className="font-semibold text-text-main">// PEA: DISTRIBUCIÓN HORARIA Y MALLA</span>
                <span>MOD-01</span>
            </div>

            {/* Contenido principal de Horas Curriculares */}
            <div className="flex-1 flex flex-col justify-center gap-3">

                {/* Gráfico de Barras Curricular Interactivo */}
                <div className="grid grid-cols-12 gap-3 bg-surface/20 p-2.5 rounded border border-border-thin/30 text-left font-mono">

                    {/* Desglose visual de columnas */}
                    <div className="col-span-6 flex items-end justify-around h-16 border-b border-border-thin/40 pb-1">
                        <div className="flex flex-col items-center w-8">
                            <div className="rounded-t transition-all duration-500 ease-out shadow-sm" style={{ width: '18px', height: budgetToggles.equipos ? '46px' : '0px', backgroundColor: '#0070f3' }} />
                            <span className="text-[7px] text-text-dim mt-1">DOC</span>
                        </div>
                        <div className="flex flex-col items-center w-8">
                            <div className="rounded-t transition-all duration-500 ease-out shadow-sm" style={{ width: '18px', height: budgetToggles.materiales ? '26px' : '0px', backgroundColor: '#10b981' }} />
                            <span className="text-[7px] text-text-dim mt-1">APE</span>
                        </div>
                        <div className="flex flex-col items-center w-8">
                            <div className="rounded-t transition-all duration-500 ease-out shadow-sm" style={{ width: '18px', height: budgetToggles.vinculacion ? '46px' : '0px', backgroundColor: '#f59e0b' }} />
                            <span className="text-[7px] text-text-dim mt-1">AUT</span>
                        </div>
                    </div>

                    {/* Métricas dinámicas en vivo */}
                    <div className="col-span-6 flex flex-col justify-center text-[8.5px] border-l border-border-thin/20 pl-3 gap-1">
                        <div className="flex justify-between">
                            <span className="text-text-dim">Malla SIGAFI:</span>
                            <span className="text-text-main font-bold">160 Horas</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-dim">Planificadas:</span>
                            <span className="text-brand font-bold">160 Horas</span>
                        </div>
                        <div className="flex justify-between border-t border-border-thin/10 pt-1">
                            <span className="text-text-dim">Estado:</span>
                            <span className="text-success font-bold">
                                100% CUADRADO
                            </span>
                        </div>
                    </div>

                </div>

                {/* Encabezado curricular */}
                <div className="flex justify-between items-center bg-surface/30 p-2.5 rounded border border-border-thin/40">
                    <span className="text-[9.5px] font-mono text-text-dim uppercase">// COMPONENTES DEL PEA</span>
                    <span className="text-brand font-bold text-xs font-mono bg-brand-subtle px-2 py-0.5 rounded border border-brand/20">
                        Total Asignatura: 160h (4 Créditos)
                    </span>
                </div>

                {/* Rejilla de tarjetas de horas */}
                <div className="grid grid-cols-3 gap-2">
                    {(['equipos', 'materiales', 'vinculacion'] as const).map((key) => {
                        const active = budgetToggles[key];
                        const label = key === 'equipos' ? '01/ DOCENCIA' : key === 'materiales' ? '02/ APE EXP.' : '03/ AUTÓNOMO';
                        const valText = key === 'equipos' ? '64h' : key === 'materiales' ? '32h' : '64h';

                        return (
                            <button
                                key={key}
                                onClick={() => toggleBudget(key)}
                                className={`p-2 border rounded text-left transition-all duration-300 cursor-pointer ${active
                                    ? 'bg-bg-deep border-brand/50 shadow-sm'
                                    : 'bg-surface/10 border-border-thin opacity-35 hover:opacity-60'
                                    }`}
                            >
                                <p className="text-[8px] text-text-dim font-bold font-mono">{label}</p>
                                <p className="text-[11px] font-bold text-text-main mt-0.5 font-mono">{valText}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Barra de progreso de correspondencia horaria */}
                <div className="space-y-1.5 bg-surface/30 p-2.5 rounded border border-border-thin/30 text-left font-mono">
                    <div className="flex justify-between text-[8.5px] text-text-dim">
                        <span>Balance Horario vs Malla Institucional</span>
                        <span className="font-bold text-text-main">{budgetPct}%</span>
                    </div>
                    <div className="w-full bg-border-thin h-1 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-success transition-all duration-500 ease-out"
                            style={{ width: `${budgetPct}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[8px] pt-1.5 border-t border-border-thin/10">
                        <span>VALIDACIÓN CURRICULAR:</span>
                        <span className="text-success font-bold">HORAS VALIDADAS CON SIGAFI ✓</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
