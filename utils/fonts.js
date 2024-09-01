// fonts.js
import fs from "fs";

export const loadFonts = async (pdfDoc) => {
  // Cargar todas las fuentes desde la carpeta assets/fonts
  const boldFontBytes = fs.readFileSync("./assets/fonts/gobCL_Bold.otf");
  const heavyFontBytes = fs.readFileSync("./assets/fonts/gobCL_Heavy.otf");
  const lightFontBytes = fs.readFileSync("./assets/fonts/gobCL_Light.otf");
  const regularFontBytes = fs.readFileSync("./assets/fonts/gobCL_Regular.otf");

  // Embebir las fuentes en el PDF
  const boldFont = await pdfDoc.embedFont(boldFontBytes);
  const heavyFont = await pdfDoc.embedFont(heavyFontBytes);
  const lightFont = await pdfDoc.embedFont(lightFontBytes);
  const regularFont = await pdfDoc.embedFont(regularFontBytes);

  // Retornar las fuentes embebidas en un objeto para su uso
  return {
    boldFont,
    heavyFont,
    lightFont,
    regularFont,
  };
};
