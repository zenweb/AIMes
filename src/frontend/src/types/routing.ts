export interface ProcessRoute {
  id: string
  routeCode: string
  routeName: string
  productCode: string
  productName: string
  version: string
  status: string
  totalLeadTimeMinutes: number | null
  stepCount: number
}

export interface RouteDetail {
  id: string
  routeCode: string
  routeName: string
  productCode: string
  productName: string
  version: string
  status: string
  totalLeadTimeMinutes: number | null
  steps: RoutingStep[]
}

export interface RoutingStep {
  id: string
  stepSequence: number
  operationCode: string
  operationName: string
  workstationType: string
  standardSetupMinutes: number
  standardRunMinutesPerUnit: number
  equipmentType: string
  inspectionRequired: boolean
  parameters: StepParameter[]
}

export interface StepParameter {
  parameterCode: string
  parameterName: string
  defaultValue: string
  unit: string
  upperLimit: number | null
  lowerLimit: number | null
  isMandatory: boolean
}
