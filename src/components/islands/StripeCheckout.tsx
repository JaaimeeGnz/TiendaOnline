import { useEffect, useState } from 'react';

const CART_KEY = 'fashionmarket_cart';

export default function StripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    // Obtener email guardado o autenticado
    const savedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    const updateCount = () => {
      const stored = localStorage.getItem(CART_KEY);
      let count = 0;
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Maneja ambos formatos: { items: [] } y []
          if (parsed.items && Array.isArray(parsed.items)) {
            count = parsed.items.length;
          } else if (Array.isArray(parsed)) {
            count = parsed.length;
          }
          console.log('Cart count updated:', count, 'Cart data:', parsed);
        } catch (e) {
          console.error('Error parsing cart:', e);
        }
      }
      
      setCartCount(count);
    };
    
    // Leer carrito al montar
    updateCount();
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => updateCount();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleClick = async (e: any) => {
    e.preventDefault();
    
    // Validar email
    if (!email || !email.trim()) {
      setEmailError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un correo válido');
      return;
    }

    setEmailError('');
    
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) {
      setError('El carrito está vacío');
      return;
    }

    let items;
    try {
      const parsed = JSON.parse(stored);
      // Maneja ambos formatos: { items: [] } y []
      if (parsed.items && Array.isArray(parsed.items)) {
        items = parsed.items;
      } else if (Array.isArray(parsed)) {
        items = parsed;
      } else {
        throw new Error('Formato de carrito inválido');
      }
      
      if (items.length === 0) {
        setError('El carrito está vacío');
        return;
      }
    } catch (e) {
      console.error('Error reading cart:', e);
      setError('Error al leer el carrito');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Obtener userId del sessionStorage (lo guarda AccountNav cuando se autentica)
      const userSession = sessionStorage.getItem('sb-user-session');
      let userId = null;
      
      if (userSession) {
        try {
          const session = JSON.parse(userSession);
          userId = session.user?.id;
        } catch (e) {
          console.error('Error parsing user session:', e);
        }
      }

      console.log('📧 Email:', email, '👤 UserId:', userId);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item: any) => ({
            name: item.name || 'Producto',
            price: (item.price_cents || 0) / 100,
            quantity: item.quantity || 1,
            brand: item.brand || '',
            image: item.image_url || '',
          })),
          email: email.trim(),
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido');
      }

      if (data.url) {
        // Extraer session_id de la URL de Stripe y guardarlo
        const url = new URL(data.url);
        const sessionId = url.searchParams.get('session_id');
        if (sessionId) {
          localStorage.setItem('stripe_session_id', sessionId);
        }
        window.location.href = data.url;
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err: any) {
      console.error('Stripe error:', err);
      setError(err.message || 'Error al procesar el pago. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Correo Electrónico *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          placeholder="tu-email@gmail.com"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            border: emailError ? '2px solid #c33' : '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
        {emailError && (
          <div style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>
            {emailError}
          </div>
        )}
      </div>

      <button
        onClick={handleClick}
        disabled={loading || cartCount === 0}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '0',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '14px',
          transition: 'background-color 0.3s',
          backgroundColor: loading || cartCount === 0 ? '#999' : '#00bcd4',
          color: 'white',
          border: 'none',
          cursor: loading || cartCount === 0 ? 'not-allowed' : 'pointer',
          opacity: 1,
        }}
      >
        {loading ? 'Procesando...' : 'Pagar con Stripe'}
      </button>
    </div>
  );
}
