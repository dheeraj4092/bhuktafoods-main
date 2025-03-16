import defaultProductImage from '@/assets/default-product.svg';

const SUPABASE_PROJECT_ID = 'topikrqamdglxakppbyg';
const DEFAULT_IMAGE = defaultProductImage;

export const getProductImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    return DEFAULT_IMAGE;
  }
  
  try {
    // If it's already a full URL, use it directly
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      return imagePath;
    }
    
    // If it starts with 'data:', it's a base64 image
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Clean the path and ensure proper format for Supabase storage
    const cleanPath = imagePath.replace(/^\/+/, '').trim();
    
    // If the path already includes the bucket name, don't add it again
    const bucketPath = cleanPath.startsWith('product-images/') 
      ? cleanPath 
      : `product-images/${cleanPath}`;
      
    // Construct the full Supabase storage URL
    return `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${bucketPath}`;
  } catch (error) {
    console.error('Error constructing image URL:', error);
    console.error('Original image path:', imagePath);
    return DEFAULT_IMAGE;
  }
};

export const DEFAULT_PRODUCT_IMAGE = DEFAULT_IMAGE; 