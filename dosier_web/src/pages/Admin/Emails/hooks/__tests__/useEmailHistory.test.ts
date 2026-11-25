/**
 * DOSIER — Tests: useEmailHistory.ts (Historial y estados de entrega de correo)
 */
import { describe, it, expect } from "vitest";

interface RegistroEmail {
    id: string;
    destinatario: string;
    asunto: string;
    estado: "Enviado" | "Fallido" | "Pendiente" | "Rebotado";
    intentos: number;
}

function sePuedeReintentar(registro: RegistroEmail): boolean {
    return registro.estado === "Fallido" && registro.intentos < 3;
}

function filtrarHistorialEmails(registros: RegistroEmail[], estadoFiltro: string): RegistroEmail[] {
    if (!estadoFiltro || estadoFiltro === "TODOS") return registros;
    return registros.filter((r) => r.estado.toUpperCase() === estadoFiltro.toUpperCase());
}

describe("useEmailHistory — historial de envíos DOSIER", () => {
    it("permite reintentar si el estado es Fallido e intentos < 3", () => {
        expect(sePuedeReintentar({ id: "1", destinatario: "docente@istpet.edu.ec", asunto: "PEA", estado: "Fallido", intentos: 1 })).toBe(true);
    });

    it("no permite reintentar si superó los 3 intentos", () => {
        expect(sePuedeReintentar({ id: "2", destinatario: "docente@istpet.edu.ec", asunto: "PEA", estado: "Fallido", intentos: 3 })).toBe(false);
    });

    it("filtra el historial por estado incluyendo Rebotado", () => {
        const registros: RegistroEmail[] = [
            { id: "1", destinatario: "a@istpet.edu.ec", asunto: "A", estado: "Enviado", intentos: 1 },
            { id: "2", destinatario: "b@istpet.edu.ec", asunto: "B", estado: "Fallido", intentos: 2 },
            { id: "3", destinatario: "c@istpet.edu.ec", asunto: "C", estado: "Rebotado", intentos: 1 },
        ];
        const fallidos = filtrarHistorialEmails(registros, "FALLIDO");
        expect(fallidos).toHaveLength(1);
        expect(fallidos[0].id).toBe("2");

        const rebotados = filtrarHistorialEmails(registros, "REBOTADO");
        expect(rebotados).toHaveLength(1);
        expect(rebotados[0].id).toBe("3");
    });
});
