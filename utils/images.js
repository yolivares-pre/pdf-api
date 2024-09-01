// images.js
import fs from "fs";

export const loadAndEmbedImage = async (pdfDoc, imagePath) => {
  try {
    const imageBytes = fs.readFileSync(imagePath);
    const image = await pdfDoc.embedPng(imageBytes); // Cambia a embedJpg si es necesario
    return image;
  } catch (error) {
    console.error(`Error al cargar la imagen desde ${imagePath}:`, error);
    throw error;
  }
};

export const drawImage = (page, image, options) => {
  const { x, y, width, height } = options;
  page.drawImage(image, {
    x,
    y,
    width,
    height,
  });
};