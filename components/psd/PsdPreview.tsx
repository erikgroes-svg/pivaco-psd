'use client'

import ReactMarkdown from 'react-markdown'

export default function PsdPreview({ markdown }: { markdown: string }) {
  return (
    <div className="psd-preview bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  )
}
