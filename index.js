// index.js
import express from "express";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";

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

    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // Tamaño A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;
    let currentY = page.getHeight() - margin;

    console.log(page.getHeight());

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

    // TEXTOS

    // Título y encabezado correctamente centrados
    const title = `Informe técnico ${mes}`;
    const subtitle = `Región de ${region}`;

    // Asegúrate de calcular el ancho del texto con el mismo tamaño de fuente que usarás para dibujar
    const titleWidth = font.widthOfTextAtSize(title, fontSize + 4);
    const subtitleWidth = font.widthOfTextAtSize(subtitle, fontSize + 2);

    // Centrar el título
    page.drawText(title, {
      x: (page.getWidth() - titleWidth) / 2, // Calcular x correctamente para centrar
      y: 700, // Posición y fija
      size: fontSize + 4,
      font,
      color: rgb(0, 0, 0),
    });

    // Centrar el subtítulo
    page.drawText(subtitle, {
      x: (page.getWidth() - subtitleWidth) / 2, // Calcular x correctamente para centrar
      y: 680, // Posición y fija
      size: fontSize + 2,
      font,
    });

    // Información principal
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
