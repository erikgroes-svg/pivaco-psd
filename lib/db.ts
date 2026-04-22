import { neon } from '@neondatabase/serverless'
import type { Project, ProjectDetail, UploadedFile, PsdDocument } from '@/types'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Projects
export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const rows = await sql`
    SELECT * FROM projects
    WHERE created_by = ${userId}
    ORDER BY created_at DESC
  `
  return rows as Project[]
}

export async function getProjectById(id: string): Promise<ProjectDetail | null> {
  const projects = await sql`
    SELECT * FROM projects WHERE id = ${id}
  `
  if (!projects[0]) return null

  const files = await sql`
    SELECT * FROM uploaded_files WHERE project_id = ${id} ORDER BY uploaded_at ASC
  `
  const psds = await sql`
    SELECT * FROM psd_documents WHERE project_id = ${id} ORDER BY updated_at DESC LIMIT 1
  `

  return {
    ...(projects[0] as Project),
    psd: (psds[0] as PsdDocument) ?? null,
    files: files as UploadedFile[],
  }
}

export async function createProject(data: {
  project_number: string | null
  project_name: string
  customer_name: string
  project_type: string
  project_leader: string | null
  notes: string | null
  start_date: string | null
  end_date: string | null
  created_by: string
}): Promise<Project> {
  const rows = await sql`
    INSERT INTO projects (project_number, project_name, customer_name, project_type, project_leader, notes, start_date, end_date, created_by)
    VALUES (${data.project_number}, ${data.project_name}, ${data.customer_name}, ${data.project_type}, ${data.project_leader}, ${data.notes}, ${data.start_date}, ${data.end_date}, ${data.created_by})
    RETURNING *
  `
  return rows[0] as Project
}

export async function deleteProject(id: string): Promise<void> {
  await sql`DELETE FROM projects WHERE id = ${id}`
}

export async function updateProjectStatus(id: string, status: string): Promise<void> {
  await sql`UPDATE projects SET status = ${status} WHERE id = ${id}`
}

// Files
export async function insertUploadedFile(data: {
  project_id: string
  original_name: string
  mime_type: string
  extracted_text: string | null
}): Promise<UploadedFile> {
  const rows = await sql`
    INSERT INTO uploaded_files (project_id, original_name, mime_type, extracted_text)
    VALUES (${data.project_id}, ${data.original_name}, ${data.mime_type}, ${data.extracted_text})
    RETURNING *
  `
  return rows[0] as UploadedFile
}

// PSD Documents
export async function upsertPsdDocument(data: {
  project_id: string
  content_markdown: string
}): Promise<PsdDocument> {
  const rows = await sql`
    INSERT INTO psd_documents (project_id, content_markdown)
    VALUES (${data.project_id}, ${data.content_markdown})
    ON CONFLICT (project_id)
    DO UPDATE SET content_markdown = EXCLUDED.content_markdown, updated_at = NOW()
    RETURNING *
  `
  return rows[0] as PsdDocument
}

// Generation runs
export async function logGenerationRun(data: {
  project_id: string
  model_name: string
  prompt_version: string
  success: boolean
  error_message: string | null
}): Promise<void> {
  await sql`
    INSERT INTO generation_runs (project_id, model_name, prompt_version, success, error_message)
    VALUES (${data.project_id}, ${data.model_name}, ${data.prompt_version}, ${data.success}, ${data.error_message})
  `
}
