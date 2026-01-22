/**
 * Lógica de recomendación de tallas basada en altura (cm) y peso (kg)
 */

export type SizeRecommendation = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

interface SizeGuide {
  size: SizeRecommendation;
  minHeight: number;
  maxHeight: number;
  minWeight: number;
  maxWeight: number;
}

const SIZE_GUIDE: SizeGuide[] = [
  { size: 'XS', minHeight: 150, maxHeight: 160, minWeight: 45, maxWeight: 60 },
  { size: 'S', minHeight: 160, maxHeight: 170, minWeight: 55, maxWeight: 70 },
  { size: 'M', minHeight: 170, maxHeight: 180, minWeight: 65, maxWeight: 80 },
  { size: 'L', minHeight: 175, maxHeight: 185, minWeight: 75, maxWeight: 95 },
  { size: 'XL', minHeight: 180, maxHeight: 195, minWeight: 90, maxWeight: 110 },
  { size: 'XXL', minHeight: 190, maxHeight: 210, minWeight: 105, maxWeight: 150 },
];

interface RecommendationResult {
  size: SizeRecommendation;
  confidence: 'high' | 'medium' | 'low';
  message: string;
}

/**
 * Recomienda una talla basada en altura y peso
 * @param height Altura en centímetros
 * @param weight Peso en kilogramos
 * @returns Objeto con talla recomendada y mensaje
 */
export function recommendSize(height: number, weight: number): RecommendationResult {
  // Validaciones
  if (height < 140 || height > 220) {
    return {
      size: 'M',
      confidence: 'low',
      message: 'La altura ingresada está fuera del rango normal. Te recomendamos la talla M por defecto.',
    };
  }

  if (weight < 40 || weight > 160) {
    return {
      size: 'M',
      confidence: 'low',
      message: 'El peso ingresado está fuera del rango normal. Te recomendamos la talla M por defecto.',
    };
  }

  // Buscar talla exacta
  for (const guide of SIZE_GUIDE) {
    if (
      height >= guide.minHeight &&
      height <= guide.maxHeight &&
      weight >= guide.minWeight &&
      weight <= guide.maxWeight
    ) {
      return {
        size: guide.size,
        confidence: 'high',
        message: `Te recomendamos la talla ${guide.size} basado en tus medidas (Altura: ${height}cm, Peso: ${weight}kg).`,
      };
    }
  }

  // Si no encaja exactamente, encontrar la más cercana
  let closestSize: SizeRecommendation = 'M';
  let minDistance = Infinity;

  for (const guide of SIZE_GUIDE) {
    const heightDiff = Math.min(
      Math.abs(height - guide.minHeight),
      Math.abs(height - guide.maxHeight)
    );
    const weightDiff = Math.min(
      Math.abs(weight - guide.minWeight),
      Math.abs(weight - guide.maxWeight)
    );
    const distance = heightDiff + weightDiff;

    if (distance < minDistance) {
      minDistance = distance;
      closestSize = guide.size;
    }
  }

  return {
    size: closestSize,
    confidence: 'medium',
    message: `Basado en tus medidas, te recomendamos la talla ${closestSize}. Si usualmente usas una talla diferente, puedes explorar otras opciones.`,
  };
}

/**
 * Obtiene la guía de tallas en formato legible
 */
export function getSizeGuideText(): string {
  return `
    <div class="space-y-3 text-sm text-gray-700">
      <p><strong>XS:</strong> Altura 150-160cm | Peso 45-60kg</p>
      <p><strong>S:</strong> Altura 160-170cm | Peso 55-70kg</p>
      <p><strong>M:</strong> Altura 170-180cm | Peso 65-80kg</p>
      <p><strong>L:</strong> Altura 175-185cm | Peso 75-95kg</p>
      <p><strong>XL:</strong> Altura 180-195cm | Peso 90-110kg</p>
      <p><strong>XXL:</strong> Altura 190-210cm | Peso 105-150kg</p>
    </div>
  `;
}
