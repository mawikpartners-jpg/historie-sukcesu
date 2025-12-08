import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      review_text,
      review_date,
      reviewers!inner(
        reviewer_name
      )
    `)
    .is('deleted_at', null)
    .order('review_date', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data.map(review => ({
    id: review.id,
    author: review.reviewers.reviewer_name,
    rating: review.rating,
    text: review.review_text,
    date: review.review_date
  }));
}

function formatReviewDate(dateString) {
  const reviewDate = new Date(dateString);
  const now = new Date();
  const diffMs = now - reviewDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffDays === 0) {
    return 'dzisiaj';
  } else if (diffDays === 1) {
    return 'wczoraj';
  } else if (diffDays < 7) {
    if (diffDays === 2 || diffDays === 3 || diffDays === 4) {
      return `${diffDays} dni temu`;
    } else {
      return `${diffDays} dni temu`;
    }
  } else if (diffWeeks < 4) {
    if (diffWeeks === 1) {
      return 'tydzień temu';
    } else if (diffWeeks === 2 || diffWeeks === 3) {
      return `${diffWeeks} tygodnie temu`;
    } else {
      return `${diffWeeks} tygodni temu`;
    }
  } else if (diffMonths < 12) {
    if (diffMonths === 1) {
      return 'miesiąc temu';
    } else if (diffMonths === 2 || diffMonths === 3 || diffMonths === 4) {
      return `${diffMonths} miesiące temu`;
    } else {
      return `${diffMonths} miesięcy temu`;
    }
  } else {
    const years = Math.floor(diffMonths / 12);
    if (years === 1) {
      return 'rok temu';
    } else if (years < 5) {
      return `${years} lata temu`;
    } else {
      return `${years} lat temu`;
    }
  }
}

export function formatReviews(reviews) {
  return reviews.map(review => ({
    ...review,
    formattedDate: formatReviewDate(review.date)
  }));
}
