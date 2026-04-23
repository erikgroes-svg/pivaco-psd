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
  if (!d) return '—'
  return new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const avatarColors = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
]

function getColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
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
        confirming ? 'bg-red-100 text-red-700' : 'text-gray-300 hover:bg-red-50 hover:text-red-500'
      }`}
    >
      {deleting ? '...' : confirming ? 'Zeker?' : 'Verwijder'}
    </button>
  )
}

interface Props {
  groups: { created_by: string; projects: Project[] }[]
  userNames: Record<string, string>
  currentUserId: string
}

export default function GroupedDashboard({ groups, userNames, currentUserId }: Props) {
  return (
    <div className="space-y-8">
      {groups.map(({ created_by, projects }) => {
        const name = userNames[created_by] ?? 'Onbekend'
        const isMe = created_by === currentUserId
        const color = getColor(created_by)

        return (
          <div key={created_by}>
            {/* Gebruiker header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
                <span className="text-white text-xs font-bold">{getInitials(name)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{name}</span>
                {isMe && (
                  <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 rounded-full px-2 py-0.5 font-medium">
                    jij
                  </span>
                )}
                <span className="text-sm text-gray-400">
                  {projects.length} project{projects.length !== 1 ? 'en' : ''}
                </span>
              </div>
            </div>

            {/* Tabel */}
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-400 text-xs w-20">Nr</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-400 text-xs" style={{minWidth: '200px'}}>Projectnaam</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-400 text-xs">Klant</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-400 text-xs">Projectleider</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-400 text-xs">Start</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-400 text-xs">Einde</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-400 text-xs">Type</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-400 text-xs">Status</th>
                    <th className="px-4 py-2.5 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        {project.project_number ?? <span className="text-gray-200">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/projects/${project.id}`}
                          className="font-medium text-gray-900 hover:text-brand-600 transition-colors">
                          {project.project_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{project.customer_name}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {project.project_leader ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(project.start_date)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(project.end_date)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{typeLabel[project.project_type]}</td>
                      <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <DeleteButton projectId={project.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
