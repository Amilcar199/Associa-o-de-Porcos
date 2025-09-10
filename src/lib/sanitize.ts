// Lightweight HTML sanitizer helper. Uses sanitize-html if available, otherwise a conservative fallback.
export function sanitizeHtmlSafe(input: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sanitizeHtml: any = require('sanitize-html')
    return sanitizeHtml(input, {
      allowedTags: sanitizeHtml.defaults?.allowedTags || undefined,
      allowedAttributes: sanitizeHtml.defaults?.allowedAttributes || undefined,
      allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data']
    })
  } catch {
    // Fallback: strip <script> and event handlers
    return String(input || '')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/ on[a-z]+="[^"]*"/gi, '')
      .replace(/ on[a-z]+='[^']*'/gi, '')
  }
}

