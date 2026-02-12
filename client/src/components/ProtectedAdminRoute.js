import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children, user, authHydrated }) {
  if (!authHydrated) {
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

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (Number(user.is_admin) !== 1) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
