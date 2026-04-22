'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadedFileItem {
  name: string
  status: 'uploading' | 'done' | 'error' | 'warn'
  message?: string
}

interface FileUploadProps {
  projectId: string
  onUploadComplete: () => void
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
}

export default function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFileItem[]>([])

  const uploadFile = useCallback(
    async (file: File) => {
      setFiles((prev) => [...prev, { name: file.name, status: 'uploading' }])

      const formData = new FormData()
      formData.append('project_id', projectId)
      formData.append('file', file)

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: 'error', message: data.error } : f
            )
          )
          return
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? {
                  ...f,
                  status: data.extracted ? 'done' : 'warn',
                  message: data.warning,
                }
              : f
          )
        )
        onUploadComplete()
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, status: 'error', message: 'Uploadfout' }
              : f
          )
        )
      }
    },
    [projectId, onUploadComplete]
  )

  const onDrop = useCallback(
    (accepted: File[]) => {
      accepted.forEach(uploadFile)
    },
    [uploadFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Laat los om te uploaden' : 'Sleep bestanden hierheen of klik om te selecteren'}
          </p>
          <p className="text-xs text-gray-400">PDF, DOCX, TXT — max 10 MB per bestand</p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-start gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
              <FileIcon status={f.status} />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-800">{f.name}</p>
                {f.message && (
                  <p className={`text-xs mt-0.5 ${f.status === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                    {f.message}
                  </p>
                )}
              </div>
              <StatusIcon status={f.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FileIcon({ status }: { status: UploadedFileItem['status'] }) {
  const color = status === 'error' ? 'text-red-400' : 'text-gray-400'
  return (
    <svg className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function StatusIcon({ status }: { status: UploadedFileItem['status'] }) {
  if (status === 'uploading') {
    return <svg className="w-4 h-4 animate-spin text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  }
  if (status === 'done') {
    return <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  }
  if (status === 'warn') {
    return <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  }
  if (status === 'error') {
    return <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  }
  return null
}
