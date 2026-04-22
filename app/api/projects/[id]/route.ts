import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getProjectById, deleteProject } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const project = await getProjectById(params.id)
  if (!project) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 })
  if (project.created_by !== userId) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  return NextResponse.json(project)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const project = await getProjectById(params.id)
  if (!project) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 })
  if (project.created_by !== userId) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  await deleteProject(params.id)
  return NextResponse.json({ success: true })
}
