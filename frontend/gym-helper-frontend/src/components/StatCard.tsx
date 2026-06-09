interface StatCardProps {
  label: string
  value: string | number
  sub?: string
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="flex-1 rounded-[14px] bg-(--surface) px-4 py-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">{label}</p>
      <p className="mt-2 text-[30px] font-bold leading-none tracking-tight text-(--text-h)">{value}</p>
      {sub && <p className="mt-1.5 text-[12px] text-(--text-muted)">{sub}</p>}
    </div>
  )
}
