import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      if (!data.user || data.user.is_admin !== 1) {
        throw new Error('У вас нет доступа к админ-панели');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/admin');
    } catch (loginError) {
      setError(loginError.message || 'Ошибка входа');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <span className="material-icons">admin_panel_settings</span>
            <h1>Вход в админ-панель</h1>
            <p>Войдите под учетной записью администратора</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <span className="material-icons">mail</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="example@email.com"
                autoFocus
                required
              />
            </div>

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
                required
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="material-icons">error</span>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              <span className="material-icons">login</span>
              {loading ? 'Вход...' : 'Войти'}
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
