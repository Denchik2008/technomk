import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product, addToCart, toggleFavorite, isFavorite }) {
  return (
    <div className="product-card">
      {(product.isHit === 1 || product.isNew === 1) && (
        <div className="product-badges">
          {product.isHit === 1 && <span className="badge-hit">hit</span>}
          {product.isNew === 1 && <span className="badge-new">new</span>}
        </div>
      )}

      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <div className="placeholder-image">
            {(product.image === "" ? 
              <span className="material-icons">inventory_2</span> :
              <img src={product.image} alt={product.name} className="image-cool" />
            )}
            {/* <span className="material-icons">inventory_2</span> */}
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          {product.category && <p className="product-category">{product.category}</p>}
          {product.description && <p className="product-description">{product.description}</p>}
          
          <div className="product-footer">
            <div className="product-price">
              {product.price_from === 1 ? `от ${product.price}` : product.price} рублей
            </div>
          </div>
        </div>
      </Link>

      <button className="btn-buy" onClick={(e) => { e.preventDefault(); addToCart(product); }}>
        <span className="material-icons">shopping_cart</span>
        Купить
      </button>

      <button 
        className={`btn-favorite ${isFavorite ? 'active' : ''}`}
        onClick={() => toggleFavorite(product)}
      >
        <span className="material-icons">
          {isFavorite ? 'favorite' : 'favorite_border'}
        </span>
      </button>
    </div>
  );
}

export default ProductCard;

