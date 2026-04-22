'use client'

import { useState } from 'react'

interface DownloadButtonsProps {
  markdown: string
  projectName: string
  customerName: string
}

// Markdown naar plain secties parsen
function parseMarkdown(markdown: string): { heading: number; text: string }[] {
  const lines = markdown.split('\n')
  const result: { heading: number; text: string }[] = []
  for (const line of lines) {
    if (line.startsWith('### ')) result.push({ heading: 3, text: line.replace(/^### /, '') })
    else if (line.startsWith('## ')) result.push({ heading: 2, text: line.replace(/^## /, '') })
    else if (line.startsWith('# ')) result.push({ heading: 1, text: line.replace(/^# /, '') })
    else result.push({ heading: 0, text: line })
  }
  return result
}

export default function DownloadButtons({ markdown, projectName, customerName }: DownloadButtonsProps) {
  const [loadingDocx, setLoadingDocx] = useState(false)

  // PDF via browser print
  function handlePdfDownload() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Markdown omzetten naar eenvoudige HTML voor print
    const htmlContent = markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
      .replace(/^(?!<[hul]|$)(.+)$/gm, '<p>$1</p>')
      .replace(/⚠️/g, '⚠')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <title>PSD — ${projectName}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { font-size: 18pt; border-bottom: 2px solid #2f4faa; padding-bottom: 8px; margin-bottom: 16px; }
          h2 { font-size: 13pt; color: #2f4faa; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #dde; padding-bottom: 4px; }
          h3 { font-size: 11pt; margin-top: 12px; margin-bottom: 4px; }
          p { margin: 6px 0; line-height: 1.5; }
          ul { margin: 6px 0 6px 20px; padding: 0; }
          li { margin: 3px 0; line-height: 1.5; }
          strong { font-weight: bold; }
          .meta { color: #666; font-size: 9pt; margin-bottom: 20px; }
          @media print {
            body { padding: 0; }
            h2 { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="meta">Klant: ${customerName} | Gegenereerd op: ${new Date().toLocaleDateString('nl-BE')}</div>
        ${htmlContent}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  // DOCX via docx library
  async function handleDocxDownload() {
    setLoadingDocx(true)
    try {
      const {
        Document, Packer, Paragraph, TextRun,
        HeadingLevel, AlignmentType, LevelFormat,
      } = await import('docx')

      const lines = parseMarkdown(markdown)
      const children: InstanceType<typeof Paragraph>[] = []

      // Meta regel bovenaan
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Klant: ${customerName} | Gegenereerd op: ${new Date().toLocaleDateString('nl-BE')}`,
              color: '888888',
              size: 18,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        })
      )

      for (const line of lines) {
        if (!line.text.trim() && line.heading === 0) {
          children.push(new Paragraph({ spacing: { after: 80 } }))
          continue
        }

        if (line.heading === 1) {
          children.push(new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: line.text, bold: true, size: 36, color: '111111' })],
            spacing: { before: 240, after: 160 },
            border: { bottom: { style: 'single' as any, size: 6, color: '2f4faa', space: 4 } },
          }))
        } else if (line.heading === 2) {
          children.push(new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: line.text, bold: true, size: 26, color: '2f4faa' })],
            spacing: { before: 280, after: 100 },
          }))
        } else if (line.heading === 3) {
          children.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: line.text, bold: true, size: 22 })],
            spacing: { before: 160, after: 80 },
          }))
        } else if (line.text.startsWith('- ')) {
          children.push(new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            children: [new TextRun({ text: line.text.replace(/^- /, ''), size: 22 })],
          }))
        } else if (line.text.trim()) {
          // Bold tekst verwerken
          const parts = line.text.split(/\*\*(.+?)\*\*/)
          const runs = parts.map((part, i) =>
            new TextRun({ text: part, bold: i % 2 === 1, size: 22 })
          )
          children.push(new Paragraph({
            children: runs,
            spacing: { after: 80 },
            alignment: AlignmentType.LEFT,
          }))
        }
      }

      const doc = new Document({
        numbering: {
          config: [{
            reference: 'bullets',
            levels: [{
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            }],
          }],
        },
        sections: [{
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children,
        }],
      })

      const buffer = await Packer.toBlob(doc)
      const url = URL.createObjectURL(buffer)
      const a = document.createElement('a')
      a.href = url
      a.download = `PSD_${projectName.replace(/\s+/g, '_')}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('DOCX fout:', err)
      alert('Fout bij genereren Word document.')
    } finally {
      setLoadingDocx(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button className="btn-secondary" onClick={handleDocxDownload} disabled={loadingDocx}>
        {loadingDocx ? (
          <>
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Word...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Word
          </>
        )}
      </button>

      <button className="btn-secondary" onClick={handlePdfDownload}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        PDF
      </button>
    </div>
  )
}
