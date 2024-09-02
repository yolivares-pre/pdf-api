// index.js
import express from "express";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import fontkit from "@pdf-lib/fontkit"; // Importa fontkit
import { loadFonts } from "./utils/fonts.js";
import { loadAndEmbedImage, drawImage } from "./utils/images.js"; // Importa las funciones para imágenes

const app = express();

// Middleware para habilitar CORS manualmente
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Permitir todas las solicitudes de origen
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Métodos permitidos
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Encabezados permitidos
  next();
});

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

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit); // Registrar fontkit

    const page = pdfDoc.addPage([595, 842]); // Tamaño A4
    const margin = 50;
    const bottomMargin = 40; // Ajusta según tus necesidades
    const contentWidth = page.getWidth() - 2 * margin; // 495 de espacio disponible
    const pageHeight = page.getHeight();

    // Cargar y embeber las fuentes usando la función modularizada
    const { boldFont, heavyFont, lightFont, regularFont } = await loadFonts(
      pdfDoc
    );

    const baseFont = regularFont;
    const fontSize = 12;

    /* IMÁGENES */

    // Cargar y embeber las imágenes usando la función modularizada
    const bicolorImage = await loadAndEmbedImage(
      pdfDoc,
      "./assets/bicolor_line.png"
    );
    const logoImage = await loadAndEmbedImage(pdfDoc, "./assets/logo_pic.png");

    // Dibujar las imágenes en la página
    drawImage(page, bicolorImage, {
      x: margin,
      y: pageHeight - 7,
      width: 104,
      height: 7,
    });

    drawImage(page, logoImage, {
      x: margin,
      y: pageHeight - 90,
      width: 105,
      height: 47,
    });

    /* TÌTULO Y SUBTÍTULO */

    // Dibujar título y subtítulo
    const title = `Informe técnico ${mes.toLowerCase()}`;
    const subtitle = `Región de ${region}`;

    const titleWidth = boldFont.widthOfTextAtSize(title, fontSize + 4);
    const subtitleWidth = baseFont.widthOfTextAtSize(subtitle, fontSize + 2);

    page.drawText(title, {
      x: (page.getWidth() - titleWidth) / 2,
      y: pageHeight - 112,
      size: fontSize + 4,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(subtitle, {
      x: (page.getWidth() - subtitleWidth) / 2,
      y: pageHeight - 127,
      size: fontSize + 2,
      font: baseFont,
    });

    /* CAMPOS DINÁMICOS */

    // About workers
    page.drawText("Datos generales del mes", {
      x: margin,
      y: pageHeight - 172,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Datos para la tabla
    const dataGeneralBenefiaries = [
      ["Beneficiarias/os activas/os", `${encontradas}`],
      ["Beneficiarias/os no activas/os", `${ausentes}`],
      ["Beneficiarias/os que renunciaron", `${renuncias}`],
      ["Beneficiarias/os desvinculadas/os", `${fiscalizados}`],
      ["Beneficiarias/os fallecidas/os", `${fallecidos}`],
      ["Total beneficiarias/os", "227"],
      ["Total supervisiones", "100"],
    ];

    // Posiciones iniciales para la tabla
    let startXGeneral = margin;
    let startYGeneral = 660; // Ajusta según sea necesario
    const rowHeightGeneral = 20;
    const colWidthsGeneral = [395, 100]; // Ajustar según el ancho deseado para cada columna

    // Dibujar las filas de la tabla
    dataGeneralBenefiaries.forEach((row, rowIndex) => {
      row.forEach((cellText, colIndex) => {
        // Dibujar el rectángulo de la celda
        page.drawRectangle({
          x:
            startXGeneral +
            colWidthsGeneral.slice(0, colIndex).reduce((a, b) => a + b, 0), // Posición acumulativa de las columnas
          y: startYGeneral - rowHeightGeneral * (rowIndex + 1),
          width: colWidthsGeneral[colIndex],
          height: rowHeightGeneral,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Dibujar el texto dentro de la celda
        page.drawText(cellText, {
          x:
            startXGeneral +
            colWidthsGeneral.slice(0, colIndex).reduce((a, b) => a + b, 0) +
            5, // Un pequeño margen interno
          y:
            startYGeneral -
            rowHeightGeneral * (rowIndex + 1) +
            rowHeightGeneral / 4, // Ajustar verticalmente para centrar el texto
          size: fontSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      });
    });

    const note = `Listado detallado de trabajadoras/es y fiscalizaciones disponible en este link. (Sólo disponible en versión digital de este archivo).`;

    page.drawText(note, {
      x: margin,
      y: pageHeight - 334,
      size: fontSize - 3,
      font: lightFont,
      color: rgb(0, 0, 0),
    });

    /* SUPERVISIONS DETAILS */
    // About workers
    page.drawText("Detalles sobre las supervisiones realizadas", {
      x: margin,
      y: pageHeight - 362,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    /* --------------- */

    // Serializar el PDF a un Uint8Array
    const pdfBytes = await pdfDoc.save();

    // Configurar la respuesta para descargar el archivo
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${region}_${mes}.pdf"`
    );
    res.end(pdfBytes);
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
