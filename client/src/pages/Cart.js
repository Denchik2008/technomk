import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

function Cart({ cart, updateQuantity, removeFromCart, clearCart, user }) {
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    comment: ''
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [needsComment, setNeedsComment] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    // Check if any product requires comments
    const checkCategories = async () => {
      try {
        const categories = await fetch('/api/categories').then(r => r.json());
        
        // Get all products with their subcategories
        const products = await fetch('/api/products').then(r => r.json());
        const subcategories = await fetch('/api/subcategories').then(r => r.json());
        
        // Check if any cart item is from a category that has_comments
        const hasCommentCategory = cart.some(cartItem => {
          const product = products.find(p => p.id === cartItem.id);
          if (!product) return false;
          
          const subcategory = subcategories.find(s => s.id === product.subcategory_id);
          if (!subcategory) return false;
          
          const category = categories.find(c => c.id === subcategory.parent_id);
          return category && category.has_comments === 1;
        });
        
        setNeedsComment(hasCommentCategory);
      } catch (error) {
        console.error('Error checking categories:', error);
      }
    };
    
    if (cart.length > 0) {
      checkCategories();
    }
  }, [cart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm({ ...orderForm, [name]: value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    try {
      const hasComment = cart.some(item => item.price_from === 1);

      const orderData = {
        ...orderForm,
        user_id: user ? user.id : null,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalPrice,
        has_comment: hasComment ? 1 : 0,
        status: hasComment ? 'under_review' : 'awaiting_payment'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при оформлении заказа');
      }

      if (!hasComment) {
        const paymentResponse = await fetch('/api/payments/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId: data.id })
        });

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok || !paymentData.paymentUrl) {
          throw new Error(paymentData.error || 'Не удалось получить ссылку на оплату');
        }

        clearCart();
        setOrderForm({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          customer_address: '',
          comment: ''
        });
        setOrderSubmitted(true);
        window.location.href = paymentData.paymentUrl;
        return;
      }

      setOrderSubmitted(true);
      clearCart();
      setOrderForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        comment: ''
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(error.message || 'Ошибка при оформлении заказа. Попробуйте еще раз.');
    }
  };

  if (orderSubmitted) {
    return (
      <div className="page">
        <div className="container">
          <div className="order-success">
            <span className="material-icons">check_circle</span>
            <h2>Заказ успешно оформлен!</h2>
            <p>Мы свяжемся с вами в ближайшее время для подтверждения заказа.</p>
            <Link to="/" className="btn btn-primary">
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <span className="material-icons">shopping_cart</span>
            <h3>Корзина пуста</h3>
            <p>Добавьте товары из каталога</p>
            <Link to="/all-products" className="btn btn-primary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page">
      <div className="container">
        <h1 className="section-title">Корзина</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <span className="material-icons">inventory_2</span>
                </div>

                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  {item.category && <p className="cart-item-category">{item.category}</p>}
                  <p className="cart-item-price">{item.price} руб.</p>
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <span className="material-icons">remove</span>
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <span className="material-icons">add</span>
                    </button>
                  </div>

                  <div className="cart-item-total">
                    {item.price * item.quantity} руб.
                  </div>

                  <button
                    className="btn-remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Итого</h2>
            <div className="summary-row">
              <span>Товары ({cart.length}):</span>
              <span>{totalPrice} руб.</span>
            </div>
            <div className="summary-row total">
              <span>Всего к оплате:</span>
              <span>{totalPrice} руб.</span>
            </div>

            {!showCheckout ? (
              <button
                className="btn btn-primary btn-block"
                onClick={() => setShowCheckout(true)}
              >
                Оформить заказ
              </button>
            ) : (
              <form className="checkout-form" onSubmit={handleSubmitOrder}>
                <h3>Контактные данные</h3>
                <input
                  type="text"
                  name="customer_name"
                  placeholder="Ваше имя *"
                  required
                  value={orderForm.customer_name}
                  onChange={handleInputChange}
                />
                <input
                  type="email"
                  name="customer_email"
                  placeholder="Email *"
                  required
                  value={orderForm.customer_email}
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="customer_phone"
                  placeholder="Телефон *"
                  required
                  value={orderForm.customer_phone}
                  onChange={handleInputChange}
                />
                <textarea
                  name="customer_address"
                  placeholder="Адрес доставки"
                  rows="3"
                  value={orderForm.customer_address}
                  onChange={handleInputChange}
                />
                {needsComment && (
                  <textarea
                    name="comment"
                    placeholder="Комментарий к заказу (детали, количество участников и т.д.)"
                    rows="4"
                    value={orderForm.comment}
                    onChange={handleInputChange}
                  />
                )}
                <button type="submit" className="btn btn-success btn-block">
                  Оплатить
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => setShowCheckout(false)}
                >
                  Отмена
                </button>
              </form>
            )}

            <button className="btn-clear" onClick={clearCart}>
              <span className="material-icons">delete_outline</span>
              Очистить корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

