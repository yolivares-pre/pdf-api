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
    "terreno",
    "oficina",
    "comentariosGenerales",
    "comentariosSupervision",
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
    "encontrados",
    "ausentes",
    "renuncias",
    "fallecidos",
    "totalSupervisiones",
    "desvinculados",
    "totalCuposEjecutados",
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

  // Verificar que todos los valores en datosGenerales sean numéricos
  for (const field of requiredDatosGeneralesFields) {
    const value = body.datosGenerales[field];
    if (typeof value !== "number" && typeof value !== "string") {
      const error = new Error(
        `El campo '${field}' en datosGenerales debe ser un número`,
      );
      error.name = "ValidationError";
      throw error;
    }

    if (typeof value === "string" && isNaN(Number(value))) {
      const error = new Error(
        `El campo '${field}' en datosGenerales debe ser un número válido`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar objetos de supervisión terreno
  if (!body.terreno || typeof body.terreno !== "object") {
    const error = new Error("El campo 'terreno' debe ser un objeto");
    error.name = "ValidationError";
    throw error;
  }

  // Verificar soportePapelTerreno
  if (!body.terreno.hasOwnProperty("soportePapelTerreno")) {
    const error = new Error(
      "El campo 'soportePapelTerreno' es requerido en terreno",
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar estructura de asistencia en terreno
  if (
    !body.terreno.asistencia ||
    typeof body.terreno.asistencia !== "object"
  ) {
    const error = new Error(
      "El campo 'asistencia' es requerido en terreno y debe ser un objeto",
    );
    error.name = "ValidationError";
    throw error;
  }

  const requiredAsistenciaFields = [
    "libroAsistencia",
    "firmaLibro",
    "horariosFirma",
    "funcionContrato",
  ];

  const missingAsistenciaFields = requiredAsistenciaFields.filter(
    (field) => !body.terreno.asistencia.hasOwnProperty(field),
  );

  if (missingAsistenciaFields.length > 0) {
    const error = new Error(
      `Faltan campos en terreno.asistencia: ${missingAsistenciaFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de asistencia sean booleanos
  for (const field of requiredAsistenciaFields) {
    const value = body.terreno.asistencia[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en terreno.asistencia debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar estructura de condicionesTrabajo en terreno
  if (
    !body.terreno.condicionesTrabajo ||
    typeof body.terreno.condicionesTrabajo !== "object"
  ) {
    const error = new Error(
      "El campo 'condicionesTrabajo' es requerido en terreno y debe ser un objeto",
    );
    error.name = "ValidationError";
    throw error;
  }

  const requiredCondicionesTrabajoFields = [
    "recibeEpp",
    "eppAdecuados",
    "utilizaEpp",
    "insumosAdecuados",
    "condicionesLaboralesAdecuadas",
    "charla",
  ];

  const missingCondicionesTrabajoFields =
    requiredCondicionesTrabajoFields.filter(
      (field) =>
        !body.terreno.condicionesTrabajo.hasOwnProperty(field),
    );

  if (missingCondicionesTrabajoFields.length > 0) {
    const error = new Error(
      `Faltan campos en terreno.condicionesTrabajo: ${missingCondicionesTrabajoFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de condicionesTrabajo sean booleanos
  for (const field of requiredCondicionesTrabajoFields) {
    const value = body.terreno.condicionesTrabajo[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en terreno.condicionesTrabajo debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar estructura de supervisionEjecutora en terreno
  if (
    !body.terreno.supervisionEjecutora ||
    typeof body.terreno.supervisionEjecutora !== "object"
  ) {
    const error = new Error(
      "El campo 'supervisionEjecutora' es requerido en terreno y debe ser un objeto",
    );
    error.name = "ValidationError";
    throw error;
  }

  if (
    !body.terreno.supervisionEjecutora.hasOwnProperty(
      "supervisionEjecutora",
    )
  ) {
    const error = new Error(
      "El campo 'supervisionEjecutora.supervisionEjecutora' es requerido",
    );
    error.name = "ValidationError";
    throw error;
  }

  if (
    typeof body.terreno.supervisionEjecutora.supervisionEjecutora !==
    "boolean"
  ) {
    const error = new Error(
      "El campo 'supervisionEjecutora.supervisionEjecutora' debe ser un booleano",
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar objetos de supervisión oficina
  if (!body.oficina || typeof body.oficina !== "object") {
    const error = new Error("El campo 'oficina' debe ser un objeto");
    error.name = "ValidationError";
    throw error;
  }

  // Verificar soportePapelOficina
  if (!body.oficina.hasOwnProperty("soportePapelOficina")) {
    const error = new Error(
      "El campo 'soportePapelOficina' es requerido en oficina",
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar estructura de requisitos en oficina
  if (
    !body.oficina.requisitos ||
    typeof body.oficina.requisitos !== "object"
  ) {
    const error = new Error(
      "El campo 'requisitos' es requerido en oficina y debe ser un objeto",
    );
    error.name = "ValidationError";
    throw error;
  }

  const requiredRequisitosFields = [
    "cedulaIdentidad",
    "declaracionCesantia",
    "rsh",
    "certificadoCotizaciones",
  ];

  const missingRequisitosFields = requiredRequisitosFields.filter(
    (field) => !body.oficina.requisitos.hasOwnProperty(field),
  );

  if (missingRequisitosFields.length > 0) {
    const error = new Error(
      `Faltan campos en oficina.requisitos: ${missingRequisitosFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de requisitos sean booleanos
  for (const field of requiredRequisitosFields) {
    const value = body.oficina.requisitos[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en oficina.requisitos debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar estructura de revisionContrato en oficina
  if (
    !body.oficina.revisionContrato ||
    typeof body.oficina.revisionContrato !== "object"
  ) {
    const error = new Error(
      "El campo 'revisionContrato' es requerido en oficina y debe ser un objeto",
    );
    error.name = "ValidationError";
    throw error;
  }

  const requiredRevisionContratoFields = [
    "debidamenteFirmado",
    "horarios",
    "direccionLugarTrabajo",
    "funcionTrabajo",
  ];

  const missingRevisionContratoFields = requiredRevisionContratoFields.filter(
    (field) => !body.oficina.revisionContrato.hasOwnProperty(field),
  );

  if (missingRevisionContratoFields.length > 0) {
    const error = new Error(
      `Faltan campos en oficina.revisionContrato: ${missingRevisionContratoFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de revisionContrato sean booleanos
  for (const field of requiredRevisionContratoFields) {
    const value = body.oficina.revisionContrato[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en oficina.revisionContrato debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar estructura de obligacionesLaborales en oficina
  if (
    !body.oficina.obligacionesLaborales ||
    typeof body.oficina.obligacionesLaborales !== "object"
  ) {
    const error = new Error(
      "El campo 'obligacionesLaborales' es requerido en oficina y debe ser un objeto",
    );
    error.name = "ValidationError";
    throw error;
  }

  const requiredObligacionesLaboralesFields = [
    "actaEpp",
    "actaInsumos",
    "liquidacionesSueldos",
    "comprobantePagosPrevisionales",
    "registroSupervisiones",
    "registroAsistencia",
  ];

  const missingObligacionesLaboralesFields =
    requiredObligacionesLaboralesFields.filter(
      (field) =>
        !body.oficina.obligacionesLaborales.hasOwnProperty(field),
    );

  if (missingObligacionesLaboralesFields.length > 0) {
    const error = new Error(
      `Faltan campos en oficina.obligacionesLaborales: ${missingObligacionesLaboralesFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de obligacionesLaborales sean booleanos
  for (const field of requiredObligacionesLaboralesFields) {
    const value = body.oficina.obligacionesLaborales[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en oficina.obligacionesLaborales debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
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
  if (
    !body.region ||
    typeof body.region !== "string" ||
    body.region.trim() === ""
  ) {
    const error = new Error(
      "El campo 'region' es requerido y debe ser un texto no vacío",
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que firmante y cargo existan
  if (
    !body.firmante ||
    typeof body.firmante !== "string" ||
    body.firmante.trim() === ""
  ) {
    const error = new Error(
      "El campo 'firmante' es requerido y debe ser un texto no vacío",
    );
    error.name = "ValidationError";
    throw error;
  }

  if (
    !body.cargo ||
    typeof body.cargo !== "string" ||
    body.cargo.trim() === ""
  ) {
    const error = new Error(
      "El campo 'cargo' es requerido y debe ser un texto no vacío",
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que comentariosGenerales y comentariosSupervision sean string (pueden estar vacíos)
  if (typeof body.comentariosGenerales !== "string") {
    const error = new Error(
      "El campo 'comentariosGenerales' debe ser un texto",
    );
    error.name = "ValidationError";
    throw error;
  }

  if (typeof body.comentariosSupervision !== "string") {
    const error = new Error(
      "El campo 'comentariosSupervision' debe ser un texto",
    );
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
