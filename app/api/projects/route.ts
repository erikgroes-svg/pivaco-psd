import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getProjectsByUser, createProject } from '@/lib/db'
import type { CreateProjectRequest } from '@/types'

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const projects = await getProjectsByUser(userId)
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body: CreateProjectRequest = await request.json()

  if (!body.project_name?.trim()) {
    return NextResponse.json({ error: 'Projectnaam is verplicht' }, { status: 400 })
  }
  if (!body.customer_name?.trim()) {
    return NextResponse.json({ error: 'Klantnaam is verplicht' }, { status: 400 })
  }
  if (!['small', 'medium', 'large'].includes(body.project_type)) {
    return NextResponse.json({ error: 'Ongeldig projecttype' }, { status: 400 })
  }

  const project = await createProject({
    project_number: body.project_number?.trim() || null,
    project_name: body.project_name.trim(),
    customer_name: body.customer_name.trim(),
    project_type: body.project_type,
    project_leader: body.project_leader?.trim() || null,
    notes: body.notes?.trim() || null,
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    created_by: userId,
  })

  return NextResponse.json(project, { status: 201 })
}
