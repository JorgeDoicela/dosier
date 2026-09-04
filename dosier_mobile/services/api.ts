import axios from 'axios';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5175/api';

if (!process.env.EXPO_PUBLIC_API_URL && __DEV__) {
    console.warn(
        '[DOSIER Mobile] ⚠️ AVISO: No se detectó EXPO_PUBLIC_API_URL en .env. ' +
        'Si estás probando desde un teléfono físico, añade en dosier_mobile/.env tu IP: ' +
        'EXPO_PUBLIC_API_URL=http://<IP_DE_TU_PC>:5175/api'
    );
}

const api = axios.create({
    baseURL: apiBaseUrl
});

export default api;
