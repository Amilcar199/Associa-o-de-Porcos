import { GridFSBucket, ObjectId, type Db } from 'mongodb'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'

const BUCKET = 'receipts'

function database() {
  return (mongoose.connection as { db?: Db }).db
}

export async function uploadReceipt(file: Buffer, filename: string, contentType: string, ownerId: string) {
  await connectDB()
  const db = database()
  if (!db) throw new Error('Database connection not available')
  const bucket = new GridFSBucket(db, { bucketName: BUCKET })
  const safeName = filename.replace(/[^\w.\-]+/g, '_').slice(0, 80) || 'comprovativo'
  const uploadStream = bucket.openUploadStream(`${Date.now()}-${safeName}`, {
    metadata: {
      contentType,
      originalName: safeName,
      ownerId,
      uploadedAt: new Date(),
    },
  })

  const fileId = await new Promise<string>((resolve, reject) => {
    uploadStream.on('error', reject)
    uploadStream.on('finish', () => resolve(String(uploadStream.id)))
    uploadStream.end(file)
  })

  return { fileId, contentType }
}

export async function openReceipt(fileId: string) {
  await connectDB()
  const db = database()
  if (!db || !/^[a-f\d]{24}$/i.test(fileId)) return null
  const bucket = new GridFSBucket(db, { bucketName: BUCKET })
  const objectId = new ObjectId(fileId)
  const fileDoc = await bucket.find({ _id: objectId }).next()
  if (!fileDoc) return null
  return {
    stream: bucket.openDownloadStream(objectId),
    contentType: fileDoc.metadata?.contentType || 'application/octet-stream',
    length: fileDoc.length || 0,
  }
}

export async function deleteReceipt(fileId: string) {
  try {
    await connectDB()
    const db = database()
    if (!db || !/^[a-f\d]{24}$/i.test(fileId)) return
    const bucket = new GridFSBucket(db, { bucketName: BUCKET })
    await bucket.delete(new ObjectId(fileId))
  } catch (error) {
    console.error('Falha ao apagar comprovativo:', error)
  }
}
