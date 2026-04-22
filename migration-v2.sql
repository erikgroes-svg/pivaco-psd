-- V2 migratie: projectnummer en projectleider toevoegen
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_number TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_leader TEXT;
