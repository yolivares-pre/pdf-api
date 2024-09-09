// validation.js

/**
 * Valida el cuerpo de la solicitud asegurando que todos los campos requeridos estén presentes.
 * @param {Object} body - El cuerpo de la solicitud a validar.
 * @throws {Error} - Lanza un error si falta algún campo requerido.
 */
export const validateRequestBody = (body) => {
  const requiredFields = [
    "mes",
    "region",
    "encontradas",
    "ausentes",
    "renuncias",
    "fallecidos",
    "fiscalizados",
    "total",
    "epp",
    "eppObserva",
    "usoEpp",
    "usoEppObserva",
    "libroAsistencia",
    "libroAsistenciaObserva",
    "jornadaCorrecta",
    "jornadaCorrectaObserva",
    "condicionesOptimas",
    "condicionesOptimasObserva",
    "laboresContrato",
    "laboresContratoObserva",
    "capacitacion",
    "capacitacionObserva",
    "listado",
    "comentariosFiscalizacion",
    "comentariosGenerales",
    "firmante",
    "cargo",
  ];

  const missingFields = requiredFields.filter(
    (field) => !body.hasOwnProperty(field)
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
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
