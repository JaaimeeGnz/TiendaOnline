import { supabaseClient as supabase } from './supabase';

/**
 * Genera un código de descuento único
 */
export function generateDiscountCode(): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
  return `SAVE${year}${randomChars}`;
}

/**
 * Valida un código de descuento
 */
export async function validateDiscountCode(code: string) {
  try {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) {
      return { valid: false, error: 'Código no válido' };
    }

    if (!data) {
      return { valid: false, error: 'Código no encontrado' };
    }

    // Validar fechas
    const now = new Date();
    if (data.valid_from && new Date(data.valid_from) > now) {
      return { valid: false, error: 'Este código aún no es válido' };
    }

    if (data.valid_until && new Date(data.valid_until) < now) {
      return { valid: false, error: 'Este código ha expirado' };
    }

    // Validar límite de usos
    if (data.max_uses && data.times_used >= data.max_uses) {
      return { valid: false, error: 'Este código ha alcanzado su límite de usos' };
    }

    return {
      valid: true,
      data: {
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_purchase_cents: data.min_purchase_cents,
      },
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { valid: false, error: 'Error validating code' };
  }
}

/**
 * Suscribe un email a la newsletter y genera un código de descuento
 */
export async function subscribeToNewsletter(
  email: string,
  discountPercentage: number = 10
): Promise<{ success: boolean; message: string; discountCode?: string }> {
  try {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Email inválido' };
    }

    // Generar código único
    let discountCode = generateDiscountCode();
    let attempts = 0;
    const maxAttempts = 5;

    // Evitar duplicados
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('discount_code', discountCode)
        .single();

      if (!existing) break;
      discountCode = generateDiscountCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return { success: false, message: 'Error generando código' };
    }

    // Crear registro de suscriptor
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        discount_code: discountCode,
        discount_percentage: discountPercentage,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      // Si el email ya existe, devolver el código existente
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('newsletter_subscribers')
          .select('discount_code')
          .eq('email', email)
          .single();

        if (existing) {
          return {
            success: true,
            message: 'Ya estabas suscrito a nuestra newsletter',
            discountCode: existing.discount_code,
          };
        }
      }
      return { success: false, message: 'Error en la suscripción' };
    }

    // También crear el código de descuento en la tabla discount_codes
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Válido 30 días

    await supabase.from('discount_codes').insert({
      code: discountCode,
      discount_type: 'percentage',
      discount_value: discountPercentage,
      valid_from: new Date().toISOString(),
      valid_until: validUntil.toISOString(),
      max_uses: null, // Ilimitado
      is_active: true,
      created_by: 'newsletter_system',
    });

    return {
      success: true,
      message: `¡Bienvenido! Usa el código ${discountCode} para obtener un ${discountPercentage}% de descuento`,
      discountCode,
    };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { success: false, message: 'Error procesando tu suscripción' };
  }
}

/**
 * Registra el uso de un código de descuento
 */
export async function recordDiscountCodeUsage(
  codeId: string,
  email: string,
  orderId?: string,
  amountSavedCents?: number
) {
  try {
    const { error } = await supabase.from('discount_code_usage').insert({
      code_id: codeId,
      email,
      order_id: orderId,
      amount_saved_cents: amountSavedCents,
    });

    if (error) {
      console.error('Error recording discount usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recording discount usage:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas de suscriptores
 */
export async function getNewsletterStats() {
  try {
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact' });

    const { data: usedCodes, error: useError } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact' })
      .not('used_at', 'is', null);

    if (subError || useError) {
      return null;
    }

    return {
      totalSubscribers: subscribers?.length || 0,
      codesUsed: usedCodes?.length || 0,
      codesUnused: (subscribers?.length || 0) - (usedCodes?.length || 0),
    };
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return null;
  }
}
