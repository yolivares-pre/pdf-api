import express from "express";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { loadFonts } from "./utils/fonts.js";
import { loadAndEmbedImage, drawImage } from "./utils/images.js";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

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
    pdfDoc.registerFontkit(fontkit);

    const { boldFont, lightFont, regularFont } = await loadFonts(pdfDoc);
    const fontSize = 12;
    const margin = 50; // margen estándar
    const bottomMargin = 50; // margen inferior
    const topMargin = 50; // margen superior para páginas subsecuentes
    const pageHeight = 842;
    const pageWidth = 595;
    const contentWidth = pageWidth - 2 * margin;

    // Función para agregar la línea azul y roja en cada página
    const addHeaderLine = async (page) => {
      const bicolorImage = await loadAndEmbedImage(
        pdfDoc,
        "./assets/bicolor_line.png"
      );
      drawImage(page, bicolorImage, {
        x: margin,
        y: pageHeight - 7,
        width: 104,
        height: 7,
      });
    };

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    await addHeaderLine(page);

    // Dibujar logo, título y subtítulo solo en la primera página
    const logoImage = await loadAndEmbedImage(pdfDoc, "./assets/logo_pic.png");

    drawImage(page, logoImage, {
      x: margin,
      y: pageHeight - 90,
      width: 105,
      height: 47,
    });

    const title = `Informe técnico ${mes.toLowerCase()}`;
    const subtitle = `Región de ${region}`;

    const titleWidth = boldFont.widthOfTextAtSize(title, fontSize + 4);
    const subtitleWidth = regularFont.widthOfTextAtSize(subtitle, fontSize + 2);

    page.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight - 112,
      size: fontSize + 4,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    page.drawText(subtitle, {
      x: (pageWidth - subtitleWidth) / 2,
      y: pageHeight - 127,
      size: fontSize + 2,
      font: regularFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    let currentY = pageHeight - 172; // Iniciar justo debajo del subtítulo

    // Dibujar "Datos generales del mes"
    page.drawText("Datos generales del mes", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });
    currentY -= fontSize;

    // Datos para la tabla
    const dataGeneralBeneficiaries = [
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
    let startYGeneral = currentY;
    const rowHeightGeneral = 20;
    const colWidthsGeneral = [395, 100];

    // Dibujar las filas de la tabla
    dataGeneralBeneficiaries.forEach((row, rowIndex) => {
      row.forEach((cellText, colIndex) => {
        page.drawRectangle({
          x:
            startXGeneral +
            colWidthsGeneral.slice(0, colIndex).reduce((a, b) => a + b, 0),
          y: startYGeneral - rowHeightGeneral * (rowIndex + 1),
          width: colWidthsGeneral[colIndex],
          height: rowHeightGeneral,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(cellText, {
          x:
            startXGeneral +
            colWidthsGeneral.slice(0, colIndex).reduce((a, b) => a + b, 0) +
            5,
          y:
            startYGeneral -
            rowHeightGeneral * (rowIndex + 1) +
            rowHeightGeneral / 4,
          size: fontSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      });
    });

    currentY =
      startYGeneral - rowHeightGeneral * dataGeneralBeneficiaries.length - 12;

    // Dibujar la nota debajo de la tabla
    const note = `Listado detallado de trabajadoras/es y fiscalizaciones disponible en este link. (Sólo disponible en versión digital de este archivo).`;

    page.drawText(note, {
      x: margin,
      y: currentY,
      size: fontSize - 3,
      font: lightFont,
      color: rgb(0, 0, 0),
    });

    currentY -= fontSize + 16; // -> 478

    // Nueva función para dibujar secciones con títulos y párrafos
    const drawSection = (title, paragraph) => {
      // Dibujar título
      checkPageSpace(fontSize + 12);
      page.drawText(title, {
        x: margin,
        y: currentY,
        size: fontSize + 1,
        font: boldFont,
        color: rgb(0.0588, 0.4118, 0.7686),
      });

      currentY -= fontSize + 3; // Ajuste después del título

      // Dibujar párrafo
      const lines = splitTextIntoLines(
        paragraph,
        contentWidth,
        regularFont,
        fontSize
      );
      lines.forEach((line) => {
        checkPageSpace(fontSize + 4);
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        currentY -= fontSize + 4;
      });

      // Añadir separación adicional entre secciones
      currentY -= 10; // Ajusta el valor según el espacio deseado entre secciones
    };

    const checkPageSpace = (requiredSpace) => {
      if (currentY - requiredSpace < bottomMargin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        addHeaderLine(page);
        currentY = pageHeight - topMargin;
      }
    };

    const splitTextIntoLines = (text, maxWidth, font, size) => {
      const words = text.split(" ");
      let lines = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const testLineWidth = font.widthOfTextAtSize(testLine, size);
        if (testLineWidth < maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    // Ejemplo de títulos y párrafos
    const sections = [
      {
        title: "Título 1",
        paragraph:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.",
      },
      {
        title: "Título 2",
        paragraph:
          "Praesent ut ligula non mi varius sagittis. Curabitur euismod nisi est, non condimentum arcu convallis at.",
      },
      {
        title: "Título 3",
        paragraph:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.",
      },
      {
        title: "Título 4",
        paragraph:
          "Praesent ut ligula non mi varius sagittis. Curabitur euismod nisi est, non condimentum arcu convallis at.",
      },
      {
        title: "Título 5",
        paragraph:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.",
      },
      {
        title: "Título 6",
        paragraph:
          "Praesent ut ligula non mi varius sagittis. Curabitur euismod nisi est, non condimentum arcu convallis at.",
      },
      {
        title: "Título 7",
        paragraph:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Praesent ut ligula non mi varius sagittis. Curabitur euismod nisi est, non condimentum arcu convallis at.",
      },
      {
        title: "Título 8",
        paragraph:
          "Praesent ut ligula non mi varius sagittis. Curabitur euismod nisi est, non condimentum arcu convallis at. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.",
      },

      // Agregar más secciones según sea necesario...
    ];

    sections.forEach(({ title, paragraph }) => {
      drawSection(title, paragraph);
    });

    const pdfBytes = await pdfDoc.save();
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
