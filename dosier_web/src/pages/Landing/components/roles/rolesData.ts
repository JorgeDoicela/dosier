import { Users, LayoutDashboard, Scale, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface RoleInfo {
    role: string;
    desc: string;
    icon: LucideIcon;
    permissions: string[];
}

export const ROLES_DATA: RoleInfo[] = [
    { 
        role: 'Docente de Cátedra', 
        desc: 'Docentes que elaboran y co-redactan PEAs, Sílabos (19 semanas) y Guías de Práctica APE.', 
        icon: Users,
        permissions: ['Co-redacción en tiempo real', 'Validación matemática de horas', 'Generación de Guías APE y Estudio']
    },
    { 
        role: 'Coordinador de Carrera', 
        desc: 'Supervisa la articulación curricular, correspondencia de mallas y emite observaciones técnicas.', 
        icon: LayoutDashboard,
        permissions: ['Revisión curricular de PEAs y Sílabos', 'Validación de prerrequisitos', 'Aprobación de primer nivel']
    },
    { 
        role: 'Vicerrectorado Académico', 
        desc: 'Autoridad institucional que aprueba y legaliza los documentos con firma electrónica .p12.', 
        icon: Scale,
        permissions: ['Aprobación institucional definitiva', 'Firma electrónica oficial', 'Sellado forense de expedientes']
    },
    { 
        role: 'Administrador Curricular', 
        desc: 'Gestión de períodos académicos, mallas curriculares de SIGAFI y auditorías del CACES.', 
        icon: ShieldCheck,
        permissions: ['Sincronización con SIGAFI', 'Parametrización de períodos y mallas', 'Auditoría y reportes CACES']
    },
];
