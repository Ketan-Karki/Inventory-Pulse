import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const MAX_POINTS = 48

export type PerfPoint = {
  t: number
  commitMs: number
  rowRenders: number
}

/**
 * Records one sample per real commit; skips commits that exist only to mirror
 * ref data into React state for the chart (avoids polluting the series).
 */
export function usePerfLog(refreshMs = 320) {
  const samplesRef = useRef<PerfPoint[]>([])
  const renderStart = useRef(0)
  const rowRenders = useRef(0)
  const skipNextRecord = useRef(false)

  const [samples, setSamples] = useState<PerfPoint[]>([])

  /** Stable identity so memoized rows aren’t invalidated every parent render. */
  const beginRender = useCallback(() => {
    renderStart.current = performance.now()
  }, [])

  const noteRowRender = useCallback(() => {
    rowRenders.current += 1
  }, [])

  useLayoutEffect(() => {
    if (skipNextRecord.current) {
      skipNextRecord.current = false
      rowRenders.current = 0
      return
    }
    const commitMs = performance.now() - renderStart.current
    const rr = rowRenders.current
    rowRenders.current = 0
    samplesRef.current = [
      ...samplesRef.current,
      { t: Date.now(), commitMs, rowRenders: rr },
    ].slice(-MAX_POINTS)
  })

  useEffect(() => {
    const id = window.setInterval(() => {
      skipNextRecord.current = true
      setSamples(samplesRef.current.slice())
    }, refreshMs)
    return () => window.clearInterval(id)
  }, [refreshMs])

  return { samples, beginRender, noteRowRender }
}
