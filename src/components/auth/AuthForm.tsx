import { useState } from 'react';
import { supabaseClient } from '../../lib/supabase';

interface AuthFormProps {
  onSuccess?: (user: any) => void;
  onGuestLogin?: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthForm({ onSuccess, onGuestLogin, initialTab = 'login' }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        const adminEmail = email.toLowerCase() === 'jaimechipiona2006@gmail.com';
        
        if (adminEmail) {
          setSuccess('¡Bienvenido Admin! 🎉');
          if (onSuccess) {
            setTimeout(() => {
              onSuccess(data?.user);
            }, 800);
          }
          setTimeout(() => {
            window.location.href = '/admin';
          }, 1500);
        } else {
          setSuccess('¡Bienvenido! 👋');
          if (onSuccess) {
            setTimeout(() => {
              onSuccess(data?.user);
            }, 800);
          }
          setTimeout(() => {
            window.location.href = '/productos';
          }, 1500);
        }
      } else {
        // REGISTRO
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }

        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const { data, error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setSuccess('¡Cuenta creada! Por favor, inicia sesión con tus credenciales.');
          setTimeout(() => {
            setIsLogin(true);
            setPassword('');
            setConfirmPassword('');
          }, 2000);
        } else if (signInData.user) {
          setSuccess('¡Bienvenido!');
          if (onSuccess) {
            setTimeout(() => {
              onSuccess(signInData?.user);
            }, 800);
          }
          setTimeout(() => {
            window.location.href = '/productos';
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('guestLoginTime', new Date().toISOString());
    if (onGuestLogin) {
      onGuestLogin();
    }
    window.location.href = '/productos';
  };

  return (
    <div className="w-full max-w-md">
      {/* Tabs */}
      <div className="flex gap-0 mb-6 bg-white rounded-t-2xl overflow-hidden shadow-lg">
        <button
          onClick={() => {
            setIsLogin(true);
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-4 font-bold transition-all duration-200 ${
            isLogin
              ? 'bg-gradient-to-r from-jd-red to-red-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-4 font-bold transition-all duration-200 ${
            !isLogin
              ? 'bg-gradient-to-r from-jd-red to-red-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Crear Cuenta
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-b-2xl shadow-lg p-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              📧 Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-jd-red focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-jd-red focus:outline-none transition-colors"
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-2">Mínimo 6 caracteres</p>
            )}
          </div>

          {/* Confirm Password - Solo en registro */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                🔐 Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-jd-red focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-jd-red to-red-700 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Procesando...
              </span>
            ) : isLogin ? (
              '🔓 Iniciar Sesión'
            ) : (
              '✨ Crear Cuenta'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 font-medium">o</span>
          </div>
        </div>

        {/* Guest Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-3 border-2 border-jd-turquoise text-jd-turquoise font-bold rounded-lg hover:bg-teal-50 transition-all duration-200 transform hover:scale-105"
        >
          ⚡ Continuar como Invitado
        </button>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  );
}
