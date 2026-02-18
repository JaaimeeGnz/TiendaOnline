/**
 * src/pages/api/account/send-code.ts
 * API para enviar código de verificación por email (un solo uso)
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// Almacén en memoria de códigos (en producción usar Redis o tabla BD)
const verificationCodes = new Map<string, { code: string; expiresAt: number; used: boolean }>();

// Limpiar códigos expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCodes.entries()) {
    if (value.expiresAt < now || value.used) {
      verificationCodes.delete(key);
    }
  }
}, 5 * 60 * 1000);

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, email, userId } = body;

    if (!email || !userId) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar que el usuario existe
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminClient = createClient(supabaseUrl!, supabaseServiceKey!);

    const { data: user, error: userError } = await adminClient.auth.admin.getUserById(userId);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar código de 6 dígitos
    const code = generateCode();
    const key = `${userId}_${action}`;

    // Guardar código (expira en 10 minutos)
    verificationCodes.set(key, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      used: false
    });

    // Enviar por email usando Brevo
    const brevoApiKey = import.meta.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      return new Response(JSON.stringify({ error: 'Servicio de email no configurado' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const actionLabels: Record<string, string> = {
      'change-username': 'cambiar tu nombre de usuario',
      'change-email': 'cambiar tu correo electrónico',
      'change-password': 'cambiar tu contraseña'
    };

    const actionLabel = actionLabels[action] || 'realizar esta acción';

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: 'jaimechipiona2006@gmail.com', name: 'JGMarket' },
        to: [{ email }],
        subject: `Código de verificación - JGMarket`,
        htmlContent: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 800;">JG<span style="color: #dc2626;">MARKET</span></h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 6px; letter-spacing: 2px; text-transform: uppercase;">Verificación de seguridad</p>
            </div>
            <div style="padding: 32px; background: white;">
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-top: 0;">
                Has solicitado <strong>${actionLabel}</strong>. Usa el siguiente código para verificar tu identidad:
              </p>
              <div style="background: #f0f2f5; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="font-size: 36px; font-weight: 800; color: #1a1a2e; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${code}</p>
              </div>
              <p style="color: #9ca3af; font-size: 13px; text-align: center;">
                Este código expira en <strong>10 minutos</strong> y solo puede usarse una vez.
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eef0f3;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">Si no solicitaste este cambio, ignora este correo.</p>
              <p style="color: #6b7280; font-size: 12px; font-weight: 600; margin: 8px 0 0 0;">JGMarket &mdash; Tu tienda de moda online</p>
            </div>
          </div>
        `
      })
    });

    if (!emailResponse.ok) {
      console.error('Error enviando email:', await emailResponse.text());
      return new Response(JSON.stringify({ error: 'Error al enviar el correo' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Código enviado al correo' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error en send-code:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Exportar para uso interno
export { verificationCodes };
