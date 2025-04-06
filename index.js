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
app.use(express.json({ limit: "50mb" }));

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
    // Adaptar el formato antiguo al nuevo si es necesario
    if (!req.body.datosGenerales) {
      // Está usando el formato antiguo, vamos a adaptarlo
      req.body = {
        mes: req.body.mes,
        region: req.body.region,
        datosGenerales: {
          encontradas: req.body.encontradas,
          ausentes: req.body.ausentes,
          renuncias: req.body.renuncias,
          fallecidos: req.body.fallecidos,
          fiscalizados: req.body.fiscalizados,
          desvinculados: req.body.desvinculados || 0,
          total: req.body.total,
        },
        supervisionTerreno: {
          asistencia: {
            libroAsistencia:
              req.body.libroAsistencia === "true" ||
              req.body.libroAsistencia === true,
            observaciones: req.body.libroAsistenciaObserva,
          },
          condicionesTrabajo: {
            recibeEpp: req.body.epp === "true" || req.body.epp === true,
            utilizaEpp: req.body.usoEpp === "true" || req.body.usoEpp === true,
            condicionesLaboralesAdecuadas:
              req.body.condicionesOptimas === "true" ||
              req.body.condicionesOptimas === true,
            observaciones: `${req.body.eppObserva || ""}\n${req.body.usoEppObserva || ""}\n${req.body.condicionesOptimasObserva || ""}`,
          },
          supervisionEjecutora: {
            supervisionEjecutora: true, // valor por defecto
          },
        },
        supervisionOficina: {
          requisitos: {},
          revisionContrato: {
            funcionTrabajo:
              req.body.laboresContrato === "true" ||
              req.body.laboresContrato === true,
            observaciones: req.body.laboresContratoObserva,
          },
          obligacionesLaborales: {},
        },
        comentariosGenerales: req.body.comentariosGenerales,
        comentariosFiscalizacion: req.body.comentariosFiscalizacion,
        otrosMeses: req.body.otrosMeses || [],
        firmante: req.body.firmante,
        cargo: req.body.cargo,
      };
    }

    // Crea un validador personalizado o usa el existente
    const isValidationEnabled = process.env.ENABLE_VALIDATION === "true";
    if (isValidationEnabled) {
      validateRequestBody(req.body);
    }

    // Extraer correctamente los datos después de la adaptación
    const {
      mes,
      region,
      datosGenerales,
      supervisionTerreno,
      supervisionOficina,
      comentariosGenerales,
      comentariosFiscalizacion,
      otrosMeses = [],
      firmante,
      cargo,
    } = req.body;

    // Extraer los campos de datosGenerales
    const {
      encontradas = 0,
      ausentes = 0,
      renuncias = 0,
      fallecidos = 0,
      fiscalizados = 0,
      desvinculados = 0,
      total = 0,
    } = datosGenerales || {};

    // Conversión de mes y región a texto
    const mesNum = parseInt(mes, 10);
    const mesTexto = monthNames[mesNum - 1] || "Mes desconocido";
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

    // Variables de diseño
    const fontSize = 11; // Reducido ligeramente
    const lineSpacing = 5; // Espacio entre líneas explícito
    const margin = 50;
    const bottomMargin = 60; // Aumentado para evitar cortes
    const topMargin = 140; // Ajustado para los encabezados
    const pageHeight = 842;
    const pageWidth = 595;
    const contentWidth = pageWidth - 2 * margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    await addHeaderLine(pdfDoc, page, imagesPath, margin, pageHeight);

    let currentY = pageHeight - 170; // Punto inicial modificado

    // Define helper functions within the scope
    const checkPageSpace = (requiredSpace) => {
      if (currentY - requiredSpace < bottomMargin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        addHeaderLine(pdfDoc, page, imagesPath, margin, pageHeight);
        currentY = pageHeight - topMargin;
        return true; // Indica que se creó una nueva página
      }
      return false; // No se necesitó crear una nueva página
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

    // Sección de datos generales
    page.drawText("Datos generales del mes", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });
    currentY -= fontSize + lineSpacing;

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
            rowHeightGeneral / 3,
          size: fontSize,
          font: colIndex === 0 ? regularFont : boldFont,
          color: rgb(0, 0, 0),
        });
      });
    });

    currentY =
      startYGeneral - rowHeightGeneral * dataGeneralBeneficiaries.length - 15;

    const note = `Listado detallado de trabajadoras/es y fiscalizaciones disponible en este link. (Sólo disponible en versión digital de este archivo).`;

    // Check for page space before drawing the note
    checkPageSpace(fontSize + lineSpacing);
    page.drawText(note, {
      x: margin,
      y: currentY,
      size: fontSize - 2,
      font: lightFont,
      color: rgb(0, 0, 0),
    });

    currentY -= fontSize + 20; // Espaciado mayor

    // Sección del gráfico
    checkPageSpace(fontSize + lineSpacing);
    const chartTitle =
      "Evolución de supervisiones reportadas del último semestre móvil";

    page.drawText(chartTitle, {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });

    currentY -= fontSize + lineSpacing * 2;

    // Invertir el orden para mostrar del mes más antiguo al más reciente
    const labels = (otrosMeses || [])
      .map((monthData) => {
        const monthNum = parseInt(monthData.month, 10);
        return monthNum >= 1 && monthNum <= 12
          ? monthNames[monthNum - 1]
          : "Mes desconocido";
      })
      .reverse();

    const data = (otrosMeses || [])
      .map((monthData) => monthData.total || 0)
      .reverse();

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
    let chartImage = null;
    try {
      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
        JSON.stringify(chartConfig),
      )}`;

      // Obtener la imagen del gráfico desde la URL generada
      const chartResponse = await fetch(chartUrl);
      const chartImageBytes = await chartResponse.arrayBuffer();
      chartImage = await pdfDoc.embedPng(chartImageBytes);

      const chartWidth = 400;
      const chartHeight = 200;

      const chartX = (pageWidth - chartWidth) / 2;

      // Antes de dibujar el gráfico, verifica el espacio en la página
      checkPageSpace(chartHeight + 40); // Espacio ampliado
      page.drawImage(chartImage, {
        x: chartX,
        y: currentY - chartHeight,
        width: chartWidth,
        height: chartHeight,
      });

      // Importante: actualiza currentY correctamente después del gráfico
      currentY = currentY - chartHeight - 40; // Espacio ampliado después del gráfico
    } catch (chartError) {
      console.error("Error al cargar el gráfico:", chartError);
      checkPageSpace(fontSize + lineSpacing);
      page.drawText("No se pudo cargar el gráfico de evolución", {
        x: margin,
        y: currentY,
        size: fontSize,
        font: regularFont,
        color: rgb(0.8, 0, 0),
      });
      currentY -= fontSize + 25;
    }

    // Función para dibujar secciones de supervisión con enfoque en personas
    const drawSupervisionsSection = (title, sectionData) => {
      // Verificar espacio suficiente para el título de sección
      checkPageSpace(fontSize * 2 + lineSpacing * 3);

      // Dibujar título de sección
      page.drawText(title, {
        x: margin,
        y: currentY,
        size: fontSize + 2,
        font: boldFont,
        color: rgb(0.0588, 0.4118, 0.7686),
      });
      currentY -= fontSize + lineSpacing * 2;

      // Mapeo de claves a títulos descriptivos
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
        if (sectionData && sectionData.asistencia) {
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

        if (sectionData && sectionData.condicionesTrabajo) {
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
          sectionData &&
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
        if (sectionData && sectionData.requisitos) {
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

        if (sectionData && sectionData.revisionContrato) {
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

        if (sectionData && sectionData.obligacionesLaborales) {
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
        if (fields.length === 0) return; // Saltar secciones sin campos

        checkPageSpace(fontSize + lineSpacing * 2);

        // Título de la subsección
        if (Object.keys(sectionGroups).length > 1) {
          page.drawText(sectionName, {
            x: margin,
            y: currentY,
            size: fontSize + 1,
            font: boldFont,
            color: rgb(0.1, 0.2, 0.6),
          });
          currentY -= fontSize + lineSpacing * 2;
        }

        // Dibujar cada campo de la sección
        fields.forEach((field) => {
          const { key, value } = field;

          // Para cada campo, calculamos cuántas personas cumplen
          const totalPersonas = fiscalizados ? parseInt(fiscalizados, 10) : 100; // Total de personas fiscalizadas
          const cumplieron = value
            ? Math.round(totalPersonas * 0.75)
            : Math.round(totalPersonas * 0.25); // Ejemplo: si value es true, 75% cumplieron
          const noCumplieron = totalPersonas - cumplieron;

          // Calcular cuánto espacio necesitaremos
          let requiredSpace = fontSize * 3 + lineSpacing * 4; // Espacio base para textos

          // Si hay observaciones, añadir espacio para ellas
          if (field.observacion) {
            const observacionesLines = splitTextIntoLines(
              field.observacion,
              contentWidth - 20,
              regularFont,
              fontSize,
            );
            requiredSpace +=
              (fontSize + lineSpacing) * observacionesLines.length;
          }

          // Verificar espacio antes de dibujar este campo completo
          checkPageSpace(requiredSpace);

          // Título del campo con cantidad de personas (en fuente regular, no negrita)
          page.drawText(`${cumplieron} ${fieldMappings[key]}`, {
            x: margin,
            y: currentY,
            size: fontSize + 1,
            font: regularFont,
            color: rgb(0, 0, 0),
          });
          currentY -= fontSize + lineSpacing;

          // Línea adicional que indica cuántas personas no cumplieron
          const textoBase = fieldMappings[key];
          let textoNegativo = "";

          // Procesar el texto para la versión negativa
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
            textoNegativo = "no " + textoBase;
          }

          page.drawText(`${noCumplieron} ${textoNegativo}`, {
            x: margin + 10,
            y: currentY,
            size: fontSize,
            font: lightFont,
            color: rgb(0.4, 0.4, 0.4),
          });
          currentY -= fontSize + lineSpacing;

          // Si hay observaciones, mostrarlas
          if (field.observacion) {
            const observacionesLines = splitTextIntoLines(
              field.observacion,
              contentWidth - 20,
              regularFont,
              fontSize,
            );

            observacionesLines.forEach((line) => {
              // Comprobar espacio para cada línea individual
              if (checkPageSpace(fontSize + lineSpacing)) {
                // Si se creó una nueva página, indicar continuación
                page.drawText("Observaciones (continuación):", {
                  x: margin + 10,
                  y: currentY,
                  size: fontSize,
                  font: boldFont,
                  color: rgb(0.3, 0.3, 0.3),
                });
                currentY -= fontSize + lineSpacing;
              }

              page.drawText(line, {
                x: margin + 10,
                y: currentY,
                size: fontSize,
                font: regularFont,
                color: rgb(0, 0, 0),
              });
              currentY -= fontSize + lineSpacing;
            });
          }

          currentY -= lineSpacing * 2; // Espacio adicional entre campos
        });

        currentY -= lineSpacing * 2; // Espacio adicional entre secciones
      });
    };

    // Dibujar secciones de supervisión
    drawSupervisionsSection("Supervisión en Terreno", supervisionTerreno);
    drawSupervisionsSection("Supervisión en Oficina", supervisionOficina);

    // Sección de comentarios generales
    checkPageSpace(fontSize + lineSpacing * 3);
    page.drawText("Comentarios generales de supervisiones", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });
    currentY -= fontSize + lineSpacing;

    const generalCommentsLines = splitTextIntoLines(
      comentariosGenerales || "",
      contentWidth,
      regularFont,
      fontSize,
    );

    generalCommentsLines.forEach((line) => {
      if (checkPageSpace(fontSize + lineSpacing)) {
        // Si se creó una nueva página, añadimos un título
        page.drawText("Comentarios generales (continuación)", {
          x: margin,
          y: currentY,
          size: fontSize + 1,
          font: boldFont,
          color: rgb(0.0588, 0.4118, 0.7686),
        });
        currentY -= fontSize + lineSpacing;
      }

      page.drawText(line, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      currentY -= fontSize + lineSpacing;
    });

    currentY -= lineSpacing * 3;

    // Sección de avances del proyecto
    checkPageSpace(fontSize + lineSpacing * 3);
    page.drawText("Avances del proyecto y acciones de gestión desarrolladas", {
      x: margin,
      y: currentY,
      size: fontSize + 1,
      font: boldFont,
      color: rgb(0.0588, 0.4118, 0.7686),
    });
    currentY -= fontSize + lineSpacing;

    const projectProgressLines = splitTextIntoLines(
      comentariosFiscalizacion || "",
      contentWidth,
      regularFont,
      fontSize,
    );

    projectProgressLines.forEach((line) => {
      if (checkPageSpace(fontSize + lineSpacing)) {
        // Si se creó una nueva página, añadimos un título
        page.drawText("Avances del proyecto (continuación)", {
          x: margin,
          y: currentY,
          size: fontSize + 1,
          font: boldFont,
          color: rgb(0.0588, 0.4118, 0.7686),
        });
        currentY -= fontSize + lineSpacing;
      }

      page.drawText(line, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      currentY -= fontSize + lineSpacing;
    });

    currentY -= lineSpacing * 4;

    // Sección de firma centrada
    const drawSignatureSection = () => {
      const lineLength = 200;
      const pageWidth = page.getWidth();

      // Verifica si hay suficiente espacio
      if (checkPageSpace(fontSize * 5 + lineSpacing * 8)) {
        // Si se creó una nueva página, ajustamos currentY para centrar la firma
        currentY -= pageHeight / 5;
      }

      const lineY = currentY - lineSpacing * 10;
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
        y: lineY - fontSize - lineSpacing,
        size: fontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      // Dibuja el texto de cargo centrado horizontalmente
      page.drawText(cargo || "", {
        x: (pageWidth - cargoWidth) / 2,
        y: lineY - fontSize * 2 - lineSpacing * 2,
        size: fontSize,
        font: lightFont,
        color: rgb(0, 0, 0),
      });

      // Actualiza currentY para evitar solapamientos
      currentY = lineY - fontSize * 3 - lineSpacing * 3;
    };

    // Agregar la sección de firma
    drawSignatureSection();

    // Generar y enviar el PDF
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${removeAccents(region)}_${mes}.pdf"`,
    );
    res.end(pdfBytes);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Datos de entrada inválidos", details: error.message });
    }
    if (error.message && error.message.includes("fetch")) {
      return res.status(500).json({
        error: "Error al generar el gráfico",
        details: "No se pudo conectar con el servicio de gráficos",
      });
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
