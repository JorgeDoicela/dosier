import React from 'react';

export type DosierRole = 'admin' | 'docente' | 'estudiante' | 'revisor' | 'externo' | 'todos';

export interface HelpStep {
    title: string;
    description: string;
    highlight: 'sidebar' | 'topbar' | 'content-top' | 'content-bottom' | 'all' | 'none';
    /** Roles que pueden ver este paso específico (por defecto: todos los que acceden al módulo) */
    roles?: DosierRole[];
}

export interface HelpTipItem {
    text: string;
    /** Roles que pueden ver este consejo específico */
    roles?: DosierRole[];
}

export type HelpTip = string | HelpTipItem;

export interface MockupProps {
    highlightTopClass: string;
    highlightBottomClass: string;
}

export interface HelpConfig {
    icon: React.ReactNode;
    title: string;
    summary: string;
    description: string;
    steps: HelpStep[];
    compliance: string;
    tips: (string | HelpTipItem)[];
    Mockup?: React.ComponentType<MockupProps>;
    /** Roles autorizados para consultar esta guía */
    roles?: DosierRole[];
    /** Sobrescrituras opcionales según el rol del usuario conectado */
    roleOverrides?: Partial<Record<DosierRole, Partial<Pick<HelpConfig, 'title' | 'summary' | 'description' | 'compliance'>>>>;
}
