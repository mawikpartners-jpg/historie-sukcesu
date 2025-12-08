/*
  # Create Google Reviews Table

  ## Overview
  This migration creates a table to store Google reviews for the real estate agency.
  
  ## New Tables
  
  ### `google_reviews`
  - `id` (uuid, primary key) - Unique identifier for each review
  - `reviewer_name` (text, required) - Name of the person who left the review
  - `rating` (integer, required) - Star rating from 1 to 5
  - `review_text` (text, required) - Content of the review
  - `review_date` (timestamptz, required) - When the review was originally posted on Google
  - `location` (text, optional) - Which office location (e.g., "Biała Podlaska", "Chełm", "Zamość")
  - `created_at` (timestamptz) - When the record was created in the database
  - `updated_at` (timestamptz) - When the record was last updated
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `google_reviews` table
  - Public read access: Anyone can view reviews (including unauthenticated users)
  - Restricted write access: Only authenticated users can insert, update, or delete reviews
  
  ## Notes
  - Reviews are publicly visible to support the social proof sections on the website
  - Only authenticated admin users can manage review data
  - Rating is constrained to be between 1 and 5
*/

-- Create the google_reviews table
CREATE TABLE IF NOT EXISTS google_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  review_date timestamptz NOT NULL,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews (public access)
CREATE POLICY "Anyone can read reviews"
  ON google_reviews
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON google_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update reviews
CREATE POLICY "Authenticated users can update reviews"
  ON google_reviews
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete reviews
CREATE POLICY "Authenticated users can delete reviews"
  ON google_reviews
  FOR DELETE
  TO authenticated
  USING (true);

-- Create an index on review_date for efficient sorting
CREATE INDEX IF NOT EXISTS idx_google_reviews_review_date ON google_reviews(review_date DESC);

-- Create an index on location for filtering by office
CREATE INDEX IF NOT EXISTS idx_google_reviews_location ON google_reviews(location);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
DROP TRIGGER IF EXISTS set_google_reviews_updated_at ON google_reviews;
CREATE TRIGGER set_google_reviews_updated_at
  BEFORE UPDATE ON google_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_google_reviews_updated_at();