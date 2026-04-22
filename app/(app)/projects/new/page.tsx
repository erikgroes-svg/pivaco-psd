import Link from 'next/link'
import PsdForm from '@/components/psd/PsdForm'

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Dashboard
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-600 font-medium">Nieuwe PSD</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Nieuw Project Start Document</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vul de projectgegevens in, upload de offerte en eventuele aanvullende documenten.
        </p>
      </div>

      <PsdForm />
    </div>
  )
}
