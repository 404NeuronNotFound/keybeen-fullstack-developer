import { useIsMobile } from '../../hooks';
import type { ContributionDay } from '../../hooks';

interface Props {
  days:    ContributionDay[];
  loading: boolean;
}

const CELL_MOBILE = 11; // px — fixed size on mobile (horizontal scroll)
const GAP         = 3;  // px
const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAY_LABELS: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

/** level 0 = no activity → level 4 = most active, mapped to Spotify green shades */
const LEVEL_COLORS: Record<number, string> = {
  0: 'var(--sp-dark3)',
  1: 'rgba(29,185,84,0.25)',
  2: 'rgba(29,185,84,0.5)',
  3: 'rgba(29,185,84,0.75)',
  4: 'var(--sp-green)',
};

type Cell = ContributionDay | null;

function buildWeeks(days: ContributionDay[]): Cell[][] {
  if (days.length === 0) return [];

  const firstDay = new Date(days[0].date).getDay(); // 0 = Sun
  const cells: Cell[] = [...Array(firstDay).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** For each week column, the short month label if a new month starts in it (else null) */
function buildMonthLabels(weeks: Cell[][]): (string | null)[] {
  let lastMonth = -1;
  return weeks.map((week) => {
    const firstReal = week.find((d) => d !== null);
    if (!firstReal) return null;
    const month = new Date(firstReal.date).getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      return MONTHS[month];
    }
    return null;
  });
}

function formatTooltipDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ContributionHeatmap({ days, loading }: Props) {
  const isMobile = useIsMobile();
  const weeks       = buildWeeks(days);
  const monthLabels = buildMonthLabels(weeks);
  const colCount    = Math.max(weeks.length, 1);

  const dayCell = (day: Cell, key: string) => (
    <div
      key={key}
      title={day ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatTooltipDate(day.date)}` : undefined}
      style={{
        width:        isMobile ? CELL_MOBILE : '100%',
        aspectRatio:  '1 / 1',
        borderRadius: 2,
        background:   day ? LEVEL_COLORS[day.level] : 'transparent',
      }}
    />
  );

  const grid = (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* month labels */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: isMobile ? `repeat(${colCount}, ${CELL_MOBILE}px)` : `repeat(${colCount}, minmax(0, 1fr))`,
          gap:                  GAP,
          height:               16,
          marginBottom:         GAP,
        }}
      >
        {weeks.map((_, i) => (
          <div key={i} style={{ fontSize: 10, color: 'var(--sp-gray)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {monthLabels[i]}
          </div>
        ))}
      </div>

      {/* day grid — column-major so each week is one column */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: isMobile ? `repeat(${colCount}, ${CELL_MOBILE}px)` : `repeat(${colCount}, minmax(0, 1fr))`,
          gridTemplateRows:    'repeat(7, auto)',
          gridAutoFlow:        'column',
          gap:                  GAP,
          opacity:              loading ? 0.4 : 1,
          transition:          'opacity .3s',
        }}
      >
        {weeks.flatMap((week, wi) => week.map((day, di) => dayCell(day, `${wi}-${di}`)))}
      </div>
    </div>
  );

  const weekdayColumn = (
    <div style={{ display: 'grid', gridTemplateRows: `16px repeat(7, 1fr)`, gap: GAP, flexShrink: 0, width: 28 }}>
      <div />
      {Array.from({ length: 7 }).map((_, row) => (
        <div key={row} style={{ display: 'flex', alignItems: 'center', fontSize: 10, color: 'var(--sp-gray)' }}>
          {WEEKDAY_LABELS[row] ?? ''}
        </div>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
        <div style={{ display: 'inline-flex', gap: 8, minWidth: colCount * (CELL_MOBILE + GAP) + 28 }}>
          {weekdayColumn}
          {grid}
        </div>
      </div>
    );
  }

  // ── Desktop: fluid grid that fills the card width ──────────────────────
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {weekdayColumn}
      {grid}
    </div>
  );
}