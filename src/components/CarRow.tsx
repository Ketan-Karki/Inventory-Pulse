import { memo, useLayoutEffect } from 'react'
import type { Car } from '../types'

export type CarRowProps = {
  car: Car
  shortlist: boolean
  onToggleShortlist: (id: string) => void
  onRowPaint?: () => void
}

function CarRowInner({ car, shortlist, onToggleShortlist, onRowPaint }: CarRowProps) {
  useLayoutEffect(() => {
    onRowPaint?.()
  })

  const title = `${car.year} ${car.make} ${car.model}`
  const sub = `${car.km.toLocaleString('en-IN')} km · ${car.city}`

  return (
    <article className="car-row car-row--glass">
      <div className="car-row__main">
        <div className="car-row__title">{title}</div>
        <div className="car-row__meta">{sub}</div>
      </div>
      <div className="car-row__side">
        <div className="car-row__price">₹{car.priceLakh.toFixed(1)} L</div>
        <button
          type="button"
          className={shortlist ? 'btn btn--primary' : 'btn btn--secondary'}
          onClick={() => onToggleShortlist(car.id)}
          aria-label={shortlist ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          {shortlist ? '★' : '+'}
        </button>
      </div>
    </article>
  )
}

export const CarRow = memo(CarRowInner)
export const CarRowUnmemoized = CarRowInner
