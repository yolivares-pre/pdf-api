// loadFonts.js

import fs from "fs";
import path from "path";

/**
 * Carga las fuentes requeridas en el documento PDF.
 * @param {PDFDocument} pdfDoc - El documento PDF en el que se van a cargar las fuentes.
 * @param {string} fontsPath - La ruta donde se encuentran las fuentes.
 * @returns {Object} - Un objeto con las fuentes cargadas: boldFont, lightFont y regularFont.
 * @throws {Error} - Lanza un error si ocurre algún problema al cargar las fuentes.
 */
export const loadFonts = async (pdfDoc, fontsPath) => {
  try {
    // Lista de archivos de fuentes a cargar
    const fontFiles = [
      "gobCL_Bold.otf",
      "gobCL_Light.otf",
      "gobCL_Regular.otf",
    ];

    // Carga y embebe las fuentes en el PDF de manera asíncrona
    const fonts = await Promise.all(
      fontFiles.map(async (file) => {
        const fontBytes = fs.readFileSync(path.join(fontsPath, file));
        return await pdfDoc.embedFont(fontBytes);
      })
    );

    // Retorna las fuentes embebidas en un objeto
    return {
      boldFont: fonts[0],
      lightFont: fonts[1],
      regularFont: fonts[2],
    };
  } catch (error) {
    throw new Error(`Error loading fonts: ${error.message}`);
  }
};
