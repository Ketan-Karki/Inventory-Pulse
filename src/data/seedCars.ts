import type { Car, Fuel } from '../types'

const MAKES = [
  'Maruti Suzuki',
  'Hyundai',
  'Honda',
  'Toyota',
  'Mahindra',
  'Tata',
  'Kia',
  'MG',
  'Volkswagen',
  'Skoda',
] as const

const MODELS: Record<(typeof MAKES)[number], string[]> = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Brezza', 'Ertiga', 'XL6'],
  Hyundai: ['Creta', 'Venue', 'i20', 'Verna', 'Alcazar', 'Ioniq 5'],
  Honda: ['City', 'Amaze', 'Elevate', 'Jazz'],
  Toyota: ['Innova Crysta', 'Fortuner', 'Glanza', 'Urban Cruiser'],
  Mahindra: ['XUV700', 'Scorpio N', 'Thar', 'Bolero', 'XUV300'],
  Tata: ['Nexon', 'Harrier', 'Safari', 'Punch', 'Altroz'],
  Kia: ['Seltos', 'Sonet', 'Carens', 'EV6'],
  MG: ['Hector', 'Astor', 'ZS EV', 'Gloster'],
  Volkswagen: ['Taigun', 'Virtus', 'Tiguan'],
  Skoda: ['Kushaq', 'Slavia', 'Kodiaq'],
}

const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Ahmedabad',
  'Kolkata',
] as const

const FUELS: Fuel[] = ['Petrol', 'Diesel', 'CNG', 'Electric']

/** Mulberry32 — deterministic “random” for reproducible seed data */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function padId(n: number): string {
  return String(n).padStart(5, '0')
}

export function buildCatalog(count: number, seed = 42): Car[] {
  const rnd = mulberry32(seed)
  const cars: Car[] = []

  for (let i = 0; i < count; i++) {
    const make = MAKES[Math.floor(rnd() * MAKES.length)]
    const models = MODELS[make]
    const model = models[Math.floor(rnd() * models.length)]
    const year = 2016 + Math.floor(rnd() * 9)
    const km = Math.floor(5000 + rnd() * 95000)
    const priceLakh = Math.round((3 + rnd() * 32) * 10) / 10
    const owners = 1 + Math.floor(rnd() * 3)
    const inspectionScore = Math.round(65 + rnd() * 34)
    const fuel = FUELS[Math.floor(rnd() * FUELS.length)]
    const city = CITIES[Math.floor(rnd() * CITIES.length)]

    cars.push({
      id: `SP-${padId(i + 1)}`,
      make,
      model,
      variant: `${['VXi', 'ZXi', 'SX', 'GTX', 'Platinum'][Math.floor(rnd() * 5)]} ${fuel === 'Electric' ? 'EV' : ''}`.trim(),
      year,
      priceLakh,
      km,
      city,
      fuel,
      owners,
      inspectionScore,
    })
  }

  return cars
}

export const NORMAL_CATALOG_SIZE = 56
export const STRESS_CATALOG_SIZE = 4000
