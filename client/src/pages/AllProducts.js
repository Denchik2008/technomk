import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

function AllProducts({ addToCart, toggleFavorite, favorites }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 10000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, priceRange]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);

      // Calculate min and max prices
      if (data.length > 0) {
        const prices = data.map(p => p.price);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setMinPrice(min);
        setMaxPrice(max);
        setPriceRange([min, max]);
        setTempPriceRange([min, max]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(filtered);
  };

  const applyPriceFilter = () => {
    setPriceRange(tempPriceRange);
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
    <div className="catalog-page page">
      <div className="container">
        <Link to="/" className="back-link">
          <span className="material-icons">arrow_back</span>
          Назад на главную
        </Link>

        <h1 className="section-title">Все товары</h1>
        <p className="category-description">Полный каталог всех доступных товаров</p>

        <div className="catalog-controls">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="price-filter">
            <label>Цена:</label>
            <div className="price-range-inputs">
              <input
                type="number"
                value={tempPriceRange[0]}
                onChange={(e) => setTempPriceRange([parseInt(e.target.value) || 0, tempPriceRange[1]])}
                min={minPrice}
                max={maxPrice}
              />
              <span>-</span>
              <input
                type="number"
                value={tempPriceRange[1]}
                onChange={(e) => setTempPriceRange([tempPriceRange[0], parseInt(e.target.value) || maxPrice])}
                min={minPrice}
                max={maxPrice}
              />
            </div>
            <div className="price-range-sliders">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={tempPriceRange[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val < tempPriceRange[1]) {
                    setTempPriceRange([val, tempPriceRange[1]]);
                  }
                }}
                className="range-min"
              />
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={tempPriceRange[1]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > tempPriceRange[0]) {
                    setTempPriceRange([tempPriceRange[0], val]);
                  }
                }}
                className="range-max"
              />
            </div>
            <button className="btn btn-secondary" onClick={applyPriceFilter}>
              Применить
            </button>
          </div>
        </div>

        <div className="catalog-info">
          <p>Найдено товаров: <strong>{filteredProducts.length}</strong> из {products.length}</p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite(product)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="material-icons">search_off</span>
            <h3>Товары не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllProducts;

