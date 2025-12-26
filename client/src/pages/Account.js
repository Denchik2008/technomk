import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';

function Account({ user, setUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

        <div className="account-section">
          <h2>Мои заказы</h2>
          
          {loading ? (
            <div className="loading">Загрузка заказов...</div>
          ) : orders.length === 0 ? (
            <div className="empty-orders">
              <p>У вас пока нет заказов</p>
              <a href="/all-products" className="btn btn-primary">Перейти к покупкам</a>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;
