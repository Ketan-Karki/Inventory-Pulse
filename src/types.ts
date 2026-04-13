export type Fuel = 'Petrol' | 'Diesel' | 'CNG' | 'Electric'

export type Car = {
  id: string
  make: string
  model: string
  variant: string
  year: number
  priceLakh: number
  km: number
  city: string
  fuel: Fuel
  owners: number
  inspectionScore: number
}

/** Four switches — each maps to one idea in the UI copy. */
export type LabFlags = {
  stress: boolean
  /** React.memo (rows) + stable shortlist callback — list derivation always memoized on inputs */
  smartRendering: boolean
  virtualize: boolean
  deferSearch: boolean
}
