using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using iText.IO.Image;
using iText.Barcodes;
using System.Linq;
using System;
using System.IO;
using System.Collections.Generic;

namespace dosier_infrastructure.Signatures;

/// <summary>
/// Estampa el bloque visual profesional de la firma DOSIER al final del PDF.
/// El bloque incluye: imagen de firma / QR de verificación, datos institucionales,
/// trazabilidad criptográfica y código DFRM único.
/// 
/// Diseñado para adaptarse con precisión milimétrica tanto a la matriz curricular normada
/// de 4 niveles del PEA (Sección K: Elaborado, Revisado 1, Revisado 2, Aprobado) como a
/// plantillas generales de dos firmas (Director de Proyecto / Coordinador).
/// </summary>
public class SignatureStamper
{
    private static readonly Color PrimaryColor  = new DeviceRgb(10, 50, 100);    // Azul institucional (#0A3264)
    private static readonly Color AccentColor   = new DeviceRgb(0, 112, 243);    // Azul eléctrico (#0070F3)
    private static readonly Color LightGray     = new DeviceRgb(248, 250, 252);  // Slate-50 (#F8FAFC)
    private static readonly Color BorderColor   = new DeviceRgb(203, 213, 225);  // Slate-300 (#CBD5E1)
    private static readonly Color TextDark      = new DeviceRgb(30, 41, 59);     // Slate-800 (#1E293B)
    private static readonly Color TextGray      = new DeviceRgb(100, 116, 139);  // Slate-500 (#64748B)

    /// <summary>
    /// Añade el bloque de firma al PDF y retorna el nuevo PDF con el sello oficial.
    /// </summary>
    public byte[] StampSignatureBlock(
        byte[]   pdfBytes,
        string   nombreFirmante,
        string?  cedula,
        string?  cargo,
        string?  departamento,
        string?  rolEnDocumento,
        string   firmaCode,
        string?  firmaImagenB64,
        string   verificationUrl,
        DateTime firmadoEn)
    {
        using var outputStream = new MemoryStream();

        using (var reader = new PdfReader(new MemoryStream(pdfBytes)))
        using (var writer = new PdfWriter(outputStream))
        using (var pdf    = new PdfDocument(reader, writer))
        {
            var fonts = LoadFonts();
            int totalPages = pdf.GetNumberOfPages();
            var page = pdf.GetPage(totalPages);
            var pageSize = page.GetPageSize();

            // 1. Analizar el layout de la última página para ubicar la tabla de firmas
            var layoutLocator = new DocumentSignatureLayoutLocator(nombreFirmante);
            try
            {
                var processor = new iText.Kernel.Pdf.Canvas.Parser.PdfCanvasProcessor(layoutLocator);
                processor.ProcessPageContent(page);
            }
            catch { }

            bool isPeaMatrix = layoutLocator.HasPeaMatrix;

            if (isPeaMatrix)
            {
                // ── MODO MATRIZ PEA (4 NIVELES DE FIRMAS) ──────────────────────────
                // En A4 con márgenes de 1.8cm (51.02pt), ancho útil = 493.24pt.
                // 5 columnas de 20%: ancho de columna = 98.65pt.
                // Sello compacto: ancho = 94.0pt, alto = 44.0pt.
                float stampWidth = 94.0f;
                float stampHeight = 44.0f;

                // Determinar el índice de columna (1: Elaborado, 2: Revisado Carrera, 3: Revisado Académico, 4: Aprobado)
                int colIndex = ResolvePeaColumnIndex(rolEnDocumento, cargo, layoutLocator.FirmanteX);

                float marginX = 51.02f;
                float colWidth = 98.65f;
                float colLeft = marginX + colIndex * colWidth;
                float canvasX = colLeft + (colWidth - stampWidth) / 2.0f;

                // Determinar coordenada Y centrada en la fila FIRMA
                float canvasY;
                if (layoutLocator.FirmaY.HasValue)
                {
                    // Centrado verticalmente dentro de la celda de la fila FIRMA
                    canvasY = layoutLocator.FirmaY.Value - 14.0f;
                }
                else if (layoutLocator.NombreY.HasValue)
                {
                    // La fila FIRMA está inmediatamente sobre la fila NOMBRE
                    canvasY = layoutLocator.NombreY.Value + 10.0f;
                }
                else if (layoutLocator.ResponsabilidadY.HasValue)
                {
                    // Fallback anclado al encabezado de la sección de firmas
                    canvasY = layoutLocator.ResponsabilidadY.Value - 68.0f;
                }
                else
                {
                    // Fallback absoluto estándar para la página 3 del PEA
                    canvasY = 112.0f;
                }

                var stampTable = BuildCompactPeaStamp(
                    nombreFirmante: nombreFirmante,
                    cargo: cargo,
                    rolEnDocumento: rolEnDocumento,
                    firmaCode: firmaCode,
                    firmaImagenB64: firmaImagenB64,
                    verificationUrl: verificationUrl,
                    firmadoEn: firmadoEn,
                    pdf: pdf,
                    fonts: fonts,
                    stampWidth: stampWidth);

                var canvasArea = new iText.Kernel.Geom.Rectangle(canvasX, canvasY, stampWidth, stampHeight);
                using (var canvas = new Canvas(page, canvasArea))
                {
                    canvas.Add(stampTable);
                }
            }
            else
            {
                // ── MODO PLANTILLA GENERAL (2 FIRMAS) ─────────────────────────────
                float canvasWidth = 190.0f;
                float canvasHeight = 55.0f;

                bool esDirector = string.IsNullOrWhiteSpace(rolEnDocumento) ||
                                  rolEnDocumento.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
                                  rolEnDocumento.Contains("Elaborado", StringComparison.OrdinalIgnoreCase);

                float canvasX = esDirector ? 70.0f : 315.0f;
                float canvasY = layoutLocator.FirmanteY.HasValue 
                    ? layoutLocator.FirmanteY.Value + 12.0f 
                    : 160.0f;

                var (headerTable, bodyTable, footerTable) = BuildGeneralStamp(
                    nombreFirmante: nombreFirmante,
                    cedula: cedula,
                    cargo: cargo,
                    departamento: departamento,
                    rolEnDocumento: rolEnDocumento,
                    firmaCode: firmaCode,
                    firmaImagenB64: firmaImagenB64,
                    verificationUrl: verificationUrl,
                    firmadoEn: firmadoEn,
                    pdf: pdf,
                    fonts: fonts);

                var canvasArea = new iText.Kernel.Geom.Rectangle(canvasX, canvasY, canvasWidth, canvasHeight);
                using (var canvas = new Canvas(page, canvasArea))
                {
                    canvas.Add(headerTable);
                    canvas.Add(bodyTable);
                    canvas.Add(footerTable);
                }
            }
        }

        return outputStream.ToArray();
    }

    // ── CONSTRUCTORES DE BLOQUES VISUALES ──────────────────────────────

    /// <summary>
    /// Construye el sello compacto institucional que encaja con precisión en una celda
    /// de 98.65pt de la tabla de 4 niveles del PEA oficial.
    /// </summary>
    private static Table BuildCompactPeaStamp(
        string nombreFirmante,
        string? cargo,
        string? rolEnDocumento,
        string firmaCode,
        string? firmaImagenB64,
        string verificationUrl,
        DateTime firmadoEn,
        PdfDocument pdf,
        FontSet fonts,
        float stampWidth)
    {
        var mainTable = new Table(1)
            .SetWidth(stampWidth)
            .SetBorder(new iText.Layout.Borders.SolidBorder(BorderColor, 0.5f))
            .SetBackgroundColor(LightGray);

        // 1. Cabecera azul institucional
        mainTable.AddCell(new Cell()
            .SetBackgroundColor(PrimaryColor)
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetPadding(1.0f)
            .Add(new Paragraph("FIRMA INSTITUCIONAL DOSIER")
                .SetFont(fonts.bold)
                .SetFontSize(3.8f)
                .SetFontColor(ColorConstants.WHITE)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMultipliedLeading(0.80f)));

        // 2. Cuerpo en 2 columnas: Izquierda (Visual/QR/Trazo) y Derecha (Metadatos)
        var bodyTable = new Table(new float[] { 2.6f, 6.8f })
            .UseAllAvailableWidth()
            .SetMarginTop(0)
            .SetBackgroundColor(LightGray);

        // Columna Izquierda: Trazo de firma o QR de verificación
        var visualCell = new Cell()
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetPadding(0.8f)
            .SetVerticalAlignment(VerticalAlignment.MIDDLE)
            .SetHorizontalAlignment(HorizontalAlignment.CENTER);

        bool qrAdded = false;
        if (!string.IsNullOrWhiteSpace(firmaImagenB64))
        {
            try
            {
                byte[] imgBytes = Convert.FromBase64String(
                    firmaImagenB64.Contains(',')
                        ? firmaImagenB64.Split(',')[1]
                        : firmaImagenB64);

                var imgData = ImageDataFactory.Create(imgBytes);
                var img = new iText.Layout.Element.Image(imgData)
                    .ScaleToFit(24, 18)
                    .SetHorizontalAlignment(HorizontalAlignment.CENTER);
                visualCell.Add(img);
                qrAdded = true;
            }
            catch { }
        }

        if (!qrAdded)
        {
            var qrImg = GenerateQrImage(verificationUrl, pdf);
            if (qrImg != null)
            {
                qrImg.ScaleToFit(22, 22)
                    .SetHorizontalAlignment(HorizontalAlignment.CENTER);
                visualCell.Add(qrImg);

                visualCell.Add(new Paragraph("Verificar")
                    .SetFont(fonts.regular)
                    .SetFontSize(2.8f)
                    .SetFontColor(TextGray)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMultipliedLeading(0.8f));
            }
            else
            {
                visualCell.Add(BuildInitialsPlaceholderCompact(nombreFirmante, fonts));
            }
        }
        bodyTable.AddCell(visualCell);

        // Columna Derecha: Datos institucionales estructurados
        var dataCell = new Cell()
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetBorderLeft(new iText.Layout.Borders.SolidBorder(BorderColor, 0.5f))
            .SetPadding(0.8f)
            .SetPaddingLeft(1.5f)
            .SetVerticalAlignment(VerticalAlignment.MIDDLE);

        // Nombre
        dataCell.Add(new Paragraph(FormatNombreMultiLine(nombreFirmante))
            .SetFont(fonts.bold)
            .SetFontSize(4.4f)
            .SetFontColor(PrimaryColor)
            .SetMultipliedLeading(0.80f)
            .SetMarginBottom(0.4f));

        // Cargo
        string cargoText = !string.IsNullOrWhiteSpace(cargo) 
            ? cargo 
            : (!string.IsNullOrWhiteSpace(rolEnDocumento) ? rolEnDocumento : "Docente");
        if (cargoText.Length > 22) cargoText = cargoText.Substring(0, 20) + "…";

        dataCell.Add(new Paragraph(cargoText)
            .SetFont(fonts.regular)
            .SetFontSize(3.5f)
            .SetFontColor(TextDark)
            .SetMultipliedLeading(0.80f));

        // Código DFRM
        dataCell.Add(new Paragraph()
            .SetMarginBottom(0)
            .SetMultipliedLeading(0.80f)
            .Add(new Text("Código: ").SetFont(fonts.bold).SetFontSize(3.5f).SetFontColor(TextGray))
            .Add(new Text(firmaCode).SetFont(fonts.bold).SetFontSize(3.5f).SetFontColor(AccentColor)));

        // Fecha y hora
        string fechaFormat = firmadoEn.ToString("dd/MM/yyyy HH:mm") + " UTC";
        dataCell.Add(new Paragraph(fechaFormat)
            .SetFont(fonts.regular)
            .SetFontSize(3.2f)
            .SetFontColor(TextGray)
            .SetMultipliedLeading(0.80f));

        bodyTable.AddCell(dataCell);

        mainTable.AddCell(new Cell()
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetPadding(0)
            .Add(bodyTable));

        // 3. Pie legal
        mainTable.AddCell(new Cell()
            .SetBackgroundColor(BorderColor)
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetPadding(0.6f)
            .Add(new Paragraph("Certificado Digital DOSIER · CACES / LOPDP")
                .SetFont(fonts.regular)
                .SetFontSize(2.8f)
                .SetFontColor(TextDark)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMultipliedLeading(0.80f)));

        return mainTable;
    }

    /// <summary>
    /// Construye el bloque visual tradicional de 3 columnas para documentos generales.
    /// </summary>
    private static (Table header, Table body, Table footer) BuildGeneralStamp(
        string nombreFirmante,
        string? cedula,
        string? cargo,
        string? departamento,
        string? rolEnDocumento,
        string firmaCode,
        string? firmaImagenB64,
        string verificationUrl,
        DateTime firmadoEn,
        PdfDocument pdf,
        FontSet fonts)
    {
        var headerTable = new Table(1)
            .UseAllAvailableWidth()
            .SetBackgroundColor(PrimaryColor);

        headerTable.AddCell(new Cell()
            .Add(new Paragraph("FIRMA INSTITUCIONAL DOSIER")
                .SetFont(fonts.bold)
                .SetFontSize(5.0f)
                .SetFontColor(ColorConstants.WHITE)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMultipliedLeading(0.85f))
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetPadding(1.0f));

        var bodyTable = new Table(new float[] { 2.8f, 5.0f, 2.2f })
            .UseAllAvailableWidth()
            .SetMarginTop(0.3f)
            .SetBackgroundColor(LightGray);

        var firmaCell = new Cell()
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetPadding(1.0f)
            .SetVerticalAlignment(VerticalAlignment.MIDDLE)
            .SetHorizontalAlignment(HorizontalAlignment.CENTER);

        if (!string.IsNullOrWhiteSpace(firmaImagenB64))
        {
            try
            {
                byte[] imgBytes = Convert.FromBase64String(
                    firmaImagenB64.Contains(',')
                        ? firmaImagenB64.Split(',')[1]
                        : firmaImagenB64);

                var imgData = ImageDataFactory.Create(imgBytes);
                var img = new iText.Layout.Element.Image(imgData)
                    .ScaleToFit(45, 16)
                    .SetHorizontalAlignment(HorizontalAlignment.CENTER);
                firmaCell.Add(img);
            }
            catch
            {
                firmaCell.Add(BuildInitialsPlaceholderCompact(nombreFirmante, fonts));
            }
        }
        else
        {
            firmaCell.Add(BuildInitialsPlaceholderCompact(nombreFirmante, fonts));
        }
        bodyTable.AddCell(firmaCell);

        var datosCell = new Cell()
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetBorderLeft(new iText.Layout.Borders.SolidBorder(BorderColor, 0.75f))
            .SetPadding(1.0f)
            .SetVerticalAlignment(VerticalAlignment.MIDDLE);

        datosCell.Add(new Paragraph(FormatNombreMultiLine(nombreFirmante))
            .SetFont(fonts.bold)
            .SetFontSize(5.5f)
            .SetFontColor(PrimaryColor)
            .SetMarginBottom(0.4f)
            .SetMultipliedLeading(0.85f));

        if (!string.IsNullOrWhiteSpace(rolEnDocumento))
            datosCell.Add(DataRow("Rol:", rolEnDocumento, fonts));

        if (!string.IsNullOrWhiteSpace(cargo))
            datosCell.Add(DataRow("Cargo:", cargo, fonts));

        string fechaFormat = firmadoEn.ToString("dd/MM/yyyy HH:mm") + " UTC";
        datosCell.Add(DataRow("Firmado:", fechaFormat, fonts));

        datosCell.Add(new Paragraph()
            .SetMarginBottom(0)
            .SetMultipliedLeading(0.85f)
            .Add(new Text("Código: ").SetFont(fonts.bold).SetFontSize(4.5f).SetFontColor(TextGray))
            .Add(new Text(firmaCode).SetFont(fonts.bold).SetFontSize(4.5f).SetFontColor(AccentColor)));

        bodyTable.AddCell(datosCell);

        var qrCell = new Cell()
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetBorderLeft(new iText.Layout.Borders.SolidBorder(BorderColor, 0.75f))
            .SetPadding(1.0f)
            .SetVerticalAlignment(VerticalAlignment.MIDDLE)
            .SetHorizontalAlignment(HorizontalAlignment.CENTER);

        var qrBytes = GenerateQrImage(verificationUrl, pdf);
        if (qrBytes != null)
        {
            qrBytes.ScaleToFit(22, 22)
                .SetHorizontalAlignment(HorizontalAlignment.CENTER);
            qrCell.Add(qrBytes);

            qrCell.Add(new Paragraph("Verificar")
                .SetFont(fonts.regular)
                .SetFontSize(3.5f)
                .SetFontColor(TextGray)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginTop(0));
        }
        bodyTable.AddCell(qrCell);

        var footerTable = new Table(1)
            .UseAllAvailableWidth()
            .SetMarginTop(0);

        footerTable.AddCell(new Cell()
            .Add(new Paragraph($"Firma institucional DOSIER · ISTPET · Verificar en: {verificationUrl}")
                .SetFont(fonts.regular)
                .SetFontSize(3.0f)
                .SetFontColor(TextGray)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMultipliedLeading(0.85f))
            .SetBackgroundColor(BorderColor)
            .SetBorder(iText.Layout.Borders.Border.NO_BORDER)
            .SetPadding(0.8f));

        return (headerTable, bodyTable, footerTable);
    }

    // ── HELPERS DE RESOLUCIÓN Y GEOMETRÍA ──────────────────────────────

    /// <summary>
    /// Determina la columna exacta (1..4) en la matriz de firmas normada del PEA:
    /// Col 1: ELABORADO (Docente)
    /// Col 2: REVISADO (Coordinador de Carrera)
    /// Col 3: REVISADO (Coordinador Académico)
    /// Col 4: APROBADO (Vicerrectorado)
    /// </summary>
    private static int ResolvePeaColumnIndex(string? rolEnDocumento, string? cargo, float? matchX)
    {
        string combined = $"{rolEnDocumento} {cargo}".ToLowerInvariant();

        if (combined.Contains("docente") || combined.Contains("elaborad") || combined.Contains("profesor"))
            return 1;

        if (combined.Contains("carrera") || combined.Contains("revisado 1") || (combined.Contains("coordinador") && !combined.Contains("acad")))
            return 2;

        if (combined.Contains("acad") || combined.Contains("revisado 2"))
            return 3;

        if (combined.Contains("vicerrector") || combined.Contains("aprobado"))
            return 4;

        // Fallback por proximidad horizontal de texto detectado
        if (matchX.HasValue)
        {
            float marginX = 51.02f;
            float colWidth = 98.65f;
            for (int i = 1; i <= 4; i++)
            {
                float left = marginX + i * colWidth;
                float right = left + colWidth;
                if (matchX.Value >= left - 15.0f && matchX.Value <= right + 15.0f)
                    return i;
            }
        }

        return 1; // Por defecto: Docente Elaborador
    }

    private static Paragraph DataRow(string label, string value, FontSet fonts, Color? valueColor = null)
    {
        return new Paragraph()
            .SetMarginBottom(0)
            .SetMultipliedLeading(0.85f)
            .Add(new Text($"{label} ").SetFont(fonts.bold).SetFontSize(4.5f).SetFontColor(TextGray))
            .Add(new Text(value).SetFont(fonts.regular).SetFontSize(4.5f)
                .SetFontColor(valueColor ?? TextDark));
    }

    private static Div BuildInitialsPlaceholderCompact(string nombre, FontSet fonts)
    {
        var initials = string.Concat(nombre.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Take(2).Select(w => char.ToUpper(w[0])));

        var div = new Div()
            .SetWidth(26).SetHeight(18)
            .SetBackgroundColor(new DeviceRgb(220, 230, 245))
            .SetBorderRadius(new iText.Layout.Properties.BorderRadius(2));

        div.Add(new Paragraph(initials)
            .SetFont(fonts.bold)
            .SetFontSize(8.0f)
            .SetFontColor(PrimaryColor)
            .SetTextAlignment(TextAlignment.CENTER)
            .SetMarginTop(1.5f));

        return div;
    }

    private static iText.Layout.Element.Image? GenerateQrImage(string url, PdfDocument pdf)
    {
        try
        {
            var barcode = new BarcodeQRCode(url);
            var qrImage = new iText.Layout.Element.Image(barcode.CreateFormXObject(pdf))
                .ScaleToFit(24, 24)
                .SetHorizontalAlignment(HorizontalAlignment.CENTER);
            return qrImage;
        }
        catch
        {
            return null;
        }
    }

    private static FontSet LoadFonts()
    {
        var localFontsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "Fonts");
        var localBoldPath = Path.Combine(localFontsDir, "OpenSans-Bold.ttf");
        var localRegularPath = Path.Combine(localFontsDir, "OpenSans-Regular.ttf");

        var candidates = new[]
        {
            localBoldPath,
            @"C:\Windows\Fonts\NotoSans-Bold.ttf",
            @"C:\Windows\Fonts\segoeui.ttf",
            @"/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
            @"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        };
        var candidatesRegular = new[]
        {
            localRegularPath,
            @"C:\Windows\Fonts\NotoSans-Regular.ttf",
            @"C:\Windows\Fonts\segoeui.ttf",
            @"/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
            @"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        };

        PdfFont boldFont;
        PdfFont regularFont;

        var boldPath    = candidates.FirstOrDefault(File.Exists);
        var regularPath = candidatesRegular.FirstOrDefault(File.Exists);

        try { boldFont = boldPath != null ? PdfFontFactory.CreateFont(boldPath, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED) : PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD); }
        catch { boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD); }

        try { regularFont = regularPath != null ? PdfFontFactory.CreateFont(regularPath, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED) : PdfFontFactory.CreateFont(StandardFonts.HELVETICA); }
        catch { regularFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA); }

        return new FontSet(boldFont, regularFont);
    }

    private static string FormatNombreMultiLine(string nombreCompleto)
    {
        if (string.IsNullOrWhiteSpace(nombreCompleto)) return string.Empty;
        var parts = nombreCompleto.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length <= 2)
        {
            return nombreCompleto;
        }

        int half = parts.Length / 2;
        if (parts.Length == 3)
        {
            half = 1;
        }

        var firstLine = string.Join(" ", parts.Take(half));
        var secondLine = string.Join(" ", parts.Skip(half));
        return $"{firstLine}\n{secondLine}";
    }

    private record FontSet(PdfFont bold, PdfFont regular);
}

/// <summary>
/// Analizador visual de coordenadas y detección de estructura de la tabla de firmas.
/// Extrae la presencia de la matriz PEA y las alturas de las filas FIRMA, NOMBRE y sección.
/// </summary>
public class DocumentSignatureLayoutLocator : iText.Kernel.Pdf.Canvas.Parser.Listener.IEventListener
{
    private readonly string? _nombreFirmante;

    public bool HasPeaMatrix { get; private set; } = false;
    public float? FirmaY { get; private set; }
    public float? NombreY { get; private set; }
    public float? ResponsabilidadY { get; private set; }
    public float? FirmanteX { get; private set; }
    public float? FirmanteY { get; private set; }

    public DocumentSignatureLayoutLocator(string? nombreFirmante)
    {
        _nombreFirmante = nombreFirmante;
    }

    public void EventOccurred(iText.Kernel.Pdf.Canvas.Parser.Data.IEventData data, iText.Kernel.Pdf.Canvas.Parser.EventType type)
    {
        if (type != iText.Kernel.Pdf.Canvas.Parser.EventType.RENDER_TEXT) return;

        var tri = (iText.Kernel.Pdf.Canvas.Parser.Data.TextRenderInfo)data;
        var text = tri.GetText();
        if (string.IsNullOrWhiteSpace(text)) return;

        var startPt = tri.GetBaseline().GetStartPoint();
        float x = startPt.Get(0);
        float y = startPt.Get(1);

        // 1. Detección de la cabecera o sección formal del PEA
        if (text.Contains("RESPONSABILIDAD", StringComparison.OrdinalIgnoreCase))
        {
            HasPeaMatrix = true;
            ResponsabilidadY = y;
        }
        else if (text.Contains("ELABORADO", StringComparison.OrdinalIgnoreCase))
        {
            HasPeaMatrix = true;
        }

        // 2. Localización de la fila "FIRMA"
        if (text.Trim().Equals("FIRMA", StringComparison.OrdinalIgnoreCase))
        {
            FirmaY = y;
        }

        // 3. Localización de la fila "NOMBRE"
        if (text.Trim().Equals("NOMBRE", StringComparison.OrdinalIgnoreCase))
        {
            NombreY = y;
        }

        // 4. Localización del texto del firmante
        if (!string.IsNullOrWhiteSpace(_nombreFirmante) && text.Contains(_nombreFirmante, StringComparison.OrdinalIgnoreCase))
        {
            FirmanteX = x;
            FirmanteY = y;
        }
    }

    public ICollection<iText.Kernel.Pdf.Canvas.Parser.EventType> GetSupportedEvents()
    {
        return new[] { iText.Kernel.Pdf.Canvas.Parser.EventType.RENDER_TEXT };
    }
}
