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
  if (!d) return <span className="text-gray-300">—</span>
  return new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function DeleteButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    setDeleting(true)
    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        confirming
          ? 'bg-red-100 text-red-700'
          : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
      }`}
    >
      {deleting ? '...' : confirming ? 'Zeker?' : 'Verwijder'}
    </button>
  )
}

export default function DashboardTable({ projects }: { projects: Project[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-500 w-24">Nr</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500" style={{width: '280px'}}>Projectnaam</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Klant</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Projectleider</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Start</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Einde</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Aangemaakt</th>
            <th className="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-4 py-3 font-mono text-xs text-gray-400">
                {project.project_number ?? <span className="text-gray-200">—</span>}
              </td>
              <td className="px-4 py-3">
                <Link href={`/projects/${project.id}`} className="font-medium text-gray-900 hover:text-brand-600 transition-colors">
                  {project.project_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{project.customer_name}</td>
              <td className="px-4 py-3 text-gray-600">
                {project.project_leader ?? <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(project.start_date)}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(project.end_date)}</td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{typeLabel[project.project_type]}</td>
              <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
              <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                {new Date(project.created_at).toLocaleDateString('nl-BE', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <DeleteButton projectId={project.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
