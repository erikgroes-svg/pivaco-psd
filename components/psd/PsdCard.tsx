'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge'

const typeLabel: Record<string, string> = {
  small: 'Klein',
  medium: 'Middelgroot',
  large: 'Groot',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PsdCard({ project }: { project: Project }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const createdAt = new Date(project.created_at).toLocaleDateString('nl-BE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    setDeleting(true)
    await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="card p-4 hover:shadow-md transition-shadow relative group">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {project.project_number && (
                <span className="text-xs font-mono text-gray-400 shrink-0">{project.project_number}</span>
              )}
              <p className="font-semibold text-gray-900 truncate">{project.project_name}</p>
            </div>
            <p className="text-sm text-gray-500 truncate mt-0.5">{project.customer_name}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-3 space-y-1">
          {project.project_leader && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {project.project_leader}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{typeLabel[project.project_type]}</span>
            {(project.start_date || project.end_date) && <span>·</span>}
            {project.start_date && <span>Start: {formatDate(project.start_date)}</span>}
            {project.end_date && <span>Einde: {formatDate(project.end_date)}</span>}
            <span>·</span>
            <span>{createdAt}</span>
          </div>
        </div>
      </Link>

      {/* Verwijder knop */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 text-xs font-medium ${
          confirming
            ? 'bg-red-100 text-red-700 opacity-100'
            : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
        }`}
        title={confirming ? 'Klik nogmaals om te bevestigen' : 'Verwijderen'}
      >
        {deleting ? '...' : confirming ? 'Zeker?' : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </div>
  )
}
