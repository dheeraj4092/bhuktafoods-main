import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadFile = async (file, bucket = 'product-images') => {
  try {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size too large. Maximum size allowed is 5MB.');
    }

    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`products/${fileName}`, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error('Failed to upload image to storage');
    }

    const { data: publicURL } = supabase.storage
      .from(bucket)
      .getPublicUrl(`products/${fileName}`);

    return {
      url: publicURL.publicUrl,
      fileName: fileName,
      path: `products/${fileName}`
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileUrl, bucket = 'product-images') => {
  try {
    // Extract the file path from the URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `products/${fileName}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error('Failed to delete image from storage');
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const validateImage = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size allowed is 5MB.'
    };
  }

  return {
    isValid: true,
    error: null
  };
}; 