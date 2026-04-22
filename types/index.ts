export type ProjectType = 'small' | 'medium' | 'large'
export type ProjectStatus = 'draft' | 'generated' | 'error'

export interface Project {
  id: string
  project_number: string | null
  project_name: string
  customer_name: string
  project_type: ProjectType
  project_leader: string | null
  notes: string | null
  start_date: string | null
  end_date: string | null
  created_by: string
  created_at: string
  status: ProjectStatus
}

export interface UploadedFile {
  id: string
  project_id: string
  original_name: string
  mime_type: string
  extracted_text: string | null
  uploaded_at: string
}

export interface PsdDocument {
  id: string
  project_id: string
  content_markdown: string
  created_at: string
  updated_at: string
}

export interface GenerationRun {
  id: string
  project_id: string
  model_name: string
  prompt_version: string
  success: boolean
  error_message: string | null
  created_at: string
}

export interface ProjectDetail extends Project {
  psd: PsdDocument | null
  files: UploadedFile[]
}

export interface CreateProjectRequest {
  project_number?: string
  project_name: string
  customer_name: string
  project_type: ProjectType
  project_leader?: string
  notes?: string
  start_date?: string
  end_date?: string
}

export interface UploadFileResponse {
  file_id: string
  original_name: string
  extracted: boolean
}

export interface GenerateResponse {
  psd_id: string
  content_markdown: string
}
