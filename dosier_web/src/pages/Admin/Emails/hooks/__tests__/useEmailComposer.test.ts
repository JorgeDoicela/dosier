/**
 * DOSIER — Tests: Motor de Correos Curriculares (emailEngineConfig & emailPreviewLayout)
 */
import { describe, it, expect } from "vitest";
import {
    applyTokenReplacements,
    buildBodyWithAdditionalMessage,
    buildEmailSendPayload,
    buildTemplateDataForSend,
    getPreviewDefaults,
    getSubjectVariants,
    getTokenLabel,
    TEMPLATE_RECOMMENDED_CONTEXT
} from "../../emailEngineConfig";
import {
    buildExtraDataForPreview,
    clearContextTokenValues,
    resolveActionUrlForPreview
} from "../../emailPreviewLayout";

describe("emailEngineConfig — Tokens curriculares DOSIER", () => {
    it("resuelve etiquetas en español para tokens de PEA y Período", () => {
        expect(getTokenLabel("[[pea_asignatura]]")).toBe("Asignatura (PEA)");
        expect(getTokenLabel("[[pea_carrera]]")).toBe("Carrera");
        expect(getTokenLabel("[[periodo_nombre]]")).toBe("Nombre del período");
    });

    it("recomienda contexto PEA para plantillas de workflow curricular", () => {
        expect(TEMPLATE_RECOMMENDED_CONTEXT.PEA_RECORDATORIO_ELABORACION.entityType).toBe("PEA");
        expect(TEMPLATE_RECOMMENDED_CONTEXT.PEA_OBSERVACIONES_SUBSANACION.entityType).toBe("PEA");
        expect(TEMPLATE_RECOMMENDED_CONTEXT.PERIODO_APERTURA_DISTRIBUTIVO.entityType).toBe("Periodo");
    });

    it("retorna variantes de asunto para plantillas oficiales y fallback estándar para personalizadas", () => {
        const variants = getSubjectVariants({
            idEmailTemplate: 1,
            uuid: "u1",
            codigo: "PEA_RECORDATORIO_ELABORACION",
            nombre: "Recordatorio",
            asunto: "Default",
            cuerpoHtml: "<p>Hola</p>",
            activo: true
        });
        expect(variants.length).toBeGreaterThanOrEqual(2);

        const customVariants = getSubjectVariants({
            idEmailTemplate: 2,
            uuid: "u2",
            codigo: "CUSTOM_TPL",
            nombre: "Custom",
            asunto: "Asunto Custom",
            cuerpoHtml: "<p>Hola</p>",
            activo: true
        });
        expect(customVariants).toHaveLength(1);
        expect(customVariants[0].asunto).toBe("Asunto Custom");
    });

    it("sustituye tokens en asunto y escapa HTML en cuerpo", () => {
        const subject = applyTokenReplacements(
            "Revisión PEA — [[pea_asignatura]] ([[pea_periodo]])",
            { "[[pea_asignatura]]": "Programación II", "[[pea_periodo]]": "ABR2026" },
            "text"
        );
        expect(subject).toBe("Revisión PEA — Programación II (ABR2026)");

        const body = applyTokenReplacements(
            "<p>Asignatura: [[pea_asignatura]]</p>",
            { "[[pea_asignatura]]": "Base de Datos <Avanzada>" },
            "html"
        );
        expect(body).toContain("Base de Datos &lt;Avanzada&gt;");
    });

    it("limpia [[mensaje_adicional]] cuando está vacío o lo inserta escapado", () => {
        const clean = buildBodyWithAdditionalMessage("<p>Inicio</p><p>[[mensaje_adicional]]</p>", "");
        expect(clean).not.toContain("[[mensaje_adicional]]");

        const withNote = buildBodyWithAdditionalMessage("<p>Inicio</p><p>[[mensaje_adicional]]</p>", "Revisar antes del viernes.");
        expect(withNote).toContain("Revisar antes del viernes.");
    });

    it("usa correo institucional ISTPET en valores de vista previa", () => {
        const defaults = getPreviewDefaults("https://dosier.istpet.edu.ec");
        expect(defaults["[[destinatario_email]]"]).toContain("@istpet.edu.ec");
    });

    it("construye payload en snake_case para el API .NET", () => {
        const payload = buildEmailSendPayload({
            templateCodigo: "PEA_SOLICITUD_AVAL",
            destinatariosEmails: ["coord@istpet.edu.ec"],
            destinatariosUserIds: [12],
            targetRole: "DOSIER_COORD_CARRERA",
            targetCarreraId: 5,
            targetCarreraIds: [5, 10],
            targetModalidadIds: [1],
            targetPeaEstado: "Observado",
            targetPeriodoId: "ABR2026",
            customSubject: "Revisión PEA",
            customBody: "<p>Contenido</p>",
            templateData: buildTemplateDataForSend({ "[[pea_asignatura]]": "Cálculo", "[[vacio]]": "   " }),
            attachments: [{ nombreArchivo: "pea_oficial.pdf", rutaArchivo: "SYSTEM:PEA_OFICIAL", contentType: "application/pdf" }],
            entityUuid: "uuid-pea-1",
            entityType: "PEA",
            certificateBase64: null,
            signaturePassword: null
        });

        expect(payload.template_codigo).toBe("PEA_SOLICITUD_AVAL");
        expect(payload.entity_type).toBe("PEA");
        expect(payload.entity_uuid).toBe("uuid-pea-1");
        expect(payload.target_carrera_ids).toEqual([5, 10]);
        expect(payload.target_modalidad_ids).toEqual([1]);
        expect(payload.target_pea_estado).toBe("Observado");
        expect(payload.target_periodo_id).toBe("ABR2026");
        expect(payload.template_data).toEqual({ "[[pea_asignatura]]": "Cálculo" });
        expect(payload.attachments[0].ruta_archivo).toBe("SYSTEM:PEA_OFICIAL");
    });
});

describe("emailPreviewLayout — Contexto PEA y Período", () => {
    it("prioriza [[pea_workspace_url]] y [[pea_revision_url]] como botón de acción", () => {
        const url = resolveActionUrlForPreview(
            { "[[pea_workspace_url]]": "https://dosier.istpet.edu.ec/documentacion/workspace/PEA_OFICIAL/abc" },
            "<p>Detalle</p>",
            "https://dosier.istpet.edu.ec"
        );
        expect(url).toBe("https://dosier.istpet.edu.ec/documentacion/workspace/PEA_OFICIAL/abc");
    });

    it("limpia únicamente los tokens del contexto desvinculado", () => {
        const cleared = clearContextTokenValues(
            { "[[pea_asignatura]]": "Redes", "[[fecha_limite]]": "2026-05-01" },
            "PEA"
        );
        expect(cleared["[[pea_asignatura]]"]).toBe("");
        expect(cleared["[[fecha_limite]]"]).toBe("2026-05-01");
    });

    it("construye ficha de detalles legibles omitiendo tokens globales y URLs", () => {
        const extra = buildExtraDataForPreview({
            "[[destinatario_nombre]]": "Ana",
            "[[pea_asignatura]]": "Redes I",
            "[[pea_workspace_url]]": "https://dosier.istpet.edu.ec/doc"
        });
        expect(extra).toEqual({ "Asignatura (PEA)": "Redes I" });
    });
});
