export interface FinancialInput {
  precioPromedio: number
  ventasEstimadasMes: number
  costoVariableUnitario: number
  gastosOperativosFijos: number
  inversionInicial: number
  horizonteMeses: 6 | 12 | 24
}

export interface IncomeStatement {
  ingresos: number
  costosVariables: number
  utilidadBruta: number
  gastosOperativosFijos: number
  utilidadOperativa: number
  margenOperativo: number         // porcentaje 0–1
}

export interface BreakEvenResult {
  unidades: number
  ventasBreakEven: number
  margenSeguridad: number         // porcentaje 0–1
}

export interface ScenarioProjectionPoint {
  mes: number
  ingresos: number
  costosVar: number
  costosFijosT: number
  flujoCaja: number
  acumulado: number
}

export interface Scenario {
  id?: string
  name: string
  input: FinancialInput
  tasaCrecimiento: number
  inflacionEstimada: number
  projection: ScenarioProjectionPoint[]
  recoveryMonth?: number
}
