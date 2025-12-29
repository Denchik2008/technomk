import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const ADMIN_PASSWORD = 'techno_center_get_money!';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      // Save authentication status
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminAuthTime', Date.now().toString());
      navigate('/admin');
    } else {
      setError('Неверный пароль!');
      setPassword('');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <span className="material-icons">admin_panel_settings</span>
            <h1>Вход в админ-панель</h1>
            <p>Введите пароль для доступа</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="password">
                <span className="material-icons">lock</span>
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Введите пароль"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="material-icons">error</span>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary login-btn">
              <span className="material-icons">login</span>
              Войти
            </button>
          </form>

          <div className="login-footer">
            <a href="/" className="back-link">
              <span className="material-icons">arrow_back</span>
              Вернуться на главную
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;



