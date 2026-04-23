import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { getProjectsByUser } from '@/lib/db'
import DashboardTable from '@/components/psd/DashboardTable'

export default async function DashboardPage() {
  const { userId } = auth()
  const user = await currentUser()
  const projects = userId ? await getProjectsByUser(userId) : []

  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.emailAddresses?.[0]?.emailAddress ?? 'Gebruiker'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Project Start Documenten</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ingelogd als <span className="font-medium text-gray-700">{userName}</span>
            {' · '}
            {projects.length === 0
              ? 'Nog geen PSD\'s aangemaakt'
              : `${projects.length} project${projects.length !== 1 ? 'en' : ''}`}
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary">
          + Nieuwe PSD
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-4">Nog geen PSD's aangemaakt.</p>
          <Link href="/projects/new" className="btn-primary">Eerste PSD aanmaken</Link>
        </div>
      ) : (
        <DashboardTable projects={projects} />
      )}
    </div>
  )
}
