import React from 'react';
import { Globe, Terminal } from 'lucide-react';

const Interoperability: React.FC = () => {
    return (
        <section className="text-center space-y-8 py-16 lg:-ml-24 lg:-mr-24">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-text-dim uppercase tracking-wider select-none">
                <Globe size={12} className="text-[#0070f3]" strokeWidth={1.5} />
                <span>Sincronización de Datos</span>
            </div>
            <h3 className="text-3xl md:text-5xl lg:text-[56px] font-bold tracking-tighter text-text-main leading-[0.95]">
                Conectado con su <br className="hidden md:inline" /> Gestión Académica
            </h3>
            <p className="text-xs text-text-dim max-w-lg mx-auto leading-relaxed">
                DOSIER se acopla a la base de datos institucional SIGAFI para sincronizar en tiempo real las materias asignadas, mallas curriculares, prerrequisitos y horas de cada docente del Tecnológico Traversari.
            </p>

            {/* Mock API Terminal Box */}
            <div className="max-w-xl mx-auto border border-border-thin rounded-xl bg-surface shadow-xl p-4 font-mono text-[11px] text-left relative overflow-x-auto select-none">
                <div className="flex items-center gap-1.5 border-b border-border-thin pb-2.5 mb-3">
                    <Terminal size={12} className="text-text-dim" strokeWidth={1.5} />
                    <span className="text-[10px] text-text-dim font-bold">// API Sincronización SIGAFI — ISTPET</span>
                </div>
                <div className="space-y-1.5 text-text-dim">
                    <p className="text-text-main">
                        <span className="text-[#0070f3]">$</span> curl -X GET https://api.dosier.istpet.edu.ec/api/docente-asignaturas/mis-materias \
                    </p>
                    <p className="pl-4">
                        -H <span className="text-emerald-600 dark:text-emerald-400">"Authorization: Bearer token_istpet_docente_2026"</span>
                    </p>
                    <p className="text-text-main mt-3">// RESPONSE OK (200)</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {`{ "status": "synchronized", "periodo": "2026-A", "materias": 4, "malla_horas_valid": true }`}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Interoperability;
