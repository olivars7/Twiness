/**
 * Fórmulas del motor financiero (client-side)
 * Referencia: Documento_maestro.md — Motor Financiero
 */

export interface IncomeStatementInput {
  precioPromedio: number
  ventasEstimadasMes: number
  costoVariableUnitario: number
  gastosOperativosFijos: number
}

export function calcIncomeStatement(input: IncomeStatementInput) {
  const ingresos = input.precioPromedio * input.ventasEstimadasMes
  const costosVariables = input.costoVariableUnitario * input.ventasEstimadasMes
  const utilidadBruta = ingresos - costosVariables
  const utilidadOperativa = utilidadBruta - input.gastosOperativosFijos
  const margenOperativo = ingresos > 0 ? utilidadOperativa / ingresos : 0

  return { ingresos, costosVariables, utilidadBruta, gastosOperativosFijos: input.gastosOperativosFijos, utilidadOperativa, margenOperativo }
}

export interface BreakEvenInput {
  costosFijos: number
  precioUnitario: number
  costoVariableUnitario: number
  ventasActuales?: number
}

export function calcBreakEven(input: BreakEvenInput) {
  const margenContribucion = input.precioUnitario - input.costoVariableUnitario
  const unidades = margenContribucion > 0 ? input.costosFijos / margenContribucion : Infinity
  const ventasBreakEven = unidades * input.precioUnitario
  const margenSeguridad = input.ventasActuales && input.ventasActuales > 0
    ? (input.ventasActuales - ventasBreakEven) / input.ventasActuales
    : 0

  return { unidades, ventasBreakEven, margenSeguridad }
}

export function calcOperatingLeverage(margenContribucion: number, utilidadOperativa: number): number {
  return utilidadOperativa !== 0 ? margenContribucion / utilidadOperativa : 0
}

export interface ProjectionInput {
  ventasBase: number
  tasaCrecimiento: number
  costoVariable: number         // fracción de ingresos
  costosFijos: number
  inflacionEstimada: number
  horizonteMeses: number
  inversionInicial: number
}

export function calcProjection(input: ProjectionInput) {
  let acumulado = -input.inversionInicial
  return Array.from({ length: input.horizonteMeses }, (_, t) => {
    const mes = t + 1
    const ingresos = input.ventasBase * Math.pow(1 + input.tasaCrecimiento, t)
    const costosVar = input.costoVariable * ingresos
    const costosFijosT = input.costosFijos + input.inflacionEstimada * t
    const flujoCaja = ingresos - costosVar - costosFijosT
    acumulado += flujoCaja
    return { mes, ingresos, costosVar, costosFijosT, flujoCaja, acumulado }
  })
}
