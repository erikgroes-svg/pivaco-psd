import type { ProjectStatus } from '@/types'

const config: Record<ProjectStatus, { label: string; className: string }> = {
  draft: {
    label: 'Concept',
    className: 'bg-gray-100 text-gray-600',
  },
  generated: {
    label: 'Gegenereerd',
    className: 'bg-green-100 text-green-700',
  },
  error: {
    label: 'Fout',
    className: 'bg-red-100 text-red-700',
  },
}

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, className } = config[status] ?? config.draft
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
