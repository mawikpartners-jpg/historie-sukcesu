import { supabase } from './supabase-client.js';

const form = document.getElementById('add-review-form');
const messageDiv = document.getElementById('message');
const reviewsContainer = document.getElementById('reviews-container');

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type} show`;

  setTimeout(() => {
    messageDiv.className = 'message';
  }, 5000);
}

function getStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function loadReviews() {
  try {
    const { data: reviews, error } = await supabase
      .from('google_reviews')
      .select('*')
      .order('review_date', { ascending: false });

    if (error) throw error;

    if (!reviews || reviews.length === 0) {
      reviewsContainer.innerHTML = '<div class="empty-state">Brak opinii w bazie danych</div>';
      return;
    }

    reviewsContainer.innerHTML = reviews.map(review => `
      <div class="review-item" data-id="${review.id}">
        <div class="review-header">
          <div class="review-info">
            <div class="reviewer-name">${review.reviewer_name}</div>
            <div class="review-meta">
              <div class="stars">${getStars(review.rating)}</div>
              ${review.location ? `<span>${review.location}</span> • ` : ''}
              <span>${formatDate(review.review_date)}</span>
            </div>
          </div>
        </div>
        <div class="review-text">${review.review_text}</div>
        <div class="review-actions">
          <button class="btn btn-danger delete-btn" data-id="${review.id}">
            Usuń
          </button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });

  } catch (error) {
    console.error('Error loading reviews:', error);
    reviewsContainer.innerHTML = `<div class="empty-state">Błąd ładowania opinii: ${error.message}</div>`;
  }
}

async function handleDelete(e) {
  const id = e.target.dataset.id;

  if (!confirm('Czy na pewno chcesz usunąć tę opinię?')) {
    return;
  }

  try {
    const { error } = await supabase
      .from('google_reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showMessage('Opinia została usunięta', 'success');
    loadReviews();
  } catch (error) {
    console.error('Error deleting review:', error);
    showMessage(`Błąd usuwania opinii: ${error.message}`, 'error');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const reviewData = {
    reviewer_name: formData.get('reviewer_name'),
    rating: parseInt(formData.get('rating')),
    review_text: formData.get('review_text'),
    review_date: new Date(formData.get('review_date')).toISOString(),
    location: formData.get('location') || null
  };

  try {
    const { data, error } = await supabase
      .from('google_reviews')
      .insert([reviewData])
      .select();

    if (error) throw error;

    showMessage('Opinia została dodana pomyślnie!', 'success');
    form.reset();
    loadReviews();
  } catch (error) {
    console.error('Error adding review:', error);
    showMessage(`Błąd dodawania opinii: ${error.message}`, 'error');
  }
});

loadReviews();
