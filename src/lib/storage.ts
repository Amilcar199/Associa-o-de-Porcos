import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export interface SavedFile {
  filepath: string
  publicUrl: string
  filename: string
  size: number
  contentType: string
}

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'images')
const PUBLIC_BASE = '/uploads/images'

export function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

export async function saveBufferToDisk(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<SavedFile> {
  ensureUploadsDir()
  const safeExt = path.extname(originalName || '').slice(1).toLowerCase() || 'bin'
  const unique = `${Date.now()}-${randomUUID()}.${safeExt}`
  const filepath = path.join(UPLOADS_DIR, unique)
  await fs.promises.writeFile(filepath, buffer)
  const stats = await fs.promises.stat(filepath)
  return {
    filepath,
    publicUrl: `${PUBLIC_BASE}/${unique}`,
    filename: unique,
    size: stats.size,
    contentType
  }
}

export function deleteFromDisk(filepath: string): Promise<void> {
  return fs.promises.unlink(filepath).catch(() => {})
}

