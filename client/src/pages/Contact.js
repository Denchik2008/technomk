import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    console.log('привет'); // Как и просил пользователь

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('message', formData.message);
      if (file) {
        formDataToSend.append('attachment', file);
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки сообщения');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page page">
      <div className="container">
        <h1 className="section-title">Свяжитесь с нами</h1>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>Наши контакты</h2>
            <div className="info-item">
              <span className="material-icons">location_on</span>
              <div>
                <strong>Адрес:</strong>
                <p>г. Красноярск</p>
              </div>
            </div>
            <div className="info-item">
              <span className="material-icons">phone</span>
              <div>
                <strong>Телефон:</strong>
                <p>+7 (XXX) XXX-XX-XX</p>
              </div>
            </div>
            <div className="info-item">
              <span className="material-icons">email</span>
              <div>
                <strong>Email:</strong>
                <p>info@technomix.ru</p>
              </div>
            </div>
            <div className="info-item">
              <span className="material-icons">schedule</span>
              <div>
                <strong>Режим работы:</strong>
                <p>Пн-Пт: 9:00 - 18:00</p>
                <p>Сб-Вс: 10:00 - 16:00</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <h2>Форма обратной связи</h2>
            
            {success && (
              <div className="success-message">
                Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Представьтесь, пожалуйста *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ваше имя"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Электронная почта *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Телефон *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Текст сообщения *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Напишите ваше сообщение..."
                  rows="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="file-input" className="file-label">
                  <span className="material-icons">attach_file</span>
                  Прикрепить файл
                </label>
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                />
                {file && (
                  <p className="file-name">
                    <span className="material-icons">description</span>
                    {file.name}
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;

