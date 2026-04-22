import Anthropic from '@anthropic-ai/sdk'
import type { Project, UploadedFile } from '@/types'
import { buildSystemPrompt, buildUserPrompt, MODEL_NAME } from './prompts'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface GenerationResult {
  success: true
  markdown: string
}

export interface GenerationError {
  success: false
  error: string
}

export async function generatePsd(
  project: Project,
  files: UploadedFile[]
): Promise<GenerationResult | GenerationError> {
  if (files.length === 0) {
    return { success: false, error: 'Geen bestanden beschikbaar voor generatie.' }
  }

  const filesWithText = files.filter((f) => f.extracted_text)
  if (filesWithText.length === 0) {
    return {
      success: false,
      error: 'Geen tekst kon worden geëxtraheerd uit de geüploade bestanden.',
    }
  }

  try {
    const message = await client.messages.create({
      model: MODEL_NAME,
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(project, filesWithText),
        },
      ],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { success: false, error: 'Claude gaf geen tekstantwoord terug.' }
    }

    return { success: true, markdown: textBlock.text }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende API fout'
    return { success: false, error: `Claude API fout: ${message}` }
  }
}
