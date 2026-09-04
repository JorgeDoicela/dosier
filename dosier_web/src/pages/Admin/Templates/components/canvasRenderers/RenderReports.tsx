import React from 'react';


export const RenderProjectProgressReport: React.FC<{ config: any }> = ({ config }) => {
    const c = config || {};
    return (
        <div className="my-2 space-y-3 select-none">
            {c.showEvidencias !== false && (
                <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50 space-y-1 text-[8.5px]">
                    <strong className="text-slate-700 block font-bold">Bitácora Científica & Conclusiones Parciales:</strong>
                    <p className="text-slate-500 italic">[Redacción de bitácora y conclusiones acumuladas por investigadores...]</p>
                </div>
            )}

            {c.showHitosCompletados !== false && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="p-1.5 bg-slate-800 text-white font-bold text-[8.5px] uppercase tracking-wider">
                        Hitos & Entregables Completados
                    </div>
                    <table className="w-full text-[8.5px] border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <th className="p-1 text-left">Actividad / Hito</th>
                                <th className="p-1 text-center w-16">% Avance</th>
                                <th className="p-1 text-center w-20">Completado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100 text-slate-600">
                                <td className="p-1">[Hito de Investigación]</td>
                                <td className="p-1 text-center font-bold">100 %</td>
                                <td className="p-1 text-center font-bold text-emerald-600">SÍ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

