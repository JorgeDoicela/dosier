/**
 * Utilidades puras de manipulación de Canvas para procesamiento de imágenes.
 * Desacopladas del estado de React para permitir testeabilidad unitaria aislada.
 */

export const createCanvas = (width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
};

export function detectImageCharacteristics(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const totalPixels = width * height;

    let transparentPixels = 0;
    let edgeLumaSum = 0;
    let edgePixelCount = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const a = pixels[idx + 3];
            if (a < 50) {
                transparentPixels++;
            }
            const isEdge = (x === 0 || x === width - 1 || y === 0 || y === height - 1);
            if (isEdge && a > 50) {
                edgePixelCount++;
                edgeLumaSum += 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
            }
        }
    }

    const hasNativeTransparency = transparentPixels > (totalPixels * 0.03);
    const avgEdgeLuma = edgePixelCount > 0 ? (edgeLumaSum / edgePixelCount) : 255;
    const isDarkBackground = !hasNativeTransparency && avgEdgeLuma < 125;

    return { hasNativeTransparency, isDarkBackground, avgEdgeLuma };
}

export function applyAdaptiveThreshold(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    thresholdValue: number,
    inkColorMode: 'blue' | 'black' | 'original',
    invertMode: boolean = false
) {
    const { width, height } = canvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels  = imgData.data;
    const output  = ctx.createImageData(width, height);
    const out     = output.data;

    // Detectar si la imagen ya tiene fondo transparente o bordes oscuros
    const { hasNativeTransparency, isDarkBackground } = detectImageCharacteristics(ctx, width, height);
    const effectiveInvert = invertMode || (isDarkBackground && thresholdValue > 0);

    // Caso 1: Sin filtro (thresholdValue === 0) -> conserva la imagen original tal cual
    if (thresholdValue === 0) {
        for (let idx = 0; idx < pixels.length; idx += 4) {
            const a = pixels[idx + 3];
            if (a < 20) {
                out[idx] = 255; out[idx + 1] = 255; out[idx + 2] = 255; out[idx + 3] = 0;
            } else if (inkColorMode === 'blue') {
                out[idx] = 10; out[idx + 1] = 50; out[idx + 2] = 100; out[idx + 3] = a;
            } else if (inkColorMode === 'black') {
                out[idx] = 0; out[idx + 1] = 0; out[idx + 2] = 0; out[idx + 3] = a;
            } else {
                out[idx] = pixels[idx]; out[idx + 1] = pixels[idx + 1]; out[idx + 2] = pixels[idx + 2]; out[idx + 3] = a;
            }
        }
        ctx.putImageData(output, 0, 0);
        return;
    }

    // Caso 2: Imagen que YA tiene transparencia nativa (PNG sin fondo)
    if (hasNativeTransparency) {
        for (let idx = 0; idx < pixels.length; idx += 4) {
            const a = pixels[idx + 3];
            if (a < 25) {
                // Mantener fondo 100% transparente
                out[idx] = 255; out[idx + 1] = 255; out[idx + 2] = 255; out[idx + 3] = 0;
                continue;
            }

            const luma = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];

            // Si hay suciedad o fondo residual blanco alrededor del trazo en PNG
            if (!effectiveInvert && luma > 245 - thresholdValue && a > 180) {
                out[idx] = 255; out[idx + 1] = 255; out[idx + 2] = 255; out[idx + 3] = 0;
                continue;
            }

            if (inkColorMode === 'blue') {
                out[idx] = 10; out[idx + 1] = 50; out[idx + 2] = 100; out[idx + 3] = a;
            } else if (inkColorMode === 'black') {
                out[idx] = 0; out[idx + 1] = 0; out[idx + 2] = 0; out[idx + 3] = a;
            } else {
                out[idx] = pixels[idx]; out[idx + 1] = pixels[idx + 1]; out[idx + 2] = pixels[idx + 2]; out[idx + 3] = a;
            }
        }
        ctx.putImageData(output, 0, 0);
        return;
    }

    // Caso 3: Imagen con fondo opaco (papel escaneado o foto sobre fondo oscuro/claro)
    const radius = Math.min(12, Math.max(2, Math.floor(Math.min(width, height) / 4)));
    const c = thresholdValue;
    const step = (width <= 32 || height <= 32) ? 1 : 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            let sum = 0, count = 0;

            for (let dy = -radius; dy <= radius; dy += step) {
                for (let dx = -radius; dx <= radius; dx += step) {
                    const nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const nIdx = (ny * width + nx) * 4;
                        if (pixels[nIdx + 3] >= 30) {
                            sum += 0.299 * pixels[nIdx] + 0.587 * pixels[nIdx + 1] + 0.114 * pixels[nIdx + 2];
                            count++;
                        }
                    }
                }
            }

            const avg = count > 0 ? (sum / count) : 128;
            const luma = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];

            let isInk = false;
            if (effectiveInvert) {
                // Modo invertido (fondo oscuro / trazos claros):
                // La tinta son los trazos significativamente más claros que el fondo circundante
                isInk = (luma > avg + c && luma > 75) || luma > 215;
            } else {
                // Modo normal (papel claro / trazos oscuros):
                // La tinta son los trazos significativamente más oscuros que el papel circundante
                isInk = (luma <= avg - c && luma <= 215) || luma < 45;
            }

            if (!isInk) {
                out[idx] = 255; out[idx + 1] = 255; out[idx + 2] = 255; out[idx + 3] = 0;
            } else if (inkColorMode === 'blue') {
                out[idx] = 10; out[idx + 1] = 50; out[idx + 2] = 100; out[idx + 3] = 255;
            } else if (inkColorMode === 'black') {
                out[idx] = 0; out[idx + 1] = 0; out[idx + 2] = 0; out[idx + 3] = 255;
            } else {
                if (effectiveInvert) {
                    out[idx]   = 255 - pixels[idx];
                    out[idx+1] = 255 - pixels[idx+1];
                    out[idx+2] = 255 - pixels[idx+2];
                    out[idx+3] = 255;
                } else {
                    const f = 1.6;
                    out[idx]   = Math.max(0, Math.min(255, (pixels[idx]   - 128) * f + 128));
                    out[idx+1] = Math.max(0, Math.min(255, (pixels[idx+1] - 128) * f + 128));
                    out[idx+2] = Math.max(0, Math.min(255, (pixels[idx+2] - 128) * f + 128));
                    out[idx+3] = pixels[idx+3];
                }
            }
        }
    }
    ctx.putImageData(output, 0, 0);
}

export async function getCroppedImg(
    image: HTMLImageElement,
    pixelCrop: any,
    rotation: number,
    ctx: CanvasRenderingContext2D,
    customCreateCanvas = createCanvas
): Promise<void> {
    return new Promise(resolve => {
        const { canvas: tmp, ctx: tCtx } = customCreateCanvas(image.width, image.height);
        if (!tCtx) { resolve(); return; }
        
        const rotRad = (rotation * Math.PI) / 180;
        const maxLen = Math.sqrt(image.width ** 2 + image.height ** 2);
        tmp.width = maxLen;
        tmp.height = maxLen;
        
        tCtx.translate(maxLen / 2, maxLen / 2);
        tCtx.rotate(rotRad);
        tCtx.translate(-image.width / 2, -image.height / 2);
        tCtx.drawImage(image, 0, 0);
        
        ctx.drawImage(tmp,
            pixelCrop.x + (maxLen - image.width) / 2,
            pixelCrop.y + (maxLen - image.height) / 2,
            pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
        resolve();
    });
}
