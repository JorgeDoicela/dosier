import { describe, it, expect } from 'vitest';
import { applyAdaptiveThreshold, detectImageCharacteristics } from '../canvasUtils';

describe('canvasUtils - Procesamiento de Firmas y Casos del Mundo Real', () => {

    it('detecta imágenes con transparencia nativa (PNG sin fondo)', () => {
        // Mock canvas context
        const width = 10, height = 10;
        const data = new Uint8ClampedArray(width * height * 4);
        
        // El 50% de los píxeles son transparentes (alpha = 0)
        for (let i = 0; i < data.length; i += 4) {
            if (i < data.length / 2) {
                data[i + 3] = 0; // transparente
            } else {
                data[i] = 10; data[i + 1] = 50; data[i + 2] = 100; data[i + 3] = 255;
            }
        }

        const mockCtx = {
            getImageData: () => ({ data, width, height }),
        } as unknown as CanvasRenderingContext2D;

        const info = detectImageCharacteristics(mockCtx, width, height);
        expect(info.hasNativeTransparency).toBe(true);
        expect(info.isDarkBackground).toBe(false);
    });

    it('preserva la transparencia nativa en PNG sin pintar tinta sobre píxeles transparentes', () => {
        const width = 4, height = 4;
        const inputData = new Uint8ClampedArray(width * height * 4);
        
        // Píxel 0 es transparente (alpha = 0)
        inputData[0] = 0; inputData[1] = 0; inputData[2] = 0; inputData[3] = 0;
        // Píxeles 1 a 15 son opacos con trazo (alpha = 255)
        for (let i = 4; i < inputData.length; i += 4) {
            inputData[i] = 30; inputData[i + 1] = 30; inputData[i + 2] = 30; inputData[i + 3] = 255;
        }

        let writtenData: ImageData | null = null;
        const mockCtx = {
            getImageData: () => ({ data: inputData, width, height }),
            createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
            putImageData: (img: ImageData) => { writtenData = img; },
        } as unknown as CanvasRenderingContext2D;

        const mockCanvas = { width, height } as HTMLCanvasElement;

        applyAdaptiveThreshold(mockCanvas, mockCtx, 14, 'blue', false);

        expect(writtenData).not.toBeNull();
        // El píxel 0 DEBE permanecer 100% transparente (alpha = 0)
        expect(writtenData!.data[3]).toBe(0);
        // Los píxeles con trazo deben estar entintados en azul institucional (10, 50, 100, 255)
        expect(writtenData!.data[4]).toBe(10);
        expect(writtenData!.data[5]).toBe(50);
        expect(writtenData!.data[6]).toBe(100);
        expect(writtenData!.data[7]).toBe(255);
    });

    it('invierte fondo oscuro eliminando el fondo de color/negro y dejando el texto claro como tinta', () => {
        const width = 4, height = 4;
        const inputData = new Uint8ClampedArray(width * height * 4);
        
        // Simular fondo rojo (luma ~80) y trazo blanco (luma = 255)
        for (let i = 0; i < inputData.length; i += 4) {
            if (i === 0) {
                // Trazo blanco
                inputData[i] = 255; inputData[i + 1] = 255; inputData[i + 2] = 255; inputData[i + 3] = 255;
            } else {
                // Fondo rojo oscuro
                inputData[i] = 200; inputData[i + 1] = 20; inputData[i + 2] = 30; inputData[i + 3] = 255;
            }
        }

        let writtenData: ImageData | null = null;
        const mockCtx = {
            getImageData: () => ({ data: inputData, width, height }),
            createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
            putImageData: (img: ImageData) => { writtenData = img; },
        } as unknown as CanvasRenderingContext2D;

        const mockCanvas = { width, height } as HTMLCanvasElement;

        // Con invertMode = true
        applyAdaptiveThreshold(mockCanvas, mockCtx, 10, 'blue', true);

        expect(writtenData).not.toBeNull();
        // El trazo blanco original (píxel 0) debe convertirse en tinta azul visible
        expect(writtenData!.data[0]).toBe(10);
        expect(writtenData!.data[1]).toBe(50);
        expect(writtenData!.data[2]).toBe(100);
        expect(writtenData!.data[3]).toBe(255);

        // El fondo rojo (píxel 1 en adelante) debe ser eliminado (alpha = 0)
        expect(writtenData!.data[7]).toBe(0);
    });

    it('permite desactivar la limpieza (threshold = 0) conservando la imagen sin alteración destructiva', () => {
        const width = 2, height = 2;
        const inputData = new Uint8ClampedArray([
            120, 130, 140, 255,
            200, 210, 220, 255,
            10, 20, 30, 255,
            255, 255, 255, 0 // transparente
        ]);

        let writtenData: ImageData | null = null;
        const mockCtx = {
            getImageData: () => ({ data: inputData, width, height }),
            createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
            putImageData: (img: ImageData) => { writtenData = img; },
        } as unknown as CanvasRenderingContext2D;

        const mockCanvas = { width, height } as HTMLCanvasElement;

        // Threshold = 0 y tinta original
        applyAdaptiveThreshold(mockCanvas, mockCtx, 0, 'original', false);

        expect(writtenData).not.toBeNull();
        // Debe conservar colores originales
        expect(writtenData!.data[0]).toBe(120);
        expect(writtenData!.data[1]).toBe(130);
        expect(writtenData!.data[2]).toBe(140);
        expect(writtenData!.data[3]).toBe(255);
        // Debe conservar el transparente
        expect(writtenData!.data[15]).toBe(0);
    });
});

