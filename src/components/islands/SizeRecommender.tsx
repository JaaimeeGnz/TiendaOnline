import React, { useState, useEffect } from 'react';
import { recommendSize } from '../../lib/sizeRecommendation';

interface SizeRecommenderProps {
  productName?: string;
}

// Variable global para controlar el modal
let globalShowModal = false;

export default function SizeRecommender({ productName = 'este producto' }: SizeRecommenderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Exponer función global para abrir el modal
    (window as any).openSizeRecommenderModal = () => {
      console.log('Opening size recommender modal');
      setIsModalOpen(true);
    };

    return () => {
      delete (window as any).openSizeRecommenderModal;
    };
  }, []);

  const handleRecommend = () => {
    if (!height || !weight) {
      alert('Por favor ingresa tanto altura como peso');
      return;
    }

    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w)) {
      alert('Por favor ingresa números válidos');
      return;
    }

    const result = recommendSize(h, w);
    setRecommendation(result);
  };

  const handleReset = () => {
    setHeight('');
    setWeight('');
    setRecommendation(null);
    setShowGuide(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    handleReset();
  };

  const handleAddToCart = () => {
    // Establecer la talla en el select del producto
    const sizeSelect = document.getElementById('size') as HTMLSelectElement;
    if (sizeSelect && recommendation) {
      sizeSelect.value = recommendation.size;
      // Desplazar a la vista
      sizeSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      handleClose();
    }
  };

  if (!isModalOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-jd-turquoise text-white p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">¿Cuál es mi talla?</h2>
            <button
              onClick={handleClose}
              className="text-white hover:opacity-80 transition"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {!recommendation ? (
              <>
                {/* Info */}
                <p className="text-gray-700 text-sm">
                  Ingresa tu altura y peso para obtener una recomendación personalizada de talla para {productName}.
                </p>

                {/* Form */}
                <div className="space-y-4">
                  {/* Height Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="ej: 175"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-jd-turquoise transition"
                      min="140"
                      max="220"
                    />
                  </div>

                  {/* Weight Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="ej: 75"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-jd-turquoise transition"
                      min="40"
                      max="160"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleRecommend}
                    className="w-full bg-jd-turquoise hover:bg-jd-turquoise/90 text-white font-bold py-3 rounded-lg transition"
                  >
                    Obtener Recomendación
                  </button>

                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition"
                  >
                    {showGuide ? 'Ocultar' : 'Ver'} Guía de Tallas
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                  >
                    Cerrar
                  </button>
                </div>

                {/* Size Guide */}
                {showGuide && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">Guía de Tallas</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>XS:</strong> 150-160cm | 45-60kg</p>
                      <p><strong>S:</strong> 160-170cm | 55-70kg</p>
                      <p><strong>M:</strong> 170-180cm | 65-80kg</p>
                      <p><strong>L:</strong> 175-185cm | 75-95kg</p>
                      <p><strong>XL:</strong> 180-195cm | 90-110kg</p>
                      <p><strong>XXL:</strong> 190-210cm | 105-150kg</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Recommendation Result */}
                <div className="bg-jd-turquoise/10 border-2 border-jd-turquoise rounded-lg p-6 text-center">
                  <p className="text-gray-600 text-sm mb-2">Tu Talla Recomendada</p>
                  <p className="text-5xl font-black text-jd-turquoise mb-3">{recommendation.size}</p>
                  <p className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                    recommendation.confidence === 'high'
                      ? 'bg-green-100 text-green-700'
                      : recommendation.confidence === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    Confianza: {recommendation.confidence === 'high' ? 'Alta' : recommendation.confidence === 'medium' ? 'Media' : 'Baja'}
                  </p>
                </div>

                {/* Message */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-blue-800 text-sm">{recommendation.message}</p>
                </div>

                {/* Info */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-3">
                    <strong>Tus medidas:</strong> {height}cm de altura, {weight}kg de peso
                  </p>
                  <p className="text-xs text-gray-600">
                    Si tienes dudas sobre la talla, consulta nuestra guía de tallas o contacta a nuestro servicio al cliente.
                  </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleReset}
                    className="w-full bg-jd-turquoise hover:bg-jd-turquoise/90 text-white font-bold py-3 rounded-lg transition"
                  >
                    Hacer Otra Búsqueda
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-jd-black hover:bg-jd-darkGray text-white font-bold py-3 rounded-lg transition"
                  >
                    Usar Talla {recommendation.size}
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
