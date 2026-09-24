import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface NotificationDto {
    uuid: string;
    titulo: string;
    mensaje: string;
    categoria: string;
    fecha_envio: string;
    leido: boolean;
    url_accion?: string;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Notificaciones In-App y Transaccionales
// ─────────────────────────────────────────────────────────────

export const notificacionesService = {
    /**
     * Obtiene las notificaciones del usuario autenticado.
     * @param limit Cantidad máxima a obtener (0 para todas).
     */
    getMyNotifications: (limit?: number): Promise<NotificationDto[]> => {
        const query = limit !== undefined ? `?limit=${limit}` : '';
        return api.get(`/Admin/notifications/my${query}`).then(r => r.data || []);
    },

    /**
     * Marca una notificación como leída.
     */
    markAsRead: (uuid: string): Promise<void> =>
        api.patch(`/Admin/notifications/${encodeURIComponent(uuid)}/read`).then(() => undefined),

    /**
     * Marca todas las notificaciones pendientes del usuario como leídas.
     */
    markAllAsRead: (): Promise<void> =>
        api.post('/Admin/notifications/mark-all-read').then(() => undefined),

    /**
     * Elimina una notificación específica del historial del usuario.
     */
    deleteNotification: (uuid: string): Promise<void> =>
        api.delete(`/Admin/notifications/${encodeURIComponent(uuid)}`).then(() => undefined),

    /**
     * Elimina todas las notificaciones ya leídas del buzón.
     */
    clearReadNotifications: (): Promise<void> =>
        api.delete('/Admin/notifications/clear-read').then(() => undefined),

    /**
     * Registra o sincroniza la suscripción Web Push o token de dispositivo del usuario.
     */
    subscribeDevice: (payload: { device_token: string; plataforma: string }): Promise<any> =>
        api.post('/Admin/notifications/subscribe', payload).then(r => r.data),
};

export default notificacionesService;
