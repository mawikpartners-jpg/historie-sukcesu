/*
  # Google Reviews Database Schema

  ## Overview
  This migration creates a comprehensive database structure for storing and managing Google Reviews data,
  supporting both initial data imports and incremental updates.

  ## New Tables

  ### 1. `businesses`
  Stores business/place information from Google
  - `id` (uuid, primary key) - Internal unique identifier
  - `google_place_id` (text, unique, not null) - Google's unique place ID
  - `business_name` (text, not null) - Name of the business
  - `address` (text) - Full business address
  - `phone` (text) - Contact phone number
  - `website` (text) - Business website URL
  - `category` (text) - Business category/type
  - `average_rating` (numeric) - Current average rating (1.0-5.0)
  - `total_reviews` (integer) - Total number of reviews
  - `latitude` (numeric) - Geographic latitude
  - `longitude` (numeric) - Geographic longitude
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `deleted_at` (timestamptz) - Soft delete timestamp

  ### 2. `reviewers`
  Stores reviewer profile information (normalized to avoid duplication)
  - `id` (uuid, primary key) - Internal unique identifier
  - `google_reviewer_id` (text, unique) - Google's reviewer ID
  - `reviewer_name` (text, not null) - Reviewer's display name
  - `reviewer_photo_url` (text) - Profile photo URL
  - `total_reviews_by_reviewer` (integer) - Total reviews by this reviewer
  - `is_local_guide` (boolean) - Whether reviewer is a Local Guide
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `reviews`
  Stores individual review data with full details
  - `id` (uuid, primary key) - Internal unique identifier
  - `google_review_id` (text, unique, not null) - Google's unique review ID
  - `business_id` (uuid, foreign key) - Reference to businesses table
  - `reviewer_id` (uuid, foreign key) - Reference to reviewers table
  - `rating` (integer, 1-5, not null) - Star rating
  - `review_text` (text) - Review content/comment
  - `review_date` (timestamptz, not null) - When review was posted
  - `owner_response_text` (text) - Business owner's response
  - `owner_response_date` (timestamptz) - When owner responded
  - `helpful_count` (integer) - Number of helpful votes
  - `review_url` (text) - Direct URL to the review
  - `photos` (jsonb) - Array of photo URLs and metadata
  - `language` (text) - Review language code (e.g., 'en', 'es')
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `deleted_at` (timestamptz) - Soft delete timestamp

  ## Indexes
  Optimized indexes for common query patterns:
  - Business lookups by Google Place ID
  - Review lookups by Google Review ID
  - Reviews by business (for listing all reviews of a business)
  - Reviews by reviewer (for reviewer history)
  - Reviews by date (for time-based queries)
  - Reviews by rating (for filtering)
  - Soft delete queries (on deleted_at)

  ## Security
  - RLS enabled on all tables
  - Read policies for authenticated users
  - Write policies restricted to service role operations
  - Update policies for authorized users only

  ## Data Validation
  - Rating constrained to 1-5 range
  - Required fields enforced with NOT NULL constraints
  - Unique constraints on Google IDs to prevent duplicates
  - Foreign key constraints to maintain referential integrity
*/

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id text UNIQUE NOT NULL,
  business_name text NOT NULL,
  address text,
  phone text,
  website text,
  category text,
  average_rating numeric(2,1) CHECK (average_rating >= 1.0 AND average_rating <= 5.0),
  total_reviews integer DEFAULT 0,
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create reviewers table
CREATE TABLE IF NOT EXISTS reviewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_reviewer_id text UNIQUE,
  reviewer_name text NOT NULL,
  reviewer_photo_url text,
  total_reviews_by_reviewer integer DEFAULT 0,
  is_local_guide boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_review_id text UNIQUE NOT NULL,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES reviewers(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_date timestamptz NOT NULL,
  owner_response_text text,
  owner_response_date timestamptz,
  helpful_count integer DEFAULT 0,
  review_url text,
  photos jsonb,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create indexes for optimal query performance

-- Businesses table indexes
CREATE INDEX IF NOT EXISTS idx_businesses_google_place_id ON businesses(google_place_id);
CREATE INDEX IF NOT EXISTS idx_businesses_deleted_at ON businesses(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_average_rating ON businesses(average_rating);

-- Reviewers table indexes
CREATE INDEX IF NOT EXISTS idx_reviewers_google_reviewer_id ON reviewers(google_reviewer_id);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_google_review_id ON reviews(google_review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_review_date ON reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_business_date ON reviews(business_id, review_date DESC);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses table

CREATE POLICY "Authenticated users can view all businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Service role can insert businesses"
  ON businesses FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update businesses"
  ON businesses FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete businesses"
  ON businesses FOR DELETE
  TO service_role
  USING (true);

-- RLS Policies for reviewers table

CREATE POLICY "Authenticated users can view all reviewers"
  ON reviewers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert reviewers"
  ON reviewers FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update reviewers"
  ON reviewers FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete reviewers"
  ON reviewers FOR DELETE
  TO service_role
  USING (true);

-- RLS Policies for reviews table

CREATE POLICY "Authenticated users can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Service role can insert reviews"
  ON reviews FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update reviews"
  ON reviews FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete reviews"
  ON reviews FOR DELETE
  TO service_role
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviewers_updated_at
  BEFORE UPDATE ON reviewers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for easy querying of reviews with business and reviewer details
CREATE OR REPLACE VIEW reviews_detailed AS
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