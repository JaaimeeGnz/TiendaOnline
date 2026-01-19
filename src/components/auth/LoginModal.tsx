/**
 * src/components/auth/LoginModal.tsx
 * Modal inicial de login - Permite elegir entre invitado o login con cuenta
 */

import { useState } from 'react';
import AuthForm from './AuthForm';

export default function LoginModal() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const handleGuestLogin = () => {
    // Guardar en localStorage
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('guestLoginTime', new Date().toISOString());
    
    // Redirigir directamente a /productos
    // El middleware ahora verifica el localStorage en el cliente
    window.location.href = '/productos?guest=true';
  };

  // Si el usuario elige login o registro, mostrar el formulario de autenticación
  if (showLoginForm || showRegisterForm) {
    return (
      <AuthForm 
        initialTab={showRegisterForm ? 'register' : 'login'}
        onSuccess={() => {
          // Después del login/registro exitoso, la redirección se maneja en AuthForm
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            JG<span className="text-red-200">MARKET</span>
          </h1>
          <p className="text-red-100 text-lg">Tu tienda de moda favorita</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cómo quieres continuar?</h2>
            <p className="text-gray-600">Elige la opción que mejor se adapte a ti</p>
          </div>

          {/* Guest Button */}
          <button
            onClick={handleGuestLogin}
            className="w-full bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Continuar como Invitado</span>
            </div>
            <p className="text-xs text-teal-100 mt-2">Navega, explora y compra sin crear cuenta</p>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-semibold">o</span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={() => setShowLoginForm(true)}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Iniciar Sesión</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Con tu cuenta de JGMarket</p>
          </button>

          {/* Register Button */}
          <button
            onClick={() => setShowRegisterForm(true)}
            className="w-full bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m0 0h3m-6-9a3 3 0 11-6 0 3 3 0 016 0M3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>Crear Cuenta</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Acceso a ofertas exclusivas y rebajas</p>
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500 border-t border-gray-200">
          <p className="mb-2">🔒 Protegemos tu privacidad • 🛒 Compra segura • ↩️ Devoluciones fáciles</p>
          <p className="text-gray-400">© 2025 JGMarket. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
