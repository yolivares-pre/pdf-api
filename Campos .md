# Campos a contemplar en la generación del PDF 'Informe técnico mensual'

Los siguientes objetos `json` corresponden a los campos que los formularios de los componentes de la aplicación creada con Nuxt para supervisiones, `supervisiones_oficina` y `supervisiones_terreno`, contemplan como campos `booleanos`.
Estos valores se deben contabilizar dentro del formulario, permitiendo señalar cuántos beneficiarios recibieron o cumplieron cierta condición.
Los `json` se señalan con valores false por defecto, sin embargo, es simplementar para señalar que corresponden a valores `true`o `false`.

[📝 TODO: añadir IA para que recopile los campos que son comentarios y poder generar una síntesis mensual de todo lo que se escribe.]

## Oficina

```json
{
  "identificacion": {
    "soportePapel": false
  },
  "requisitos": {
    "cedulaIdentidad": false,
    "declaracionCesantia": false,
    "rsh": false,
    "certificadoCotizaciones": false
  },
  "revisionContrato": {
    "debidamenteFirmado": false,
    "horarios": false,
    "direccionLugarTrabajo": false,
    "funcionTrabajo": false
  },
  "obligacionesLaborales": {
    "actaEpp": false,
    "actaInsumos": false,
    "liquidacionesSueldos": false,
    "comprobantePagosPrevisionales": false,
    "registroSupervisiones": false,
    "registroAsistencia": false
  }
}
```

# Terreno

```json
{
  "identificacion": {
    "soportePapel": false
  },
  "asistencia": {
    "libroAsistencia": false,
    "firmaLibro": false,
    "presencia": false,
    "horariosFirma": false,
    "funcionContrato": false
  },
  "condicionesTrabajo": {
    "recibeEpp": false,
    "eppAdecuados": false,
    "utilizaEpp": false,
    "insumosAdecuados": false,
    "condicionesLaboralesAdecuadas": false,
    "charla": false
  },
  "supervisionEjecutora": {
    "supervisionEjecutora": false
  }
}
```
