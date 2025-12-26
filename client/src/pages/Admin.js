import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    price_from: false,
    category_id: '',
    subcategory_id: '',
    description: '',
    image: '',
    isHit: false,
    isNew: false
  });
  const [subcategories, setSubcategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    has_comments: false
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    parent_id: '',
    name: '',
    description: '',
    image: ''
  });
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [managingCategoryId, setManagingCategoryId] = useState(null);
  const [categorySubcategories, setCategorySubcategories] = useState([]);
  const [orderFilter, setOrderFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingTotal, setEditingTotal] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderFilter, categoryFilter, activeTab]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?status=${orderFilter}&category_id=${categoryFilter}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleProductFormChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newForm = {
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // If category changed, load subcategories
    if (name === 'category_id' && value) {
      try {
        const response = await fetch(`/api/categories/${value}/subcategories`);
        const data = await response.json();
        setSubcategories(data);
        newForm.subcategory_id = ''; // Reset subcategory
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    }
    
    setProductForm(newForm);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...productForm,
      price: parseFloat(productForm.price),
      price_from: productForm.price_from ? 1 : 0,
      isHit: productForm.isHit ? 1 : 0,
      isNew: productForm.isNew ? 1 : 0
    };

    try {
      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (response.ok) {
          alert('Товар обновлен!');
        }
      } else {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (response.ok) {
          alert('Товар добавлен!');
        }
      }
      
      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ошибка при сохранении товара');
    }
  };

  const handleEditProduct = async (product) => {
    setEditingProduct(product);
    
    // Get subcategory info to determine parent category
    try {
      const subRes = await fetch('/api/subcategories');
      const subs = await subRes.json();
      const sub = subs.find(s => s.id === product.subcategory_id);
      
      if (sub) {
        // Load subcategories for this category
        const response = await fetch(`/api/categories/${sub.parent_id}/subcategories`);
        const data = await response.json();
        setSubcategories(data);
        
        setProductForm({
          name: product.name,
          price: product.price.toString(),
          price_from: product.price_from === 1,
          category_id: sub.parent_id.toString(),
          subcategory_id: product.subcategory_id?.toString() || '',
          description: product.description || '',
          image: product.image || '',
          isHit: product.isHit === 1,
          isNew: product.isNew === 1
        });
      }
    } catch (error) {
      console.error('Error loading product data:', error);
    }
    
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Товар удален!');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ошибка при удалении товара');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      category_id: '',
      subcategory_id: '',
      description: '',
      isHit: false,
      isNew: false
    });
    setSubcategories([]);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    // Подтверждение при отмене заказа
    if (newStatus === 'cancelled') {
      if (!window.confirm('Вы уверены, что хотите отменить этот заказ?')) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
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

  const handleUpdateOrderTotal = async (orderId) => {
    if (!editingTotal || isNaN(editingTotal)) {
      alert('Введите корректную сумму');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/total`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: parseFloat(editingTotal) })
      });
      if (response.ok) {
        alert('Стоимость заказа обновлена!');
        setEditingOrderId(null);
        setEditingTotal('');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order total:', error);
      alert('Ошибка при обновлении стоимости');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        ...categoryForm,
        has_comments: categoryForm.has_comments ? 1 : 0
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      if (response.ok) {
        alert('Категория добавлена!');
        setCategoryForm({ name: '', description: '', image: '', has_comments: false });
        setShowCategoryForm(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Ошибка при добавлении категории');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию? Все подкаталоги также будут удалены.')) {
      return;
    }
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Категория удалена!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Ошибка при удалении категории');
    }
  };

  const handleManageSubcategories = async (categoryId) => {
    setManagingCategoryId(categoryId);
    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories`);
      const data = await response.json();
      setCategorySubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subcategoryForm, parent_id: managingCategoryId })
      });
      if (response.ok) {
        alert('Подкаталог добавлен!');
        setSubcategoryForm({ parent_id: '', name: '', description: '' });
        setShowSubcategoryForm(false);
        handleManageSubcategories(managingCategoryId);
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
      alert('Ошибка при добавлении подкаталога');
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот подкаталог? Все товары в этом подкаталоге также будут удалены.')) {
      return;
    }
    try {
      const response = await fetch(`/api/subcategories/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Подкаталог удален!');
        handleManageSubcategories(managingCategoryId);
        fetchProducts(); // Refresh products list
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Ошибка при удалении подкаталога');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminAuthTime');
      navigate('/admin-login');
    }
  };

  return (
    <div className="admin-page page">
      <div className="container">
        <div className="admin-page-header">
          <h1 className="section-title">Панель администратора</h1>
          <button className="btn btn-danger logout-btn" onClick={handleLogout}>
            <span className="material-icons">logout</span>
            Выйти
          </button>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span className="material-icons">inventory_2</span>
            Товары
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="material-icons">shopping_bag</span>
            Заказы
          </button>
          <button
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <span className="material-icons">category</span>
            Категории
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="admin-content">
            <div className="admin-header">
              <h2>Управление товарами</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowProductForm(!showProductForm)}
              >
                <span className="material-icons">add</span>
                Добавить товар
              </button>
            </div>

            {showProductForm && (
              <div className="product-form-container">
                <form className="product-form" onSubmit={handleProductSubmit}>
                  <h3>{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h3>
                  
                  <div className="form-group">
                    <label>Название *</label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Цена (руб.) *</label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Каталог *</label>
                    <select
                      name="category_id"
                      value={productForm.category_id}
                      onChange={handleProductFormChange}
                      required
                    >
                      <option value="">Выберите каталог</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Подкаталог *</label>
                    <select
                      name="subcategory_id"
                      value={productForm.subcategory_id}
                      onChange={handleProductFormChange}
                      required
                      disabled={!productForm.category_id}
                    >
                      <option value="">Сначала выберите каталог</option>
                      {subcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Описание</label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Изображение (URL или выберите файл)</label>
                    <input
                      type="text"
                      name="image"
                      value={productForm.image}
                      onChange={handleProductFormChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-checkboxes">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="price_from"
                        checked={productForm.price_from}
                        onChange={handleProductFormChange}
                      />
                      <span>Цена "от"</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isHit"
                        checked={productForm.isHit}
                        onChange={handleProductFormChange}
                      />
                      <span>Хит продаж</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isNew"
                        checked={productForm.isNew}
                        onChange={handleProductFormChange}
                      />
                      <span>Новинка</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-success">
                      {editingProduct ? 'Сохранить' : 'Добавить'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetProductForm}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Название</th>
                    <th>Цена</th>
                    <th>Подкаталог</th>
                    <th>Hit</th>
                    <th>New</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>{product.name}</td>
                      <td>{product.price} руб.</td>
                      <td>-</td>
                      <td>{product.isHit === 1 ? '✓' : '-'}</td>
                      <td>{product.isNew === 1 ? '✓' : '-'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEditProduct(product)}
                            title="Редактировать"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Удалить"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-content">
            <div className="admin-header">
              <h2>Управление заказами</h2>
              <div className="order-filters-row">
                <div className="order-filter">
                  <button
                    className={`filter-btn ${orderFilter === 'pending' || orderFilter === 'under_review' || orderFilter === 'awaiting_payment' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('pending')}
                  >
                    Невыполненные
                  </button>
                  <button
                    className={`filter-btn ${orderFilter === 'completed' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('completed')}
                  >
                    Выполненные
                  </button>
                  <button
                    className={`filter-btn ${orderFilter === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('cancelled')}
                  >
                    Отмененные
                  </button>
                </div>
                <div className="category-filter">
                  <label>Категория:</label>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="all">Все заказы</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <span className="material-icons">inbox</span>
                <h3>Заказов нет</h3>
                <p>Здесь будут отображаться заказы</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => {
                  const getStatusLabel = (status) => {
                    const labels = { under_review: 'На рассмотрении', awaiting_payment: 'Ожидает оплаты', pending: 'Ожидает', confirmed: 'Подтвержден', completed: 'Завершен', cancelled: 'Отменен' };
                    return labels[status] || status;
                  };

                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <h3>Заказ №{order.id}</h3>
                          <p className="order-date">{new Date(order.created_at).toLocaleString('ru-RU')}</p>
                        </div>
                        <div className={`order-status ${order.status}`}>{getStatusLabel(order.status)}</div>
                      </div>

                      <div className="order-customer">
                        <div className="customer-info"><span className="material-icons">person</span><span>{order.customer_name}</span></div>
                        <div className="customer-info"><span className="material-icons">phone</span><span>{order.customer_phone}</span></div>
                        {order.customer_email && <div className="customer-info"><span className="material-icons">email</span><span>{order.customer_email}</span></div>}
                        {order.customer_address && <div className="customer-info"><span className="material-icons">location_on</span><span>{order.customer_address}</span></div>}
                      </div>

                      {order.comment && <div className="order-comment"><strong>Комментарий:</strong> {order.comment}</div>}

                      <div className="order-items">
                        <h4>Товары:</h4>
                        {order.items && order.items.map((item, index) => (
                          <div key={index} className="order-item-full">
                            {/* {item.image && <img src={item.image} alt={item.name} className="item-image" />} */}
                            <div className="item-details">
                              <span className="item-category">{item.category_name} › {item.subcategory_name} › </span>
                              <span className="item-name">{item.name}</span>
                            </div>
                            <span className="item-quantity">x{item.quantity}</span>
                            <span className="item-price">{item.price * item.quantity} ₽</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-total-section">
                          {editingOrderId === order.id ? (
                            <div className="edit-total">
                              <input type="number" value={editingTotal} onChange={(e) => setEditingTotal(e.target.value)} placeholder="Новая сумма" />
                              <button className="btn btn-sm btn-success" onClick={() => handleUpdateOrderTotal(order.id)}>Сохранить</button>
                              <button className="btn btn-sm btn-secondary" onClick={() => { setEditingOrderId(null); setEditingTotal(''); }}>Отмена</button>
                            </div>
                          ) : (
                            <div className="order-total">
                              Итого: <strong>{order.total} ₽</strong>
                              {order.has_comment === 1 && order.status === 'under_review' && (
                                <button className="btn-icon" onClick={() => { setEditingOrderId(order.id); setEditingTotal(order.total); }} title="Изменить цену">
                                  <span className="material-icons">edit</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="order-actions">
                          {order.status === 'under_review' && (
                            <button className="btn btn-primary" onClick={() => handleOrderStatusChange(order.id, 'awaiting_payment')}>
                              <span className="material-icons">schedule</span>Перевести в ожидание
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <>
                              <button className="btn btn-success" onClick={() => handleOrderStatusChange(order.id, 'completed')}>
                                <span className="material-icons">check</span>Отметить выполненным
                              </button>
                              <button className="btn btn-warning" onClick={() => handleOrderStatusChange(order.id, 'cancelled')}>
                                <span className="material-icons">cancel</span>Отменить
                              </button>
                            </>
                          )}
                          {order.status === 'completed' && (
                            <button className="btn btn-secondary" onClick={() => handleOrderStatusChange(order.id, 'pending')}>
                              <span className="material-icons">undo</span>Вернуть в ожидание
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="admin-content">
            <div className="admin-header">
              <h2>Управление категориями</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowCategoryForm(!showCategoryForm)}
              >
                <span className="material-icons">add</span>
                Добавить категорию
              </button>
            </div>

            {showCategoryForm && (
              <div className="product-form-container">
                <form className="product-form" onSubmit={handleCategorySubmit}>
                  <h3>Новая категория</h3>
                  
                  <div className="form-group">
                    <label>Название *</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Описание</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Изображение (URL)</label>
                    <input
                      type="text"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-checkboxes">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={categoryForm.has_comments}
                        onChange={(e) => setCategoryForm({ ...categoryForm, has_comments: e.target.checked })}
                      />
                      <span>Требуются комментарии при заказе</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-success">Добавить</button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCategoryForm(false)}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Подкаталоги</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.id}>
                      <td>{index + 1}</td>
                      <td>{category.name}</td>
                      <td>{category.description || '-'}</td>
                      <td>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleManageSubcategories(category.id)}
                          title="Управление подкаталогами"
                        >
                          <span className="material-icons">folder_open</span>
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteCategory(category.id)}
                            title="Удалить"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subcategories Management Modal */}
        {managingCategoryId && (
          <div className="modal-overlay" onClick={() => setManagingCategoryId(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Управление подкаталогами</h2>
                <button className="modal-close" onClick={() => setManagingCategoryId(null)}>
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="modal-body">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowSubcategoryForm(!showSubcategoryForm)}
                  style={{ marginBottom: '20px' }}
                >
                  <span className="material-icons">add</span>
                  Добавить подкаталог
                </button>

                {showSubcategoryForm && (
                  <form className="product-form" onSubmit={handleSubcategorySubmit} style={{ marginBottom: '20px' }}>
                    <h3>Новый подкаталог</h3>
                    
                    <div className="form-group">
                      <label>Название *</label>
                      <input
                        type="text"
                        value={subcategoryForm.name}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Описание</label>
                      <textarea
                        value={subcategoryForm.description}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label>Изображение (URL)</label>
                      <input
                        type="text"
                        value={subcategoryForm.image}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">Добавить</button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowSubcategoryForm(false)}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                )}

                <div className="products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySubcategories.map((sub, index) => (
                        <tr key={sub.id}>
                          <td>{index + 1}</td>
                          <td>{sub.name}</td>
                          <td>{sub.description || '-'}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                title="Удалить"
                              >
                                <span className="material-icons">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {categorySubcategories.length === 0 && (
                    <div className="empty-state">
                      <span className="material-icons">folder</span>
                      <p>Подкаталогов нет</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;

