import { useState, useEffect, useRef } from 'react';
import {
    FileSignature,
    Clock,
    Cpu,
    ShieldCheck,
    Key,
    type LucideIcon
} from 'lucide-react';

export interface ModuleItem {
    id: number;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    desc: string;
}

export interface CommitItem {
    hash: string;
    msg: string;
    time: string;
}

export interface HitoItem {
    id: number;
    name: string;
    completed: boolean;
}

export interface BudgetToggles {
    equipos: boolean;
    materiales: boolean;
    vinculacion: boolean;
}

export const useModulosOrchestration = () => {
    // Estado del selector de módulos interactivo
    const [activeModule, setActiveModule] = useState<number | null>(null);
    const [showDetail, setShowDetail] = useState<boolean>(false);

    // Estados para simulación de exportación CACES y notificaciones Toast
    const [exportState, setExportState] = useState<'idle' | 'loading' | 'success'>('idle');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [cacesProgress, setCacesProgress] = useState({ id: 0, vinc: 0, prop: 0 });

    useEffect(() => {
        if (activeModule === 4) {
            setCacesProgress({ id: 0, vinc: 0, prop: 0 });

            const duration = 800; // Animación de 800ms
            const steps = 20;
            const stepTime = duration / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                setCacesProgress({
                    id: Math.min(100, Math.round((100 / steps) * currentStep)),
                    vinc: Math.min(85, Math.round((85 / steps) * currentStep)),
                    prop: Math.min(60, Math.round((60 / steps) * currentStep))
                });

                if (currentStep >= steps) {
                    clearInterval(interval);
                }
            }, stepTime);

            return () => clearInterval(interval);
        }
    }, [activeModule]);

    const handleExportSiies = () => {
        if (exportState !== 'idle') return;
        setExportState('loading');

        setTimeout(() => {
            setExportState('success');
            setShowToast(true);

            setTimeout(() => {
                setShowToast(false);
            }, 4000);

            setTimeout(() => {
                setExportState('idle');
            }, 5500);
        }, 1500);
    };

    const laptopContainerRef = useRef<HTMLDivElement>(null);
    const [laptopScale, setLaptopScale] = useState<number>(1);

    useEffect(() => {
        const updateScale = () => {
            if (!laptopContainerRef.current) return;
            const containerWidth = laptopContainerRef.current.getBoundingClientRect().width;
            const baseWidth = 740; // Base layout width for the laptop mockup in CSS (max-width: 740px)
            if (containerWidth < baseWidth && containerWidth > 0) {
                setLaptopScale(containerWidth / baseWidth);
            } else {
                setLaptopScale(1);
            }
        };

        updateScale();
        const timer = setTimeout(updateScale, 100);

        window.addEventListener('resize', updateScale);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScale);
        };
    }, []);

    const modulesList: ModuleItem[] = [
        {
            id: 1,
            title: "PEA",
            subtitle: "Programa de Estudio de la Asignatura",
            icon: FileSignature,
            desc: "Estructura el macro-currículo de la asignatura con datos institucionales de SIGAFI. Define resultados de aprendizaje, objetivos, unidades temáticas y el balance de horas de contacto docente, APE y trabajo autónomo."
        },
        {
            id: 2,
            title: "Sílabo",
            subtitle: "Plan Analítico (19 Semanas)",
            icon: Clock,
            desc: "Planifica la matriz de 19 semanas con validación matemática en tiempo real. Distribuye horas semanales y sincroniza hitos de evaluación oficial (Parcial 1 sem 9, Parcial 2 sem 18, Examen Final sem 19)."
        },
        {
            id: 3,
            title: "Guías APE",
            subtitle: "Trabajo Práctico-Experimental",
            icon: Cpu,
            desc: "Diseña guías de laboratorio y taller asociadas a los espacios físicos de SIGAFI. Vincula rúbricas de evaluación, procedimientos por etapas y normas de seguridad alineadas al PEA activo."
        },
        {
            id: 4,
            title: "Guía de Estudio",
            subtitle: "Compendio Teórico y Evaluación",
            icon: ShieldCheck,
            desc: "Genera el compendio oficial por unidades y temas del PEA. Incluye desarrollo teórico, cuadros comparativos, preguntas de autoevaluación y glosario para los estudiantes."
        },
        {
            id: 5,
            title: "Firma & CACES",
            subtitle: "Acreditación y Firma .P12",
            icon: Key,
            desc: "Generación de formatos PDF institucionales con código QR público, hash SHA-256 e integración de firma electrónica .p12 para auditorías del CACES con validez legal completa."
        }
    ];

    const handleModuleSelect = (id: number | null) => {
        setActiveModule(id);
        if (id !== null) {
            setShowDetail(true);
        } else {
            setShowDetail(false);
        }
    };

    const handleNextModule = () => {
        if (activeModule === null) {
            handleModuleSelect(1);
        } else {
            const next = activeModule === 5 ? 1 : activeModule + 1;
            handleModuleSelect(next);
        }
    };

    const handlePrevModule = () => {
        if (activeModule === null) {
            handleModuleSelect(5);
        } else {
            const prev = activeModule === 1 ? 5 : activeModule - 1;
            handleModuleSelect(prev);
        }
    };

    // Estados para la firma electrónica interactiva
    const [signState, setSignState] = useState<'idle' | 'scanning' | 'signed'>('idle');
    const [signProgress, setSignProgress] = useState<number>(0);
    const [signTimestamp, setSignTimestamp] = useState<string>('');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (signState === 'scanning') {
            setSignProgress(0);
            interval = setInterval(() => {
                setSignProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        const now = new Date();
                        setSignTimestamp(now.toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }));
                        setSignState('signed');
                        return 100;
                    }
                    return prev + 5;
                });
            }, 80);
        }
        return () => clearInterval(interval);
    }, [signState]);

    const startSigning = () => {
        if (signState !== 'idle') return;
        setSignState('scanning');
    };

    const resetSignature = () => {
        setSignState('idle');
        setSignProgress(0);
    };

    // Prácticas de Laboratorio simuladas para el Módulo 3
    const [commits, setCommits] = useState<CommitItem[]>([
        { hash: 'APE-01', msg: 'Lab Software: Modelo MVC y Arquitectura', time: 'Hace 2 min' },
        { hash: 'APE-02', msg: 'Lab Redes: Enrutamiento y Criptografía', time: 'Hace 12 min' },
        { hash: 'APE-03', msg: 'Taller HW: Ensamblaje Forense', time: 'Hace 1 hora' }
    ]);

    const handlePushCommit = () => {
        const msgs = [
            'APE-04: Algoritmos y Complejidad en C#',
            'APE-05: Protocolos TCP/IP y Routers Cisco',
            'APE-06: Configuración de Servidores Linux',
            'APE-07: Práctica de Base de Datos MySQL'
        ];
        const newMsg = msgs[Math.floor(Math.random() * msgs.length)];
        const newHash = `APE-0${Math.floor(Math.random() * 6) + 4}`;
        setCommits(prev => [
            { hash: newHash, msg: newMsg, time: 'Ahora mismo' },
            ...prev.slice(0, 2)
        ]);
    };

    // Módulo 1: Distribución Horaria del PEA
    const [budgetToggles, setBudgetToggles] = useState<BudgetToggles>({
        equipos: true,
        materiales: true,
        vinculacion: true
    });

    const budgetValues = {
        equipos: 64, // Horas Docencia
        materiales: 32, // Horas APE
        vinculacion: 64 // Horas Autónomo
    };

    const toggleBudget = (key: keyof BudgetToggles) => {
        setBudgetToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const currentBudgetTotal = (budgetToggles.equipos ? budgetValues.equipos : 0) +
        (budgetToggles.materiales ? budgetValues.materiales : 0) +
        (budgetToggles.vinculacion ? budgetValues.vinculacion : 0);

    const budgetMax = budgetValues.equipos + budgetValues.materiales + budgetValues.vinculacion;
    const budgetPct = Math.round((currentBudgetTotal / budgetMax) * 100);

    // Módulo 2: Hitos y Parciales del Sílabo
    const [hitos, setHitos] = useState<HitoItem[]>([
        { id: 1, name: 'Semanas 1-8: Temas Unidad 1 (Docencia + APE)', completed: true },
        { id: 2, name: 'Semana 9: Evaluación Primer Parcial SIGAFI', completed: true },
        { id: 3, name: 'Semanas 18-19: Parcial 2 y Examen Final', completed: false }
    ]);

    const toggleHito = (id: number) => {
        setHitos(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
    };

    const hitosCompletedCount = hitos.filter(h => h.completed).length;
    const hitosTotalCount = hitos.length;

    // Módulo 3: Descargas de Guías APE y Rúbricas
    const [downloadStates, setDownloadStates] = useState<{ [key: string]: 'idle' | number | 'success' }>({
        'Guia_Practica_APE_01.pdf': 'idle',
        'Rubrica_Evaluacion_APE.pdf': 'idle'
    });

    const triggerDownload = (fileName: string) => {
        if (downloadStates[fileName] !== 'idle') return;

        let progress = 0;
        setDownloadStates(prev => ({ ...prev, [fileName]: 0 }));

        const interval = setInterval(() => {
            progress += 25;
            if (progress >= 100) {
                clearInterval(interval);
                setDownloadStates(prev => ({ ...prev, [fileName]: 'success' }));

                setTimeout(() => {
                    setDownloadStates(prev => ({ ...prev, [fileName]: 'idle' }));
                }, 3000);
            } else {
                setDownloadStates(prev => ({ ...prev, [fileName]: progress }));
            }
        }, 200);
    };

    return {
        activeModule,
        showDetail,
        exportState,
        showToast,
        cacesProgress,
        laptopContainerRef,
        laptopScale,
        modulesList,
        handleModuleSelect,
        handleNextModule,
        handlePrevModule,
        signState,
        signProgress,
        signTimestamp,
        startSigning,
        resetSignature,
        commits,
        handlePushCommit,
        budgetToggles,
        budgetValues,
        toggleBudget,
        currentBudgetTotal,
        budgetPct,
        hitos,
        toggleHito,
        hitosCompletedCount,
        hitosTotalCount,
        downloadStates,
        triggerDownload,
        handleExportSiies
    };
};
