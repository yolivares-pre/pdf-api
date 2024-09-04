// images.js
import fs from "fs";

/**
 * Carga y embebe una imagen en un documento PDF.
 * @param {PDFDocument} pdfDoc - El documento PDF donde se embebirá la imagen.
 * @param {string} imagePath - La ruta del archivo de imagen a embeder.
 * @returns {Promise<PDFImage>} - Una promesa que resuelve con la imagen embebida.
 * @throws {Error} - Lanza un error si ocurre algún problema al cargar o embebir la imagen.
 */
export const loadAndEmbedImage = async (pdfDoc, imagePath) => {
  try {
    const imageBytes = fs.readFileSync(imagePath);

    // Determina el formato de la imagen basado en la extensión del archivo
    if (imagePath.endsWith(".png")) {
      return await pdfDoc.embedPng(imageBytes);
    } else if (imagePath.endsWith(".jpg") || imagePath.endsWith(".jpeg")) {
      return await pdfDoc.embedJpg(imageBytes);
    } else {
      throw new Error(`Unsupported image format for ${imagePath}`);
    }
  } catch (error) {
    console.error(`Error al cargar la imagen desde ${imagePath}:`, error);
    throw error;
  }
};

/**
 * Dibuja una imagen en una página PDF.
 * @param {PDFPage} page - La página PDF donde se dibujará la imagen.
 * @param {PDFImage} image - La imagen embebida en el documento PDF.
 * @param {Object} options - Opciones para la posición y tamaño de la imagen.
 */
export const drawImage = (page, image, options) => {
  const { x, y, width, height } = options;
  page.drawImage(image, {
    x,
    y,
    width,
    height,
  });
};
