/**
 * Procesa los datos del cuerpo de la solicitud y retorna un objeto estructurado
 * para el informe mensual.
 *
 * @param {Object} requestBody - El cuerpo de la solicitud HTTP
 * @returns {Object} - Objeto estructurado con los datos procesados
 */
export function processMonthlyReportData(requestBody) {
  const body = requestBody;

  return {
    mes: body.mes, // Luego se realiza un toLowerCase()
    region: body.region, // Debe ser el nombre de la región, no el número
    // Tabla inicial del documento
    datosGenerales: {
      // Los siguientes valores se calculan a partir del agregado de los campos del objeto asistencia
      // del componente supervision-terreno/index.vue, a excepción de los señalados,
      // los cuales deben ser ingresados manualmente por el usuario
      encontradas: body.encontradas, // Contabiliza asistencia.presencia = true
      ausentes: body.ausentes, // Contabiliza asistencia.presencia = false
      renuncias: body.renuncias, // Ingresado por usuario
      fallecidos: body.fallecidos, // Ingresado por usuario
      fiscalizados: body.fiscalizados, // Contabiliza los registros en tabla realizados en mes
      desvinculados: body.desvinculados || 0, // Ingresado por usuario
      total: body.total, // Corresponde al universo de beneficiarios total en la región.
    },
    supervisionTerreno: {
      // Nuevo campo. Calcula cuántos informes fueron realizados en papel
      // y cuántos en digital. En componente se llama `soportePapel`
      tipoSoporteTerreno: body.tipoSoporteTerreno,
      // Se añaden todos los campos de asistencia, a excepción de `presencia`
      // porque ese valor es relevante y se calcula en tabla de `datosGenerales`.
      //mantiene nombres del componente supervision-terreno
      asistencia: {
        libroAsistencia:
          body.libroAsistencia === "true" || body.libroAsistencia === true,
        firmaLibro: body.firmaLibro === "true" || body.firmaLibro === true,
        horariosFirma:
          body.horariosFirma === "true" || body.horariosFirma === true,
        funcionContrato:
          body.funcionContrato === "true" || body.funcionContrato === true,
      },
      // Se añaden todos los campos de condicionesTrabajo
      // mantiene nombres del componente supervision-terreno
      condicionesTrabajo: {
        recibeEpp: body.recibeEpp === "true" || body.recibeEpp === true,
        eppAdecuados:
          body.eppAdecuados === "true" || body.eppAdecuados === true,
        utilizaEpp: body.utilizaEpp === "true" || body.utilizaEpp === true,
        insumosAdecuados:
          body.insumosAdecuados === "true" || body.insumosAdecuados === true,
        condicionesLaboralesAdecuadas:
          body.condicionesOptimas === "true" ||
          body.condicionesOptimas === true,
        charla: body.charla === "true" || body.charla === true,
      },
      supervisionEjecutora: {
        supervisionEjecutora: false, // Veces que empleador supervisió a beneficiario
      },
    },
    supervisionOficina: {
      // Nuevo campo. Calcula cuántos informes fueron realizados en papel
      // y cuántos en digital. En componente se llama `soportePapel`
      tipoSoporteOficina: body.tipoSoporteOficina,
      // Se añaden todos los campos de requisitos
      // mantiene nombres del componente supervision-oficina
      requisitos: {
        cedulaIdentidad:
          body.cedulaIdentidad === "true" || body.cedulaIdentidad === true,
        declaracionCesantia:
          body.declaracionCesantia === "true" ||
          body.declaracionCesantia === true,
        rsh: body.rsh === "true" || body.rsh === true,
        certificadoCotizaciones:
          body.certificadoCotizaciones === "true" ||
          body.certificadoCotizaciones === true,
      },
      // Se añaden todos los campos de revisionContrato
      // mantiene nombres del componente supervision-oficina
      revisionContrato: {
        debidamenteFirmado:
          body.debidamenteFirmado === "true" ||
          body.debidamenteFirmado === true,
        horarios: body.horarios === "true" || body.horarios === true,
        direccionLugarTrabajo:
          body.direccionLugarTrabajo === "true" ||
          body.direccionLugarTrabajo === true,
        funcionTrabajo:
          body.funcionTrabajo === "true" || body.funcionTrabajo === true,
      },
      // Se añaden todos los campos de obligacionesLaborales
      // mantiene nombres del componente supervision-oficina
      obligacionesLaborales: {
        actaEpp: body.actaEpp === "true" || body.actaEpp === true,
        actaInsumos: body.actaInsumos === "true" || body.actaInsumos === true,
        liquidacionesSueldos:
          body.liquidacionesSueldos === "true" ||
          body.liquidacionesSueldos === true,
        comprobantePagosPrevisionales:
          body.comprobantePagosPrevisionales === "true" ||
          body.comprobantePagosPrevisionales === true,
        registroSupervisiones:
          body.registroSupervisiones === "true" ||
          body.registroSupervisiones === true,
        registroAsistencia:
          body.registroAsistencia === "true" ||
          body.registroAsistencia === true,
      },
    },
    comentariosGenerales: body.comentariosGenerales, // Proviene del formulario del componente informe-mensual
    comentariosFiscalizacion: body.comentariosFiscalizacion, // Proviene del formulario del componente informe-mensual
    otrosMeses: body.otrosMeses || [], // Se calcula a partir de datosGenerales.fiscalizados
    firmante: body.firmante, // Proviene del formulario del componente informe-mensual
    cargo: body.cargo, // Proviene del formulario del componente informe-mensual
  };
}
