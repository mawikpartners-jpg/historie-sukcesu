/*
  # Fix Database Security Issues

  1. Remove Unused Indexes
    - Drop `idx_reviews_google_review_id` (redundant with unique constraint)
    - Drop `idx_reviews_business_id` (covered by `idx_reviews_business_date`)
    - Drop `idx_reviews_review_date` (covered by `idx_reviews_business_date`)
    - Drop `idx_reviews_rating` (not used in queries)
    - Drop `idx_google_reviews_review_date` (not used)
    - Drop `idx_google_reviews_location` (not used)
    - Drop `idx_businesses_deleted_at` (not used)
    - Drop `idx_businesses_average_rating` (not used)

  2. Security Fixes
    - Recreate `reviews_detailed` view with SECURITY INVOKER instead of SECURITY DEFINER
    - Fix function search paths for `update_google_reviews_updated_at` and `update_updated_at_column`

  3. Notes
    - Keeping composite index `idx_reviews_business_date` as it's more useful
    - Keeping `idx_reviews_deleted_at` for soft delete queries
    - Functions now have immutable search_path set to 'public'
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_reviews_google_review_id;
DROP INDEX IF EXISTS idx_reviews_business_id;
DROP INDEX IF EXISTS idx_reviews_review_date;
DROP INDEX IF EXISTS idx_reviews_rating;
DROP INDEX IF EXISTS idx_google_reviews_review_date;
DROP INDEX IF EXISTS idx_google_reviews_location;
DROP INDEX IF EXISTS idx_businesses_deleted_at;
DROP INDEX IF EXISTS idx_businesses_average_rating;

-- Recreate the reviews_detailed view with SECURITY INVOKER
DROP VIEW IF EXISTS reviews_detailed;

CREATE VIEW reviews_detailed
WITH (security_invoker = true)
AS
SELECT 
    r.id,
    r.google_review_id,
    r.rating,
    r.review_text,
    r.review_date,
    r.owner_response_text,
    r.owner_response_date,
    r.helpful_count,
    r.review_url,
    r.photos,
    r.language,
    b.google_place_id,
    b.business_name,
    b.address AS business_address,
    b.category AS business_category,
    rev.google_reviewer_id,
    rev.reviewer_name,
    rev.reviewer_photo_url,
    rev.is_local_guide,
    r.created_at,
    r.updated_at
FROM reviews r
JOIN businesses b ON r.business_id = b.id
JOIN reviewers rev ON r.reviewer_id = rev.id
WHERE r.deleted_at IS NULL AND b.deleted_at IS NULL;

-- Fix function search paths
CREATE OR REPLACE FUNCTION update_google_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
