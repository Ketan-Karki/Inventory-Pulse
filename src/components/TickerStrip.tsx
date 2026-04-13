import { useEffect, useState } from 'react'

type Props = {
  intervalMs: number
}

/**
 * Colocated live counter — only this subtree re-renders on the timer.
 */
export function TickerStrip({ intervalMs }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return (
    <div
      className="ticker-strip"
      title="State lives in this component only. The rest of the page does not re-render when Pulse changes."
    >
      <span className="ticker-strip__dot" aria-hidden />
      <span className="ticker-strip__k">Pulse</span>
      <span className="ticker-strip__v" aria-live="polite">
        {tick}
      </span>
    </div>
  )
}
