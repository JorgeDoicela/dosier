import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface AvailableUnitOption {
    value: string;
    display: string;
    num: number;
}

interface UnitGroupSelectProps {
    value: string;
    availableUnits: AvailableUnitOption[];
    onChange: (newValue: string) => void;
    disabled?: boolean;
}

export function parseSelectedUnitNums(rawValue: string, availableUnits: AvailableUnitOption[]): number[] {
    const validNums = new Set(availableUnits.map(u => u.num));
    const matches = String(rawValue || '').match(/\d+/g);
    if (!matches || matches.length === 0) {
        return availableUnits.length > 0 ? [availableUnits[0].num] : [1];
    }

    const parsed = Array.from(
        new Set(
            matches
                .map(n => Number(n))
                .filter(n => Number.isFinite(n) && n > 0 && (validNums.size === 0 || validNums.has(n)))
        )
    ).sort((a, b) => a - b);

    if (parsed.length > 0) return parsed;
    return availableUnits.length > 0 ? [availableUnits[0].num] : [1];
}

export function formatUnitSelectionValue(selectedNums: number[]): string {
    const sorted = Array.from(new Set(selectedNums)).sort((a, b) => a - b);
    if (sorted.length <= 1) {
        return `Unidad ${sorted[0] ?? 1}`;
    }
    return sorted.join(', ');
}

export const UnitGroupSelect: React.FC<UnitGroupSelectProps> = ({
    value,
    availableUnits,
    onChange,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
        top: 0,
        left: 0,
        width: 340
    });
    const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');

    const selectedNums = useMemo(
        () => parseSelectedUnitNums(value, availableUnits),
        [value, availableUnits]
    );

    const displayLabel = useMemo(() => {
        if (selectedNums.length === 1) {
            const match = availableUnits.find(u => u.num === selectedNums[0]);
            return match ? match.display : `Unidad ${selectedNums[0]}`;
        }
        return `Unidades ${selectedNums.join(', ')}`;
    }, [selectedNums, availableUnits]);

    const allNums = useMemo(() => availableUnits.map(u => u.num), [availableUnits]);
    const isAllSelected = allNums.length > 1 && allNums.every(n => selectedNums.includes(n));

    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const popoverHeight = 320;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const openTop = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

            const viewportWidth = window.innerWidth;
            const targetWidth = Math.min(Math.max(rect.width, 360), viewportWidth - 32);
            let left = rect.left;
            if (left + targetWidth > viewportWidth - 16) {
                left = Math.max(16, viewportWidth - targetWidth - 16);
            }

            setPlacement(openTop ? 'top' : 'bottom');
            setCoords({
                top: openTop ? rect.top - 6 : rect.bottom + 6,
                left,
                width: targetWidth
            });
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutside = (e: MouseEvent) => {
            if (
                containerRef.current?.contains(e.target as Node) ||
                popoverRef.current?.contains(e.target as Node)
            ) {
                return;
            }
            setIsOpen(false);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const toggleUnit = (num: number) => {
        if (disabled) return;
        const exists = selectedNums.includes(num);
        if (exists) {
            if (selectedNums.length <= 1) return; // Mantener al menos 1 unidad seleccionada
            onChange(formatUnitSelectionValue(selectedNums.filter(n => n !== num)));
        } else {
            onChange(formatUnitSelectionValue([...selectedNums, num]));
        }
    };

    const selectOnlyUnit = (num: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        onChange(formatUnitSelectionValue([num]));
        setIsOpen(false);
    };

    const handleToggleAll = () => {
        if (disabled || allNums.length === 0) return;
        if (isAllSelected) {
            onChange(formatUnitSelectionValue([allNums[0]]));
        } else {
            onChange(formatUnitSelectionValue(allNums));
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs sm:text-sm font-semibold transition-colors ${
                    disabled
                        ? 'bg-zinc-50 dark:bg-zinc-900 border-border-thin text-text-dim cursor-not-allowed'
                        : isOpen
                        ? 'bg-white dark:bg-zinc-950 border-[#0070f3] ring-2 ring-blue-100 dark:ring-blue-950 text-text-main cursor-pointer'
                        : 'bg-white dark:bg-zinc-950 border-border-thin hover:border-slate-400 dark:hover:border-zinc-600 text-text-main cursor-pointer'
                }`}
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown
                    size={15}
                    className={`shrink-0 text-text-dim transition-transform ${isOpen ? 'rotate-180 text-[#0070f3]' : ''}`}
                />
            </button>

            {isOpen &&
                createPortal(
                    <div
                        ref={popoverRef}
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                            transform: placement === 'top' ? 'translateY(-100%)' : undefined,
                            zIndex: 9999
                        }}
                        className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden font-sans"
                    >
                        {/* Cabecera sólida con acción de grupo */}
                        <div className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                                Selecciona una o varias unidades
                            </span>
                            {allNums.length > 1 && (
                                <button
                                    type="button"
                                    onClick={handleToggleAll}
                                    className="text-xs font-semibold text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                                >
                                    {isAllSelected ? `Solo Unidad ${allNums[0]}` : `Todas (${allNums.join(', ')})`}
                                </button>
                            )}
                        </div>

                        {/* Lista interactiva de unidades */}
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                            {availableUnits.map(unit => {
                                const checked = selectedNums.includes(unit.num);
                                return (
                                    <div
                                        key={unit.num}
                                        role="checkbox"
                                        aria-checked={checked}
                                        tabIndex={0}
                                        onClick={() => toggleUnit(unit.num)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggleUnit(unit.num);
                                            }
                                        }}
                                        className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors ${
                                            checked
                                                ? 'bg-blue-50 dark:bg-blue-950/60 text-slate-900 dark:text-zinc-100 font-semibold'
                                                : 'bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <span
                                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                    checked
                                                        ? 'bg-[#0070f3] border-[#0070f3] text-white'
                                                        : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700'
                                                }`}
                                            >
                                                {checked && <Check size={12} strokeWidth={3} />}
                                            </span>
                                            <span className="leading-snug">{unit.display}</span>
                                        </div>

                                        {selectedNums.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={e => selectOnlyUnit(unit.num, e)}
                                                className="text-[11px] font-medium text-slate-400 hover:text-[#0070f3] dark:text-zinc-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer shrink-0"
                                            >
                                                Solo esta
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pie sólido con resumen y cierre */}
                        <div className="px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium truncate">
                                {selectedNums.length === 1
                                    ? `Individual: Unidad ${selectedNums[0]}`
                                    : `Grupo: Unidades ${selectedNums.join(', ')}`}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1 rounded-lg bg-[#0070f3] hover:bg-blue-600 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                            >
                                Listo
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};
