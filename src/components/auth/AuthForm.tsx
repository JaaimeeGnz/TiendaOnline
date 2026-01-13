import { useState } from 'react';
import { supabaseClient } from '../../lib/supabase';

interface AuthFormProps {
  onSuccess?: (user: any) => void;
  onGuestLogin?: () => void;
}

export default function AuthForm({ onSuccess, onGuestLogin }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
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
        // Iniciar sesión
        const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        setSuccess('¡Bienvenido! Redirigiendo...');
        setTimeout(() => {
          window.location.href = '/productos';
        }, 1500);
      } else {
        // Registrarse
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }

        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Registrarse con Supabase sin verificación de email
        const { data, error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            // No requerir verificación de email
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        // Después de registrarse, intentar iniciar sesión automáticamente
        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // Si no puede iniciar sesión automáticamente, mostrar instrucciones
          setSuccess('¡Cuenta creada! Por favor, inicia sesión con tus credenciales.');
          setTimeout(() => {
            setIsLogin(true);
            setPassword('');
            setConfirmPassword('');
          }, 2000);
        } else if (signInData.user) {
          // Inicio de sesión automático exitoso
          setSuccess('¡Cuenta creada e iniciada sesión! Redirigiendo...');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Guardar un flag en localStorage para indicar que es un invitado
    localStorage.setItem('jgmarket-guest', 'true');
    if (onGuestLogin) {
      onGuestLogin();
    }
    // Redirigir a productos
    window.location.href = '/productos';
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-jd-black mb-2">
          JG<span className="text-jd-red">Market</span>
        </h1>
        <p className="text-sm text-gray-600">
          {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded text-sm border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded text-sm border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-jd-black mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-jd-turquoise focus:ring-2 focus:ring-jd-turquoise/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-jd-black mb-2">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-jd-turquoise focus:ring-2 focus:ring-jd-turquoise/20"
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-jd-black mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-jd-turquoise focus:ring-2 focus:ring-jd-turquoise/20"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-jd-black text-white font-semibold rounded hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2 border-2 border-jd-turquoise text-jd-turquoise font-semibold rounded hover:bg-jd-turquoise hover:text-white transition"
        >
          Entrar como Invitado
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-jd-black font-semibold hover:text-jd-red transition"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </p>
      </div>

      {isLogin && (
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-xs text-jd-turquoise font-semibold hover:text-jd-black transition"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      )}
    </div>
  );
}
