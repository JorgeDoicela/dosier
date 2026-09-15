export interface MockPeaItem {
    id: string;
    codigo_asignatura: string;
    nombre_asignatura: string;
    carrera: string;
    id_carrera: number;
    semestre: string;
    docente_responsable: string;
    horas_totales: number;
    horas_docencia: number;
    horas_practicas: number;
    horas_autonomo: number;
    estado_workflow: 'Borrador' | 'En_Revision_Carrera' | 'Con_Observaciones' | 'Avalado_Carrera' | 'Avalado_Academica' | 'Legalizado';
    cumple_caces: boolean;
    observacion_pendiente?: string;
    seccion_observada?: string;
    fecha_limite: string;
    dias_restantes: number;
    tiene_aval_carrera: boolean;
    tiene_aval_academica: boolean;
    tiene_firma_rectorado: boolean;
    qr_hash?: string;
}

export interface ConvocatoriaPeriodo {
    id_periodo: string;
    nombre_periodo: string;
    fecha_inicio: string;
    fecha_limite_docente: string;
    fecha_limite_carrera: string;
    fecha_limite_academica: string;
    fecha_cierre_vicerrectorado: string;
    estado: 'Abierta' | 'En_Evaluacion' | 'Cerrada';
    total_materias: number;
    total_docentes: number;
}

export const MOCK_CONVOCATORIA_ACTIVA: ConvocatoriaPeriodo = {
    id_periodo: '2025-A',
    nombre_periodo: 'Período Académico Ordinario 2025-A',
    fecha_inicio: '2025-03-01',
    fecha_limite_docente: '2025-04-15',
    fecha_limite_carrera: '2025-04-22',
    fecha_limite_academica: '2025-04-30',
    fecha_cierre_vicerrectorado: '2025-05-10',
    estado: 'Abierta',
    total_materias: 42,
    total_docentes: 28
};

export const MOCK_PEAS: MockPeaItem[] = [
    {
        id: 'pea-001',
        codigo_asignatura: 'DS-201',
        nombre_asignatura: 'Programación Orientada a Objetos',
        carrera: 'Desarrollo de Software',
        id_carrera: 9,
        semestre: 'Segundo Nivel',
        docente_responsable: 'Ing. Edison Pérez',
        horas_totales: 160,
        horas_docencia: 64,
        horas_practicas: 32,
        horas_autonomo: 64,
        estado_workflow: 'Borrador',
        cumple_caces: true,
        fecha_limite: '15 de Abril, 2025',
        dias_restantes: 4,
        tiene_aval_carrera: false,
        tiene_aval_academica: false,
        tiene_firma_rectorado: false
    },
    {
        id: 'pea-002',
        codigo_asignatura: 'DS-301',
        nombre_asignatura: 'Estructura de Datos y Algoritmos',
        carrera: 'Desarrollo de Software',
        id_carrera: 9,
        semestre: 'Tercer Nivel',
        docente_responsable: 'Ing. Edison Pérez',
        horas_totales: 160,
        horas_docencia: 64,
        horas_practicas: 32,
        horas_autonomo: 64,
        estado_workflow: 'En_Revision_Carrera',
        cumple_caces: true,
        fecha_limite: '22 de Abril, 2025',
        dias_restantes: 8,
        tiene_aval_carrera: false,
        tiene_aval_academica: false,
        tiene_firma_rectorado: false
    },
    {
        id: 'pea-003',
        codigo_asignatura: 'DS-302',
        nombre_asignatura: 'Bases de Datos Relacionales y NoSQL',
        carrera: 'Desarrollo de Software',
        id_carrera: 9,
        semestre: 'Tercer Nivel',
        docente_responsable: 'Ing. Wilfrido Trujillo',
        horas_totales: 160,
        horas_docencia: 64,
        horas_practicas: 48,
        horas_autonomo: 48,
        estado_workflow: 'Con_Observaciones',
        cumple_caces: false,
        observacion_pendiente: 'Actualizar la bibliografía básica al estándar APA 7ma edición con textos posteriores a 2020.',
        seccion_observada: 'Sección J: Bibliografía y Recursos Digitales',
        fecha_limite: '16 de Abril, 2025',
        dias_restantes: 2,
        tiene_aval_carrera: false,
        tiene_aval_academica: false,
        tiene_firma_rectorado: false
    },
    {
        id: 'pea-004',
        codigo_asignatura: 'DS-401',
        nombre_asignatura: 'Ingeniería de Software y Calidad',
        carrera: 'Desarrollo de Software',
        id_carrera: 9,
        semestre: 'Cuarto Nivel',
        docente_responsable: 'Ing. Marco Proaño',
        horas_totales: 160,
        horas_docencia: 64,
        horas_practicas: 32,
        horas_autonomo: 64,
        estado_workflow: 'Avalado_Carrera',
        cumple_caces: true,
        fecha_limite: '30 de Abril, 2025',
        dias_restantes: 12,
        tiene_aval_carrera: true,
        tiene_aval_academica: false,
        tiene_firma_rectorado: false
    },
    {
        id: 'pea-005',
        codigo_asignatura: 'DS-501',
        nombre_asignatura: 'Desarrollo Web Fullstack y Cloud',
        carrera: 'Desarrollo de Software',
        id_carrera: 9,
        semestre: 'Quinto Nivel',
        docente_responsable: 'Ing. Edison Pérez',
        horas_totales: 160,
        horas_docencia: 64,
        horas_practicas: 32,
        horas_autonomo: 64,
        estado_workflow: 'Avalado_Academica',
        cumple_caces: true,
        fecha_limite: '10 de Mayo, 2025',
        dias_restantes: 18,
        tiene_aval_carrera: true,
        tiene_aval_academica: true,
        tiene_firma_rectorado: false
    },
    {
        id: 'pea-006',
        codigo_asignatura: 'DS-502',
        nombre_asignatura: 'Ciberseguridad y Auditoría de Sistemas',
        carrera: 'Desarrollo de Software',
        id_carrera: 9,
        semestre: 'Quinto Nivel',
        docente_responsable: 'Ing. Wilfrido Trujillo',
        horas_totales: 160,
        horas_docencia: 64,
        horas_practicas: 32,
        horas_autonomo: 64,
        estado_workflow: 'Legalizado',
        cumple_caces: true,
        fecha_limite: 'Concluido',
        dias_restantes: 0,
        tiene_aval_carrera: true,
        tiene_aval_academica: true,
        tiene_firma_rectorado: true,
        qr_hash: 'ISTPET-PEA-2025A-DS502-SHA256-VALID'
    },
    {
        id: 'pea-007',
        codigo_asignatura: 'MI-201',
        nombre_asignatura: 'Mecanizado por Arranque de Viruta',
        carrera: 'Mecánica Industrial',
        id_carrera: 10,
        semestre: 'Segundo Nivel',
        docente_responsable: 'Ing. Christian Castro',
        horas_totales: 160,
        horas_docencia: 48,
        horas_practicas: 64,
        horas_autonomo: 48,
        estado_workflow: 'En_Revision_Carrera',
        cumple_caces: true,
        fecha_limite: '22 de Abril, 2025',
        dias_restantes: 8,
        tiene_aval_carrera: false,
        tiene_aval_academica: false,
        tiene_firma_rectorado: false
    },
    {
        id: 'pea-008',
        codigo_asignatura: 'ED-301',
        nombre_asignatura: 'Fisiología y Biomecánica del Deporte',
        carrera: 'Entrenamiento Deportivo',
        id_carrera: 7,
        semestre: 'Tercer Nivel',
        docente_responsable: 'Lcdo. Wilmer Toapanta',
        horas_totales: 160,
        horas_docencia: 64,
        horas_practicas: 48,
        horas_autonomo: 48,
        estado_workflow: 'Avalado_Carrera',
        cumple_caces: true,
        fecha_limite: '30 de Abril, 2025',
        dias_restantes: 12,
        tiene_aval_carrera: true,
        tiene_aval_academica: false,
        tiene_firma_rectorado: false
    }
];

export const MOCK_MATERIAS_ANTERIORES = [
    {
        id_materia_anterior: 'poo-2024b',
        nombre: 'Programación Orientada a Objetos',
        periodo: '2024-B (Semestre Anterior)',
        docente: 'Ing. Edison Pérez',
        fecha_aprobacion: '18/11/2024',
        unidades_tematicas: 4,
        horas: 160
    },
    {
        id_materia_anterior: 'edd-2024b',
        nombre: 'Estructura de Datos y Algoritmos',
        periodo: '2024-B (Semestre Anterior)',
        docente: 'Ing. Edison Pérez',
        fecha_aprobacion: '20/11/2024',
        unidades_tematicas: 4,
        horas: 160
    },
    {
        id_materia_anterior: 'bd-2024b',
        nombre: 'Bases de Datos Relacionales',
        periodo: '2024-B (Semestre Anterior)',
        docente: 'Ing. Wilfrido Trujillo',
        fecha_aprobacion: '15/11/2024',
        unidades_tematicas: 5,
        horas: 160
    }
];

export const MOCK_DOCENTES_REZAGADOS = [
    {
        nombre: 'Ing. Edison Pérez',
        asignatura: 'Programación Orientada a Objetos',
        carrera: 'Desarrollo de Software',
        email: 'eperez@istpet.edu.ec',
        estado: 'Borrador (42% de avance)',
        dias_restantes: 4
    },
    {
        nombre: 'Ing. Wilfrido Trujillo',
        asignatura: 'Bases de Datos Relacionales y NoSQL',
        carrera: 'Desarrollo de Software',
        email: 'wtrujillo@istpet.edu.ec',
        estado: 'Con Observaciones pendientes',
        dias_restantes: 2
    },
    {
        nombre: 'Ing. Christian Castro',
        asignatura: 'Mecanizado por Arranque de Viruta',
        carrera: 'Mecánica Industrial',
        email: 'ccastro@istpet.edu.ec',
        estado: 'Borrador sin enviar',
        dias_restantes: 4
    }
];
