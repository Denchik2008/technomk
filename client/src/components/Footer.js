import React from 'react';
import './Footer.css';

function Footer() {
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
                <li><a href="#delivery">Доставка</a></li>
                <li><a href="#payment">Оплата</a></li>
                <li><a href="#about">О нас</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Подписаться на новости</h4>
              <p>Будьте в курсе акций и новинок!</p>
              <div className="newsletter">
                <input type="email" placeholder="Ваш email" />
                <button className="btn btn-primary">Отправить</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>©2025 ТехноМиКс. Все права защищены.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

