import React, { useState } from 'react';

interface NewsletterFormProps {
  discountPercentage?: number;
}

export default function NewsletterForm({ discountPercentage = 10 }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar email
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa tu email' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Por favor ingresa un email válido' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        discount: discountPercentage,
      };

      console.log('📤 Sending newsletter subscription:', payload);
      console.log('📤 Payload JSON:', JSON.stringify(payload));

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status, 'Content-Type:', response.headers.get('content-type'));

      const responseText = await response.text();
      console.log('📥 Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parsing response:', parseError);
        console.error('📥 Response was:', responseText);
        setMessage({
          type: 'error',
          text: 'Error en la respuesta del servidor',
        });
        setIsLoading(false);
        return;
      }

      console.log('📥 Newsletter response:', { response: response.ok, status: response.status, data });

      if (response.ok && data.success) {
        setMessage({
          type: 'success',
          text: data.message || `¡Éxito! Código: ${data.discountCode}`,
        });
        setDiscountCode(data.discountCode || null);
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.message || data.error || 'Error al suscribirse',
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage({
        type: 'error',
        text: 'Error al procesar tu suscripción',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex w-full md:w-auto gap-0">
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-l focus:outline-none focus:border-jd-turquoise transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-jd-turquoise text-white font-bold text-sm rounded-r hover:bg-opacity-90 transition uppercase disabled:opacity-50"
        >
          {isLoading ? 'Suscribiendo...' : 'Suscribir'}
        </button>
      </form>

      {/* Mensaje de estado */}
      {message && (
        <div
          className={`mt-3 p-3 rounded text-sm animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-500 text-green-300'
              : 'bg-red-900/30 border border-red-500 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Mostrar código de descuento si se obtuvo */}
      {discountCode && (
        <div className="mt-3 p-4 bg-jd-turquoise/20 border border-jd-turquoise rounded">
          <p className="text-sm text-gray-300 mb-2">Tu código de descuento:</p>
          <p className="text-2xl font-bold text-jd-turquoise font-mono">{discountCode}</p>
          <p className="text-xs text-gray-400 mt-2">Válido por 30 días</p>
        </div>
      )}
    </div>
  );
}
