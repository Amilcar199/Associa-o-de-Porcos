import ImageManager from '@/components/admin/ImageManager';

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Imagens</h1>
        <p className="text-gray-600">
          Faça upload e gerencie as imagens do site
        </p>
      </div>

      <ImageManager />
    </div>
  );
}
