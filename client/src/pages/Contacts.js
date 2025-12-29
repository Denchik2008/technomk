import React, { useState } from 'react';
import './Contacts.css';

function Contacts() {
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

    console.log('привет');

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
        setError('Сообщение не отправлено, попробуйте позже');
        return;
      }

      // Проверяем, была ли ошибка при отправке email
      if (data.emailError) {
        setError('Сообщение не отправлено, попробуйте позже');
      } else {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      setError('Сообщение не отправлено, попробуйте позже');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contacts-page page">
      <div className="container">
        <h1 className="section-title">Контакты</h1>

        <div className="contacts-content">
          <div className="contact-info">
            <div className="contact-item">
              <span className="material-icons">location_on</span>
              <div>
                <h3>Адрес</h3>
                <p>г. Красноярск, ул. Корнеева, 50</p>
              </div>
            </div>

            {/* <div className="contact-item">
              <span className="material-icons">phone</span>
              <div>
                <h3>Телефон</h3>
                <p>+7 (123) 456-78-90</p>
              </div>
            </div> */}

            <div className="contact-item">
              <span className="material-icons">email</span>
              <div>
                <h3>Email</h3>
                <p>technomk@gmail.com</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="material-icons">schedule</span>
              <div>
                <h3>Режим работы</h3>
                <p>Пн-Пт: 9:00 - 18:00</p>
                <p>Сб-Вс: 10:00 - 16:00</p>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Форма связи с администрацией</h2>
            
            {success && (
              <div className="success-message">
                <span className="material-icons">check_circle</span>
                Сообщение отправлено
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="material-icons">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>
                  Представьтесь, пожалуйста <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ваше имя"
                />
              </div>

              <div className="form-group">
                <label>
                  Электронная почта <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label>
                  Телефон <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div className="form-group">
                <label>
                  Текст сообщения <span className="required">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Опишите ваш вопрос или пожелание"
                />
              </div>

              <div className="form-group">
                <label>Прикрепить файл</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-input" className="file-input-label">
                    <span className="material-icons">attach_file</span>
                    {file ? file.name : 'Выберите файл'}
                  </label>
                </div>
                <p className="file-hint">Максимальный размер файла: 5 МБ</p>
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

export default Contacts;



