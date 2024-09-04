// addHeaderLine.js

import path from "path";
import { loadAndEmbedImage, drawImage } from "./images.js";

/**
 * Añade una línea de encabezado al documento PDF en la posición especificada.
 * @param {PDFDocument} pdfDoc - El documento PDF al que se le va a añadir la línea de encabezado.
 * @param {PDFPage} page - La página actual del PDF donde se dibujará la línea de encabezado.
 * @param {string} imagesPath - La ruta donde se encuentran las imágenes.
 * @param {number} margin - El margen izquierdo para posicionar la línea de encabezado.
 * @param {number} pageHeight - La altura de la página para calcular la posición vertical de la línea de encabezado.
 * @throws {Error} - Lanza un error si ocurre algún problema al añadir la línea de encabezado.
 */
export const addHeaderLine = async (
  pdfDoc,
  page,
  imagesPath,
  margin,
  pageHeight
) => {
  try {
    // Ruta de la imagen de la línea bicolor
    const bicolorImagePath = path.join(imagesPath, "bicolor_line.png");

    // Cargar y embeber la imagen en el documento PDF
    const bicolorImage = await loadAndEmbedImage(pdfDoc, bicolorImagePath);

    // Dibujar la imagen de la línea bicolor en la página
    drawImage(page, bicolorImage, {
      x: margin,
      y: pageHeight - 7, // Posición cercana al borde superior de la página
      width: 104, // Ancho de la imagen
      height: 7, // Altura de la imagen
    });
  } catch (error) {
    throw new Error(`Error adding header line: ${error.message}`);
  }
};
