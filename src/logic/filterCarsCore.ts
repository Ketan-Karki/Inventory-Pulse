import { syntheticInspectionPass } from '../data/expensive'
import type { Car } from '../types'

/** `runInspectionPass` — synthetic CPU-heavy per-row pass (stress / worker scenarios). */
export function computeFiltered(
  cars: Car[],
  query: string,
  runInspectionPass: boolean,
): Car[] {
  const q = query.trim().toLowerCase()
  let list = !q
    ? cars
    : cars.filter(
        (c) =>
          `${c.make} ${c.model} ${c.city} ${c.variant}`
            .toLowerCase()
            .includes(q) || c.id.toLowerCase().includes(q),
      )

  if (runInspectionPass) {
    list = list.map((car) => {
      syntheticInspectionPass(car)
      return car
    })
  }

  return list
}
