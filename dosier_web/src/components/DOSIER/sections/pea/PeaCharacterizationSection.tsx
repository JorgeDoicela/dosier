import React from 'react';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { PeaObjectivesSection } from './PeaObjectivesSection';
import { PeaPrerequisitesSection } from './PeaPrerequisitesSection';

interface PeaCharacterizationSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
    onAdd?: (list: string, template: any) => void;
    onRemove?: (list: string, index: number) => void;
    onUpdateItem?: (list: string, index: number, field: string, value: any) => void;
}

/**
 * [LEGACY COMPATIBILITY] Wrapper compuesto que renderiza b) Objetivo y c) Prerrequisitos
 * si una plantilla anterior aún referencia pea_characterization_section.
 */
export const PeaCharacterizationSection: React.FC<PeaCharacterizationSectionProps> = (props) => {
    return (
        <div className="w-full space-y-8 animate-fade-in font-sans">
            <PeaObjectivesSection
                formData={props.formData}
                cowork={props.cowork}
                onUpdate={props.onUpdate}
                readOnly={props.readOnly}
                config={props.config}
            />
            <PeaPrerequisitesSection
                formData={props.formData}
                cowork={props.cowork}
                onUpdate={props.onUpdate}
                readOnly={props.readOnly}
                config={props.config}
                onAdd={props.onAdd}
                onRemove={props.onRemove}
                onUpdateItem={props.onUpdateItem}
            />
        </div>
    );
};
