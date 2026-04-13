import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PerfPoint } from '../hooks/usePerfLog'

type Props = {
  samples: PerfPoint[]
}

export function PerfCharts({ samples }: Props) {
  const data = useMemo(
    () =>
      samples.map((p, i) => ({
        i: i + 1,
        ms: Math.round(p.commitMs * 10) / 10,
        rows: p.rowRenders,
      })),
    [samples],
  )

  const last = samples[samples.length - 1]

  return (
    <div className="charts glass-panel">
      <div className="charts__meta">
        {last ? (
          <>
            Commit <strong>{last.commitMs.toFixed(0)} ms</strong>
            <span className="charts__sep">·</span>
            Row paints <strong>{last.rowRenders}</strong>
          </>
        ) : (
          <span style={{ color: 'var(--ink-tertiary)' }}>Collecting…</span>
        )}
      </div>
      <div className="charts__plot">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillMs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64d2ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#64d2ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis
              yAxisId="ms"
              width={36}
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="rows"
              orientation="right"
              width={32}
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(20,22,30,0.92)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                fontSize: 12,
                backdropFilter: 'blur(12px)',
              }}
              formatter={(value, name) => [value ?? '—', name === 'ms' ? 'ms' : 'rows']}
            />
            <Area
              yAxisId="ms"
              type="monotone"
              dataKey="ms"
              name="ms"
              stroke="#64d2ff"
              strokeWidth={1.5}
              fill="url(#fillMs)"
              isAnimationActive={false}
            />
            <Area
              yAxisId="rows"
              type="monotone"
              dataKey="rows"
              name="rows"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1}
              fill="none"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
