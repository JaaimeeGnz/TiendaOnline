import { useState, useEffect } from 'react';

export default function DiscountPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');
    const [discountCode, setDiscountCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);

    useEffect(() => {
        const dismissed = localStorage.getItem('discount_popup_dismissed');
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            const hoursSince = (Date.now() - dismissedAt) / (1000 * 60 * 60);
            if (hoursSince < 24) return;
        }

        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('discount_popup_dismissed', Date.now().toString());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus('error');
                return;
            }

            setDiscountCode(data.code);
            setDiscountPercent(data.discountPercent);
            setStatus(data.alreadySubscribed ? 'already' : 'success');
            localStorage.setItem('discount_popup_dismissed', Date.now().toString());
        } catch {
            setStatus('error');
        }
    };

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.3s ease',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

            <div
                style={{
                    position: 'relative',
                    width: '90%',
                    maxWidth: '440px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    animation: 'slideUp 0.4s ease',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                }}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        zIndex: 10,
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        color: '#fff',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        backdropFilter: 'blur(4px)',
                        transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)'; }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                        padding: '40px 30px 30px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '-30px',
                            right: '-30px',
                            width: '120px',
                            height: '120px',
                            background: 'radial-gradient(circle, rgba(79,209,197,0.2), transparent)',
                            borderRadius: '50%',
                        }}
                    />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎁</div>
                        <h2
                            style={{
                                color: '#ffffff',
                                margin: '0 0 8px',
                                fontSize: '26px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            ¡Oferta exclusiva!
                        </h2>
                        <p
                            style={{
                                color: '#4fd1c5',
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: 600,
                            }}
                        >
                            Suscríbete y recibe un descuento
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div
                    style={{
                        background: '#ffffff',
                        padding: '30px',
                    }}
                >
                    {status === 'idle' || status === 'loading' || status === 'error' ? (
                        <>
                            {/* Big Discount Badge */}
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginBottom: '24px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'inline-block',
                                        background: 'linear-gradient(135deg, #e53e3e, #c53030)',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        padding: '12px 28px',
                                        fontSize: '36px',
                                        fontWeight: 900,
                                        letterSpacing: '2px',
                                        animation: 'pulse 2s ease-in-out infinite',
                                    }}
                                >
                                    10% DESCUENTO
                                </div>
                                <p style={{ color: '#666', fontSize: '14px', margin: '12px 0 0' }}>
                                    En tu primera compra
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="email"
                                        placeholder="Tu email..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            flex: 1,
                                            padding: '14px 16px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '10px',
                                            fontSize: '15px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = '#4fd1c5'; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        style={{
                                            padding: '14px 24px',
                                            background: status === 'loading' ? '#a0aec0' : 'linear-gradient(135deg, #4fd1c5, #38b2ac)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            cursor: status === 'loading' ? 'wait' : 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            boxShadow: '0 4px 12px rgba(79,209,197,0.3)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {status === 'loading' ? '...' : 'Enviar'}
                                    </button>
                                </div>
                                {status === 'error' && (
                                    <p style={{ color: '#e53e3e', fontSize: '13px', margin: '10px 0 0', textAlign: 'center' }}>
                                        Ha ocurrido un error. Inténtalo de nuevo.
                                    </p>
                                )}
                            </form>

                            <p style={{ color: '#a0aec0', fontSize: '11px', textAlign: 'center', margin: '16px 0 0' }}>
                                No spam, solo ofertas exclusivas. Cancelar en cualquier momento.
                            </p>
                        </>
                    ) : (
                        /* Success / Already Subscribed State */
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                                {status === 'already' ? '👋' : '🎉'}
                            </div>
                            <h3 style={{ color: '#1a1a1a', margin: '0 0 8px', fontSize: '20px', fontWeight: 700 }}>
                                {status === 'already' ? '¡Ya estás inscrito/a!' : '¡Enhorabuena!'}
                            </h3>
                            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 20px' }}>
                                {status === 'already'
                                    ? 'Este email ya está registrado. Aquí tienes tu código:'
                                    : 'Hemos enviado el código a tu email. ¡Úsalo ahora!'}
                            </p>

                            {/* Code Display */}
                            <div
                                style={{
                                    background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    marginBottom: '20px',
                                }}
                            >
                                <p style={{ color: '#4fd1c5', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 8px' }}>
                                    Tu código de descuento
                                </p>
                                <div
                                    style={{
                                        background: '#fff',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        display: 'inline-block',
                                        margin: '0 0 8px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '24px',
                                            fontWeight: 900,
                                            color: '#1a1a1a',
                                            letterSpacing: '4px',
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        {discountCode}
                                    </span>
                                </div>
                                <p style={{ color: '#e53e3e', fontSize: '20px', fontWeight: 700, margin: '8px 0 0' }}>
                                    {discountPercent}% DE DESCUENTO
                                </p>
                            </div>

                            <button
                                onClick={handleClose}
                                style={{
                                    padding: '12px 32px',
                                    background: 'linear-gradient(135deg, #4fd1c5, #38b2ac)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 4px 12px rgba(79,209,197,0.3)',
                                }}
                            >
                                ¡Ir a comprar!
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
