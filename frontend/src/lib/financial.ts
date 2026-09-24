/**
 * Fórmulas del motor financiero (client-side)
 * Referencia: Documento_maestro.md — Motor Financiero
 */

// ─── Elasticidad precio-demanda implícita ─────────────────────────────────────
//
// El modelo lineal puro (Ingresos = Precio × Unidades) ignora que a precios muy
// altos la demanda cae. Usamos un ajuste basado en el markup sobre el costo
// variable como proxy del precio relativo al mercado:
//
//   markup         = precio / costoVar
//   markupBase     = 2.0  (×2 es el mínimo saludable; por debajo el margen es escaso)
//   markupNormal   = 3.0  (×3 es un markup típico de muchos negocios minoristas)
//   elasticidad    = 0.18 (cada punto de markup sobre markupBase reduce demanda 18%)
//
//   factorDemanda  = max(0, 1 - elasticidad × max(0, markup - markupNormal))
//
// Ejemplos con costoVar = $60:
//   precio $120 (×2.0)  → factor 0.82  → demanda al 82%
//   precio $180 (×3.0)  → factor 1.00  → demanda plena (precio normal)
//   precio $300 (×5.0)  → factor 0.64  → demanda al 64%
//   precio $600 (×10.0) → factor 0.00  → nadie compra
//
// Si precio ≤ costoVar (MC negativo) el factor es irrelevante — la utilidad ya
// es negativa independientemente del volumen.

const MARKUP_NORMAL    = 3.0
const ELASTICIDAD      = 0.18

/**
 * Calcula el factor de ajuste de demanda según el markup precio/costo variable.
 * Devuelve un número entre 0 y 1.
 */
export function calcDemandFactor(precio: number, costoVar: number): number {
  if (costoVar <= 0 || precio <= 0) return 1
  const markup = precio / costoVar
  return Math.max(0, 1 - ELASTICIDAD * Math.max(0, markup - MARKUP_NORMAL))
}

/**
 * Clasifica el nivel de precio para mostrar advertencias en UI.
 */
export type PriceWarning = 'none' | 'low-margin' | 'high-price' | 'extreme-price' | 'below-cost'

export function getPriceWarning(precio: number, costoVar: number): PriceWarning {
  if (costoVar <= 0) return 'none'
  if (precio <= costoVar)           return 'below-cost'
  const markup = precio / costoVar
  if (markup > 8)                   return 'extreme-price'
  if (markup > 5)                   return 'high-price'
  if (markup < 1.4)                 return 'low-margin'
  return 'none'
}

export interface IncomeStatementInput {
  precioPromedio: number
  ventasEstimadasMes: number
  costoVariableUnitario: number
  gastosOperativosFijos: number
}

export function calcIncomeStatement(input: IncomeStatementInput) {
  // Ajustar unidades según elasticidad implícita
  const demandFactor = calcDemandFactor(input.precioPromedio, input.costoVariableUnitario)
  const ventasEfectivas = input.ventasEstimadasMes * demandFactor

  const ingresos = input.precioPromedio * ventasEfectivas
  const costosVariables = input.costoVariableUnitario * ventasEfectivas
  const utilidadBruta = ingresos - costosVariables
  const utilidadOperativa = utilidadBruta - input.gastosOperativosFijos
  const margenOperativo = ingresos > 0 ? utilidadOperativa / ingresos : 0

  return {
    ingresos,
    costosVariables,
    utilidadBruta,
    gastosOperativosFijos: input.gastosOperativosFijos,
    utilidadOperativa,
    margenOperativo,
    ventasEfectivas,      // unidades reales después del ajuste
    demandFactor,         // para mostrar en UI
  }
}

export interface BreakEvenInput {
  costosFijos: number
  precioUnitario: number
  costoVariableUnitario: number
  /** Unidades actuales vendidas por mes (no ingresos en $) */
  unidadesActuales?: number
  /** @deprecated usa unidadesActuales */
  ventasActuales?: number
}

export function calcBreakEven(input: BreakEvenInput) {
  const margenContribucion = input.precioUnitario - input.costoVariableUnitario
  const unidades = margenContribucion > 0 ? input.costosFijos / margenContribucion : Infinity
  const ventasBreakEven = isFinite(unidades) ? unidades * input.precioUnitario : Infinity
  // Margen de seguridad calculado en unidades: (uds_actuales - uds_BE) / uds_actuales
  const udsActuales = input.unidadesActuales ?? input.ventasActuales
  const margenSeguridad = udsActuales && udsActuales > 0 && isFinite(unidades)
    ? (udsActuales - unidades) / udsActuales
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
