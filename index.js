// index.js
import express from "express";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const app = express();

// Middleware para procesar JSON en las solicitudes
app.use(express.json());

app.post("/api/create-pdf", async (req, res) => {
  try {
    const {
      mes,
      ejecutora,
      folios,
      region,
      decreto,
      encontradas,
      ausentes,
      renuncias,
      fallecidos,
      fiscalizados,
      total,
      epp,
      eppObserva,
      usoEpp,
      usoEppObserva,
      libroAsistencia,
      libroAsistenciaObserva,
      jornadaCorrecta,
      jornadaCorrectaObserva,
      condicionesOptimas,
      condicionesOptimasObserva,
      laboresContrato,
      laboresContratoObserva,
      capacitacion,
      capacitacionObserva,
      remuneracion,
      remuneracionObserva,
      listado,
      comentariosFiscalizacion,
      comentariosGenerales,
      firmante,
      cargo,
    } = req.body;

    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // Tamaño A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;

    // Añadir título y encabezados
    page.drawText("ProEmpleo Ministerio del Trabajo y Previsión Social", {
      x: margin,
      y: page.getHeight() - margin,
      size: fontSize + 2,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Informe técnico ${mes} de la región ${region}`, {
      x: margin,
      y: page.getHeight() - margin - 20,
      size: fontSize,
      font,
    });

    // Información principal y tablas
    page.drawText(`Folios: ${folios}`, {
      x: margin,
      y: page.getHeight() - margin - 50,
      size: fontSize,
      font,
    });
    page.drawText(`Nombre ejecutora/s final/es: ${ejecutora}`, {
      x: margin,
      y: page.getHeight() - margin - 70,
      size: fontSize,
      font,
    });
    page.drawText(`Decreto/s: ${decreto}`, {
      x: margin,
      y: page.getHeight() - margin - 90,
      size: fontSize,
      font,
    });

    // Agregar más detalles como tablas y observaciones similares al documento proporcionado

    // Serializar el PDF a un Uint8Array
    const pdfBytes = await pdfDoc.save();

    // Configurar la respuesta para descargar el archivo
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="reporte.pdf"');
    res.send(pdfBytes);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    res.status(500).send("Error al generar el PDF");
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
