import React from 'react';
import './DocumentStampPreview.css';

export interface DocumentStampPreviewProps {
    nombreFirmante?: string;
    cargo?: string;
    departamento?: string;
    cedula?: string;
    firmaImagenB64?: string;
    firmaCode?: string;
    firmadoEn?: string;
    tipoPresentacion?: 'solo_firma' | 'solo_sello' | 'sello_y_firma' | 'sello_institucional' | 'completo';
    className?: string;
}

export const DocumentStampPreview: React.FC<DocumentStampPreviewProps> = ({
    nombreFirmante = 'Docente Institucional',
    cargo = 'Docente Titular',
    departamento = '',
    cedula = '17XXXXXXXX',
    firmaImagenB64,
    firmaCode = 'DOSIER-ISTPET-2026-OFIC',
    firmadoEn,
    tipoPresentacion = 'completo',
    className = '',
}) => {
    // Resolver leyendas departamentales para el sello institucional oficial según rol y carrera
    const resolveDepartmentLabels = (c?: string, d?: string) => {
        const combined = `${c || ''} ${d || ''}`.toLowerCase();

        // 1. Vicerrectorado (soporta vicerrector, vicerector, vicerrectorado, aprobado)
        if (combined.includes('vicerrector') || combined.includes('vicerector') || combined.includes('aprobado') || combined.includes('dosier_vicerrector')) {
            return { central: 'VICERRECTORADO', sub: null };
        }

        // 2. Coordinación Académica
        if (
            combined.includes('coordinador acad') ||
            combined.includes('coordinador académ') ||
            combined.includes('coordinacion acad') ||
            combined.includes('coordinación acad') ||
            combined.includes('dosier_coord_acad') ||
            combined.includes('comisionacademica') ||
            combined.includes('comisión académica')
        ) {
            return { central: 'COORDINACIÓN ACADÉMICA', sub: 'CARRERAS PRESENCIALES' };
        }

        // 3. Catálogo Oficial de Carreras del ISTPET
        if (combined.includes('software')) return { central: 'DESARROLLO DE SOFTWARE', sub: null };
        if (combined.includes('redes') || combined.includes('telecomunicaciones')) return { central: 'REDES Y', sub: 'TELECOMUNICACIONES' };
        if (combined.includes('gastronomia') || combined.includes('gastronomía')) return { central: 'GASTRONOMÍA', sub: null };
        if (combined.includes('diseño') || combined.includes('diseno')) return { central: 'DISEÑO GRÁFICO', sub: null };
        if (combined.includes('mecanica') || combined.includes('mecánica') || combined.includes('automotriz')) return { central: 'MECÁNICA AUTOMOTRIZ', sub: null };
        if (combined.includes('contabilidad') || combined.includes('tributaria')) return { central: 'CONTABILIDAD Y', sub: 'ASESORÍA TRIBUTARIA' };
        if (combined.includes('talento humano') || combined.includes('talento_humano')) return { central: 'ADMINISTRACIÓN DE', sub: 'TALENTO HUMANO' };
        if (combined.includes('marketing') || combined.includes('comercio')) return { central: 'MARKETING DIGITAL Y', sub: 'COMERCIO ELECTRÓNICO' };
        if (combined.includes('educacion inicial') || combined.includes('educación inicial') || combined.includes('inicial')) return { central: 'EDUCACIÓN INICIAL', sub: null };
        if (combined.includes('educacion basica') || combined.includes('educación básica') || combined.includes('basica')) return { central: 'EDUCACIÓN BÁSICA', sub: null };
        if (combined.includes('educacion inclusiva') || combined.includes('educación inclusiva') || combined.includes('inclusiva')) return { central: 'EDUCACIÓN INCLUSIVA', sub: null };
        if (combined.includes('entrenamiento') || combined.includes('deporte') || combined.includes('deportiv')) return { central: 'ENTRENAMIENTO', sub: 'DEPORTIVO' };
        if (combined.includes('electronica') || combined.includes('electrónica')) return { central: 'ELECTRÓNICA', sub: null };

        const cleanCareer = (raw: string) => {
            let u = raw.trim().toUpperCase();
            const p1 = 'TECNOLOGÍA SUPERIOR EN ';
            const p2 = 'TECNOLOGIA SUPERIOR EN ';
            const p3 = 'CARRERA DE ';
            if (u.startsWith(p1)) u = u.slice(p1.length).trim();
            else if (u.startsWith(p2)) u = u.slice(p2.length).trim();
            else if (u.startsWith(p3)) u = u.slice(p3.length).trim();
            return u;
        };

        // 4. Coordinación de Carrera genérica o con departamento
        if (combined.includes('carrera') || combined.includes('coordinador')) {
            if (d && d.trim().toUpperCase() !== 'ISTPET') {
                return { central: cleanCareer(d), sub: null };
            }
            return { central: 'COORDINACIÓN DE CARRERA', sub: null };
        }

        // 5. Docentes o Área Académica
        const dUpper = d ? d.trim().toUpperCase() : '';
        if (d && dUpper !== '' && dUpper !== 'ISTPET' && dUpper !== 'ACADEMIA' && dUpper !== 'DOCENCIA') {
            return { central: cleanCareer(d), sub: null };
        }

        return { central: 'DOCENCIA SUPERIOR', sub: null };
    };
    // Formatear nombre a 2 líneas si es largo
    const formatMultiLineName = (name: string) => {
        if (!name) return 'Nombre del Firmante';
        const parts = name.trim().split(/\s+/);
        if (parts.length <= 2) return name;
        const half = parts.length === 3 ? 1 : Math.ceil(parts.length / 2);
        return `${parts.slice(0, half).join(' ')}\n${parts.slice(half).join(' ')}`;
    };

    // Iniciales en caso de no tener imagen aún
    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'DS';
        return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('');
    };

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const defaultDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} UTC`;
    const formattedDate = firmadoEn || defaultDate;

    // ── MODO 'SELLO OFICIAL' (SOLO SELLO O SELLO Y FIRMA COMBINADOS) ────
    if (tipoPresentacion === 'solo_sello' || tipoPresentacion === 'sello_y_firma' || tipoPresentacion === 'sello_institucional') {
        const { central, sub } = resolveDepartmentLabels(cargo, departamento);
        const incluirFirma = tipoPresentacion !== 'solo_sello';
        return (
            <div className={`doc-stamp-preview-container ${className}`}>
                <div className="doc-stamp-display-wrapper">
                    <div className="dosier-sello-institucional-stamp" role="region" aria-label="Sello Institucional Oficial">
                        <svg 
                            viewBox="0 0 200 200" 
                            className="sello-circular-svg" 
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                        >
                            <defs>
                                {/* Arco superior centrado con radio calibrado (r=70) para no invadir la banda central */}
                                <path id="sello-arc-top" d="M 30,100 A 70,70 0 1,1 170,100" fill="none" />
                                {/* Arco inferior equilibrado con margen amplio */}
                                <path id="sello-arc-bot" d="M 35,100 A 65,65 0 0,0 165,100" fill="none" />
                            </defs>

                            {/* Doble anillo exterior con líneas finas y elegantes estilo sello oficial */}
                            <circle cx="100" cy="100" r="94" stroke="#0a3264" strokeWidth="2.2" fill="#ffffff" />
                            <circle cx="100" cy="100" r="87.5" stroke="#0a3264" strokeWidth="1.1" fill="none" />

                            {sub ? (
                                <>
                                    <line x1="16" y1="78" x2="184" y2="78" stroke="#0a3264" strokeWidth="1.2" />
                                    <line x1="16" y1="122" x2="184" y2="122" stroke="#0a3264" strokeWidth="1.2" />
                                </>
                            ) : (
                                <>
                                    <line x1="15" y1="82" x2="185" y2="82" stroke="#0a3264" strokeWidth="1.2" />
                                    <line x1="15" y1="118" x2="185" y2="118" stroke="#0a3264" strokeWidth="1.2" />
                                </>
                            )}

                            {/* TECNOLÓGICO TRAVERSARI limpio y desahogado */}
                            <text fill="#0a3264" fontWeight="900" fontSize="10.2" letterSpacing="0.4px">
                                <textPath href="#sello-arc-top" startOffset="50%" textAnchor="middle">
                                    TECNOLÓGICO TRAVERSARI
                                </textPath>
                            </text>

                            {/* ISTPET limpio y centrado */}
                            <text fill="#0a3264" fontWeight="900" fontSize="13" letterSpacing="2.2px">
                                <textPath href="#sello-arc-bot" startOffset="50%" textAnchor="middle">
                                    ISTPET
                                </textPath>
                            </text>

                            {sub ? (
                                <>
                                    <text 
                                        x="100" 
                                        y="95" 
                                        textAnchor="middle" 
                                        fill="#0a3264" 
                                        fontWeight="900" 
                                        fontSize={central.length > 20 ? '9.5' : '10.8'} 
                                        letterSpacing="0.3px"
                                    >
                                        {central}
                                    </text>
                                    <text 
                                        x="100" 
                                        y="112" 
                                        textAnchor="middle" 
                                        fill="#0a3264" 
                                        fontWeight="900" 
                                        fontSize={sub.length > 20 ? '7.5' : '8.5'} 
                                        letterSpacing="0.5px"
                                    >
                                        {sub}
                                    </text>
                                </>
                            ) : (
                                <text 
                                    x="100" 
                                    y="103.5" 
                                    textAnchor="middle" 
                                    fill="#0a3264" 
                                    fontWeight="900" 
                                    fontSize={central.length > 22 ? '9.8' : central.length > 15 ? '10.8' : '13.2'} 
                                    letterSpacing={central.length > 20 ? '0.2px' : '0.5px'}
                                >
                                    {central}
                                </text>
                            )}

                            {incluirFirma && firmaImagenB64 && (
                                <image
                                    href={firmaImagenB64}
                                    x="20"
                                    y="58"
                                    width="160"
                                    height="84"
                                    preserveAspectRatio="xMidYMid meet"
                                    style={{ mixBlendMode: 'multiply' }}
                                />
                            )}
                            {incluirFirma && !firmaImagenB64 && (
                                <text x="100" y="145" textAnchor="middle" fill="#94a3b8" fontSize="8" fontStyle="italic">
                                    (Sin firma registrada)
                                </text>
                            )}
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    // ── MODO 'SOLO FIRMA' (ÚNICAMENTE EL TRAZO MANUSCRITO) ────────────
    if (tipoPresentacion === 'solo_firma') {
        return (
            <div className={`doc-stamp-preview-container ${className}`}>
                <div className="doc-stamp-display-wrapper">
                    <div className="dosier-solo-firma-stamp" role="region" aria-label="Trazo de Firma Digital">
                        {firmaImagenB64 ? (
                            <img
                                src={firmaImagenB64}
                                alt="Trazo de firma digital"
                                className="solo-stroke-img"
                            />
                        ) : (
                            <div className="stamp-initials-box w-28 h-16 text-2xl font-bold flex items-center justify-center">
                                {getInitials(nombreFirmante)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── MODO 'COMPLETO' (SELLO INSTITUCIONAL CON CABECERA AZUL Y QR) ───
    return (
        <div className={`doc-stamp-preview-container ${className}`}>
            <div className="doc-stamp-display-wrapper">
                <div className="dosier-official-stamp" role="region" aria-label="Sello Institucional DOSIER">
                    {/* Encabezado Azul Institucional */}
                    <div className="stamp-header">
                        <span className="stamp-header-dot" />
                        <span>FIRMA INSTITUCIONAL DOSIER</span>
                        <span className="stamp-header-dot" />
                    </div>

                    {/* Cuerpo de 3 Columnas */}
                    <div className="stamp-body-grid">
                        {/* Columna 1: Trazo Manuscrito */}
                        <div className="stamp-col-stroke">
                            {firmaImagenB64 ? (
                                <img
                                    src={firmaImagenB64}
                                    alt="Trazo de firma digital"
                                    className="stamp-stroke-img"
                                />
                            ) : (
                                <div className="stamp-initials-box">
                                    {getInitials(nombreFirmante)}
                                </div>
                            )}
                        </div>

                        {/* Columna 2: Datos Institucionales */}
                        <div className="stamp-col-data">
                            <div className="stamp-signer-name whitespace-pre-line">
                                {formatMultiLineName(nombreFirmante)}
                            </div>

                            <div className="stamp-data-row">
                                <span className="stamp-data-label">Cargo:</span>
                                <span className="stamp-data-val" title={cargo}>{cargo || 'Docente Titular'}</span>
                            </div>

                            <div className="stamp-data-row">
                                <span className="stamp-data-label">Departamento:</span>
                                <span className="stamp-data-val" title={departamento}>{departamento || 'ISTPET'}</span>
                            </div>

                            {cedula && (
                                <div className="stamp-data-row">
                                    <span className="stamp-data-label">C.I.:</span>
                                    <span className="stamp-data-val">{cedula}</span>
                                </div>
                            )}

                            <div className="stamp-data-row">
                                <span className="stamp-data-label">Firmado:</span>
                                <span className="stamp-data-val">{formattedDate}</span>
                            </div>

                            <div className="stamp-data-row">
                                <span className="stamp-data-label">Código:</span>
                                <span className="stamp-data-val code">{firmaCode}</span>
                            </div>
                        </div>

                        {/* Columna 3: QR de Verificación y Seguridad */}
                        <div className="stamp-col-qr">
                            <div className="stamp-qr-matrix">
                                <svg viewBox="0 0 33 33" width="44" height="44" fill="#0f172a">
                                    <rect x="0" y="0" width="10" height="10" fill="#0a3264" />
                                    <rect x="2" y="2" width="6" height="6" fill="#ffffff" />
                                    <rect x="3.5" y="3.5" width="3" height="3" fill="#0a3264" />

                                    <rect x="23" y="0" width="10" height="10" fill="#0a3264" />
                                    <rect x="25" y="2" width="6" height="6" fill="#ffffff" />
                                    <rect x="26.5" y="3.5" width="3" height="3" fill="#0a3264" />

                                    <rect x="0" y="23" width="10" height="10" fill="#0a3264" />
                                    <rect x="2" y="25" width="6" height="6" fill="#ffffff" />
                                    <rect x="3.5" y="26.5" width="3" height="3" fill="#0a3264" />

                                    <rect x="12" y="2" width="3" height="3" />
                                    <rect x="17" y="2" width="3" height="3" />
                                    <rect x="14" y="6" width="3" height="3" />
                                    <rect x="12" y="12" width="4" height="4" />
                                    <rect x="18" y="13" width="3" height="3" />
                                    <rect x="2" y="14" width="3" height="3" />
                                    <rect x="6" y="17" width="3" height="3" />
                                    <rect x="24" y="13" width="3" height="3" />
                                    <rect x="28" y="16" width="3" height="3" />
                                    <rect x="13" y="24" width="4" height="4" />
                                    <rect x="19" y="27" width="3" height="3" />
                                    <rect x="25" y="23" width="4" height="4" />
                                </svg>
                            </div>
                            <span className="stamp-qr-label">Verificar</span>
                        </div>
                    </div>

                    {/* Footer Legal Idéntico al Backend SignatureStamper */}
                    <div className="stamp-footer">
                        Firma institucional DOSIER · Sistema de Portafolio Docente ISTPET · Verificar en: https://dosier.istpet.edu.ec
                    </div>
                </div>
            </div>
        </div>
    );
};
