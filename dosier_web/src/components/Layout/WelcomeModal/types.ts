import type { DosierRole } from '../Help/types';

export interface RoleBenefit {
    title: string;
    description: string;
    tag: string;
    path?: string;
}

export interface RoleWelcomeConfig {
    role: DosierRole;
    roleLabel: string;
    greeting: string;
    systemDescription: string;
    sectionTitle: string;
    benefits: RoleBenefit[];
    primaryActionLabel: string;
    primaryActionPath?: string;
}

