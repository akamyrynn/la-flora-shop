'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { uploadImage, deleteImage } from '@/lib/storage';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
  folder = 'products',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        setError(`Максимум ${maxImages} изображений`);
        return;
      }

      setUploading(true);
      setError(null);

      const newImages: string[] = [];

      for (const file of acceptedFiles) {
        const result = await uploadImage(file, folder);
        if (result.url) {
          newImages.push(result.url);
        } else if (result.error) {
          setError(result.error);
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }

      setUploading(false);
    },
    [images, onChange, maxImages, folder]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    maxSize: 5 * 1024 * 1024,
    disabled: uploading || images.length >= maxImages,
  });

  const handleRemove = async (url: string) => {
    await deleteImage(url);
    onChange(images.filter((img) => img !== url));
  };

  const handleMakeMain = (url: string) => {
    const newImages = [url, ...images.filter((img) => img !== url)];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive
            ? 'border-primary bg-primary-50'
            : 'border-gray-300 hover:border-primary'
        } ${uploading || images.length >= maxImages ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-gray-500">Загрузка...</span>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-primary" />
            <span className="text-sm text-primary">Отпустите файлы здесь</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              Перетащите изображения или нажмите для выбора
            </span>
            <span className="text-xs text-gray-400">
              JPG, PNG, WebP, GIF до 5 МБ
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 ${
                index === 0 ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleMakeMain(url)}
                    className="rounded bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Главное
                  </button>
                )}
              </div>

              {/* Main badge */}
              {index === 0 && (
                <div className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs text-white">
                  Главное
                </div>
              )}

              {/* Drag handle */}
              <div className="absolute right-2 top-2 cursor-move opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-5 w-5 text-white drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="text-right text-sm text-gray-500">
        {images.length} / {maxImages} изображений
      </div>
    </div>
  );
}
