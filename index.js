// index.js
import express from "express";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import fontkit from "@pdf-lib/fontkit"; // Importa fontkit
import { loadFonts } from "./utils/fonts.js";

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
    const contentWidth = page.getWidth() - 2 * margin; // 495 de espacio disponible

    // Cargar y embeber las fuentes usando la función modularizada
    const { boldFont, heavyFont, lightFont, regularFont } = await loadFonts(pdfDoc);

    const baseFont = regularFont;
    const fontSize = 12;

    // Cargar la imagen desde el sistema de archivos
    const bicolor_line = "./assets/bicolor_line.png"; // Ruta a la imagen Bicolor
    const logo_pic = "./assets/logo_pic.png"; // Ruta a la imagen Logo
    const BicolorimageBytes = fs.readFileSync(bicolor_line);
    const LogoimageBytes = fs.readFileSync(logo_pic);

    // Insertar la imagen en el documento PDF
    const bicolor_image = await pdfDoc.embedPng(BicolorimageBytes); // Embed la imagen PNG
    const logo_image = await pdfDoc.embedPng(LogoimageBytes); // Embed la imagen PNG
    const imageDims = bicolor_image.scale(1); // Escalar la imagen si es necesario

    // IMAGENES

    // Dibujar line en la página
    page.drawImage(bicolor_image, {
      x: 50, // Posición X a 50px desde el borde izquierdo
      y: page.getHeight() - 7, // Posición Y arriba de la página
      width: 104, // Ancho de la imagen
      height: 7, // Altura de la imagen
    });

    // Dibujar logo en la página
    page.drawImage(logo_image, {
      x: 50, // Posición X a 50px desde el borde izquierdo
      y: page.getHeight() - 100, // Posición Y arriba de la página
      width: 105, // Ancho de la imagen
      height: 47, // Altura de la imagen
    });

    // Dibujar título y subtítulo
    const title = `Informe técnico ${mes.toLowerCase()}`;
    const subtitle = `Región de ${region}`;

    const titleWidth = boldFont.widthOfTextAtSize(title, fontSize + 4);
    const subtitleWidth = baseFont.widthOfTextAtSize(subtitle, fontSize + 2);

    page.drawText(title, {
      x: (page.getWidth() - titleWidth) / 2,
      y: 700,
      size: fontSize + 4,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(subtitle, {
      x: (page.getWidth() - subtitleWidth) / 2,
      y: 680,
      size: fontSize + 2,
      font: baseFont,
    });

   // Texto para insertar en el rectángulo
   const textContent = `El equipo correspondiente a la Delegación Presidencial Regional de Ñuble, realiza la primera mesa Tripartita del período y consigna un plan de mitigación por las altas tasas de ausentismo laboral que afectan directamente la relación con los órganos colaboradores quienes resienten la mantención de los trabajadores y trabajadoras del Programa Inversión en la Comunidad en sus instituciones.\n\nSe cargan los beneficiarios definitivos acogidos al Plan de Egreso en sus modalidades Bono Complemento a la Pensión y Bono de Incentivo al Retiro.\n\nEl Organo Ejecutor gestiona la implementación piloto del Plan de Cuidados. Se observan las gestiones administrativas y técnicas del proceso para evaluar un período de prueba que asegure el cumplimiento de objetivos del Programa.`;

   // Dividir el texto en líneas respetando los saltos de línea
   const splitLines = (text, maxWidth, fontSize) => {
     const words = text.split(' ');
     let lines = [];
     let currentLine = '';
     
     words.forEach(word => {
       const testLine = currentLine + (currentLine ? ' ' : '') + word;
       const testLineWidth = regularFont.widthOfTextAtSize(testLine, fontSize);
       
       if (testLineWidth < maxWidth) {
         currentLine = testLine;
       } else {
         lines.push(currentLine);
         currentLine = word;
       }
     });

     if (currentLine) lines.push(currentLine);
     return lines;
   };

   // Procesar el texto para respetar los saltos de línea
   const paragraphs = textContent.split('\n');
   let allLines = [];
   paragraphs.forEach(paragraph => {
     const lines = splitLines(paragraph, contentWidth - 20, fontSize);
     allLines = allLines.concat(lines, ''); // Añadir un espacio entre párrafos
   });

   // Calcular la altura total del bloque de texto
   const lineHeight = 14; // Ajustar según sea necesario
   const boxHeight = allLines.length * lineHeight + 20; // Añadir margen interno

   const boxX = margin;
   const boxY = 550 - boxHeight; // Ajustar la posición Y según sea necesario

   // Dibujar el rectángulo
   page.drawRectangle({
     x: boxX,
     y: boxY,
     width: contentWidth,
     height: boxHeight,
     borderColor: rgb(0, 0, 0),
     borderWidth: 1,
   });

   // Dibujar el texto dentro del rectángulo
   let currentY = boxY + boxHeight - 15;
   allLines.forEach(line => {
     page.drawText(line, {
       x: boxX + 10, // Un pequeño margen dentro del rectángulo
       y: currentY,
       size: fontSize,
       font: regularFont,
       color: rgb(0, 0, 0),
       lineHeight: lineHeight,
     });
     currentY -= lineHeight; // Mover la posición Y hacia abajo para la siguiente línea
   });
    // currentY -= 30;
    // page.drawText(`Folios: ${folios}`, {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize,
    //   font,
    // });

    // currentY -= 20;
    // page.drawText(`Nombre ejecutora/s final/es: ${ejecutora}`, {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize,
    //   font,
    // });
    // currentY -= 20;
    // page.drawText(`Decreto/s: ${decreto}`, {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize,
    //   font,
    // });

    // Sección de resumen de datos
    // currentY -= 40;
    // const summaryData = [
    //   ["Trabajadoras/es activas/os", encontradas],
    //   ["Trabajadoras/es no activas/os", ausentes],
    //   ["Trabajadoras/es que renunciaron", renuncias],
    //   ["Trabajadoras/es desvinculadas/os", fallecidos],
    //   ["Total trabajadoras/es", total],
    //   ["Total fiscalizaciones", fiscalizados],
    // ];

    // summaryData.forEach(([label, value]) => {
    //   page.drawText(`${label}: ${value}`, {
    //     x: margin,
    //     y: currentY,
    //     size: fontSize,
    //     font,
    //   });
    //   currentY -= 20;
    // });

    // // Secciones de detalles con observaciones
    // const detailData = [
    //   ["Trabajadores que recibieron EPP", epp, eppObserva],
    //   ["Trabajadores que usan EPP", usoEpp, usoEppObserva],
    //   ["Libro de Asistencia", libroAsistencia, libroAsistenciaObserva],
    //   ["Jornada Correcta", jornadaCorrecta, jornadaCorrectaObserva],
    //   ["Condiciones Óptimas", condicionesOptimas, condicionesOptimasObserva],
    //   ["Labores según Contrato", laboresContrato, laboresContratoObserva],
    //   ["Capacitación", capacitacion, capacitacionObserva],
    //   ["Remuneración", remuneracion, remuneracionObserva],
    // ];

    // currentY -= 20;
    // detailData.forEach(([label, count, obs]) => {
    //   if (currentY < 100) {
    //     // Añadir una nueva página si queda poco espacio
    //     page = pdfDoc.addPage([595, 842]);
    //     currentY = page.getHeight() - margin;
    //   }
    //   page.drawText(`${label}: ${count}`, {
    //     x: margin,
    //     y: currentY,
    //     size: fontSize,
    //     font,
    //   });
    //   currentY -= 15;
    //   page.drawText(`Observaciones: ${obs}`, {
    //     x: margin,
    //     y: currentY,
    //     size: fontSize - 2,
    //     font,
    //     color: rgb(0.5, 0.5, 0.5),
    //   });
    //   currentY -= 25;
    // });

    // // Sección de comentarios
    // currentY -= 20;
    // page.drawText("Comentarios de Fiscalización:", {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize,
    //   font,
    // });
    // currentY -= 15;
    // page.drawText(comentariosFiscalizacion, {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize - 2,
    //   font,
    //   maxWidth: 495,
    //   lineHeight: 14,
    // });

    // currentY -= 45;
    // page.drawText("Comentarios Generales:", {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize,
    //   font,
    // });
    // currentY -= 15;
    // page.drawText(comentariosGenerales, {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize - 2,
    //   font,
    //   maxWidth: 495,
    //   lineHeight: 14,
    // });

    // // Firmante y cargo
    // currentY -= 40;
    // page.drawText(`Firmante: ${firmante}`, {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize,
    //   font,
    // });
    // currentY -= 15;
    // page.drawText(`Cargo: ${cargo}`, {
    //   x: margin,
    //   y: currentY,
    //   size: fontSize - 2,
    //   font,
    //   color: rgb(0.5, 0.5, 0.5),
    // });

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
