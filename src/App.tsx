import {
  Fragment,
  useCallback,
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties } from 'react'
import { List } from 'react-window'
import { buildCatalog, NORMAL_CATALOG_SIZE, STRESS_CATALOG_SIZE } from './data/seedCars'
import { usePerfLog } from './hooks/usePerfLog'
import { computeFiltered } from './logic/filterCars'
import type { Car, LabFlags } from './types'
import { CarRow, CarRowUnmemoized } from './components/CarRow'
import { PerfCharts } from './components/PerfCharts'
import { TickerStrip } from './components/TickerStrip'
import { Toggle } from './components/Toggle'

/** Must match `--row-h` / `.car-row--glass` in CSS */
const ROW_HEIGHT = 76

type VirtualRowExtra = {
  cars: Car[]
  shortlist: Record<string, boolean>
  onToggleShortlist: (id: string) => void
  RowImpl: typeof CarRow | typeof CarRowUnmemoized
  onRowPaint: () => void
}

type VirtualRowProps = VirtualRowExtra & {
  index: number
  style: CSSProperties
  ariaAttributes: {
    'aria-posinset': number
    'aria-setsize': number
    role: 'listitem'
  }
}

function VirtualCatalogRow({
  index,
  style,
  ariaAttributes,
  cars,
  shortlist,
  onToggleShortlist,
  RowImpl,
  onRowPaint,
}: VirtualRowProps) {
  const car = cars[index]
  if (!car) return null
  return (
    <div style={style} {...ariaAttributes} className="virtual-row">
      <RowImpl
        car={car}
        shortlist={!!shortlist[car.id]}
        onToggleShortlist={onToggleShortlist}
        onRowPaint={onRowPaint}
      />
    </div>
  )
}

const defaultFlags: LabFlags = {
  stress: false,
  smartRendering: true,
  virtualize: false,
  deferSearch: false,
}

export default function App() {
  const { samples, beginRender, noteRowRender } = usePerfLog(400)
  beginRender()

  const [flags, setFlags] = useState<LabFlags>(defaultFlags)
  const [search, setSearch] = useState('')

  const deferredSearch = useDeferredValue(search)
  const filterQuery = flags.deferSearch ? deferredSearch : search

  const cars = useMemo(
    () => buildCatalog(flags.stress ? STRESS_CATALOG_SIZE : NORMAL_CATALOG_SIZE),
    [flags.stress],
  )

  const runInspection = flags.stress

  const filteredCars = useMemo(
    () => computeFiltered(cars, filterQuery, runInspection),
    [cars, filterQuery, runInspection],
  )

  const [shortlist, setShortlist] = useState<Record<string, boolean>>({})

  const toggleStable = useCallback((id: string) => {
    setShortlist((s) => ({ ...s, [id]: !s[id] }))
  }, [])

  const toggleUnstable = (id: string) => {
    setShortlist((s) => ({ ...s, [id]: !s[id] }))
  }

  const onToggleShortlist = flags.smartRendering ? toggleStable : toggleUnstable
  const RowImpl = flags.smartRendering ? CarRow : CarRowUnmemoized

  const virtualRowProps: VirtualRowExtra = useMemo(
    () => ({
      cars: filteredCars,
      shortlist,
      onToggleShortlist,
      RowImpl,
      onRowPaint: noteRowRender,
    }),
    [filteredCars, shortlist, onToggleShortlist, RowImpl, noteRowRender],
  )

  const canVirtualize = flags.stress || filteredCars.length >= 120

  const listWrapRef = useRef<HTMLDivElement>(null)
  const [listViewportPx, setListViewportPx] = useState(320)

  useLayoutEffect(() => {
    const el = listWrapRef.current
    if (!el) return

    const measure = () => {
      const h = el.getBoundingClientRect().height
      if (h > 0) {
        const nh = Math.max(Math.floor(h), 120)
        setListViewportPx((prev) => (prev === nh ? prev : nh))
      }
    }

    measure()
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0
      if (h > 0) {
        const nh = Math.max(Math.floor(h), 120)
        setListViewportPx((prev) => (prev === nh ? prev : nh))
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [flags.virtualize, flags.stress, filteredCars.length, search])

  return (
    <Fragment>
      <div className="app-bg" aria-hidden />
      <div className="shell">
        <header className="topbar glass-panel glass-panel--hero">
        <div className="topbar__copy">
          <p className="topbar__eyebrow">Performance lab</p>
          <h1 className="topbar__title">Inventory pulse</h1>
          <p className="topbar__sub">
            Four switches, one viewport. Watch commit cost and row paints respond — built for demos,
            tuned like a product surface.
          </p>
        </div>
          <TickerStrip intervalMs={flags.stress ? 1000 : 800} />
        </header>

        <section className="metrics-row glass-panel" aria-label="Metrics">
        <div className="metric-pill">
          <span className="metric-pill__label">Samples</span>
          <span className="metric-pill__value">{samples.length}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-pill__label">Loaded</span>
          <span className="metric-pill__value">{cars.length.toLocaleString('en-IN')}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-pill__label">Matches</span>
          <span className="metric-pill__value">{filteredCars.length.toLocaleString('en-IN')}</span>
        </div>
        </section>

        <PerfCharts samples={samples} />

        <div className="layout layout--fill">
          <aside className="rail glass-panel" aria-label="Controls">
          <p className="rail__heading">Controls</p>
          <Toggle
            id="stress"
            label="Heavy load"
            hint="Big catalog + CPU-heavy inspection pass on the filtered list."
            checked={flags.stress}
            onChange={(v) => setFlags((f) => ({ ...f, stress: v }))}
            variant="danger"
          />
          <Toggle
            id="smart"
            label="Smart rendering"
            hint="React.memo rows + stable shortlist handler. Filtered list is always memoized on inputs."
            checked={flags.smartRendering}
            onChange={(v) => setFlags((f) => ({ ...f, smartRendering: v }))}
          />
          <Toggle
            id="virt"
            label="Virtual list"
            hint="Only visible rows mount (needs a long list)."
            checked={flags.virtualize}
            onChange={(v) => setFlags((f) => ({ ...f, virtualize: v }))}
            disabled={!canVirtualize}
          />
          <Toggle
            id="defer"
            label="Defer search"
            hint="useDeferredValue — typing stays ahead of the list."
            checked={flags.deferSearch}
            onChange={(v) => setFlags((f) => ({ ...f, deferSearch: v }))}
          />
          </aside>

          <section className="catalog glass-panel catalog--fill" aria-label="List">
            <div className="catalog__toolbar">
            <label className="field field--glass">
              <span className="field__label">Search inventory</span>
              <input
                className="field__input"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Make, model, city…"
                autoComplete="off"
              />
            </label>
            {flags.deferSearch && search !== deferredSearch ? (
              <span className="catalog__pending">Catching up…</span>
            ) : null}
            </div>

            {flags.stress && !flags.virtualize && filteredCars.length > 200 ? (
            <p className="catalog__warn" role="status">
              Full DOM ({filteredCars.length.toLocaleString('en-IN')} rows) — enable{' '}
              <strong>Virtual list</strong> for smooth scrolling.
            </p>
            ) : null}

            <div ref={listWrapRef} className="catalog__list-wrap">
            {flags.virtualize ? (
              <List
                rowCount={filteredCars.length}
                rowHeight={ROW_HEIGHT}
                rowComponent={VirtualCatalogRow}
                rowProps={virtualRowProps}
                overscanCount={4}
                className="virtual-list-root"
                style={{
                  height: listViewportPx,
                  width: '100%',
                  minWidth: 0,
                }}
              />
            ) : (
              <div className="catalog__list native-scroll" role="list">
                {filteredCars.map((car) => (
                  <div key={car.id} role="listitem">
                    <RowImpl
                      car={car}
                      shortlist={!!shortlist[car.id]}
                      onToggleShortlist={onToggleShortlist}
                      onRowPaint={noteRowRender}
                    />
                  </div>
                ))}
              </div>
            )}
            </div>
          </section>
        </div>

        <footer className="footer">
        Pulse is isolated in its pill — it does not re-render the chart or list. Strict Mode off for
        predictable counts.
        </footer>
      </div>
    </Fragment>
  )
}
