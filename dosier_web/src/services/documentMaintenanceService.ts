import api from '../api/axios_config';
import type { ObsoleteDoc, BackupLog, DiskInfo } from '../pages/Admin/DocumentMaintenance/documentMaintenanceTypes';

export type { ObsoleteDoc, BackupLog, DiskInfo };

export interface PurgeAllResultDto {
    count: number;
}

export interface VerifyIntegrityResultDto {
    isMatch: boolean;
    message: string;
}

export interface TriggerBackupResultDto {
    status?: string;
    message?: string;
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Mantenimiento de Documentos y Copias de Seguridad
// ─────────────────────────────────────────────────────────────

export const documentMaintenanceService = {
    /**
     * Obtiene el diagnóstico de almacenamiento y versiones obsoletas de documentos físicos.
     */
    getDiagnosis: (): Promise<ObsoleteDoc[]> =>
        api.get<ObsoleteDoc[]>('/documents/instances/maintenance/diagnose').then(r => r.data || []),

    /**
     * Purga el archivo PDF físico de una versión documental obsoleta específica.
     */
    purgeSingle: (uuid: string): Promise<any> =>
        api.post(`/documents/instances/maintenance/purge/${encodeURIComponent(uuid)}`).then(r => r.data),

    /**
     * Ejecuta la purga masiva de versiones obsoletas no protegidas ni de respaldo inmediato.
     */
    purgeAll: (): Promise<PurgeAllResultDto> =>
        api.post<PurgeAllResultDto>('/documents/instances/maintenance/purge-all').then(r => r.data),

    /**
     * Obtiene el historial de registros de copias de seguridad del sistema.
     */
    getBackups: (): Promise<BackupLog[]> =>
        api.get<BackupLog[]>('/admin/backups').then(r => r.data || []),

    /**
     * Obtiene la métrica de uso y espacio disponible en el disco del servidor.
     */
    getDiskInfo: (): Promise<DiskInfo> =>
        api.get<DiskInfo>('/admin/backups/disk-info').then(r => r.data),

    /**
     * Dispara un proceso asíncrono de copia de seguridad inmediata.
     */
    triggerBackup: (): Promise<TriggerBackupResultDto> =>
        api.post<TriggerBackupResultDto>('/admin/backups/trigger').then(r => r.data),

    /**
     * Verifica la integridad criptográfica SHA-256 del archivo de respaldo en disco.
     */
    verifyIntegrity: (uuid: string): Promise<VerifyIntegrityResultDto> =>
        api.post<VerifyIntegrityResultDto>(`/admin/backups/verify/${encodeURIComponent(uuid)}`).then(r => r.data),

    /**
     * Elimina físicamente un archivo de respaldo del disco del servidor.
     */
    purgeBackup: (uuid: string): Promise<void> =>
        api.delete(`/admin/backups/${encodeURIComponent(uuid)}`).then(() => undefined),

    /**
     * Descarga el archivo de copia de seguridad como blob binario.
     */
    downloadBackup: (uuid: string): Promise<Blob> =>
        api.get(`/admin/backups/download/${encodeURIComponent(uuid)}`, { responseType: 'blob' }).then(r => new Blob([r.data])),
};

export default documentMaintenanceService;
