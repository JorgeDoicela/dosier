import React from 'react';

export type DosierRole =
    | 'admin'
    | 'docente'
    | 'coord_carrera'
    | 'coord_acad'
    | 'vicerrector'
    | 'todos';

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

export interface HelpVideoItem {
    id: string;
    title: string;
    description?: string;
    duration?: string;
    url: string;
    poster?: string;
    /** Roles que pueden ver este video específico (por defecto: todos los del módulo) */
    roles?: DosierRole[];
}

export interface HelpConfig {
    icon: React.ReactNode;
    title: string;
    summary: string;
    description: string;
    steps: HelpStep[];
    compliance: string;
    tips: (string | HelpTipItem)[];
    videos?: HelpVideoItem[];
    Mockup?: React.ComponentType<MockupProps>;
    /** Roles autorizados para consultar esta guía */
    roles?: DosierRole[];
    /** Sobrescrituras opcionales según el rol del usuario conectado */
    roleOverrides?: Partial<Record<DosierRole, Partial<Pick<HelpConfig, 'title' | 'summary' | 'description' | 'compliance' | 'videos'>>>>;
}
