import React, { useEffect } from 'react';
import './AutoSignatureTab.css';

const FONTS = [
    { id: 'Caveat',              label: 'Casual',      fontClass: 'font-caveat'     },
    { id: 'Dancing Script',      label: 'Moderna',     fontClass: 'font-dancing'    },
    { id: 'Sacramento',          label: 'Fina',        fontClass: 'font-sacramento' },
    { id: 'Alex Brush',          label: 'Elegante',    fontClass: 'font-alex'       },
    { id: 'Great Vibes',         label: 'Caligráfica', fontClass: 'font-vibes'      },
    { id: 'Allura',              label: 'Fluida',      fontClass: 'font-allura'     },
    { id: 'Pinyon Script',       label: 'Formal',      fontClass: 'font-pinyon'     },
    { id: 'Mrs Saint Delafield', label: 'Artística',   fontClass: 'font-delafield'  },
];

interface AutoSignatureTabProps {
    autoText: string;
    selectedFont: string;
    firmaImagenB64: string | undefined;
    onAutoTextChange: (v: string) => void;
    onFontChange: (v: string) => void;
    onSignatureGenerated: (b64: string) => void;
}

export const AutoSignatureTab: React.FC<AutoSignatureTabProps> = ({
    autoText, selectedFont, firmaImagenB64,
    onAutoTextChange, onFontChange, onSignatureGenerated,
}) => {

    useEffect(() => {
        let active = true;
        if (!autoText) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const baseFontSize = 80;
        const fontSpec = `italic ${baseFontSize}px "${selectedFont}"`;

        document.fonts.load(fontSpec).then(() => {
            if (!active) return;
            
            // Dividir el texto en dos líneas si tiene más de 2 palabras
            const parts = autoText.split(' ').filter(p => p.trim() !== '');
            let firstLine = '';
            let secondLine = '';

            if (parts.length <= 2) {
                firstLine = autoText;
            } else {
                const half = parts.length === 3 ? 1 : Math.ceil(parts.length / 2);
                firstLine = parts.slice(0, half).join(' ');
                secondLine = parts.slice(half).join(' ');
            }

            ctx.font = `italic ${baseFontSize}px "${selectedFont}", cursive`;
            
            // Medir el ancho de cada línea para ajustar el canvas
            const width1 = ctx.measureText(firstLine).width;
            const width2 = secondLine ? ctx.measureText(secondLine).width : 0;
            const maxWidth = Math.max(width1, width2);
            
            const paddingX  = 60;
            canvas.width  = Math.max(300, Math.ceil(maxWidth + paddingX));
            
            const lineHeight = baseFontSize * 1.1;
            canvas.height = secondLine 
                ? Math.ceil(lineHeight * 2 + 40) 
                : Math.ceil(baseFontSize * 1.6);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0a3264';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `italic ${baseFontSize}px "${selectedFont}", cursive`;

            if (secondLine) {
                // Dibujar línea 1 (arriba) y línea 2 (abajo)
                ctx.fillText(firstLine, canvas.width / 2, canvas.height / 2 - lineHeight / 2);
                ctx.fillText(secondLine, canvas.width / 2, canvas.height / 2 + lineHeight / 2);
            } else {
                ctx.fillText(firstLine, canvas.width / 2, canvas.height / 2);
            }

            onSignatureGenerated(canvas.toDataURL('image/png'));
        }).catch(() => {});

        return () => { active = false; };
    }, [autoText, selectedFont]);

    return (
        <div className="space-y-5">
            <div className="space-y-1 text-center">
                <label htmlFor="sig-auto-text" className="text-xs font-bold text-text-main uppercase tracking-wider block text-center">
                    Nombre a transformar en Firma
                </label>
                <input
                    id="sig-auto-text"
                    type="text"
                    value={autoText}
                    onChange={(e) => onAutoTextChange(e.target.value)}
                    placeholder="Ingrese el texto de la firma"
                    className="w-full bg-transparent border-0 border-b border-slate-300 dark:border-zinc-700 rounded-none px-1 py-2.5 text-center text-xs sm:text-sm font-medium text-text-main placeholder:text-slate-400 focus:border-[#0070f3] dark:focus:border-blue-400 outline-none transition-colors"
                />
            </div>

            <div className="sig-auto-layout">
                <div className="sig-mode-auto-workspace">
                    <div className="sig-preview-section">
                        <span className="sig-label">Vista Previa Automática:</span>
                        <div className="sig-preview-box auto-signature-preview">
                            {firmaImagenB64 ? (
                                <img src={firmaImagenB64} alt="Previsualización de firma cursiva" />
                            ) : (
                                <span className="no-image">Escriba su nombre para generar</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sig-form-group font-styles-panel">
                    <label>Estilo de Letra Manuscrita</label>
                    <div className="sig-fonts-grid">
                        {FONTS.map((font) => {
                            const words = autoText.trim().split(/\s+/).filter(Boolean);
                            const previewText = words.length === 0
                                ? 'Firma'
                                : words.length === 1
                                    ? words[0]
                                    : `${words[0]} ${words[1]}`;

                            return (
                                <button
                                    key={font.id}
                                    type="button"
                                    className={`sig-font-option-btn ${selectedFont === font.id ? 'active' : ''}`}
                                    onClick={() => onFontChange(font.id)}
                                >
                                    <span className="sig-font-option-label">{font.label}</span>
                                    <span className={`sig-font-option-preview ${font.fontClass}`}>
                                        {previewText}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
