CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('small', 'medium', 'large')),
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'error'))
);

CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  extracted_text TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE psd_documents (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_markdown TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT psd_documents_project_id_unique UNIQUE (project_id)
);

CREATE TABLE generation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_uploaded_files_project_id ON uploaded_files(project_id);
CREATE INDEX idx_psd_documents_project_id ON psd_documents(project_id);
CREATE INDEX idx_generation_runs_project_id ON generation_runs(project_id);
