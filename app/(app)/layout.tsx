import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">PV</span>
          </div>
          <span className="font-semibold text-gray-900">PSD Generator</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
