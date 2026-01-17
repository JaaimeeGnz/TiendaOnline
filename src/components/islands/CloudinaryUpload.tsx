import { useState } from 'react';

interface CloudinaryUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  multiple?: boolean;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function CloudinaryUpload({ onUploadComplete, multiple = true }: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    // Esperar a que Cloudinary esté completamente cargado
    if (!window.cloudinary) {
      const errorMsg = 'Widget de Cloudinary no cargado. Por favor, recarga la página.';
      console.error(errorMsg);
      setError(errorMsg);
      setUploading(false);
      return;
    }

    const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      const errorMsg = 'Cloud Name no configurado. Verifica .env.local';
      console.error(errorMsg);
      setError(errorMsg);
      setUploading(false);
      return;
    }

    console.log('Iniciando widget con cloudName:', cloudName);

    try {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: 'fashionmarket_products',
          folder: 'fashionmarket/products',
          multiple: multiple,
          maxFileSize: 5000000, // 5MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          sources: ['local', 'url', 'camera'],
          showAdvancedOptions: false,
          cropping: false,
          defaultSource: 'local',
          resourceType: 'auto',
          language: 'es',
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Error en upload:', error);
            setError(`Error: ${error.statusText || error.message || error}`);
            setUploading(false);
          } else if (result && result.event === 'success') {
            const newUrl = result.info.secure_url;
            const newUrls = [...uploadedUrls, newUrl];
            setUploadedUrls(newUrls);
            onUploadComplete?.(newUrls);
            setError(null);
          } else if (result && result.event === 'close') {
            if (uploadedUrls.length === 0) {
              setUploading(false);
            }
          }
        }
      );

      setUploading(true);
      setError(null);
      widget.open();
    } catch (err: any) {
      console.error('Error al crear widget:', err);
      setError(`Error: ${err.message}`);
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    onUploadComplete?.(newUrls);
  };

  return (
    <div class="space-y-4">
      {error && (
        <div class="p-4 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}
      
      <button
        type="button"
        onClick={handleUploadClick}
        disabled={uploading}
        className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {uploading ? 'Subiendo...' : '📷 Subir Imágenes con Cloudinary'}
      </button>

      {uploadedUrls.length > 0 && (
        <div class="space-y-3">
          <h4 class="font-bold text-sm">Imágenes subidas ({uploadedUrls.length})</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            {uploadedUrls.map((url, index) => (
              <div key={index} class="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {/* Hidden input para pasar URLs al formulario */}
          <input
            type="hidden"
            name="images_json"
            value={JSON.stringify(uploadedUrls)}
          />
        </div>
      )}
    </div>
  );
};
