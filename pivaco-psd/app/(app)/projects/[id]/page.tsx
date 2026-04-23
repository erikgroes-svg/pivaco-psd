import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getProjectById } from '@/lib/db'
import PsdPreview from '@/components/psd/PsdPreview'
import StatusBadge from '@/components/ui/StatusBadge'
import RegenerateButton from './RegenerateButton'
import CopyButton from './CopyButton'
import DownloadButtons from '@/components/psd/DownloadButtons'

const typeLabel: Record<string, string> = {
  small: 'Klein project',
  medium: 'Middelgroot project',
  large: 'Groot project',
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const project = await getProjectById(params.id)
  if (!project) notFound()
  // alle ingelogde gebruikers mogen projecten bekijken

  const date = new Date(project.created_at).toLocaleDateString('nl-BE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Dashboard
            </Link>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{project.project_name}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
            <span>{project.customer_name}</span>
            <span>·</span>
            <span>{typeLabel[project.project_type]}</span>
            <span>·</span>
            <span>{date}</span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Acties */}
        <div className="flex items-center gap-2 shrink-0">
          {project.psd && <DownloadButtons markdown={project.psd.content_markdown} projectName={project.project_name} customerName={project.customer_name} />}
          {project.psd && <CopyButton markdown={project.psd.content_markdown} />}
          <RegenerateButton projectId={project.id} />
        </div>
      </div>

      {/* Bronbestanden */}
      {project.files.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Bronbestanden ({project.files.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {project.files.map((f) => (
              <span
                key={f.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border ${
                  f.extracted_text
                    ? 'bg-gray-50 border-gray-200 text-gray-600'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {f.original_name}
                {!f.extracted_text && ' ⚠️'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PSD Preview */}
      {project.psd ? (
        <PsdPreview markdown={project.psd.content_markdown} />
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            {project.status === 'error'
              ? 'De laatste generatie is mislukt. Probeer opnieuw.'
              : 'Nog geen PSD gegenereerd voor dit project.'}
          </p>
          <RegenerateButton projectId={project.id} label="Genereer PSD" />
        </div>
      )}
    </div>
  )
}
