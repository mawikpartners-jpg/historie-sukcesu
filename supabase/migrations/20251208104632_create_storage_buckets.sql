/*
  # Create Storage Buckets for File Storage

  1. New Storage Buckets
    - `property-photos` - For property images and photos (max 10MB, public)
    - `property-videos` - For video testimonials and property videos (max 100MB, public)
    - `documents` - For property documents and contracts (max 10MB, private)
    - `avatars` - For user profile pictures (max 2MB, public)
  
  2. Configuration
    - Public buckets allow anyone to read files
    - File size limits and MIME type restrictions are enforced
    - All buckets are created with proper constraints
*/

-- Create storage buckets with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'property-photos', 
    'property-photos', 
    true, 
    10485760, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  ),
  (
    'property-videos', 
    'property-videos', 
    true, 
    104857600, 
    ARRAY['video/mp4', 'video/webm', 'video/quicktime']
  ),
  (
    'documents', 
    'documents', 
    false, 
    10485760, 
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  ),
  (
    'avatars', 
    'avatars', 
    true, 
    2097152, 
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;