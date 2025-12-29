import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Subcategories.css';

function Subcategories() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAndSubcategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const fetchCategoryAndSubcategories = async () => {
    try {
      // Получаем информацию о категории
      const categoriesRes = await fetch('/api/categories');
      const categories = await categoriesRes.json();
      const foundCategory = categories.find(c => c.id === parseInt(categoryId));
      setCategory(foundCategory);

      // Получаем подкаталоги
      const subcategoriesRes = await fetch(`/api/categories/${categoryId}/subcategories`);
      const data = await subcategoriesRes.json();
      setSubcategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setLoading(false);
    }
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

  if (!category) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <span className="material-icons">error</span>
            <h3>Категория не найдена</h3>
            <Link to="/" className="btn btn-primary">Вернуться на главную</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subcategories-page page">
      <div className="container">
        <Link to="/" className="back-link">
          <span className="material-icons">arrow_back</span>
          Назад на главную
        </Link>

        <h1 className="section-title">{category.name}</h1>
        {category.description && <p className="category-description">{category.description}</p>}

        {subcategories.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">category</span>
            <h3>Подкаталоги не найдены</h3>
            <p>В этой категории пока нет подкаталогов</p>
          </div>
        ) : (
          <div className="subcategories-grid">
            {subcategories.map(subcategory => (
              <Link
                key={subcategory.id}
                to={`/subcategory/${subcategory.id}/products`}
                className="subcategory-card"
              >
                <div className="subcategory-image">
                  <div className="placeholder-image">
                    <img src={subcategory.image} alt={subcategory.name} className="image-cool" />
                    {/* <span className="material-icons">folder</span> */}
                  </div>
                </div>
                <div className="subcategory-info">
                  <h3 className="subcategory-name">{subcategory.name}</h3>
                  {subcategory.description && (
                    <p className="subcategory-description">{subcategory.description}</p>
                  )}
                  <div className="subcategory-link-text">
                    <span>Перейти</span>
                    <span className="material-icons">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Subcategories;



