import React from 'react';
import { ProjectWorkspace } from '../Proyectos/Workspace/ProjectWorkspace';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER — Dominio Curricular: Espacio de Trabajo Documental (Workspace)
 * ══════════════════════════════════════════════════════════════════════════════
 * Orquestador principal del editor documental colaborativo. Monta el constructor
 * DOSIERBuilderShell con sincronización concurrente Yjs (CRDTs) y soporte para
 * las 11 secciones normativas del PEA y futuros instrumentos docentes.
 */
export const DocumentWorkspace: React.FC = () => {
    return <ProjectWorkspace />;
};

export default DocumentWorkspace;
