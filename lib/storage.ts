import { supabase } from './supabase';

const BUCKET_NAME = 'Flower';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export async function uploadImage(
  file: File,
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return { url: null, error: 'Недопустимый формат файла. Разрешены: JPG, PNG, WebP, GIF' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'Размер файла превышает 5 МБ' };
    }

    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload exception:', error);
    return { url: null, error: 'Ошибка загрузки файла' };
  }
}

export async function deleteImage(url: string): Promise<boolean> {
  try {
    const bucketPath = `${BUCKET_NAME}/`;
    const pathIndex = url.indexOf(bucketPath);

    if (pathIndex === -1) {
      console.error('Invalid image URL');
      return false;
    }

    const path = url.substring(pathIndex + bucketPath.length);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete exception:', error);
    return false;
  }
}

export async function uploadMultipleImages(
  files: File[],
  folder: string = 'products'
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

export function getImageUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function listImages(folder: string = 'products'): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List error:', error);
      return [];
    }

    return data
      .filter((file) => file.name !== '.emptyFolderPlaceholder')
      .map((file) => getImageUrl(`${folder}/${file.name}`));
  } catch (error) {
    console.error('List exception:', error);
    return [];
  }
}
