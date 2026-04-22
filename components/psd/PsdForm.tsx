'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/ui/FileUpload'
import type { ProjectType } from '@/types'

export default function PsdForm() {
  const router = useRouter()

  const [projectNumber, setProjectNumber] = useState('')
  const [projectName, setProjectName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('medium')
  const [projectLeader, setProjectLeader] = useState('')
  const [notes, setNotes] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [projectId, setProjectId] = useState<string | null>(null)
  const [fileCount, setFileCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateProject() {
    setError(null)
    if (!projectName.trim() || !customerName.trim()) {
      setError('Projectnaam en klantnaam zijn verplicht.')
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_number: projectNumber.trim() || undefined,
          project_name: projectName.trim(),
          customer_name: customerName.trim(),
          project_type: projectType,
          project_leader: projectLeader.trim() || undefined,
          notes: notes.trim() || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Fout bij aanmaken project.')
        return
      }
      setProjectId(data.id)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleGenerate() {
    if (!projectId) return
    setError(null)
    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Fout bij genereren PSD.')
        return
      }
      router.push(`/projects/${projectId}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <section className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Projectgegevens</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Projectnummer <span className="text-gray-400 font-normal">(optioneel)</span></label>
            <input className="input" value={projectNumber} onChange={(e) => setProjectNumber(e.target.value)}
              placeholder="bv. 2024-042" disabled={!!projectId} />
          </div>
          <div>
            <label className="label">Projectleider <span className="text-gray-400 font-normal">(optioneel)</span></label>
            <input className="input" value={projectLeader} onChange={(e) => setProjectLeader(e.target.value)}
              placeholder="bv. Jan Janssen" disabled={!!projectId} />
          </div>
        </div>

        <div>
          <label className="label">Projectnaam *</label>
          <input className="input" value={projectName} onChange={(e) => setProjectName(e.target.value)}
            placeholder="bv. Installatie koelwaterleidingen Unit 4" disabled={!!projectId} />
        </div>

        <div>
          <label className="label">Klantnaam *</label>
          <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
            placeholder="bv. BASF Antwerpen" disabled={!!projectId} />
        </div>

        <div>
          <label className="label">Projecttype *</label>
          <select className="input" value={projectType} onChange={(e) => setProjectType(e.target.value as ProjectType)} disabled={!!projectId}>
            <option value="small">Klein (&lt; €50k)</option>
            <option value="medium">Middelgroot (€50k – €500k)</option>
            <option value="large">Groot (&gt; €500k)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Gewenste startdatum <span className="text-gray-400 font-normal">(optioneel)</span></label>
            <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={!!projectId} />
          </div>
          <div>
            <label className="label">Gewenste einddatum <span className="text-gray-400 font-normal">(optioneel)</span></label>
            <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!!projectId} />
          </div>
        </div>

        <div>
          <label className="label">Opmerking van sales <span className="text-gray-400 font-normal">(optioneel)</span></label>
          <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Aandachtspunten, speciale afspraken, context voor de projectverantwoordelijke..."
            disabled={!!projectId} />
        </div>

        {!projectId && (
          <button className="btn-primary" onClick={handleCreateProject}
            disabled={isCreating || !projectName.trim() || !customerName.trim()}>
            {isCreating ? 'Aanmaken...' : 'Project aanmaken & doorgaan →'}
          </button>
        )}

        {projectId && (
          <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Project aangemaakt — upload nu je documenten
          </p>
        )}
      </section>

      {projectId && (
        <section className="card p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Documenten uploaden</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload eerst de <strong>offerte</strong> (primaire bron), daarna eventuele aanvullende documenten.
            </p>
          </div>
          <FileUpload projectId={projectId} onUploadComplete={() => setFileCount((n) => n + 1)} />
        </section>
      )}

      {projectId && (
        <section className="space-y-3">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <button className="btn-primary w-full justify-center py-3 text-base"
            onClick={handleGenerate} disabled={isGenerating || fileCount === 0}>
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                PSD wordt gegenereerd...
              </>
            ) : '⚡ Genereer PSD'}
          </button>
          {fileCount === 0 && (
            <p className="text-xs text-center text-gray-400">Upload minstens één document om te genereren.</p>
          )}
        </section>
      )}
    </div>
  )
}
