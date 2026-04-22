import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getProjectById, upsertPsdDocument, updateProjectStatus, logGenerationRun } from '@/lib/db'
import { generatePsd } from '@/lib/ai'
import { MODEL_NAME, PROMPT_VERSION } from '@/lib/prompts'

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { project_id } = await request.json()
  if (!project_id) {
    return NextResponse.json({ error: 'project_id is verplicht' }, { status: 400 })
  }

  // Project + bestanden ophalen
  const project = await getProjectById(project_id)
  if (!project) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 })
  if (project.created_by !== userId) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  if (project.files.length === 0) {
    return NextResponse.json(
      { error: 'Upload eerst minstens één document voordat je een PSD genereert.' },
      { status: 400 }
    )
  }

  // Claude aanroepen
  const result = await generatePsd(project, project.files)

  if (!result.success) {
    await updateProjectStatus(project_id, 'error')
    await logGenerationRun({
      project_id,
      model_name: MODEL_NAME,
      prompt_version: PROMPT_VERSION,
      success: false,
      error_message: result.error,
    })
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  // PSD opslaan
  const psd = await upsertPsdDocument({
    project_id,
    content_markdown: result.markdown,
  })

  await updateProjectStatus(project_id, 'generated')
  await logGenerationRun({
    project_id,
    model_name: MODEL_NAME,
    prompt_version: PROMPT_VERSION,
    success: true,
    error_message: null,
  })

  return NextResponse.json({
    psd_id: psd.id,
    content_markdown: psd.content_markdown,
  })
}
