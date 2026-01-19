import React, { useState } from 'react';

interface DiscountCodeInputProps {
  onApply: (code: string, discount: number) => void;
  onRemove?: () => void;
  appliedCode?: string;
  loading?: boolean;
}

export default function DiscountCodeInput({
  onApply,
  onRemove,
  appliedCode,
  loading = false,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    setValidating(true);
    setError('');

    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const result = await response.json();

      if (result.valid) {
        onApply(code.toUpperCase(), result.data.discount_value);
        setCode('');
      } else {
        setError(result.error || 'Código no válido');
      }
    } catch (error) {
      setError('Error validando el código');
    } finally {
      setValidating(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Código aplicado</p>
            <p className="text-lg font-bold text-green-600">{appliedCode}</p>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
            >
              Remover
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código de descuento
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="Ej: SAVE2025ABC"
            disabled={validating || loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 uppercase"
          />
          <button
            type="submit"
            disabled={validating || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
          >
            {validating ? 'Validando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </form>
  );
}
