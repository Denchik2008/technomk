/* eslint-disable unicode-bom */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Home.css';

function Home({ addToCart, toggleFavorite, favorites }) {
  const [products, setProducts] = useState([]);
  const [hitProducts, setHitProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setHitProducts(data.filter(p => p.isHit).slice(0, 8));
      setNewProducts(data.filter(p => p.isNew).slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const isFavorite = (product) => {
    return favorites.some(fav => fav.id === product.id);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
          <h1>ТехноМиКс</h1>
          <p className="hero-subtitle">Рады видеть вас на нашем сайте!</p>
            <div className="hero-features">
              <div className="hero-feature">
                <span className="material-icons">card_giftcard</span>
                <span>Заказать сувенирную продукцию</span>
              </div>
              <div className="hero-feature">
                <span className="material-icons">school</span>
                <span>Приобрести наборы для мастер-классов</span>
              </div>
              <div className="hero-feature">
                <span className="material-icons">redeem</span>
                <span>Выбрать необычные подарки</span>
              </div>
            </div>
            <p className="hero-cta">Приятных покупок!</p>
          </div>
        </div>
      </section>

      {/* <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="material-icons">whatshot</span>
              Товары по акции
            </h2>
          </div>
          <div className="products-grid">
            {products.slice(0, 8).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite(product)}
              />
            ))}
          </div>
        </div>
      </section> */}

      <section className="section bg-light">
        <div className="container">
          <h2 className="section-subtitle">
            <span>
              <span className="material-icons">stars</span>
              Хиты продаж
            </span>
            <Link to="/all-products" className="view-all-link">Смотреть все</Link>
          </h2>
          <div className="products-grid">
            {hitProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite(product)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <span className="material-icons">local_shipping</span>
              <h3>Доставка</h3>
              <p>В зависимости от района стоимость доставки по Красноярску от 100 руб.</p>
            </div>
            <div className="info-card">
              <span className="material-icons">school</span>
              <h3>Мастер-классы</h3>
              <p>Наши мастер-классы очень любят взрослые и дети! Следите за расписанием!</p>
            </div>
            <div className="info-card">
              <span className="material-icons">local_offer</span>
              <h3>Наши цены</h3>
              <p>У нас очень низкие цены, а еще бывают скидки, так что следите за акциями!</p>
            </div>
            <div className="info-card">
              <span className="material-icons">feedback</span>
              <h3>Обратная связь</h3>
              <p>Нам всегда интересны все ваши пожелания и советы! Пишите нам!</p>
            </div>
          </div>
        </div>
      </section>

      {newProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-subtitle">
              <span>
                <span className="material-icons">new_releases</span>
                Новинки
              </span>
              <Link to="/catalog" className="view-all-link">Смотреть все</Link>
            </h2>
            <div className="products-grid">
              {newProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  toggleFavorite={toggleFavorite}
                  isFavorite={isFavorite(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
