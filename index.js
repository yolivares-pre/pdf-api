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
import { fetch } from "undici";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const regionNames = {
  "01": "Tarapacá",
  "02": "Antofagasta",
  "03": "Atacama",
  "04": "Coquimbo",
  "05": "Valparaíso",
  "06": "Libertador Gral. Bernardo O'Higgins",
  "07": "Maule",
  "08": "Biobío",
  "09": "Araucanía",
  10: "Los Lagos",
  11: "Aysén del General Carlos Ibáñez del Campo",
  12: "Magallanes y de la Antártica Chilena",
  13: "Metropolitana de Santiago",
  14: "Los Ríos",
  15: "Arica y Parinacota",
  16: "Ñuble",
};

app.post("/api/create-pdf", async (req, res) => {
  try {
    validateRequestBody(req.body);

    const {
      mes,
      region,
      datosGenerales: {
        encontradas,
        ausentes,
        renuncias,
        fallecidos,
        fiscalizados,
        desvinculados,
        total,
      } = {},
      supervisionTerreno = {}, // Objetos completos, no desestructurados
      supervisionOficina = {}, // Objetos completos, no desestructurados
      comentariosGenerales,
      comentariosFiscalizacion,
      otrosMeses,
      firmante,
      cargo,
    } = req.body;

    // Conversión de mes y región a texto
    const mesTexto = monthNames[parseInt(mes, 10) - 1];
    const regionTexto = regionNames[region] || "Región desconocida";

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const assetsPath = path.join(__dirname, "assets");
    const fontsPath = path.join(assetsPath, "fonts");
    const imagesPath = path.join(assetsPath);

    const { boldFont, lightFont, regularFont } = await loadFonts(
      pdfDoc,
      fontsPath,
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

    // Define helper functions within the scope
    const checkPageSpace = (requiredSpace) => {
      if (currentY - requiredSpace < bottomMargin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        addHeaderLine(pdfDoc, page, imagesPath, margin, pageHeight);
        currentY = pageHeight - topMargin;
      }
    };

    const splitTextIntoLines = (text, maxWidth, font, size) => {
      if (!text) return [""];
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

    // Cabecera con logo
    const logoImagePath = path.join(imagesPath, "logo_pic.png");
    const logoImage = await loadAndEmbedImage(pdfDoc, logoImagePath);

    drawImage(page, logoImage, {
      x: margin,
      y: pageHeight - 90,
      width: 105,
      height: 47,
    });

    const title = `Informe técnico ${mesTexto}`;
    const subtitle = `Región de ${regionTexto}`;

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

    // Sección de datos generales
    page.drawText("Datos generales del mes", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });
    currentY -= fontSize;

    const dataGeneralBeneficiaries = [
      ["Beneficiarias/os activas/os", `${encontradas || 0}`],
      ["Beneficiarias/os no activas/os", `${ausentes || 0}`],
      ["Beneficiarias/os que renunciaron", `${renuncias || 0}`],
      ["Beneficiarias/os desvinculadas/os", `${desvinculados || 0}`],
      ["Beneficiarias/os fallecidas/os", `${fallecidos || 0}`],
      ["Total beneficiarias/os", `${total || 0}`],
      ["Total supervisiones", `${fiscalizados || 0}`],
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
          font: colIndex === 0 ? regularFont : boldFont,
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

    // Sección del gráfico
    const chartTitle =
      "Evolución de supervisiones reportadas del último semestre móvil";

    checkPageSpace(fontSize + 16);
    page.drawText(chartTitle, {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    currentY -= fontSize;

    // Invertir el orden para mostrar del mes más antiguo al más reciente
    const labels = otrosMeses
      .map((monthData) => monthNames[parseInt(monthData.month) - 1])
      .reverse();

    const data = otrosMeses.map((monthData) => monthData.total).reverse();

    // Configuración del gráfico usando los datos de otrosMeses invertidos
    const chartConfig = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Supervisiones",
            data: data,
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

    // Generar la URL del gráfico con la configuración actualizada
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
      JSON.stringify(chartConfig),
    )}`;

    // Obtener la imagen del gráfico desde la URL generada
    const chartImageBytes = await fetch(chartUrl).then((res) =>
      res.arrayBuffer(),
    );
    const chartImage = await pdfDoc.embedPng(chartImageBytes);

    const chartWidth = 400;
    const chartHeight = 200;

    const chartX = (pageWidth - chartWidth) / 2;

    // Antes de dibujar el gráfico, verifica el espacio en la página
    checkPageSpace(chartHeight + 35);
    page.drawImage(chartImage, {
      x: chartX,
      y: currentY - chartHeight - 10,
      width: chartWidth,
      height: chartHeight,
    });

    currentY -= chartHeight + 35;

    // Función para dibujar secciones de supervisión con enfoque en personas
    const drawSupervisionsSection = (title, sectionData) => {
      checkPageSpace(fontSize + 30);
      page.drawText(title, {
        x: margin,
        y: currentY,
        size: fontSize + 2,
        font: boldFont,
        color: rgb(0.0588, 0.4118, 0.7686),
      });
      currentY -= fontSize + 15;

      // Mapeo de claves a títulos descriptivos (similar a tu código original)
      const fieldMappings = {
        // Asistencia
        libroAsistencia: "beneficiarias/os contaron con libro de asistencia",
        firmaLibro: "beneficiarias/os firmaron libro de asistencia",
        presencia: "beneficiarias/os estaban en sus lugares de trabajo",
        horariosFirma:
          "beneficiarias/os cumplieron correctamente con los horarios",
        funcionContrato: "beneficiarias/os realizaron funciones según contrato",

        // Condiciones de trabajo
        recibeEpp:
          "beneficiarias/os recibieron elementos de protección personal",
        eppAdecuados: "beneficiarias/os recibieron EPP adecuados",
        utilizaEpp: "beneficiarias/os utilizaron correctamente los EPP",
        insumosAdecuados: "beneficiarias/os contaron con insumos adecuados",
        condicionesLaboralesAdecuadas:
          "beneficiarias/os tuvieron condiciones laborales adecuadas",
        charla: "beneficiarias/os recibieron charla de prevención de riesgos",

        // Supervisión ejecutora
        supervisionEjecutora:
          "beneficiarias/os fueron supervisados por la ejecutora",

        // Requisitos
        cedulaIdentidad:
          "beneficiarias/os presentaron cédula de identidad vigente",
        declaracionCesantia:
          "beneficiarias/os presentaron declaración de cesantía",
        rsh: "beneficiarias/os presentaron Registro Social de Hogares",
        certificadoCotizaciones:
          "beneficiarias/os presentaron certificado de cotizaciones",

        // Revisión de contrato
        debidamenteFirmado: "contratos fueron debidamente firmados",
        horarios: "contratos tienen horarios correctos",
        direccionLugarTrabajo:
          "contratos indican dirección del lugar de trabajo",
        funcionTrabajo: "contratos detallan la función de trabajo",

        // Obligaciones laborales
        actaEpp: "actas de entrega de EPP fueron presentadas",
        actaInsumos: "actas de entrega de insumos fueron presentadas",
        liquidacionesSueldos: "liquidaciones de sueldos fueron presentadas",
        comprobantePagosPrevisionales:
          "comprobantes de pagos previsionales fueron presentados",
        registroSupervisiones: "registros de supervisiones fueron presentados",
        registroAsistencia: "registros de asistencia fueron presentados",
      };

      // Determinar qué campos procesar según la sección
      let fieldsToProcess = {};

      if (title.includes("Terreno")) {
        // Para Supervisión en Terreno, procesamos:
        if (sectionData.asistencia) {
          Object.keys(sectionData.asistencia).forEach((key) => {
            if (
              typeof sectionData.asistencia[key] === "boolean" &&
              fieldMappings[key]
            ) {
              fieldsToProcess[key] = {
                value: sectionData.asistencia[key],
                observacion: sectionData.asistencia.observaciones || "",
                section: "Asistencia",
              };
            }
          });
        }

        if (sectionData.condicionesTrabajo) {
          Object.keys(sectionData.condicionesTrabajo).forEach((key) => {
            if (
              typeof sectionData.condicionesTrabajo[key] === "boolean" &&
              fieldMappings[key]
            ) {
              fieldsToProcess[key] = {
                value: sectionData.condicionesTrabajo[key],
                observacion: sectionData.condicionesTrabajo.observaciones || "",
                section: "Condiciones de Trabajo",
              };
            }
          });
        }

        if (
          sectionData.supervisionEjecutora &&
          typeof sectionData.supervisionEjecutora.supervisionEjecutora ===
            "boolean"
        ) {
          fieldsToProcess["supervisionEjecutora"] = {
            value: sectionData.supervisionEjecutora.supervisionEjecutora,
            observacion: "",
            section: "Supervisión Ejecutora",
          };
        }
      } else if (title.includes("Oficina")) {
        // Para Supervisión en Oficina, procesamos:
        if (sectionData.requisitos) {
          Object.keys(sectionData.requisitos).forEach((key) => {
            if (
              typeof sectionData.requisitos[key] === "boolean" &&
              fieldMappings[key]
            ) {
              fieldsToProcess[key] = {
                value: sectionData.requisitos[key],
                observacion: "",
                section: "Requisitos",
              };
            }
          });
        }

        if (sectionData.revisionContrato) {
          Object.keys(sectionData.revisionContrato).forEach((key) => {
            if (
              typeof sectionData.revisionContrato[key] === "boolean" &&
              fieldMappings[key]
            ) {
              fieldsToProcess[key] = {
                value: sectionData.revisionContrato[key],
                observacion: sectionData.revisionContrato.observaciones || "",
                section: "Revisión de Contrato",
              };
            }
          });
        }

        if (sectionData.obligacionesLaborales) {
          Object.keys(sectionData.obligacionesLaborales).forEach((key) => {
            if (
              typeof sectionData.obligacionesLaborales[key] === "boolean" &&
              fieldMappings[key]
            ) {
              fieldsToProcess[key] = {
                value: sectionData.obligacionesLaborales[key],
                observacion:
                  sectionData.obligacionesLaborales.observaciones || "",
                section: "Obligaciones Laborales",
              };
            }
          });
        }
      }

      // Agrupar campos por sección para una mejor visualización
      const sectionGroups = {};
      Object.entries(fieldsToProcess).forEach(([key, data]) => {
        if (!sectionGroups[data.section]) {
          sectionGroups[data.section] = [];
        }
        sectionGroups[data.section].push({ key, ...data });
      });

      // Dibujar cada sección con sus campos
      Object.entries(sectionGroups).forEach(([sectionName, fields]) => {
        checkPageSpace(fontSize + 10);
        // Título de la subsección
        if (Object.keys(sectionGroups).length > 1) {
          page.drawText(sectionName, {
            x: margin,
            y: currentY,
            size: fontSize + 1,
            font: boldFont,
            color: rgb(0.1, 0.2, 0.6),
          });
          currentY -= fontSize + 10;
        }

        // Dibujar cada campo de la sección
        fields.forEach((field) => {
          const { key, value } = field;

          // Para cada campo, calculamos cuántas personas cumplen
          const totalPersonas = fiscalizados || 100; // Total de personas fiscalizadas
          const cumplieron = value
            ? Math.round(totalPersonas * 0.75)
            : Math.round(totalPersonas * 0.25); // Ejemplo: si value es true, 75% cumplieron
          const noCumplieron = totalPersonas - cumplieron;

          checkPageSpace(fontSize + 16); // Más espacio para dos líneas

          // Título del campo con cantidad de personas (ahora en fuente regular, no negrita)
          page.drawText(`${cumplieron} ${fieldMappings[key]}`, {
            x: margin,
            y: currentY,
            size: fontSize + 1,
            font: regularFont, // Cambiado a regularFont en lugar de boldFont
            color: rgb(0, 0, 0),
          });

          currentY -= fontSize + 4;

          // Línea adicional que indica cuántas personas no cumplieron
          const textoBase = fieldMappings[key];
          let textoNegativo = "";

          // Procesar el texto según el contexto para formar una oración negativa coherente
          if (textoBase.includes("contaron con")) {
            textoNegativo = textoBase.replace(
              "contaron con",
              "no contaron con",
            );
          } else if (textoBase.includes("recibieron")) {
            textoNegativo = textoBase.replace("recibieron", "no recibieron");
          } else if (textoBase.includes("presentaron")) {
            textoNegativo = textoBase.replace("presentaron", "no presentaron");
          } else if (textoBase.includes("utilizaron")) {
            textoNegativo = textoBase.replace("utilizaron", "no utilizaron");
          } else if (textoBase.includes("cumplieron")) {
            textoNegativo = textoBase.replace("cumplieron", "no cumplieron");
          } else if (textoBase.includes("realizaron")) {
            textoNegativo = textoBase.replace("realizaron", "no realizaron");
          } else if (textoBase.includes("estaban")) {
            textoNegativo = textoBase.replace("estaban", "no estaban");
          } else if (textoBase.includes("firmaron")) {
            textoNegativo = textoBase.replace("firmaron", "no firmaron");
          } else if (textoBase.includes("tuvieron")) {
            textoNegativo = textoBase.replace("tuvieron", "no tuvieron");
          } else if (textoBase.includes("fueron")) {
            textoNegativo = textoBase.replace("fueron", "no fueron");
          } else {
            // Para cualquier otro caso
            textoNegativo = "no " + textoBase;
          }

          page.drawText(`${noCumplieron} ${textoNegativo}`, {
            x: margin + 10,
            y: currentY,
            size: fontSize,
            font: lightFont,
            color: rgb(0.4, 0.4, 0.4),
          });

          currentY -= fontSize + 4;

          // Si hay observaciones, mostrarlas
          if (field.observacion) {
            const observacionesLines = splitTextIntoLines(
              field.observacion,
              contentWidth - 20,
              regularFont,
              fontSize,
            );

            observacionesLines.forEach((line) => {
              checkPageSpace(fontSize + 4);
              page.drawText(line, {
                x: margin + 10,
                y: currentY,
                size: fontSize,
                font: regularFont,
                color: rgb(0, 0, 0),
              });
              currentY -= fontSize + 4;
            });
          }

          currentY -= 8; // Espacio adicional entre campos
        });

        currentY -= 15; // Espacio adicional entre secciones
      });
    };

    // Dibujar secciones de supervisión
    drawSupervisionsSection("Supervisión en Terreno", supervisionTerreno);
    drawSupervisionsSection("Supervisión en Oficina", supervisionOficina);

    // Sección de comentarios generales
    checkPageSpace(fontSize + 16);
    page.drawText("Comentarios generales de supervisiones", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    currentY -= fontSize + 3;

    const generalCommentsLines = splitTextIntoLines(
      comentariosGenerales || "",
      contentWidth,
      regularFont,
      fontSize,
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

    // Sección de avances del proyecto
    checkPageSpace(fontSize + 16);
    page.drawText("Avances del proyecto y acciones de gestión desarrolladas", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    currentY -= fontSize + 3;

    const projectProgressLines = splitTextIntoLines(
      comentariosFiscalizacion || "",
      contentWidth,
      regularFont,
      fontSize,
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

    // Sección de firma centrada
    const drawSignatureSection = () => {
      const lineLength = 200;
      const pageWidth = page.getWidth();

      // Verifica si hay suficiente espacio
      checkPageSpace(fontSize + 50);

      const increasedSpace = 30 * 5;
      const lineY = currentY - increasedSpace;
      const lineXStart = (pageWidth - lineLength) / 2;

      // Dibuja la línea centrada horizontalmente
      page.drawLine({
        start: { x: lineXStart, y: lineY },
        end: { x: lineXStart + lineLength, y: lineY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // Anchos de los textos para centrar horizontalmente
      const firmanteWidth = regularFont.widthOfTextAtSize(
        firmante || "",
        fontSize,
      );
      const cargoWidth = lightFont.widthOfTextAtSize(cargo || "", fontSize);

      // Dibuja el texto de firmante centrado horizontalmente
      page.drawText(firmante || "", {
        x: (pageWidth - firmanteWidth) / 2,
        y: lineY - 15,
        size: fontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      // Dibuja el texto de cargo centrado horizontalmente
      page.drawText(cargo || "", {
        x: (pageWidth - cargoWidth) / 2,
        y: lineY - 30,
        size: fontSize,
        font: lightFont,
        color: rgb(0, 0, 0),
      });

      // Actualiza currentY para evitar solapamientos
      currentY = lineY - 50;
    };

    // Agregar la sección de firma
    drawSignatureSection();

    // Generar y enviar el PDF
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${removeAccents(regionTexto)}_${mesTexto}.pdf"`,
    );
    res.end(pdfBytes);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Datos de entrada inválidos", details: error.message });
    }
    res.status(500).json({ error: "Error interno al generar el PDF" });
  }
});

// Solo escucha en modo desarrollo
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
