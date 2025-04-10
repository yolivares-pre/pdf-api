# PDF Report API

Esta API es una función serverless construida con Express y PDF-lib, que permite generar informes PDF dinámicos a partir de un payload JSON. Está pensada para integrarse fácilmente con un componente de Nuxt, que enviará la información real a la API.

## Índice

- [Visión General](#visión-general)
- [Estructura de Archivos](#estructura-de-archivos)
- [Endpoint Principal](#endpoint-principal)
- [Estructura del JSON de Entrada](#estructura-del-json-de-entrada)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Variables de Entorno](#variables-de-entorno)
- [Cómo Ejecutar la API](#cómo-ejecutar-la-api)
- [Integración con Nuxt](#integración-con-nuxt)
- [Notas Adicionales](#notas-adicionales)

## Visión General

La API recibe un JSON con datos del informe mensual y devuelve un PDF que incluye:
- Datos generales (números de beneficiarias/os, supervisiones, etc.).
- Secciones de supervisión en terreno y en oficina, donde se detalla tanto la información de soporte digital como en papel.
- Comentarios generales y sobre fiscalización.
- Un gráfico que muestra la evolución de supervisiones en meses previos.
- Sección de firma.

## Estructura de Archivos

- **index.js**:  
  Archivo principal de la API. Define el endpoint `/api/create-pdf`, procesa la solicitud, genera el PDF usando PDF-lib y lo envía como respuesta.
  
- **processMonthlyReportData.js**:  
  Transforma el JSON recibido en un objeto estructurado, convirtiendo los campos numéricos y extrayendo la información anidada para el informe.

- **regiones.js**:  
  Mapea los códigos de región a nombres de regiones (ej.: `"05"` a `"Valparaíso"`).

- **meses.js**:  
  Contiene un array con los nombres de los meses para convertir números a nombres (ej.: `4` a `"Abril"`).

- **validation.js**:  
  Valida que el JSON de entrada tenga todos los campos requeridos y que sean del tipo esperado. La validación se activa si la variable de entorno `ENABLE_VALIDATION` está en `"true"`.

- **addHeaderLine.js**:  
  Añade una línea de encabezado (con imagen) en la parte superior del PDF.

- **loadFonts.js** y **fonts.js**:  
  Cargan y embeben las fuentes necesarias en el PDF.

- **images.js**:  
  Gestiona la carga y embebido de imágenes, y proporciona funciones para dibujarlas en las páginas del PDF.

## Endpoint Principal

### POST `/api/create-pdf`

Genera un informe PDF basado en el JSON enviado en el cuerpo de la solicitud.

#### Respuesta

- **Content-Type**: `application/pdf`  
- **Content-Disposition**: `attachment; filename=informe.pdf`

En caso de error, se retorna un código HTTP 500 con un mensaje descriptivo.

## Estructura del JSON de Entrada

El payload debe tener la siguiente estructura:

- **mes**: (String) Número de mes (por ejemplo, `"4"` para Abril).
- **region**: (String) Código de región (por ejemplo, `"05"` para Valparaíso).
- **datosGenerales**: (Object) Con los siguientes campos:
  - `encontrados`: Número
  - `ausentes`: Número
  - `renuncias`: Número
  - `fallecidos`: Número
  - `totalSupervisiones`: Número
  - `desvinculados`: Número
  - `totalCuposEjecutados`: Número
- **terreno**: (Object) Con:
  - `soportePapelTerreno`: Número
  - `asistencia`: (Object) Con campos numéricos:
    - `libroAsistencia`, `firmaLibro`, `horariosFirma`, `funcionContrato`
    - `observaciones`: (Opcional) Texto.
  - `condicionesTrabajo`: (Object) Con campos numéricos:
    - `recibeEpp`, `eppAdecuados`, `utilizaEpp`, `insumosAdecuados`, `condicionesLaboralesAdecuadas`, `charla`
    - `observaciones`: (Opcional) Texto.
  - `supervisionEjecutora`: (Object) Con:
    - `supervisionEjecutora`: Número
    - `observaciones`: (Opcional) Texto.
- **oficina**: (Object) Con:
  - `soportePapelOficina`: Número
  - `requisitos`: (Object) Con campos numéricos:
    - `cedulaIdentidad`, `declaracionCesantia`, `rsh`, `certificadoCotizaciones`
    - `observaciones`: (Opcional) Texto.
  - `revisionContrato`: (Object) Con campos numéricos:
    - `debidamenteFirmado`, `horarios`, `direccionLugarTrabajo`, `funcionTrabajo`
    - `observaciones`: (Opcional) Texto.
  - `obligacionesLaborales`: (Object) Con campos numéricos:
    - `actaEpp`, `actaInsumos`, `liquidacionesSueldos`, `comprobantePagosPrevisionales`, `registroSupervisiones`, `registroAsistencia`
    - `observaciones`: (Opcional) Texto.
- **comentariosGenerales**: (String) Comentarios generales.
- **comentariosSupervision**: (String) Comentarios sobre fiscalización.
- **otrosMeses**: (Array) Arreglo de objetos con datos de meses anteriores, por ejemplo:
  ```json
  [
    {"month": "3", "total": 35},
    {"month": "2", "total": 80},
    {"month": "1", "total": 42}
  ]
- firmante: (String) Nombre del firmante.
- cargo: (String) Cargo del firmante.

### Ejemplo de JSON
```json
{
  "mes": "4",
  "region": "05",
  "datosGenerales": {
    "encontrados": 50,
    "ausentes": 5,
    "renuncias": 2,
    "fallecidos": 0,
    "totalSupervisiones": 40,
    "desvinculados": 1,
    "totalCuposEjecutados": 50
  },
  "terreno": {
    "soportePapelTerreno": 10,
    "asistencia": {
      "libroAsistencia": 28,
      "firmaLibro": 27,
      "horariosFirma": 25,
      "funcionContrato": 22,
      "observaciones": "Observaciones para asistencia."
    },
    "condicionesTrabajo": {
      "recibeEpp": 30,
      "eppAdecuados": 25,
      "utilizaEpp": 29,
      "insumosAdecuados": 26,
      "condicionesLaboralesAdecuadas": 20,
      "charla": 35,
      "observaciones": "Observaciones para condiciones de trabajo."
    },
    "supervisionEjecutora": {
      "supervisionEjecutora": 15,
      "observaciones": "Observaciones para supervisión ejecutora."
    }
  },
  "oficina": {
    "soportePapelOficina": 5,
    "requisitos": {
      "cedulaIdentidad": 18,
      "declaracionCesantia": 17,
      "rsh": 20,
      "certificadoCotizaciones": 19,
      "observaciones": "Observaciones para requisitos."
    },
    "revisionContrato": {
      "debidamenteFirmado": 18,
      "horarios": 16,
      "direccionLugarTrabajo": 15,
      "funcionTrabajo": 18,
      "observaciones": "Observaciones para revisión de contrato."
    },
    "obligacionesLaborales": {
      "actaEpp": 17,
      "actaInsumos": 18,
      "liquidacionesSueldos": 15,
      "comprobantePagosPrevisionales": 19,
      "registroSupervisiones": 20,
      "registroAsistencia": 16,
      "observaciones": "Observaciones para obligaciones laborales."
    }
  },
  "comentariosGenerales": "Comentarios generales del informe.",
  "comentariosSupervision": "Comentarios sobre fiscalización.",
  "otrosMeses": [
    {"month": "3", "total": 35},
    {"month": "2", "total": 80},
    {"month": "1", "total": 42}
  ],
  "firmante": "María González",
  "cargo": "Encargada Territorial"
}
```

## Flujo de Trabajo
**1. Procesamiento de Datos:**
Se utiliza processMonthlyReportData.js para transformar el JSON de entrada en un objeto estructurado, asegurando que todos los campos numéricos se conviertan correctamente (usando Number()).

**2. Validación:**
Con la variable de entorno ENABLE_VALIDATION en "true", se valida que el JSON contenga todos los campos requeridos y sean del tipo esperado mediante validation.js.

**3. Generación del PDF:**
- Se crea un nuevo documento PDF usando PDF-lib.
- Se cargan y embeben las fuentes (con loadFonts.js o fonts.js) y se gestionan las imágenes (con images.js y addHeaderLine.js).
- Se dibujan las secciones del informe (datos generales, supervisión en terreno/oficina, comentarios, firma, etc.).
- En las secciones de supervisión se agrega, además, una línea que muestra la cantidad de supervisiones realizadas en soporte digital y en soporte papel.

**4. Respuesta:**
El PDF se envía como respuesta con los headers adecuados para ser descargado.

**5.Variables de Entorno**

- ENABLE_VALIDATION:
Establece "true" para habilitar la validación del JSON de entrada.
- PORT:
Puerto en el que se ejecuta la API (por defecto 3001).

## Cómo Ejecutar la API
**1. Instala las dependencias**
```bash
npm install
```
**2. Crea un archivo `.env` en la raíz y define tus variables de entorno:**
```bash
ENABLE_VALIDATION=true
PORT=3001
```
**3. Ejecuta el servidor (modo desarrollo):**
```bash
node index.js
```
**4. La API estará disponible en:**
`http://localhost:3001/api/create-pdf`

## Notas adicionales
- Modularidad y Mantenibilidad:
La API está dividida en varios módulos (para procesar datos, validar, cargar fuentes e imágenes, etc.) lo que facilita su extensión y mantenimiento.

- Error Handling:
Si ocurre algún error durante el procesamiento o la generación del PDF, la API responde con un HTTP 500 y un mensaje descriptivo del error.
