import React from 'react';

export const ModulosHeader: React.FC = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tighter leading-[0.95] text-text-main">
                Módulos de Documentación
            </h2>
            <p className="text-text-dim text-sm max-w-xl leading-relaxed">
                Explora a detalle cómo opera cada módulo de DOSIER para estandarizar el diseño curricular, la co-redacción en tiempo real y la acreditación ante el CACES.
            </p>
        </div>
    );
};
