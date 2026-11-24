namespace dosier_infrastructure.Signatures;

using System;
using System.IO;
using System.Linq;
using iText.IO.Font.Constants;
using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Pdf.Xobject;
using iText.Layout.Element;

/// <summary>
/// Generador de sellos circulares institucionales oficiales en gráficos vectoriales puros de PDF (PdfFormXObject).
/// Produce un sello de alta definición idéntico a los sellos oficiales de caucho del ISTPET:
/// - Doble aro concéntrico en azul institucional (#0A3264).
/// - Texto superior en arco: "TECNOLÓGICO TRAVERSARI".
/// - Banda central horizontal con el departamento o carrera oficial (ej: "COORDINACIÓN ACADÉMICA", "DESARROLLO DE SOFTWARE", "VICERRECTORADO").
/// - Texto inferior en arco: "ISTPET".
/// - Superposición centrada de la rúbrica personal limpia del firmante.
/// </summary>
public static class InstitutionalStampGenerator
{
    private static readonly Color StampColor = new DeviceRgb(10, 50, 100); // Azul institucional oficial #0A3264

    /// <summary>
    /// Construye el Image de iText que contiene el PdfFormXObject del sello vectorial.
    /// </summary>
    public static Image CreateInstitutionalStamp(
        PdfDocument pdfDocument,
        string textoSuperior = "TECNOLÓGICO TRAVERSARI",
        string textoCentral = "COORDINACIÓN ACADÉMICA",
        string? textoCentralSub = null,
        string textoInferior = "ISTPET",
        ImageData? firmaPersonalData = null,
        PdfFont? fontBold = null,
        float diameter = 84.0f)
    {
        fontBold ??= PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

        var formXObject = new PdfFormXObject(new Rectangle(diameter, diameter));
        var canvas = new PdfCanvas(formXObject, pdfDocument);

        float xc = diameter / 2.0f;
        float yc = diameter / 2.0f;
        float rOut = (diameter / 2.0f) - 1.2f;
        float rIn = rOut - 2.8f;

        // 1. Doble anillo concéntrico oficial (calibre refinado y limpio, estilo sello de caucho)
        canvas.SetStrokeColor(StampColor);
        canvas.SetLineWidth(1.4f);
        canvas.Circle(xc, yc, rOut);
        canvas.Stroke();

        canvas.SetLineWidth(0.75f);
        canvas.Circle(xc, yc, rIn);
        canvas.Stroke();

        // 2. Líneas horizontales delimitadoras de la banda central
        float halfBand = string.IsNullOrWhiteSpace(textoCentralSub) ? 8.0f : 10.0f;
        float y1 = yc + halfBand;
        float y2 = yc - halfBand;

        float chordHalf = (float)Math.Sqrt(Math.Max(0, (rIn * rIn) - (halfBand * halfBand)));
        float x1 = xc - chordHalf + 0.5f;
        float x2 = xc + chordHalf - 0.5f;

        canvas.SetLineWidth(0.9f);
        canvas.MoveTo(x1, y1);
        canvas.LineTo(x2, y1);
        canvas.Stroke();

        canvas.MoveTo(x1, y2);
        canvas.LineTo(x2, y2);
        canvas.Stroke();

        // 3. Texto en arco superior (TECNOLÓGICO TRAVERSARI) acotado al cuadrante superior con aire
        float rTopText = rIn - 6.5f;
        DrawArcTextTop(canvas, fontBold, 4.3f, textoSuperior, xc, yc, rTopText);

        // 4. Texto en arco inferior (ISTPET) con espacio equilibrado
        float rBotText = rIn - 6.5f;
        DrawArcTextBottom(canvas, fontBold, 5.6f, textoInferior, xc, yc, rBotText);

        // 5. Texto central (Unidad / Carrera)
        DrawCenterText(canvas, fontBold, textoCentral, textoCentralSub, xc, yc, x2 - x1);

        // 6. Superposición de rúbrica personal limpia (si se proporciona)
        if (firmaPersonalData != null)
        {
            try
            {
                float sigWidth = diameter * 0.72f;
                float sigHeight = diameter * 0.44f;
                var sigRect = new Rectangle(xc - sigWidth / 2.0f, yc - sigHeight / 2.0f, sigWidth, sigHeight);
                canvas.AddImageFittedIntoRectangle(firmaPersonalData, sigRect, false);
            }
            catch { }
        }

        var image = new Image(formXObject);
        return image;
    }

    /// <summary>
    /// Resuelve las leyendas de texto del departamento y carrera según el rol institucional.
    /// Cubre todas las autoridades y carreras oficiales del ISTPET:
    /// - Vicerrectorado (vicerrector / vicerector / aprobado / vicerrectorado)
    /// - Coordinación Académica (coordinador académico / academia / comision académica)
    /// - Las 13 Carreras Oficiales del ISTPET (Desarrollo de Software, Redes, Gastronomía, etc.)
    /// - Docentes y Docencia Superior
    /// </summary>
    public static (string textoCentral, string? textoCentralSub) ResolveDepartmentLabels(
        string? rolEnDocumento,
        string? cargo,
        string? departamento)
    {
        string combined = $"{rolEnDocumento} {cargo} {departamento}".ToLowerInvariant();

        // 1. Vicerrectorado Académico (soporta 'vicerrector', 'vicerector', 'aprobado', 'vicerrectorado', etc.)
        if (combined.Contains("vicerrector") || 
            combined.Contains("vicerector") || 
            combined.Contains("aprobado") || 
            combined.Contains("dosier_vicerrector"))
        {
            return ("VICERRECTORADO", null);
        }

        // 2. Coordinación Académica General
        if (combined.Contains("coordinador acad") ||
            combined.Contains("coordinador académ") ||
            combined.Contains("coordinacion acad") ||
            combined.Contains("coordinación acad") ||
            combined.Contains("dosier_coord_acad") ||
            combined.Contains("comisionacademica") ||
            combined.Contains("comisión académica"))
        {
            return ("COORDINACIÓN ACADÉMICA", "CARRERAS PRESENCIALES");
        }

        // 3. Catálogo Oficial de Carreras del ISTPET
        if (combined.Contains("software"))
            return ("DESARROLLO DE SOFTWARE", null);

        if (combined.Contains("redes") || combined.Contains("telecomunicaciones"))
            return ("REDES Y", "TELECOMUNICACIONES");

        if (combined.Contains("gastronomia") || combined.Contains("gastronomía"))
            return ("GASTRONOMÍA", null);

        if (combined.Contains("diseño") || combined.Contains("diseno"))
            return ("DISEÑO GRÁFICO", null);

        if (combined.Contains("mecanica") || combined.Contains("mecánica") || combined.Contains("automotriz"))
            return ("MECÁNICA AUTOMOTRIZ", null);

        if (combined.Contains("contabilidad") || combined.Contains("tributaria"))
            return ("CONTABILIDAD Y", "ASESORÍA TRIBUTARIA");

        if (combined.Contains("talento humano") || combined.Contains("talento_humano"))
            return ("ADMINISTRACIÓN DE", "TALENTO HUMANO");

        if (combined.Contains("marketing") || combined.Contains("comercio"))
            return ("MARKETING DIGITAL Y", "COMERCIO ELECTRÓNICO");

        if (combined.Contains("educacion inicial") || combined.Contains("educación inicial") || combined.Contains("inicial"))
            return ("EDUCACIÓN INICIAL", null);

        if (combined.Contains("educacion basica") || combined.Contains("educación básica") || combined.Contains("basica"))
            return ("EDUCACIÓN BÁSICA", null);

        if (combined.Contains("educacion inclusiva") || combined.Contains("educación inclusiva") || combined.Contains("inclusiva"))
            return ("EDUCACIÓN INCLUSIVA", null);

        if (combined.Contains("entrenamiento") || combined.Contains("deporte") || combined.Contains("deportiv"))
            return ("ENTRENAMIENTO", "DEPORTIVO");

        if (combined.Contains("electronica") || combined.Contains("electrónica"))
            return ("ELECTRÓNICA", null);

        // 4. Coordinación de Carrera genérica o con departamento específico
        if (combined.Contains("carrera") || combined.Contains("coordinador"))
        {
            if (!string.IsNullOrWhiteSpace(departamento) && !departamento.Equals("ISTPET", StringComparison.OrdinalIgnoreCase))
            {
                return (CleanCareerName(departamento), null);
            }
            return ("COORDINACIÓN DE CARRERA", null);
        }

        // 5. Caso Docente Titular o Área Académica
        if (!string.IsNullOrWhiteSpace(departamento) &&
            !departamento.Trim().Equals("ISTPET", StringComparison.OrdinalIgnoreCase) &&
            !departamento.Trim().Equals("ACADEMIA", StringComparison.OrdinalIgnoreCase) &&
            !departamento.Trim().Equals("DOCENCIA", StringComparison.OrdinalIgnoreCase))
        {
            return (CleanCareerName(departamento), null);
        }

        return ("DOCENCIA SUPERIOR", null);
    }

    private static string CleanCareerName(string raw)
    {
        string upper = raw.Trim().ToUpperInvariant();
        if (upper.StartsWith("TECNOLOGÍA SUPERIOR EN "))
            upper = upper.Substring("TECNOLOGÍA SUPERIOR EN ".Length).Trim();
        else if (upper.StartsWith("TECNOLOGIA SUPERIOR EN "))
            upper = upper.Substring("TECNOLOGIA SUPERIOR EN ".Length).Trim();
        else if (upper.StartsWith("CARRERA DE "))
            upper = upper.Substring("CARRERA DE ".Length).Trim();

        return upper;
    }

    private static void DrawArcTextTop(
        PdfCanvas canvas,
        PdfFont font,
        float fontSize,
        string text,
        float xc,
        float yc,
        float radius)
    {
        if (string.IsNullOrWhiteSpace(text)) return;
        text = text.Trim().ToUpperInvariant();

        float letterSpacing = 0.32f;
        float totalWidth = 0f;
        float[] charWidths = new float[text.Length];
        for (int i = 0; i < text.Length; i++)
        {
            charWidths[i] = font.GetWidth(text[i].ToString(), fontSize) + letterSpacing;
            totalWidth += charWidths[i];
        }

        float totalAngle = totalWidth / radius;
        // El texto superior se centra en el ángulo 90° (PI / 2)
        float startAngle = (float)(Math.PI / 2.0 + totalAngle / 2.0);
        float currentAngle = startAngle;

        for (int i = 0; i < text.Length; i++)
        {
            float halfCharAngle = (charWidths[i] / 2.0f) / radius;
            float charAngle = currentAngle - halfCharAngle;

            float x = xc + radius * (float)Math.Cos(charAngle);
            float y = yc + radius * (float)Math.Sin(charAngle);

            // Ángulo de rotación del carácter tangente a la curva en sentido horario
            float rot = (float)(charAngle - Math.PI / 2.0);

            float cos = (float)Math.Cos(rot);
            float sin = (float)Math.Sin(rot);

            canvas.BeginText();
            canvas.SetFontAndSize(font, fontSize);
            canvas.SetColor(StampColor, true);
            canvas.SetTextMatrix(cos, sin, -sin, cos, x, y);
            canvas.ShowText(text[i].ToString());
            canvas.EndText();

            currentAngle -= charWidths[i] / radius;
        }
    }

    private static void DrawArcTextBottom(
        PdfCanvas canvas,
        PdfFont font,
        float fontSize,
        string text,
        float xc,
        float yc,
        float radius)
    {
        if (string.IsNullOrWhiteSpace(text)) return;
        text = text.Trim().ToUpperInvariant();

        float letterSpacing = 1.2f;
        float totalWidth = 0f;
        float[] charWidths = new float[text.Length];
        for (int i = 0; i < text.Length; i++)
        {
            charWidths[i] = font.GetWidth(text[i].ToString(), fontSize) + letterSpacing;
            totalWidth += charWidths[i];
        }

        float totalAngle = totalWidth / radius;
        // El texto inferior se centra en 270° (3 * PI / 2) y se lee de izquierda a derecha (sentido antihorario)
        float startAngle = (float)(3.0 * Math.PI / 2.0 - totalAngle / 2.0);
        float currentAngle = startAngle;

        for (int i = 0; i < text.Length; i++)
        {
            float halfCharAngle = (charWidths[i] / 2.0f) / radius;
            float charAngle = currentAngle + halfCharAngle;

            float x = xc + radius * (float)Math.Cos(charAngle);
            float y = yc + radius * (float)Math.Sin(charAngle);

            // Rotación del carácter para que la base quede apoyada en el círculo y lea derecho
            float rot = (float)(charAngle - 3.0 * Math.PI / 2.0);

            float cos = (float)Math.Cos(rot);
            float sin = (float)Math.Sin(rot);

            canvas.BeginText();
            canvas.SetFontAndSize(font, fontSize);
            canvas.SetColor(StampColor, true);
            canvas.SetTextMatrix(cos, sin, -sin, cos, x, y);
            canvas.ShowText(text[i].ToString());
            canvas.EndText();

            currentAngle += charWidths[i] / radius;
        }
    }

    private static void DrawCenterText(
        PdfCanvas canvas,
        PdfFont font,
        string text1,
        string? text2,
        float xc,
        float yc,
        float maxAvailableWidth)
    {
        text1 = text1.Trim().ToUpperInvariant();
        text2 = text2?.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(text2))
        {
            // Ajustar en una sola línea elegante con márgenes laterales (sin quiebres forzados de palabra)
            float singleFontSize = 6.0f;
            float w = font.GetWidth(text1, singleFontSize);
            if (w > maxAvailableWidth - 6.0f)
            {
                singleFontSize = singleFontSize * ((maxAvailableWidth - 6.0f) / w);
                w = font.GetWidth(text1, singleFontSize);
            }

            // Dibujar en una sola línea centrada
            float x = xc - (w / 2.0f);
            float y = yc - (singleFontSize * 0.35f);

            canvas.BeginText();
            canvas.SetFontAndSize(font, singleFontSize);
            canvas.SetColor(StampColor, true);
            canvas.SetTextMatrix(x, y);
            canvas.ShowText(text1);
            canvas.EndText();
            return;
        }

        // Renderizado en 2 líneas dentro de la banda central
        float lineFontSize = 5.2f;
        float w1 = font.GetWidth(text1, lineFontSize);
        float w2 = font.GetWidth(text2, lineFontSize);

        float xLine1 = xc - (w1 / 2.0f);
        float yLine1 = yc + 1.2f;

        float xLine2 = xc - (w2 / 2.0f);
        float yLine2 = yc - 5.2f;

        canvas.BeginText();
        canvas.SetFontAndSize(font, lineFontSize);
        canvas.SetColor(StampColor, true);
        canvas.SetTextMatrix(xLine1, yLine1);
        canvas.ShowText(text1);
        canvas.EndText();

        canvas.BeginText();
        canvas.SetFontAndSize(font, lineFontSize);
        canvas.SetColor(StampColor, true);
        canvas.SetTextMatrix(xLine2, yLine2);
        canvas.ShowText(text2);
        canvas.EndText();
    }
}
