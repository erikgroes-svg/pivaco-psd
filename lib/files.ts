export type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/plain'
  | 'text/markdown'

const SUPPORTED_TYPES: SupportedMimeType[] = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]

export function isSupportedType(mime: string): mime is SupportedMimeType {
  return SUPPORTED_TYPES.includes(mime as SupportedMimeType)
}

export function friendlyTypeName(mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word document',
    'text/plain': 'Tekstbestand',
    'text/markdown': 'Markdown',
  }
  return map[mime] ?? mime
}

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string | null; error: string | null }> {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const result = await pdfParse(buffer)
      return { text: result.text?.trim() || null, error: null }
    }

    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return { text: result.value?.trim() || null, error: null }
    }

    if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
      return { text: buffer.toString('utf-8').trim(), error: null }
    }

    return { text: null, error: `Bestandstype niet ondersteund: ${mimeType}` }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return { text: null, error: `Fout bij verwerking: ${message}` }
  }
}

export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
