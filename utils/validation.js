/**
 * Valida el cuerpo de la solicitud asegurando que todos los campos requeridos estén presentes.
 * @param {Object} body - El cuerpo de la solicitud a validar.
 * @throws {Error} - Lanza un error si falta algún campo requerido o si su estructura es incorrecta.
 */
export const validateRequestBody = (body) => {
  // Verificar campos de primer nivel
  const requiredTopLevelFields = [
    "mes",
    "region",
    "datosGenerales",
    "supervisionTerreno",
    "supervisionOficina",
    "comentariosGenerales",
    "comentariosFiscalizacion",
    "otrosMeses",
    "firmante",
    "cargo",
  ];

  const missingTopLevelFields = requiredTopLevelFields.filter(
    (field) => !body.hasOwnProperty(field),
  );

  if (missingTopLevelFields.length > 0) {
    const error = new Error(
      `Faltan campos requeridos: ${missingTopLevelFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar campos dentro de datosGenerales
  const requiredDatosGeneralesFields = [
    "encontradas",
    "ausentes",
    "renuncias",
    "fallecidos",
    "fiscalizados",
    "desvinculados",
    "total",
  ];

  if (!body.datosGenerales || typeof body.datosGenerales !== "object") {
    const error = new Error("El campo 'datosGenerales' debe ser un objeto");
    error.name = "ValidationError";
    throw error;
  }

  const missingDatosGeneralesFields = requiredDatosGeneralesFields.filter(
    (field) => !body.datosGenerales.hasOwnProperty(field),
  );

  if (missingDatosGeneralesFields.length > 0) {
    const error = new Error(
      `Faltan campos en datosGenerales: ${missingDatosGeneralesFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar objetos de supervisión
  if (!body.supervisionTerreno || typeof body.supervisionTerreno !== "object") {
    const error = new Error("El campo 'supervisionTerreno' debe ser un objeto");
    error.name = "ValidationError";
    throw error;
  }

  if (!body.supervisionOficina || typeof body.supervisionOficina !== "object") {
    const error = new Error("El campo 'supervisionOficina' debe ser un objeto");
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que otrosMeses sea un arreglo
  if (!Array.isArray(body.otrosMeses)) {
    const error = new Error("El campo 'otrosMeses' debe ser un arreglo");
    error.name = "ValidationError";
    throw error;
  }

  // Verificar formato de mes (1-12)
  const mesNum = parseInt(body.mes, 10);
  if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
    const error = new Error("El campo 'mes' debe ser un número entre 1 y 12");
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que region exista
  if (!body.region) {
    const error = new Error("El campo 'region' es requerido");
    error.name = "ValidationError";
    throw error;
  }
};

/**
 * Elimina los acentos y caracteres especiales de una cadena y reemplaza los espacios y caracteres no alfanuméricos con guiones bajos.
 * @param {string} str - La cadena a normalizar.
 * @returns {string} - La cadena normalizada sin acentos y caracteres especiales.
 */
export const removeAccents = (str) => {
  return str
    .normalize("NFD") // Normaliza la cadena separando los caracteres base de los diacríticos
    .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos
    .replace(/[^a-zA-Z0-9_]/g, "_"); // Reemplaza caracteres no alfanuméricos con guiones bajos
};
