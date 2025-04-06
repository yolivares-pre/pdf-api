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
      encontradas: Number(body.datosGenerales.encontradas), // Contabiliza asistencia.presencia = true
      ausentes: Number(body.datosGenerales.ausentes), // Contabiliza asistencia.presencia = false
      renuncias: Number(body.datosGenerales.renuncias), // Ingresado por usuario
      fallecidos: Number(body.datosGenerales.fallecidos), // Ingresado por usuario
      fiscalizados: Number(body.datosGenerales.fiscalizados), // Contabiliza los registros en tabla realizados en mes
      desvinculados: Number(body.datosGenerales.desvinculados || 0), // Ingresado por usuario
      total: Number(body.datosGenerales.total), // Corresponde al universo de beneficiarios total en la región.
    },
    supervisionTerreno: {
      // Nuevo campo. Calcula cuántos informes fueron realizados en papel
      // y cuántos en digital. En componente se llama `soportePapel`
      tipoSoporteTerreno: body.supervisionTerreno.tipoSoporteTerreno,
      // Se añaden todos los campos de asistencia, a excepción de `presencia`
      // porque ese valor es relevante y se calcula en tabla de `datosGenerales`.
      // Mantiene nombres del componente supervision-terreno
      asistencia: {
        libroAsistencia: Number(
          body.supervisionTerreno.asistencia.libroAsistencia,
        ),
        firmaLibro: Number(body.supervisionTerreno.asistencia.firmaLibro),
        horariosFirma: Number(body.supervisionTerreno.asistencia.horariosFirma),
        funcionContrato: Number(
          body.supervisionTerreno.asistencia.funcionContrato,
        ),
        observaciones: body.supervisionTerreno.asistencia.observaciones || "",
      },
      // Se añaden todos los campos de condicionesTrabajo
      // Mantiene nombres del componente supervision-terreno
      condicionesTrabajo: {
        recibeEpp: Number(body.supervisionTerreno.condicionesTrabajo.recibeEpp),
        eppAdecuados: Number(
          body.supervisionTerreno.condicionesTrabajo.eppAdecuados,
        ),
        utilizaEpp: Number(
          body.supervisionTerreno.condicionesTrabajo.utilizaEpp,
        ),
        insumosAdecuados: Number(
          body.supervisionTerreno.condicionesTrabajo.insumosAdecuados,
        ),
        condicionesLaboralesAdecuadas: Number(
          body.supervisionTerreno.condicionesTrabajo
            .condicionesLaboralesAdecuadas,
        ),
        charla: Number(body.supervisionTerreno.condicionesTrabajo.charla),
        observaciones:
          body.supervisionTerreno.condicionesTrabajo.observaciones || "",
      },
      supervisionEjecutora: {
        // Ahora se toma el valor numérico enviado en lugar de asignar false por defecto
        supervisionEjecutora: Number(
          body.supervisionTerreno.supervisionEjecutora.supervisionEjecutora,
        ),
        observaciones:
          body.supervisionTerreno.supervisionEjecutora.observaciones || "",
      },
    },
    supervisionOficina: {
      // Nuevo campo. Calcula cuántos informes fueron realizados en papel
      // y cuántos en digital. En componente se llama `soportePapel`
      tipoSoporteOficina: body.supervisionOficina.tipoSoporteOficina,
      // Se añaden todos los campos de requisitos
      // Mantiene nombres del componente supervision-oficina
      requisitos: {
        cedulaIdentidad: Number(
          body.supervisionOficina.requisitos.cedulaIdentidad,
        ),
        declaracionCesantia: Number(
          body.supervisionOficina.requisitos.declaracionCesantia,
        ),
        rsh: Number(body.supervisionOficina.requisitos.rsh),
        certificadoCotizaciones: Number(
          body.supervisionOficina.requisitos.certificadoCotizaciones,
        ),
        observaciones: body.supervisionOficina.requisitos.observaciones || "",
      },
      // Se añaden todos los campos de revisionContrato
      // Mantiene nombres del componente supervision-oficina
      revisionContrato: {
        debidamenteFirmado: Number(
          body.supervisionOficina.revisionContrato.debidamenteFirmado,
        ),
        horarios: Number(body.supervisionOficina.revisionContrato.horarios),
        direccionLugarTrabajo: Number(
          body.supervisionOficina.revisionContrato.direccionLugarTrabajo,
        ),
        funcionTrabajo: Number(
          body.supervisionOficina.revisionContrato.funcionTrabajo,
        ),
        observaciones:
          body.supervisionOficina.revisionContrato.observaciones || "",
      },
      // Se añaden todos los campos de obligacionesLaborales
      // Mantiene nombres del componente supervision-oficina
      obligacionesLaborales: {
        actaEpp: Number(body.supervisionOficina.obligacionesLaborales.actaEpp),
        actaInsumos: Number(
          body.supervisionOficina.obligacionesLaborales.actaInsumos,
        ),
        liquidacionesSueldos: Number(
          body.supervisionOficina.obligacionesLaborales.liquidacionesSueldos,
        ),
        comprobantePagosPrevisionales: Number(
          body.supervisionOficina.obligacionesLaborales
            .comprobantePagosPrevisionales,
        ),
        registroSupervisiones: Number(
          body.supervisionOficina.obligacionesLaborales.registroSupervisiones,
        ),
        registroAsistencia: Number(
          body.supervisionOficina.obligacionesLaborales.registroAsistencia,
        ),
        observaciones:
          body.supervisionOficina.obligacionesLaborales.observaciones || "",
      },
    },
    comentariosGenerales: body.comentariosGenerales, // Proviene del formulario del componente informe-mensual
    comentariosFiscalizacion: body.comentariosFiscalizacion, // Proviene del formulario del componente informe-mensual
    otrosMeses: body.otrosMeses || [], // Se calcula a partir de datosGenerales.fiscalizados
    firmante: body.firmante, // Proviene del formulario del componente informe-mensual
    cargo: body.cargo, // Proviene del formulario del componente informe-mensual
  };
}
