import type { Car } from '../types'

/** Synchronous CPU work used to simulate heavy catalog processing (inspection scoring, etc.). */
export function syntheticInspectionPass(car: Car, iterations = 320): number {
  let x = car.km * 0.0001 + car.year * 0.01 + car.priceLakh
  for (let i = 0; i < iterations; i++) {
    x = Math.sin(x * 0.03) * Math.cos(i * 0.017) + Math.sqrt(Math.abs(car.inspectionScore + i * 0.001))
  }
  return x
}
