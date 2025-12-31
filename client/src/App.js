import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import Subcategories from './pages/Subcategories';
import SubcategoryProducts from './pages/SubcategoryProducts';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Contacts from './pages/Contacts';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import './App.css';

function AppContent() {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    // Проверяем, нужно ли показывать модальное окно авторизации
    const isAdminRoute = location.pathname.startsWith('/admin');
    if (!user && !isAdminRoute) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [user, location]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (product) => {
    const isFavorite = favorites.find(item => item.id === product.id);
    if (isFavorite) {
      setFavorites(favorites.filter(item => item.id !== product.id));
    } else {
      setFavorites([...favorites, product]);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  return (
    <div className="App">
      {showAuthModal && <AuthModal onAuthSuccess={handleAuthSuccess} />}
      <Header cartCount={cart.length} favoritesCount={favorites.length} user={user} />
      <Routes>
        <Route path="/" element={<Home addToCart={addToCart} toggleFavorite={toggleFavorite} favorites={favorites} />} />
        <Route path="/all-products" element={<AllProducts addToCart={addToCart} toggleFavorite={toggleFavorite} favorites={favorites} />} />
        <Route path="/category/:categoryId" element={<Subcategories />} />
        <Route path="/subcategory/:subcategoryId/products" element={<SubcategoryProducts addToCart={addToCart} toggleFavorite={toggleFavorite} favorites={favorites} />} />
        <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/account" element={<Account user={user} setUser={setUser} favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <Admin />
          </ProtectedAdminRoute>
        } />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

