/**
 * src/components/AccountLink.tsx
 * Componente que muestra el link de cuenta basado en sesión del cliente
 */

import { useEffect, useState } from 'react';

export default function AccountLink() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = () => {
      try {
        // Verificar SOLO localStorage - es la fuente de verdad
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        if (isMounted) {
          // Solo está autenticado si isAuthenticated es true Y no es invitado
          setIsAuthenticated(isAuth && !isGuest);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    };

    // Verificar inmediatamente
    checkAuth();

    // Verificar cada 500ms para capturar cambios de sesión rápidamente
    const interval = setInterval(() => {
      if (isMounted) {
        checkAuth();
      }
    }, 500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestLoginTime');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
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

  // Mientras carga, mostrar Mi cuenta (por defecto)
  if (isAuthenticated === null) {
    return <a href="/auth" className="hover:text-jd-turquoise transition">Mi cuenta</a>;
  }

  if (isAuthenticated) {
    return (
      <>
        <a href="/account" className="hover:text-jd-turquoise transition">
          Mi cuenta
        </a>
        <button 
          onClick={handleLogout}
          className="hover:text-jd-turquoise transition cursor-pointer bg-transparent border-none text-inherit p-0"
        >
          Cerrar Sesión
        </button>
      </>
    );
  }

  return (
    <a href="/auth" className="hover:text-jd-turquoise transition">
      Mi cuenta
    </a>
  );
}
