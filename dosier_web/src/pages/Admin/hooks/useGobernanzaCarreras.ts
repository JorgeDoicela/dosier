import { useState, useEffect, useMemo } from 'react';
import {
    usersService,
    type GobernanzaCurricularDto,
    type CarreraGobernanzaDto
} from '../../../services/usersService';

export const useGobernanzaCarreras = () => {
    const [data, setData] = useState<GobernanzaCurricularDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCarreraId, setSelectedCarreraId] = useState<number | null>(null);
    const [searchFilter, setSearchFilter] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'CON_COORD' | 'SIN_COORD'>('TODAS');

    const fetchGobernanza = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await usersService.getGobernanzaCarreras();
            setData(res);
            if (res.carreras && res.carreras.length > 0) {
                // Auto-seleccionar la primera carrera activa
                setSelectedCarreraId(prev => prev ?? res.carreras[0].id_carrera);
            }
        } catch (err: any) {
            console.error('Error al cargar gobernanza curricular:', err);
            setError(err?.response?.data?.message || 'No se pudo cargar la estructura de carreras y gobernanza.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGobernanza();
    }, []);

    // Filtrar carreras por texto (nombre, alias o coordinador) y por estado
    const carrerasFiltradas = useMemo(() => {
        if (!data?.carreras) return [];
        const term = searchFilter.trim().toLowerCase();

        return data.carreras.filter(c => {
            // Filtro por estado
            const tieneCoord = Boolean(c.coordinador && c.coordinador.id_sigafi);
            if (filtroEstado === 'CON_COORD' && !tieneCoord) return false;
            if (filtroEstado === 'SIN_COORD' && tieneCoord) return false;

            // Filtro por texto
            if (!term) return true;
            const matchNombre = c.carrera.toLowerCase().includes(term);
            const matchAlias = c.alias_carrera?.toLowerCase().includes(term) ?? false;
            const matchCoord = c.coordinador?.nombre_completo.toLowerCase().includes(term) ?? false;
            const matchDocente = c.docentes.some(d => d.nombre_completo.toLowerCase().includes(term));

            return matchNombre || matchAlias || matchCoord || matchDocente;
        });
    }, [data, searchFilter, filtroEstado]);

    // Carrera activa seleccionada para detalle
    const carreraSeleccionada: CarreraGobernanzaDto | null = useMemo(() => {
        if (!data?.carreras) return null;
        if (!selectedCarreraId) return data.carreras[0] ?? null;
        return data.carreras.find(c => c.id_carrera === selectedCarreraId) ?? data.carreras[0] ?? null;
    }, [data, selectedCarreraId]);

    // Métricas globales
    const metricas = useMemo(() => {
        const totalCarreras = data?.carreras.length ?? 0;
        const conCoordinador = data?.carreras.filter(c => Boolean(c.coordinador?.id_sigafi)).length ?? 0;
        const vacantes = totalCarreras - conCoordinador;
        const totalDocentes = data?.carreras.reduce((acc, c) => acc + c.total_docentes, 0) ?? 0;

        return {
            totalCarreras,
            conCoordinador,
            vacantes,
            totalDocentes
        };
    }, [data]);

    return {
        data,
        loading,
        error,
        carrerasFiltradas,
        carreraSeleccionada,
        selectedCarreraId,
        setSelectedCarreraId,
        searchFilter,
        setSearchFilter,
        filtroEstado,
        setFiltroEstado,
        metricas,
        refetch: fetchGobernanza
    };
};
