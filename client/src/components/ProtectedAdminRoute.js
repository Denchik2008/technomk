import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = () => {
    const authenticated = localStorage.getItem('adminAuthenticated');
    const authTime = localStorage.getItem('adminAuthTime');
    
    // Check if authenticated and session is still valid (24 hours)
    if (authenticated === 'true' && authTime) {
      const now = Date.now();
      const timePassed = now - parseInt(authTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (timePassed < twentyFourHours) {
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        // Session expired
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminAuthTime');
        navigate('/admin-login');
      }
    } else {
      navigate('/admin-login');
    }
  };

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Проверка доступа...
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

export default ProtectedAdminRoute;

