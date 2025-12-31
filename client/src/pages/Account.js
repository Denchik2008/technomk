import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Account.css';

function Account({ user, setUser, favorites, toggleFavorite }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('все');
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId) => {
    if (!window.confirm('Подтвердить оплату заказа?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' })
      });

      if (response.ok) {
        alert('Заказ оплачен! Статус изменен на "Ожидает"');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Ошибка при обновлении заказа');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }
  };
  const handleOrderStatusSetCencelled = async (orderId) => {
    // Подтверждение при отмене заказа
    if (!window.confirm('Вы уверены, что хотите отменить этот заказ?')) {
        return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (response.ok) {
        alert('Статус заказа обновлен!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const getStatusLabel = (status) => {
    const statuses = {
      'under_review': 'На рассмотрении',
      'awaiting_payment': 'Ожидает оплаты',
      'pending': 'Ожидает',
      'confirmed': 'Подтвержден',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    };
    return statuses[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      'under_review': 'status-review',
      'awaiting_payment': 'status-awaiting',
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  };

  const filterOrders = (orders) => {
    if (orderFilter === 'все') {
      return orders;
    } else if (orderFilter === 'завершенные') {
      return orders.filter(order => 
        order.status === 'completed' || order.status === 'cancelled'
      );
    } else if (orderFilter === 'активные') {
      return orders.filter(order => 
        order.status === 'under_review' || 
        order.status === 'awaiting_payment' || 
        order.status === 'pending'
      );
    }
    return orders;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="account-page page">
      <div className="container">
        <div className="account-header">
          <div>
            <h1 className="section-title">Личный кабинет</h1>
            <p className="account-email">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Выйти
          </button>
        </div>

        <div className="account-tabs">
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="material-icons">shopping_bag</span>
            Мои заказы
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <span className="material-icons">favorite</span>
            Понравившиеся
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="account-section">
            <div className="orders-header">
              <h2>Мои заказы</h2>
              <div className="order-filter">
              <label>Посмотреть заказы: </label>
              <select 
                value={orderFilter} 
                onChange={(e) => setOrderFilter(e.target.value)}
                className="filter-select"
              >
                <option value="все">Все</option>
                <option value="активные">Активные</option>
                <option value="завершенные">Завершенные</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Загрузка заказов...</div>
          ) : orders.length === 0 ? (
            <div className="empty-orders">
              <p>У вас пока нет заказов</p>
              <a href="/all-products" className="btn btn-primary">Перейти к покупкам</a>
            </div>
          ) : filterOrders(orders).length === 0 ? (
            <div className="empty-orders">
              <p>Нет заказов в выбранной категории</p>
            </div>
          ) : (
            <div className="orders-list">
              {filterOrders(orders).map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Заказ №{order.id}</h3>
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {order.comment && (
                    <div className="order-comment">
                      <strong>Комментарий:</strong> {order.comment}
                    </div>
                  )}

                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="order-item-image" />
                        ) : (
                          <div className="order-item-image-placeholder">
                            <span className="material-icons">inventory_2</span>
                          </div>
                        )}
                        <div className="order-item-details">
                          <p className="order-item-name">{item.name}</p>
                          <p className="order-item-category">
                            {item.category_name} › {item.subcategory_name}
                          </p>
                          <p className="order-item-quantity">Количество: {item.quantity}</p>
                        </div>
                        <p className="order-item-price">{item.price * item.quantity} ₽</p>
                      </div>
                    ))}
                  </div>

                  <div className="order-total">
                    <strong>Итого:</strong> {order.total} ₽
                  </div>

                  {order.status === 'awaiting_payment' && (
                    <div className="order-actions">
                      <button 
                        className="btn btn-success"
                        onClick={() => handlePayment(order.id)}
                      >
                        <span className="material-icons">payment</span>
                        Оплатить
                      </button>

                      <button 
                        className="btn btn-warning" 
                        onClick={() => handleOrderStatusSetCencelled(order.id)}
                      >
                        <span className="material-icons">cancel</span>
                        Отменить
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        ) : (
          <div className="account-section">
            <h2>Понравившиеся товары</h2>
            
            {!favorites || favorites.length === 0 ? (
              <div className="empty-favorites">
                <span className="material-icons large-icon">favorite_border</span>
                <p>У вас пока нет понравившихся товаров</p>
                <Link to="/all-products" className="btn btn-primary">Перейти к покупкам</Link>
              </div>
            ) : (
              <div className="favorites-grid">
                {favorites.map(product => (
                  <div key={product.id} className="favorite-card">
                    <button 
                      className="btn-remove-favorite"
                      onClick={() => toggleFavorite(product)}
                      title="Удалить из избранного"
                    >
                      <span className="material-icons">close</span>
                    </button>
                    
                    <Link to={`/product/${product.id}`} className="favorite-link">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="favorite-image" />
                      ) : (
                        <div className="favorite-image-placeholder">
                          <span className="material-icons">inventory_2</span>
                        </div>
                      )}
                      
                      <div className="favorite-info">
                        <h3 className="favorite-name">{product.name}</h3>
                        {product.description && (
                          <p className="favorite-description">{product.description}</p>
                        )}
                        <div className="favorite-price">
                          {product.price_from === 1 ? `от ${product.price}` : product.price} ₽
                        </div>
                      </div>
                    </Link>
                    
                    <button 
                      className="btn btn-primary btn-add-to-cart"
                      onClick={() => {
                        // Добавить в корзину (нужно передать функцию из App.js)
                        alert('Товар добавлен в корзину');
                      }}
                    >
                      <span className="material-icons">shopping_cart</span>
                      В корзину
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;
