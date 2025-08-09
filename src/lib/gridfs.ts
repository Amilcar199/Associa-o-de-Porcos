import { GridFSBucket, ObjectId } from 'mongodb';
import { connectDB } from './mongodb';

export interface UploadResult {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
}

export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const { db } = await connectDB();
  const bucket = new GridFSBucket(db, { bucketName: 'images' });

  // Gerar nome único para o arquivo
  const uniqueFilename = `${Date.now()}-${filename}`;
  
  // Upload do arquivo
  const uploadStream = bucket.openUploadStream(uniqueFilename, {
    metadata: {
      contentType,
      originalName: filename,
      uploadedAt: new Date()
    }
  });

  return new Promise((resolve, reject) => {
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        fileId: uploadStream.id.toString(),
        filename: uniqueFilename,
        contentType,
        size: uploadStream.length,
        url: `/api/images/${uploadStream.id}`
      });
    });

    uploadStream.end(file);
  });
}

export async function getImage(fileId: string): Promise<{ stream: any; contentType: string } | null> {
  try {
    const { db } = await connectDB();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    
    return {
      stream: downloadStream,
      contentType: downloadStream.s.files.metadata?.contentType || 'image/jpeg'
    };
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return null;
  }
}

export async function deleteImage(fileId: string): Promise<boolean> {
  try {
    const { db } = await connectDB();
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
    const { db } = await connectDB();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    const cursor = bucket.find({});
    const files = await cursor.toArray();
    
    return files.map(file => ({
      fileId: file._id.toString(),
      filename: file.filename,
      contentType: file.metadata?.contentType || 'image/jpeg',
      size: file.length,
      uploadedAt: file.metadata?.uploadedAt || file.uploadDate
    }));
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    return [];
  }
}
