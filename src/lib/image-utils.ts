import defaultProductImage from '@/assets/default-product.svg';

const SUPABASE_PROJECT_ID = 'topikrqamdglxakppbyg';
const DEFAULT_IMAGE = defaultProductImage;

export const getProductImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    return DEFAULT_IMAGE;
  }
  
  // If it's already a full URL, use it directly
  if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
    return imagePath;
  }
  
  try {
    // Clean the path and ensure proper format for Supabase storage
    const cleanPath = imagePath.replace(/^\/+/, '').trim();
    return `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/product-images/${cleanPath}`;
  } catch (error) {
    console.error('Error constructing image URL:', error);
    return DEFAULT_IMAGE;
  }
};

export const DEFAULT_PRODUCT_IMAGE = DEFAULT_IMAGE; 