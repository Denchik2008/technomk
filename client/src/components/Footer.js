import React, { useState } from 'react';
import './Footer.css';

function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  const openModal = (title, content) => {
    setModalContent({ title, content });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const infoLinks = {
    delivery: {
      title: 'Доставка',
      content: 'Здесь будет информация о доставке. Текст добавит пользователь.'
    },
    payment: {
      title: 'Оплата',
      content: 'Здесь будет информация об оплате. Текст добавит пользователь.'
    },
    privacy: {
      title: 'Политика конфиденциальности',
      content: 'Здесь будет текст политики конфиденциальности. Текст добавит пользователь.'
    },
    oferta: {
      title: 'Оферта',
      content: 'Здесь будет текст оферты. Текст добавит пользователь.'
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>ТехноМиКс</h3>
              <p>Интернет-магазин мастер-классов и сувенирной продукции</p>
            </div>

            <div className="footer-section">
              <h4>Контакты</h4>
              <div className="footer-contact">
                <span className="material-icons">email</span>
                <span>tehnomk24@mail.ru</span>
              </div>
              <div className="footer-contact">
                <span className="material-icons">schedule</span>
                <span>с 10:00 до 19:00</span>
              </div>
              <div className="footer-contact">
                <span className="material-icons">location_on</span>
                <span>Россия, Красноярск</span>
              </div>
            </div>

            <div className="footer-section">
              <h4>Информация</h4>
              <ul>
                <li>
                  <button 
                    className="info-link" 
                    onClick={() => openModal(infoLinks.delivery.title, infoLinks.delivery.content)}
                  >
                    Доставка
                  </button>
                </li>
                <li>
                  <button 
                    className="info-link" 
                    onClick={() => openModal(infoLinks.payment.title, infoLinks.payment.content)}
                  >
                    Оплата
                  </button>
                </li>
                <li>
                  <button 
                    className="info-link" 
                    onClick={() => openModal(infoLinks.privacy.title, infoLinks.privacy.content)}
                  >
                    Политика конфиденциальности
                  </button>
                </li>
                <li>
                  <button 
                    className="info-link" 
                    onClick={() => openModal(infoLinks.oferta.title, infoLinks.oferta.content)}
                  >
                    Оферта
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>©2025 ТехноМиКс. Все права защищены.</p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="info-modal-overlay" onClick={closeModal}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <h2>{modalContent.title}</h2>
              <button className="close-modal-btn" onClick={closeModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="info-modal-body">
              <p>{modalContent.content}</p>
            </div>
            <div className="info-modal-footer">
              <button className="btn btn-primary" onClick={closeModal}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;



