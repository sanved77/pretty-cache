import { MONO } from './constants'

export function DayProgressRing({ pct }: { pct: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={r} fill="none" stroke="#21262d" strokeWidth={4} />
      <circle
        cx={24}
        cy={24}
        r={r}
        fill="none"
        stroke="#22c55e"
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text
        x={24}
        y={24}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#e6edf3"
        fontSize={11}
        fontFamily={MONO}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  )
}
