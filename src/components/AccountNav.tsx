/**
 * src/components/AccountNav.tsx
 * Componente reactivo para mostrar el link de cuenta y botón de logout
 */

import { useState, useEffect } from 'react';

export default function AccountNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Verificar estado inicial desde localStorage
    // localStorage es la fuente de verdad para la sesión actual
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      const guest = localStorage.getItem('isGuest') === 'true';
      setIsAuthenticated(auth);
      setIsGuest(guest);
      setHasCheckedAuth(true);
      console.log('🔍 AccountNav: auth=', auth, 'guest=', guest);
    };

    checkAuth();

    // Escuchar cambios
    const handleAuthChanged = () => {
      console.log('🔄 AccountNav: auth-changed detectado');
      checkAuth();
    };

    const handleStorageChange = () => {
      console.log('🔄 AccountNav: storage cambió');
      checkAuth();
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    window.addEventListener('storage', handleStorageChange);

    // Poll cada 500ms como backup
    const interval = setInterval(checkAuth, 500);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Redireccionar a /auth si no está autenticado y no es invitado
    // PERO SOLO después de verificar localStorage (hasCheckedAuth = true)
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === '/auth' || currentPath === '/login' || currentPath === '/register';
    
    // Si aún no hemos verificado localStorage, no redirigir
    if (!hasCheckedAuth) {
      return;
    }
    
    // Solo redirigir desde / si realmente no está autenticado
    if (currentPath === '/' && !isAuthPage && !isAuthenticated && !isGuest) {
      console.log('📍 Redirigiendo a /auth - no autenticado');
      window.location.href = '/auth';
    }
  }, [isAuthenticated, isGuest, hasCheckedAuth]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestLoginTime');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');

      // Disparar evento
      window.dispatchEvent(new Event('auth-changed'));

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        window.location.href = '/login';
      } else {
        alert('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error al cerrar sesión');
    }
  };

  // Si es invitado, mostrar opción de iniciar sesión
  if (isGuest) {
    return (
      <a 
        href="/login" 
        className="p-2 text-jd-black hover:text-jd-red transition"
        title="Iniciar Sesión"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </a>
    );
  }

  // Si está autenticado
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <a 
          href="/account" 
          className="p-2 text-jd-black hover:text-jd-red transition"
          title="Mi cuenta"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </a>
        <button
          onClick={handleLogout}
          className="p-2 text-jd-black hover:text-jd-red transition"
          title="Cerrar Sesión"
          id="logout-btn"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    );
  }

  // Si no está autenticado
  return (
    <a 
      href="/auth" 
      className="p-2 text-jd-black hover:text-jd-red transition"
      title="Mi cuenta"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </a>
  );
}
