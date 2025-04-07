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
    mes: body.mes,
    region: body.region, // -> Por ahora provene de const regionVieneUsuario
    firmante: body.firmante,
    cargo: body.cargo,
    cuposDisponibles: body.cuposDisponibles,
    porcentajeCuposEjecutados: body.porcentajeCuposEjecutados,
    datosGenerales: {
      encontrados: Number(body.datosGenerales.encontrados),
      ausentes: Number(body.datosGenerales.ausentes),
      renuncias: Number(body.datosGenerales.renuncias),
      desvinculados: Number(body.datosGenerales.desvinculados || 0),
      fallecidos: Number(body.datosGenerales.fallecidos),
      totalCuposEjecutados: Number(body.datosGenerales.totalCuposEjecutados),
      totalSupervisionesTerreno: Number(
        body.datosGenerales.totalSupervisionesTerreno,
      ),
      totalSupervisionesOficina: Number(
        body.datosGenerales.totalSupervisionesOficina,
      ),
      totalSupervisiones: Number(body.datosGenerales.totalSupervisiones), // Contabiliza los registros en tabla realizados en mes
    },
    terreno: {
      soportePapelTerreno: Number(body.supervisionTerreno.soportePapelTerreno),
      asistencia: {
        libroAsistencia: Number(
          body.supervisionTerreno.asistencia.libroAsistencia,
        ),
        firmaLibro: Number(body.supervisionTerreno.asistencia.firmaLibro),
        presencia: Number(body.supervisionTerreno.asistencia.presencia),
        horariosFirma: Number(body.supervisionTerreno.asistencia.horariosFirma),
        funcionContrato: Number(
          body.supervisionTerreno.asistencia.funcionContrato,
        ),
        observaciones: body.supervisionTerreno.asistencia.observaciones || "",
      },
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
        supervisionEjecutora: Number(
          body.supervisionTerreno.supervisionEjecutora.supervisionEjecutora,
        ),
        observaciones:
          body.supervisionTerreno.supervisionEjecutora.observaciones || "",
      },
    },
    oficina: {
      soportePapelOficina: Number(body.supervisionOficina.soportePapelOficina),
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
    listadoBeneficiarios: body.listadoBeneficiarios || "", // -> Proviene de const listadoBeneficiarios
    avanceProyectos: body.avanceProyectos || "",
    comentariosGenerales: body.comentariosGenerales,
    comentariosSupervision: body.comentariosSupervision,
    otrosMeses: body.otrosMeses || [], // -> Proviene de const otrosMeses
  };
}
