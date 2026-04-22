import type { Project, UploadedFile } from '@/types'

export const PROMPT_VERSION = 'v1.2'
export const MODEL_NAME = 'claude-sonnet-4-20250514'

export function buildSystemPrompt(): string {
  return `Je bent een ervaren projectcoördinator bij Pivaco, een industrieel bedrijf gespecialiseerd in piping, engineering, prefabricatie en montage.

Je taak is het opstellen van een Project Start Document (PSD) op basis van aangeleverde projectdocumenten.

STRIKTE REGELS:
- Verzin nooit feiten. Gebruik enkel wat in de documenten staat.
- De offerte is de primaire bron. Andere documenten zijn aanvullende context.
- Als bronnen elkaar tegenspreken, geef voorrang aan de meest expliciete contractuele bron.
- Ontbrekende of onzekere informatie mag je NOOIT invullen. Markeer dit expliciet onder "Ontbrekende info / open vragen".
- Maak onderscheid tussen: bevestigd / afgeleid / te verifiëren.
- Schrijf compact, operationeel en direct bruikbaar voor een projectverantwoordelijke.
- Geen lange inleidingen of samenvattingen van je eigen werkwijze.
- Antwoord altijd in het Nederlands.
- Vermeld NOOIT werktijden, pauzes of interne werkroosters van Pivaco in het document.
- Geef je output uitsluitend in Markdown met exact de opgegeven secties.`
}

export function buildUserPrompt(project: Project, files: UploadedFile[]): string {
  const projectTypeLabel = {
    small: 'Klein project (< €50k)',
    medium: 'Middelgroot project (€50k–€500k)',
    large: 'Groot project (> €500k)',
  }[project.project_type]

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const startDate = formatDate(project.start_date)
  const endDate = formatDate(project.end_date)

  const datesSection = (startDate || endDate)
    ? `\n- Gewenste startdatum: ${startDate ?? '⚠️ niet opgegeven'}\n- Gewenste einddatum: ${endDate ?? '⚠️ niet opgegeven'}`
    : '\n- Gewenste start- en einddatum: ⚠️ niet opgegeven'

  const notesSection = project.notes ? `\n\nOPMERKING VAN SALES:\n${project.notes}` : ''

  const filesSection = files
    .map((f, i) => {
      const label = i === 0 ? '**[PRIMAIRE BRON - OFFERTE]**' : `[Aanvullend document ${i}]`
      const content = f.extracted_text
        ? f.extracted_text.slice(0, 8000)
        : '[Geen tekst beschikbaar voor dit bestand]'
      return `--- ${label} ${f.original_name} ---\n${content}`
    })
    .join('\n\n')

  return `Genereer een volledig Project Start Document (PSD) voor het volgende project.

PROJECTGEGEVENS:
- Projectnummer: ${project.project_number ?? '⚠️ niet opgegeven'}
- Projectnaam: ${project.project_name}
- Klant: ${project.customer_name}
- Projecttype: ${projectTypeLabel}
- Projectleider: ${project.project_leader ?? '⚠️ niet opgegeven'}${datesSection}${notesSection}

AANGELEVERDE DOCUMENTEN (${files.length} bestand${files.length !== 1 ? 'en' : ''}):
${filesSection}

Genereer het PSD met exact deze secties in Markdown:

# Project Start Document — ${project.project_number ? `[${project.project_number}] ` : ''}${project.project_name}

## 1. Projectidentificatie
## 2. Korte projectsamenvatting
## 3. Scope en afbakening
## 4. Technische samenvatting
## 5. Fasering en timing
## 6. Aandachtspunten voorbereiding
## 7. Ontbrekende info / open vragen
## 8. Risico's en aandachtspunten
## 9. Kickoff-nood en opstartacties
## 10. Voorstel interne opstartmail
## 11. Voorstel klantbevestiging

Gebruik voor sectie 1 de projectidentificatiegegevens (nummer, naam, klant, PL, datums).
Gebruik voor sectie 5 de opgegeven start- en einddatum als kader.
Vermeld nooit werktijden, pauzes of interne werkroosters.
Markeer ontbrekende informatie duidelijk met ⚠️.`
}
