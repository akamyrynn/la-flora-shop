'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { uploadImage, deleteImage } from '@/lib/storage';

interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
}

export default function SingleImageUploader({
  value,
  onChange,
  folder = 'products',
  label = 'Изображение',
  placeholder = 'https://...',
}: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setError(null);

      const file = acceptedFiles[0];
      const result = await uploadImage(file, folder);

      if (result.url) {
        // Delete old image if exists and is from our storage
        if (value && value.includes('supabase')) {
          await deleteImage(value);
        }
        onChange(result.url);
      } else if (result.error) {
        setError(result.error);
      }

      setUploading(false);
    },
    [value, onChange, folder]
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
    multiple: false,
    disabled: uploading,
  });

  const handleRemove = async () => {
    if (value && value.includes('supabase')) {
      await deleteImage(value);
    }
    onChange('');
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary"
        >
          <LinkIcon className="h-3 w-3" />
          {showUrlInput ? 'Загрузить файл' : 'Указать URL'}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
          >
            OK
          </button>
        </div>
      ) : value ? (
        <div className="relative">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 truncate text-xs text-gray-400">{value}</p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragActive
              ? 'border-primary bg-primary-50'
              : 'border-gray-300 hover:border-primary'
          } ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-gray-500">Загрузка...</span>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              <span className="text-sm text-primary">Отпустите файл</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500">
                Перетащите или нажмите
              </span>
              <span className="text-xs text-gray-400">
                JPG, PNG, WebP до 5 МБ
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
