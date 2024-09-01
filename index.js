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
    let currentY = page.getHeight() - margin;

    // Título y encabezado
    page.drawText("ProEmpleo Ministerio del Trabajo y Previsión Social", {
      x: margin,
      y: currentY,
      size: fontSize + 2,
      font,
      color: rgb(0, 0, 0),
    });

    currentY -= 20;
    page.drawText(`Informe técnico ${mes} de la región ${region}`, {
      x: margin,
      y: currentY,
      size: fontSize,
      font,
    });

    // Información principal
    currentY -= 30;
    page.drawText(`Folios: ${folios}`, {
      x: margin,
      y: currentY,
      size: fontSize,
      font,
    });
    currentY -= 20;
    page.drawText(`Nombre ejecutora/s final/es: ${ejecutora}`, {
      x: margin,
      y: currentY,
      size: fontSize,
      font,
    });
    currentY -= 20;
    page.drawText(`Decreto/s: ${decreto}`, {
      x: margin,
      y: currentY,
      size: fontSize,
      font,
    });

    // Sección de resumen de datos
    currentY -= 40;
    const summaryData = [
      ["Trabajadoras/es activas/os", encontradas],
      ["Trabajadoras/es no activas/os", ausentes],
      ["Trabajadoras/es que renunciaron", renuncias],
      ["Trabajadoras/es desvinculadas/os", fallecidos],
      ["Total trabajadoras/es", total],
      ["Total fiscalizaciones", fiscalizados],
    ];

    summaryData.forEach(([label, value]) => {
      page.drawText(`${label}: ${value}`, {
        x: margin,
        y: currentY,
        size: fontSize,
        font,
      });
      currentY -= 20;
    });

    // Secciones de detalles con observaciones
    const detailData = [
      ["Trabajadores que recibieron EPP", epp, eppObserva],
      ["Trabajadores que usan EPP", usoEpp, usoEppObserva],
      ["Libro de Asistencia", libroAsistencia, libroAsistenciaObserva],
      ["Jornada Correcta", jornadaCorrecta, jornadaCorrectaObserva],
      ["Condiciones Óptimas", condicionesOptimas, condicionesOptimasObserva],
      ["Labores según Contrato", laboresContrato, laboresContratoObserva],
      ["Capacitación", capacitacion, capacitacionObserva],
      ["Remuneración", remuneracion, remuneracionObserva],
    ];

    currentY -= 20;
    detailData.forEach(([label, count, obs]) => {
      if (currentY < 100) {
        // Añadir una nueva página si queda poco espacio
        page = pdfDoc.addPage([595, 842]);
        currentY = page.getHeight() - margin;
      }
      page.drawText(`${label}: ${count}`, {
        x: margin,
        y: currentY,
        size: fontSize,
        font,
      });
      currentY -= 15;
      page.drawText(`Observaciones: ${obs}`, {
        x: margin,
        y: currentY,
        size: fontSize - 2,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      currentY -= 25;
    });

    // Sección de comentarios
    currentY -= 20;
    page.drawText("Comentarios de Fiscalización:", {
      x: margin,
      y: currentY,
      size: fontSize,
      font,
    });
    currentY -= 15;
    page.drawText(comentariosFiscalizacion, {
      x: margin,
      y: currentY,
      size: fontSize - 2,
      font,
      maxWidth: 495,
      lineHeight: 14,
    });

    currentY -= 45;
    page.drawText("Comentarios Generales:", {
      x: margin,
      y: currentY,
      size: fontSize,
      font,
    });
    currentY -= 15;
    page.drawText(comentariosGenerales, {
      x: margin,
      y: currentY,
      size: fontSize - 2,
      font,
      maxWidth: 495,
      lineHeight: 14,
    });

    // Firmante y cargo
    currentY -= 40;
    page.drawText(`Firmante: ${firmante}`, {
      x: margin,
      y: currentY,
      size: fontSize,
      font,
    });
    currentY -= 15;
    page.drawText(`Cargo: ${cargo}`, {
      x: margin,
      y: currentY,
      size: fontSize - 2,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serializar el PDF a un Uint8Array
    const pdfBytes = await pdfDoc.save();

    // Configurar la respuesta para descargar el archivo
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${region}_${mes}.pdf"`
    );
    res.send(pdfBytes);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    res.status(500).send("Error al generar el PDF");
  }
});

app.get("/", (req, res) => {
    res.redirect("/api/create-pdf");
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Exportar la aplicación para Vercel
export default app;
