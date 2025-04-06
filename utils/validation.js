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
  if (!body.supervisionTerreno || typeof body.supervisionTerreno !== "object") {
    const error = new Error("El campo 'supervisionTerreno' debe ser un objeto");
    error.name = "ValidationError";
    throw error;
  }

  // Verificar tipoSoporteTerreno
  if (!body.supervisionTerreno.hasOwnProperty("tipoSoporteTerreno")) {
    const error = new Error(
      "El campo 'tipoSoporteTerreno' es requerido en supervisionTerreno",
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar estructura de asistencia en supervisionTerreno
  if (
    !body.supervisionTerreno.asistencia ||
    typeof body.supervisionTerreno.asistencia !== "object"
  ) {
    const error = new Error(
      "El campo 'asistencia' es requerido en supervisionTerreno y debe ser un objeto",
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
    (field) => !body.supervisionTerreno.asistencia.hasOwnProperty(field),
  );

  if (missingAsistenciaFields.length > 0) {
    const error = new Error(
      `Faltan campos en supervisionTerreno.asistencia: ${missingAsistenciaFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de asistencia sean booleanos
  for (const field of requiredAsistenciaFields) {
    const value = body.supervisionTerreno.asistencia[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en supervisionTerreno.asistencia debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar estructura de condicionesTrabajo en supervisionTerreno
  if (
    !body.supervisionTerreno.condicionesTrabajo ||
    typeof body.supervisionTerreno.condicionesTrabajo !== "object"
  ) {
    const error = new Error(
      "El campo 'condicionesTrabajo' es requerido en supervisionTerreno y debe ser un objeto",
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
        !body.supervisionTerreno.condicionesTrabajo.hasOwnProperty(field),
    );

  if (missingCondicionesTrabajoFields.length > 0) {
    const error = new Error(
      `Faltan campos en supervisionTerreno.condicionesTrabajo: ${missingCondicionesTrabajoFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de condicionesTrabajo sean booleanos
  for (const field of requiredCondicionesTrabajoFields) {
    const value = body.supervisionTerreno.condicionesTrabajo[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en supervisionTerreno.condicionesTrabajo debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar estructura de supervisionEjecutora en supervisionTerreno
  if (
    !body.supervisionTerreno.supervisionEjecutora ||
    typeof body.supervisionTerreno.supervisionEjecutora !== "object"
  ) {
    const error = new Error(
      "El campo 'supervisionEjecutora' es requerido en supervisionTerreno y debe ser un objeto",
    );
    error.name = "ValidationError";
    throw error;
  }

  if (
    !body.supervisionTerreno.supervisionEjecutora.hasOwnProperty(
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
    typeof body.supervisionTerreno.supervisionEjecutora.supervisionEjecutora !==
    "boolean"
  ) {
    const error = new Error(
      "El campo 'supervisionEjecutora.supervisionEjecutora' debe ser un booleano",
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar objetos de supervisión oficina
  if (!body.supervisionOficina || typeof body.supervisionOficina !== "object") {
    const error = new Error("El campo 'supervisionOficina' debe ser un objeto");
    error.name = "ValidationError";
    throw error;
  }

  // Verificar tipoSoporteOficina
  if (!body.supervisionOficina.hasOwnProperty("tipoSoporteOficina")) {
    const error = new Error(
      "El campo 'tipoSoporteOficina' es requerido en supervisionOficina",
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar estructura de requisitos en supervisionOficina
  if (
    !body.supervisionOficina.requisitos ||
    typeof body.supervisionOficina.requisitos !== "object"
  ) {
    const error = new Error(
      "El campo 'requisitos' es requerido en supervisionOficina y debe ser un objeto",
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
    (field) => !body.supervisionOficina.requisitos.hasOwnProperty(field),
  );

  if (missingRequisitosFields.length > 0) {
    const error = new Error(
      `Faltan campos en supervisionOficina.requisitos: ${missingRequisitosFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de requisitos sean booleanos
  for (const field of requiredRequisitosFields) {
    const value = body.supervisionOficina.requisitos[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en supervisionOficina.requisitos debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar estructura de revisionContrato en supervisionOficina
  if (
    !body.supervisionOficina.revisionContrato ||
    typeof body.supervisionOficina.revisionContrato !== "object"
  ) {
    const error = new Error(
      "El campo 'revisionContrato' es requerido en supervisionOficina y debe ser un objeto",
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
    (field) => !body.supervisionOficina.revisionContrato.hasOwnProperty(field),
  );

  if (missingRevisionContratoFields.length > 0) {
    const error = new Error(
      `Faltan campos en supervisionOficina.revisionContrato: ${missingRevisionContratoFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de revisionContrato sean booleanos
  for (const field of requiredRevisionContratoFields) {
    const value = body.supervisionOficina.revisionContrato[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en supervisionOficina.revisionContrato debe ser un booleano`,
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  // Verificar estructura de obligacionesLaborales en supervisionOficina
  if (
    !body.supervisionOficina.obligacionesLaborales ||
    typeof body.supervisionOficina.obligacionesLaborales !== "object"
  ) {
    const error = new Error(
      "El campo 'obligacionesLaborales' es requerido en supervisionOficina y debe ser un objeto",
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
        !body.supervisionOficina.obligacionesLaborales.hasOwnProperty(field),
    );

  if (missingObligacionesLaboralesFields.length > 0) {
    const error = new Error(
      `Faltan campos en supervisionOficina.obligacionesLaborales: ${missingObligacionesLaboralesFields.join(", ")}`,
    );
    error.name = "ValidationError";
    throw error;
  }

  // Verificar que los campos de obligacionesLaborales sean booleanos
  for (const field of requiredObligacionesLaboralesFields) {
    const value = body.supervisionOficina.obligacionesLaborales[field];
    if (typeof value !== "boolean") {
      const error = new Error(
        `El campo '${field}' en supervisionOficina.obligacionesLaborales debe ser un booleano`,
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

  // Verificar que comentariosGenerales y comentariosFiscalizacion sean string (pueden estar vacíos)
  if (typeof body.comentariosGenerales !== "string") {
    const error = new Error(
      "El campo 'comentariosGenerales' debe ser un texto",
    );
    error.name = "ValidationError";
    throw error;
  }

  if (typeof body.comentariosFiscalizacion !== "string") {
    const error = new Error(
      "El campo 'comentariosFiscalizacion' debe ser un texto",
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
