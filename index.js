import express from "express";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { loadFonts } from "./utils/loadFonts.js";
import { addHeaderLine } from "./utils/addHeaderLine.js";
import { validateRequestBody, removeAccents } from "./utils/validation.js";
import { fileURLToPath } from "url";
import { loadAndEmbedImage, drawImage } from "./utils/images.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/create-pdf", async (req, res) => {
  try {
    validateRequestBody(req.body);

    // Define helper functions within the scope
    const checkPageSpace = (requiredSpace) => {
      if (currentY - requiredSpace < bottomMargin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        addHeaderLine(pdfDoc, page, imagesPath, margin, pageHeight);
        currentY = pageHeight - topMargin;
      }
    };

    const splitTextIntoLines = (text, maxWidth, font, size) => {
      const words = text.split(" ");
      const lines = [];
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

    const {
      mes,
      region,
      encontradas,
      ausentes,
      renuncias,
      fallecidos,
      fiscalizados,
      desvinculados,
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
      otrosMeses
    } = req.body;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const assetsPath = path.join(__dirname, "assets");
    const fontsPath = path.join(assetsPath, "fonts");
    const imagesPath = path.join(assetsPath);

    const { boldFont, lightFont, regularFont } = await loadFonts(
      pdfDoc,
      fontsPath
    );

    const fontSize = 12;
    const margin = 50;
    const bottomMargin = 50;
    const topMargin = 50;
    const pageHeight = 842;
    const pageWidth = 595;
    const contentWidth = pageWidth - 2 * margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    await addHeaderLine(pdfDoc, page, imagesPath, margin, pageHeight);

    const logoImagePath = path.join(imagesPath, "logo_pic.png");
    const logoImage = await loadAndEmbedImage(pdfDoc, logoImagePath);

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

    let currentY = pageHeight - 172;

    page.drawText("Datos generales del mes", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });
    currentY -= fontSize;

    const dataGeneralBeneficiaries = [
      ["Beneficiarias/os activas/os", `${encontradas}`],
      ["Beneficiarias/os no activas/os", `${ausentes}`],
      ["Beneficiarias/os que renunciaron", `${renuncias}`],
      ["Beneficiarias/os desvinculadas/os", `${desvinculados}`],
      ["Beneficiarias/os fallecidas/os", `${fallecidos}`],
      ["Total beneficiarias/os", `${total}`],
      ["Total supervisiones", `${fiscalizados}`],
    ];

    let startXGeneral = margin;
    let startYGeneral = currentY;
    const rowHeightGeneral = 20;
    const colWidthsGeneral = [395, 100];

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

    const note = `Listado detallado de trabajadoras/es y fiscalizaciones disponible en este link. (Sólo disponible en versión digital de este archivo).`;

    // Check for page space before drawing the note
    checkPageSpace(fontSize + 16);
    page.drawText(note, {
      x: margin,
      y: currentY,
      size: fontSize - 3,
      font: lightFont,
      color: rgb(0, 0, 0),
    });

    currentY -= fontSize + 16;

    const supervisionesComparativo = [142, 89, 175, 113, 196, 134];

    const chartTitle =
      "Evolución de supervisiones reportadas del último semestre móvil";

    // Check for page space before drawing the chart title
    checkPageSpace(fontSize + 16);
    page.drawText(chartTitle, {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    currentY -= fontSize;

    const chartConfig = {
      type: "bar",
      data: {
        labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
        datasets: [
          {
            label: "Supervisiones",
            data: supervisionesComparativo,
            backgroundColor: "rgba(15, 105, 196, 0.8)",
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            color: "#000000",
            font: {
              weight: "bold",
            },
          },
        },
      },
      plugins: ["chartjs-plugin-datalabels"],
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
      JSON.stringify(chartConfig)
    )}`;

    const chartImageBytes = await fetch(chartUrl).then((res) =>
      res.arrayBuffer()
    );
    const chartImage = await pdfDoc.embedPng(chartImageBytes);

    const chartWidth = 400;
    const chartHeight = 200;

    const chartX = (pageWidth - chartWidth) / 2;

    // Before drawing chart, check for page space
    checkPageSpace(chartHeight + 35);
    page.drawImage(chartImage, {
      x: chartX,
      y: currentY - chartHeight - 10,
      width: chartWidth,
      height: chartHeight,
    });

    currentY -= chartHeight + 35;

    const drawSection = (title, paragraph) => {
      checkPageSpace(fontSize + 12);
      page.drawText(title, {
        x: margin,
        y: currentY,
        size: fontSize + 1,
        font: boldFont,
        color: rgb(0.0588, 0.4118, 0.7686),
      });

      currentY -= fontSize + 3;

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

      currentY -= 10;
    };

    const sections = [
      {
        title: `${epp} beneficiarias/os recibieron elementos de protección personal`,
        paragraph: `${eppObserva}`,
      },
      {
        title: `${usoEpp} beneficiarias/os hicieron uso de los elementos de protección personal`,
        paragraph: `${usoEppObserva}`,
      },
      {
        title: `${jornadaCorrecta} beneficiarias/os cumplieron correctamente la jornada laboral`,
        paragraph: `${jornadaCorrectaObserva}`,
      },
      {
        title: `${condicionesOptimas} beneficiarias/os no contaron con condiciones óptimas de trabajo`, 
        paragraph: `${condicionesOptimasObserva}`,
      },
      {
        title: `${laboresContrato} beneficiarias/os realizaron labores según contrato`,
        paragraph: `${laboresContratoObserva}`,
      },
      {
        title: `${capacitacion} beneficiarias/os recibieron capacitación sobre prevención de riesgos`,
        paragraph: `${capacitacionObserva}`,
      },
      {
        title: `${remuneracion} beneficiarias/os recibieron su remuneración en el plazo correspondiente`,
        paragraph: `${remuneracionObserva}`,
      },
      {
        title: `${libroAsistencia} asistencias fueron registradas en el libro`,
        paragraph: `${libroAsistenciaObserva}`,
      },
    ];

    sections.forEach(({ title, paragraph }) => {
      drawSection(title, paragraph);
    });

    // Check for page space before adding the general comments section
    checkPageSpace(fontSize + 16);
    page.drawText("Comentarios generales de supervisiones", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    // Párrafo de comentarios generales de supervisiones
    currentY -= fontSize + 3;

    const generalCommentsLines = splitTextIntoLines(
      comentariosGenerales,
      contentWidth,
      regularFont,
      fontSize
    );

    generalCommentsLines.forEach((line) => {
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

    currentY -= fontSize + 16;

    // Check for page space before adding the comment section
    checkPageSpace(fontSize + 16);
    page.drawText("Avances del proyecto y acciones de gestión desarrolladas", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    // Párrafo de comentarios de avances del proyecto y acciones de gestión desarrolladas
    currentY -= fontSize + 3;

    const projectProgressLines = splitTextIntoLines(
      comentariosFiscalizacion,
      contentWidth,
      regularFont,
      fontSize
    );

    projectProgressLines.forEach((line) => {
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

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${removeAccents(region)}_${mes}.pdf"`
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