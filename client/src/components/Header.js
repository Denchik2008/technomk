import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ cartCount, favoritesCount, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <header className="header">
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="contact-info">
              <span className="material-icons">email</span>
              <span>tehnomk24@mail.ru</span>
            </div>
            <div className="contact-info">
              <span className="material-icons">schedule</span>
              <span>с 10:00 до 19:00</span>
            </div>
            {user ? (
              <Link to="/account" className="contact-info user-link">
                <span className="material-icons">account_circle</span>
                <span>{user.name}</span>
              </Link>
            ) : (
              <Link to="/login" className="contact-info user-link">
                <span className="material-icons">login</span>
                <span>Войти</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="main-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link to="/">
                <h1>ТехноМиКс</h1>
              </Link>
            </div>

            <nav className={`nav ${menuOpen ? 'open' : ''}`}>
              <Link to="/" onClick={() => setMenuOpen(false)}>Главная</Link>
              <Link to="/all-products" onClick={() => setMenuOpen(false)}>Все товары</Link>
              
              <div className="catalog-dropdown">
                <button 
                  className="catalog-btn"
                  onClick={() => setCatalogOpen(!catalogOpen)}
                  onBlur={() => setTimeout(() => setCatalogOpen(false), 200)}
                >
                  Каталог
                  <span className="material-icons">{catalogOpen ? 'expand_less' : 'expand_more'}</span>
                </button>
                {catalogOpen && (
                  <div className="dropdown-menu">
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        to={`/category/${category.id}`}
                        className="dropdown-item"
                        onClick={() => { setCatalogOpen(false); setMenuOpen(false); }}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/cart" onClick={() => setMenuOpen(false)}>Корзина</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Контакты</Link>
            </nav>

            <div className="header-actions">
              <Link to="/cart" className="icon-button">
                <span className="material-icons">shopping_cart</span>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
              <button className="icon-button menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="material-icons">{menuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

