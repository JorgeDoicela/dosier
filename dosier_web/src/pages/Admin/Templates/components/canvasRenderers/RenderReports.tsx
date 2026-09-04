import React from 'react';

export const RenderProjectBudgetSection: React.FC<{ config: any }> = ({ config }) => {
    const c = config || {};
    return (
        <div className="my-2 space-y-3 select-none">

            {c.showRecursosDisponibles !== false && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="p-1.5 bg-slate-800 text-white font-bold text-[8.5px] uppercase tracking-wider">
                        4.1 Recursos Disponibles (Equipos, Licencias, Espacios)
                    </div>
                    <table className="w-full text-[8.5px] border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <th className="p-1 text-left">Descripción del Recurso</th>
                                <th className="p-1 text-center w-12">Cant.</th>
                                <th className="p-1 text-left w-28">Fuente</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100 text-slate-600">
                                <td className="p-1">[Ejemplo de Recurso Disponible / Infraestructura]</td>
                                <td className="p-1 text-center font-bold">1</td>
                                <td className="p-1">[Institucional / ISTPET]</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {c.showRecursosNecesarios !== false && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="p-1.5 bg-slate-800 text-white font-bold text-[8.5px] uppercase tracking-wider">
                        4.2 Recursos Necesarios (Presupuesto de Gasto)
                    </div>
                    <table className="w-full text-[8.5px] border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <th className="p-1 text-left">Partida / Rubro</th>
                                <th className="p-1 text-center w-12">Cant.</th>
                                <th className="p-1 text-right w-20">P. Unitario</th>
                                <th className="p-1 text-right w-20">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100 text-slate-600">
                                <td className="p-1">[Partida Presupuestaria de Gasto]</td>
                                <td className="p-1 text-center font-bold">1</td>
                                <td className="p-1 text-right">$ 0.00</td>
                                <td className="p-1 text-right font-bold">$ 0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {c.showFinanciamiento !== false && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[8.5px]">
                    <div className="space-y-1">
                        <div><strong className="text-slate-700">Financiamiento Solicitado al ISTPET:</strong> <span className="font-semibold text-indigo-600">[SÍ / NO]</span></div>
                        <div><strong className="text-slate-700">Financiamiento Otras Fuentes:</strong> <span className="text-slate-500">[No especificadas]</span></div>
                    </div>
                    <div className="text-right">
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 block">Costo Total Estimado</span>
                        <span className="text-xs font-black text-indigo-600">$ 0.00</span>
                    </div>
                </div>
            )}
        </div>
    );
};

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

