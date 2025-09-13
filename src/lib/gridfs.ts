import { GridFSBucket, ObjectId, Db } from 'mongodb';
import mongoose from 'mongoose';
import { connectDB } from './mongodb';

export interface UploadResult {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  category?: string;
}

export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string,
  metadata?: Record<string, any>
): Promise<UploadResult> {
  await connectDB();
  const db = (mongoose.connection as any).db as Db;
  if (!db) {
    throw new Error('Database connection not available')
  }
  const bucket = new GridFSBucket(db, { bucketName: 'images' });

  // Gerar nome único para o arquivo
  const uniqueFilename = `${Date.now()}-${filename}`;
  
  // Upload do arquivo
  const uploadStream = bucket.openUploadStream(uniqueFilename, {
    metadata: {
      contentType,
      originalName: filename,
      uploadedAt: new Date(),
      ...(metadata || {})
    }
  });

  return new Promise((resolve, reject) => {
    uploadStream.on('error', reject);
    uploadStream.on('finish', async () => {
      try {
        const fileId = uploadStream.id as ObjectId;
        const fileDoc = await bucket.find({ _id: fileId }).next();
        resolve({
          fileId: fileId.toString(),
          filename: uniqueFilename,
          contentType: fileDoc?.metadata?.contentType || contentType,
          size: fileDoc?.length || file.byteLength || 0,
          url: `/api/images/${fileId.toString()}`,
          category: fileDoc?.metadata?.category
        });
      } catch (err) {
        reject(err);
      }
    });

    uploadStream.end(file);
  });
}

export async function uploadVideo(
  file: Buffer,
  filename: string,
  contentType: string,
  metadata?: Record<string, any>
): Promise<UploadResult> {
  await connectDB();
  const db = (mongoose.connection as any).db as Db;
  if (!db) {
    throw new Error('Database connection not available')
  }
  const bucket = new GridFSBucket(db, { bucketName: 'videos' });

  const uniqueFilename = `${Date.now()}-${filename}`;

  const uploadStream = bucket.openUploadStream(uniqueFilename, {
    metadata: {
      contentType,
      originalName: filename,
      uploadedAt: new Date(),
      ...(metadata || {})
    }
  });

  return new Promise((resolve, reject) => {
    uploadStream.on('error', reject);
    uploadStream.on('finish', async () => {
      try {
        const fileId = uploadStream.id as ObjectId;
        const fileDoc = await bucket.find({ _id: fileId }).next();
        resolve({
          fileId: fileId.toString(),
          filename: uniqueFilename,
          contentType: fileDoc?.metadata?.contentType || contentType,
          size: fileDoc?.length || file.byteLength || 0,
          url: `/api/videos/${fileId.toString()}`,
          category: fileDoc?.metadata?.category
        });
      } catch (err) {
        reject(err);
      }
    });

    uploadStream.end(file);
  });
}

export async function getImage(fileId: string): Promise<{ stream: any; contentType: string } | null> {
  try {
    await connectDB();
    const db = (mongoose.connection as any).db as Db;
    if (!db) return null
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    const objectId = new ObjectId(fileId);
    const fileDoc = await bucket.find({ _id: objectId }).next();
    const downloadStream = bucket.openDownloadStream(objectId);
    
    return {
      stream: downloadStream,
      contentType: fileDoc?.metadata?.contentType || 'image/jpeg'
    };
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return null;
  }
}

export async function deleteImage(fileId: string): Promise<boolean> {
  try {
    await connectDB();
    const db = (mongoose.connection as any).db as Db;
    if (!db) return false
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    await bucket.delete(new ObjectId(fileId));
    return true;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return false;
  }
}

export async function listImages(): Promise<Array<{ fileId: string; filename: string; contentType: string; size: number; uploadedAt: Date }>> {
  try {
    await connectDB();
    const db = (mongoose.connection as any).db as Db;
    if (!db) return []
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    const cursor = bucket.find({});
    const files = await cursor.toArray();
    
    return files.map(file => ({
      fileId: file._id.toString(),
      filename: file.filename,
      contentType: file.metadata?.contentType || 'image/jpeg',
      size: file.length,
      uploadedAt: file.metadata?.uploadedAt || (file as any).uploadDate
    }));
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    return [];
  }
}
