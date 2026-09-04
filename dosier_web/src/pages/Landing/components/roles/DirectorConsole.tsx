import React from 'react';

interface DirectorConsoleProps {
    assignmentCriteria: 'linea' | 'carga' | 'aleatorio';
    setAssignmentCriteria: (crit: 'linea' | 'carga' | 'aleatorio') => void;
    assignState: 'idle' | 'assigning' | 'assigned';
    setAssignState: (state: 'idle' | 'assigning' | 'assigned') => void;
    assignLog: string;
    setAssignLog: (log: string) => void;
    runAssignSimulation: () => void;
}

export const DirectorConsole: React.FC<DirectorConsoleProps> = ({
    assignmentCriteria,
    setAssignmentCriteria,
    assignState,
    setAssignState,
    assignLog,
    setAssignLog,
    runAssignSimulation,
}) => {
    return (
        <div className="space-y-2.5 animate-fade-in text-[9.5px] font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="border border-border-thin rounded p-2 bg-bg-deep/40 flex flex-col justify-between gap-2.5">
                    <div>
                        <span className="text-[8px] md:text-[8.5px] text-text-dim uppercase block">Criterio de validación curricular</span>
                        <div className="flex flex-col gap-1.5 mt-1.5">
                            {[
                                { value: 'linea', label: 'Por Malla Curricular Activa' },
                                { value: 'carga', label: 'Por Prerrequisitos y Horas' },
                                { value: 'aleatorio', label: 'Validación Integral CACES' }
                            ].map((crit) => (
                                <button
                                    key={crit.value}
                                    type="button"
                                    onClick={() => {
                                        setAssignmentCriteria(crit.value as any);
                                        setAssignState('idle');
                                        setAssignLog('Esperando validación de la coordinación...');
                                    }}
                                    className={`text-left px-2.5 py-1.5 rounded text-[9.5px] md:text-[10px] font-sans font-medium transition-all border cursor-pointer ${
                                        assignmentCriteria === crit.value
                                            ? 'bg-brand border-brand text-white shadow-sm font-semibold'
                                            : 'bg-surface border-border-thin text-text-dim hover:text-text-main hover:bg-surface-hover'
                                    }`}
                                >
                                    {crit.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={runAssignSimulation}
                        disabled={assignState !== 'idle'}
                        className={`w-full py-1.5 rounded font-semibold text-[9.5px] md:text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
                            assignState === 'assigning'
                                ? 'bg-surface border border-border-thin text-text-dim'
                                : assignState === 'assigned'
                                    ? 'bg-success/15 border border-success/30 text-success'
                                    : 'bg-text-main text-bg-deep hover:opacity-95'
                        }`}
                    >
                        {assignState === 'assigning' ? 'Validando...' : assignState === 'assigned' ? 'Planificación Aprobada ✓' : 'Validar Planificación'}
                    </button>
                </div>
                <div className="border border-border-thin rounded p-2 bg-bg-deep/40 flex flex-col justify-center min-h-[70px] space-y-1 text-[8.5px] md:text-[9px]">
                    <span className="text-[8px] md:text-[8.5px] text-text-dim uppercase block">Auditoría Curricular SIGAFI</span>
                    <p className={`text-[8.5px] md:text-[9px] font-mono leading-tight ${assignState === 'assigning' ? 'text-brand animate-pulse' : assignState === 'assigned' ? 'text-success font-semibold' : 'text-text-dim'}`}>
                        {assignLog}
                    </p>
                    {assignState === 'assigned' && (
                        <div className="space-y-0.5 mt-0.5 animate-fade-in text-[8px] md:text-[8.5px]">
                            <p className="text-[8px] text-text-dim uppercase tracking-wider">// VALIDACIÓN CURRICULAR CONCLUIDA</p>
                            <div className="flex flex-wrap gap-1.5 font-mono text-[7.5px] md:text-[8px]">
                                <span className="border border-border-thin px-1 py-0.5 rounded bg-surface/50">Malla: 2026-A OK</span>
                                <span className="border border-border-thin px-1 py-0.5 rounded bg-surface/50">Horas: 160h OK</span>
                                <span className="border border-border-thin px-1 py-0.5 rounded bg-surface/50">Prerreq: 100% OK</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
