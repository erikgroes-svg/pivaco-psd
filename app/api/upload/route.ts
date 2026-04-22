import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getProjectById, insertUploadedFile } from '@/lib/db'
import { extractText, isSupportedType, MAX_FILE_SIZE_BYTES } from '@/lib/files'

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const formData = await request.formData()
  const projectId = formData.get('project_id') as string
  const file = formData.get('file') as File | null

  if (!projectId || !file) {
    return NextResponse.json({ error: 'project_id en file zijn verplicht' }, { status: 400 })
  }

  // Eigenaarschap controleren
  const project = await getProjectById(projectId)
  if (!project) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 })
  if (project.created_by !== userId) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  // Bestandsgrootte
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Bestand te groot. Maximum is 10 MB.` },
      { status: 400 }
    )
  }

  // Bestandstype
  const mimeType = file.type
  if (!isSupportedType(mimeType)) {
    return NextResponse.json(
      {
        error: `Bestandstype niet ondersteund: ${mimeType}. Gebruik PDF, DOCX of TXT.`,
      },
      { status: 400 }
    )
  }

  // Tekst extraheren
  const buffer = Buffer.from(await file.arrayBuffer())
  const { text, error: extractError } = await extractText(buffer, mimeType)

  if (extractError) {
    // Bestand opslaan maar zonder tekst — gebruiker wordt geïnformeerd
    const uploaded = await insertUploadedFile({
      project_id: projectId,
      original_name: file.name,
      mime_type: mimeType,
      extracted_text: null,
    })
    return NextResponse.json({
      file_id: uploaded.id,
      original_name: file.name,
      extracted: false,
      warning: extractError,
    })
  }

  const uploaded = await insertUploadedFile({
    project_id: projectId,
    original_name: file.name,
    mime_type: mimeType,
    extracted_text: text,
  })

  return NextResponse.json({
    file_id: uploaded.id,
    original_name: file.name,
    extracted: true,
  })
}
