import { useState, useRef, useCallback } from 'react';

export interface UseSmartHeaderOptions {
    threshold?: number;
    topOffset?: number;
    initialVisible?: boolean;
}

export interface UseSmartHeaderReturn {
    isHeaderVisible: boolean;
    setIsHeaderVisible: (visible: boolean) => void;
    handleScroll: (e: React.UIEvent<HTMLElement>) => void;
    resetHeader: () => void;
}

/**
 * Hook desacoplado para la gestión de visibilidad inteligente de cabeceras (Smart Header).
 * Detecta la dirección y delta del scroll en cualquier contenedor scrollable y conmuta
 * la visibilidad sin generar saltos de maquetación (layout shifts).
 */
export const useSmartHeader = (options: UseSmartHeaderOptions = {}): UseSmartHeaderReturn => {
    const { threshold = 10, topOffset = 60, initialVisible = true } = options;
    const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(initialVisible);
    const lastScrollY = useRef<number>(0);

    const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
        const currentScrollY = e.currentTarget.scrollTop;

        // En el margen superior, la cabecera permanece visible de forma natural
        if (currentScrollY <= 15) {
            setIsHeaderVisible(true);
            lastScrollY.current = currentScrollY;
            return;
        }

        const diff = currentScrollY - lastScrollY.current;

        // Scroll descendente (bajar): ocultar cabecera para maximizar área de lectura
        if (diff > threshold && currentScrollY > topOffset) {
            setIsHeaderVisible(false);
            lastScrollY.current = currentScrollY;
        }
        // Scroll ascendente (subir): reaparecer cabecera de inmediato
        else if (diff < -threshold) {
            setIsHeaderVisible(true);
            lastScrollY.current = currentScrollY;
        }
    }, [threshold, topOffset]);

    const resetHeader = useCallback(() => {
        setIsHeaderVisible(true);
    }, []);

    return {
        isHeaderVisible,
        setIsHeaderVisible,
        handleScroll,
        resetHeader
    };
};

