import React from 'react';
import type { PizarraCursorData } from '../types';

interface PizarraRemoteCursorProps {
    cursor: PizarraCursorData;
}

export const PizarraRemoteCursor: React.FC<PizarraRemoteCursorProps> = ({ cursor }) => {
    const userColor = cursor.userColor || '#0070f3';

    return (
        <div
            className="absolute pointer-events-none z-50 transition-transform duration-75 ease-out select-none"
            style={{
                transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
                left: 0,
                top: 0,
            }}
        >
            {/* Puntero SVG Estilo Figma/Canva */}
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-xs"
            >
                <path
                    d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                    fill={userColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Etiqueta con Nombre del Docente */}
            <div
                className="mt-0.5 ml-3 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-xs whitespace-nowrap flex items-center gap-1"
                style={{ backgroundColor: userColor }}
            >
                <span>{cursor.userName}</span>
                {cursor.userRole && (
                    <span className="opacity-75 font-normal text-[9px]">({cursor.userRole})</span>
                )}
            </div>
        </div>
    );
};
