import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetail.css';

function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${id}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      if (response.ok) {
        alert('Отзыв добавлен!');
        setReviewForm({ customer_name: '', rating: 5, comment: '' });
        setShowReviewForm(false);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при добавлении отзыва');
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <span className="material-icons">error</span>
            <h3>Товар не найден</h3>
            <Link to="/" className="btn btn-primary">Вернуться к товарам</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page page">
      <div className="container">
        <Link to="/" className="back-link">
          <span className="material-icons">arrow_back</span>
          Назад к товарам
        </Link>

        <div className="product-detail">
          <div className="product-image-large">
            <div className="placeholder-image">
            {(product.image === "" ? 
              <span className="material-icons">inventory_2</span> :
              <img src={product.image} alt={product.name} className="image-cool" />
            )}
              {/* <img src={product.image} alt={product.name} className="image-cool" /> */}
              {/* <span className="material-icons">inventory_2</span> */}
            </div>
            {(product.isHit === 1 || product.isNew === 1) && (
              <div className="product-badges">
                {product.isHit === 1 && <span className="badge-hit">hit</span>}
                {product.isNew === 1 && <span className="badge-new">new</span>}
              </div>
            )}
          </div>

          <div className="product-info-large">
            <h1>{product.name}</h1>
            {product.category && <p className="product-category">{product.category}</p>}
            
            <div className="product-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className="material-icons" style={{ color: star <= averageRating ? '#ffc107' : '#ddd' }}>
                    star
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {averageRating} ({reviews.length} {reviews.length === 1 ? 'отзыв' : 'отзывов'})
              </span>
            </div>

            <div className="product-price-large">{product.price} рублей</div>

            <button className="btn btn-primary btn-large" onClick={() => addToCart(product)}>
              <span className="material-icons">shopping_cart</span>
              Добавить в корзину
            </button>

            <div className="product-description">
              <h3>Описание</h3>
              <p>{product.description || 'Описание отсутствует'}</p>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Отзывы ({reviews.length})</h2>
            <button className="btn btn-secondary" onClick={() => setShowReviewForm(!showReviewForm)}>
              <span className="material-icons">add_comment</span>
              Оставить отзыв
            </button>
          </div>

          {showReviewForm && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h3>Ваш отзыв</h3>
              <div className="form-group">
                <label>Ваше имя *</label>
                <input
                  type="text"
                  value={reviewForm.customer_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Оценка *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className="material-icons rating-star"
                      style={{ color: star <= reviewForm.rating ? '#ffc107' : '#ddd', cursor: 'pointer' }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Комментарий</label>
                <textarea
                  rows="4"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Отправить</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewForm(false)}>
                  Отмена
                </button>
              </div>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="empty-reviews">
                <span className="material-icons">rate_review</span>
                <p>Пока нет отзывов. Будьте первым!</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div>
                      <strong>{review.customer_name}</strong>
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className="material-icons small" style={{ color: star <= review.rating ? '#ffc107' : '#ddd' }}>
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

