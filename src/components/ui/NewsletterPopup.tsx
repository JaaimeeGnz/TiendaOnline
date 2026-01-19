import React, { useState, useEffect } from 'react';
import { subscribeToNewsletter } from '../../lib/newsletter';

interface NewsletterPopupProps {
  discount?: number;
}

export default function NewsletterPopup({ discount = 10 }: NewsletterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Mostrar popup después de 3 segundos de que cargue la página
  useEffect(() => {
    const timer = setTimeout(() => {
      // No mostrar si ya se vio el popup antes en esta sesión
      const popupViewed = sessionStorage.getItem('newsletter_popup_viewed');
      if (!popupViewed) {
        setIsOpen(true);
        // Marcar que el popup fue visto
        sessionStorage.setItem('newsletter_popup_viewed', 'true');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Función para copiar código al portapapeles
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando código:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await subscribeToNewsletter(email, discount);

      if (result.success) {
        setSuccess(true);
        setDiscountCode(result.discountCode || 'BIENVENIDA10');
        setMessage(result.message);
        localStorage.setItem('newsletter_subscribed', 'true');
        
        // Enviar email de bienvenida al newsletter
        try {
          const emailResponse = await fetch('/api/email/send-newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              discountCode: result.discountCode || 'BIENVENIDA10'
            })
          });
          
          if (emailResponse.ok) {
            console.log('✅ Email de newsletter enviado');
          } else {
            console.warn('⚠️ Error enviando email de newsletter:', await emailResponse.text());
          }
        } catch (emailError) {
          console.error('❌ Error en llamada a send-newsletter:', emailError);
        }
        
        setEmail('');
      } else {
        setSuccess(false);
        setMessage(result.message);
      }
    } catch (error) {
      setSuccess(false);
      setMessage('Error procesando tu solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-2xl z-50 p-8 max-w-sm mx-4">
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
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
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {!success ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Obtén {discount}% de descuento!
              </h2>
              <p className="text-gray-600">
                Suscríbete a nuestra newsletter y recibe un código exclusivo
              </p>
            </div>

            {/* Beneficios */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <svg
                  className="w-4 h-4 text-blue-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Código de descuento exclusivo
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg
                  className="w-4 h-4 text-blue-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Ofertas especiales semanales
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg
                  className="w-4 h-4 text-blue-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Acceso temprano a nuevas colecciones
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Procesando...' : 'Obtener mi código'}
              </button>
            </form>

            {/* Mensaje de error */}
            {message && !success && (
              <p className="text-red-600 text-sm text-center mt-4">{message}</p>
            )}

            {/* Política privacidad */}
            <p className="text-xs text-gray-500 text-center mt-6">
              No compartimos tu email. Puedes desuscribirse en cualquier momento.
            </p>
          </>
        ) : (
          <>
            {/* Éxito */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Suscripción exitosa!
                </h3>
              </div>

              {/* Código de descuento */}
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Tu código de descuento:</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-bold text-blue-600">
                    {discountCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 text-gray-600 hover:text-gray-900 transition"
                    title="Copiar código"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-2 font-semibold">✓ Código copiado al portapapeles</p>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-6">{message}</p>

              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Ir a comprar
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
