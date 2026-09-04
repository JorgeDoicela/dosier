import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../api/axios_config';
import { useConfirm } from '../../../api/ConfirmContext';

export interface PeriodoAcademico {
    idPeriodo: string;
    detalle?: string;
    fechaInicial?: string;
    fechaFinal?: string;
    activo?: boolean;
    cerrado?: boolean;
}

export interface EventoNormativo {
    uuid?: string;
    titulo: string;
    descripcion?: string;
    tipoEvento: string;
    fechaInicio: string;
    fechaFin?: string;
    esTodoElDia: boolean;
    recurrenciaAnual: boolean;
    recurrenciaHasta?: string;
    rolesVisibles?: string;
    moduloOrigen?: string;
    urlAccion?: string;
    colorHex?: string;
    alertaDias?: number;
    activo?: boolean;
}

export const useConfiguracion = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab = (tabParam === 'periodos' || tabParam === 'calendario') ? tabParam : 'periodos';
    
    const setActiveTab = (tab: 'periodos' | 'calendario') => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('tab', tab);
            return next;
        });
    };

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const confirm = useConfirm();

    // Data lists
    const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
    const [calendario, setCalendario] = useState<EventoNormativo[]>([]);

    // Modals control states
    const [isPeriodoModalOpen, setIsPeriodoModalOpen] = useState(false);
    const [editingPeriodo, setEditingPeriodo] = useState<PeriodoAcademico | null>(null);
    const [periodoForm, setPeriodoForm] = useState({
        idPeriodo: '',
        detalle: '',
        fechaInicial: '',
        fechaFinal: ''
    });

    const [isCalendarioModalOpen, setIsCalendarioModalOpen] = useState(false);
    const [editingCalendario, setEditingCalendario] = useState<EventoNormativo | null>(null);
    const [calendarioForm, setCalendarioForm] = useState({
        titulo: '',
        descripcion: '',
        tipoEvento: 'Normativo',
        fechaInicio: '',
        fechaFin: '',
        esTodoElDia: true,
        recurrenciaAnual: false,
        recurrenciaHasta: '',
        rolesVisibles: '',
        moduloOrigen: '',
        urlAccion: '',
        colorHex: '#6B7280',
        alertaDias: 7
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'periodos') {
                const res = await api.get('/catalogs/periodos');
                const rawData = res.data || [];
                const mappedData = rawData.map((p: any) => ({
                    idPeriodo: p.id_periodo || p.idPeriodo || '',
                    detalle: p.detalle,
                    fechaInicial: p.fecha_inicial || p.fechaInicial,
                    fechaFinal: p.fecha_final || p.fechaFinal,
                    activo: p.activo,
                    cerrado: p.cerrado
                }));
                setPeriodos(mappedData);
            } else if (activeTab === 'calendario') {
                const res = await api.get('/calendario/normativos');
                const rawData = res.data || [];
                const mappedData = rawData.map((e: any) => ({
                    uuid: e.uuid,
                    titulo: e.titulo || '',
                    descripcion: e.descripcion || '',
                    tipoEvento: e.tipo_evento || e.tipoEvento || 'Normativo',
                    fechaInicio: e.fecha_inicio || e.fechaInicio || '',
                    fechaFin: e.fecha_fin || e.fechaFin || '',
                    esTodoElDia: e.es_todo_el_dia ?? e.esTodoElDia ?? true,
                    recurrenciaAnual: e.recurrencia_anual ?? e.recurrenciaAnual ?? false,
                    recurrenciaHasta: e.recurrencia_hasta || e.recurrenciaHasta || '',
                    rolesVisibles: e.roles_visibles || e.rolesVisibles || '',
                    moduloOrigen: e.modulo_origen || e.moduloOrigen || '',
                    urlAccion: e.url_accion || e.urlAccion || '',
                    colorHex: e.color_hex || e.colorHex || '#6B7280',
                    alertaDias: e.alerta_dias ?? e.alertaDias ?? 7,
                    activo: e.activo
                }));
                setCalendario(mappedData);
            }
        } catch (error) {
            console.error('Error fetching data for tab:', activeTab, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Periodos actions
    const handleOpenPeriodoModal = (item: PeriodoAcademico | null = null) => {
        if (item) {
            setEditingPeriodo(item);
            setPeriodoForm({
                idPeriodo: item.idPeriodo,
                detalle: item.detalle || '',
                fechaInicial: item.fechaInicial ? item.fechaInicial.split('T')[0] : '',
                fechaFinal: item.fechaFinal ? item.fechaFinal.split('T')[0] : ''
            });
        } else {
            setEditingPeriodo(null);
            setPeriodoForm({
                idPeriodo: '',
                detalle: '',
                fechaInicial: '',
                fechaFinal: ''
            });
        }
        setIsPeriodoModalOpen(true);
    };

    const handleSavePeriodo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                id_periodo: periodoForm.idPeriodo,
                detalle: periodoForm.detalle,
                fecha_inicial: periodoForm.fechaInicial ? periodoForm.fechaInicial : null,
                fecha_final: periodoForm.fechaFinal ? periodoForm.fechaFinal : null,
                activo: editingPeriodo ? editingPeriodo.activo : true,
                cerrado: editingPeriodo ? editingPeriodo.cerrado : false
            };
            if (editingPeriodo) {
                await api.put(`/catalogs/periodos/${editingPeriodo.idPeriodo}`, payload);
            } else {
                await api.post('/catalogs/periodos', payload);
            }
            setIsPeriodoModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert('Error al guardar período: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleTogglePeriodo = async (item: PeriodoAcademico) => {
        if (!await confirm({
            title: "Cambiar Estado de Período",
            message: `¿Está seguro de cambiar el estado del período "${item.idPeriodo}"?`,
            confirmText: "Cambiar",
            cancelText: "Cancelar",
            variant: "warning"
        })) return;
        try {
            await api.delete(`/catalogs/periodos/${item.idPeriodo}`);
            fetchData();
        } catch (error: any) {
            alert('Error al cambiar estado: ' + error.message);
        }
    };

    // Calendario actions
    const handleOpenCalendarioModal = (item: EventoNormativo | null = null) => {
        if (item) {
            setEditingCalendario(item);
            setCalendarioForm({
                titulo: item.titulo,
                descripcion: item.descripcion || '',
                tipoEvento: item.tipoEvento,
                fechaInicio: item.fechaInicio ? item.fechaInicio.split('T')[0] : '',
                fechaFin: item.fechaFin ? item.fechaFin.split('T')[0] : '',
                esTodoElDia: item.esTodoElDia,
                recurrenciaAnual: item.recurrenciaAnual,
                recurrenciaHasta: item.recurrenciaHasta ? item.recurrenciaHasta.split('T')[0] : '',
                rolesVisibles: item.rolesVisibles || '',
                moduloOrigen: item.moduloOrigen || '',
                urlAccion: item.urlAccion || '',
                colorHex: item.colorHex || '#6B7280',
                alertaDias: item.alertaDias ?? 7
            });
        } else {
            setEditingCalendario(null);
            setCalendarioForm({
                titulo: '',
                descripcion: '',
                tipoEvento: 'Normativo',
                fechaInicio: '',
                fechaFin: '',
                esTodoElDia: true,
                recurrenciaAnual: false,
                recurrenciaHasta: '',
                rolesVisibles: '',
                moduloOrigen: '',
                urlAccion: '',
                colorHex: '#6B7280',
                alertaDias: 7
            });
        }
        setIsCalendarioModalOpen(true);
    };

    const handleSaveCalendario = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                titulo: calendarioForm.titulo,
                descripcion: calendarioForm.descripcion,
                tipo_evento: calendarioForm.tipoEvento,
                fecha_inicio: calendarioForm.fechaInicio,
                fecha_fin: calendarioForm.fechaFin || null,
                es_todo_el_dia: calendarioForm.esTodoElDia,
                recurrencia_anual: calendarioForm.recurrenciaAnual,
                recurrencia_hasta: calendarioForm.recurrenciaHasta || null,
                roles_visibles: calendarioForm.rolesVisibles || null,
                modulo_origen: calendarioForm.moduloOrigen || null,
                url_accion: calendarioForm.urlAccion || null,
                color_hex: calendarioForm.colorHex,
                alerta_dias: calendarioForm.alertaDias ? Number(calendarioForm.alertaDias) : null,
                activo: editingCalendario ? editingCalendario.activo : true
            };
            if (editingCalendario && editingCalendario.uuid) {
                await api.put(`/calendario/normativos/${editingCalendario.uuid}`, payload);
            } else {
                await api.post('/calendario/normativos', payload);
            }
            setIsCalendarioModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert('Error al guardar hito: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteCalendario = async (item: EventoNormativo) => {
        if (!await confirm({
            title: "Eliminar Hito Normativo",
            message: `¿Está seguro de eliminar el hito normativo "${item.titulo}" del calendario?`,
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            variant: "destructive"
        })) return;
        try {
            await api.delete(`/calendario/normativos/${item.uuid}`);
            fetchData();
        } catch (error: any) {
            alert('Error al eliminar hito: ' + error.message);
        }
    };

    // Filtered lists for searching
    const filteredPeriodos = periodos.filter(p => 
        (p.idPeriodo || '').toLowerCase().includes(search.toLowerCase()) || 
        (p.detalle || '').toLowerCase().includes(search.toLowerCase())
    );
    
    const filteredCalendario = calendario.filter(c => 
        (c.titulo || '').toLowerCase().includes(search.toLowerCase()) || 
        (c.descripcion || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.tipoEvento || '').toLowerCase().includes(search.toLowerCase())
    );

    return {
        activeTab,
        setActiveTab,
        loading,
        search,
        setSearch,

        // Data arrays
        periodos,
        calendario,

        // Filtered lists
        filteredPeriodos,
        filteredCalendario,

        // Periodo states & actions
        isPeriodoModalOpen,
        setIsPeriodoModalOpen,
        editingPeriodo,
        periodoForm,
        setPeriodoForm,
        handleOpenPeriodoModal,
        handleSavePeriodo,
        handleTogglePeriodo,

        // Calendario states & actions
        isCalendarioModalOpen,
        setIsCalendarioModalOpen,
        editingCalendario,
        calendarioForm,
        setCalendarioForm,
        handleOpenCalendarioModal,
        handleSaveCalendario,
        handleDeleteCalendario,

        fetchData
    };
};
