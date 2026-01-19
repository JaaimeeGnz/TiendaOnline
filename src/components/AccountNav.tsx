/**
 * src/components/AccountNav.tsx
 * Componente reactivo para mostrar el link de cuenta y botón de logout
 */

import { useState, useEffect } from 'react';

export default function AccountNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      const guest = localStorage.getItem('isGuest') === 'true';
      setIsAuthenticated(auth);
      setIsGuest(guest);
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
    // Solo redirigir después de un delay para que localStorage se estabilice
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === '/auth' || currentPath === '/login' || currentPath === '/register';
    
    // No redirigir si ya estamos en página de auth o si es root /
    if (isAuthPage || currentPath === '/') {
      // En /, haremos la redirección basada en localStorage directamente
      if (currentPath === '/' && !isAuthPage) {
        const timer = setTimeout(() => {
          const auth = localStorage.getItem('isAuthenticated') === 'true';
          const guest = localStorage.getItem('isGuest') === 'true';
          
          // Solo redirigir si REALMENTE no está autenticado ni es invitado
          if (!auth && !guest) {
            console.log('📍 Redirigiendo a /auth - no autenticado (desde AccountNav)');
            window.location.href = '/auth';
          }
        }, 100); // Delay para que localStorage se estabilice
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

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
      <a href="/login" className="hover:text-jd-turquoise transition">
        Iniciar Sesión
      </a>
    );
  }

  // Si está autenticado
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <a href="/account" className="hover:text-jd-turquoise transition">
          Mi cuenta
        </a>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-800 transition font-semibold"
          id="logout-btn"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // Si no está autenticado
  return (
    <a href="/auth" className="hover:text-jd-turquoise transition">
      Mi cuenta
    </a>
  );
}
