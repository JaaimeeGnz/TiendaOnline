import type { APIRoute } from 'astro';
import { subscribeToNewsletter } from '../../../lib/newsletter';
import { sendNewsletterWelcomeEmail } from '../../../lib/email';

/**
 * Endpoint de prueba para diagnosticar problemas con el newsletter
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, action = 'full' } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ 
          error: 'Email es requerido',
          debug: {
            timestamp: new Date().toISOString(),
            action
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const debug = {
      timestamp: new Date().toISOString(),
      email,
      action,
      steps: [] as any[]
    };

    // Paso 1: Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    debug.steps.push({
      step: 'email_validation',
      valid: emailRegex.test(email),
      email
    });

    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido', debug }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Paso 2: Suscribirse
    if (action === 'full' || action === 'subscribe') {
      const startTime = Date.now();
      const result = await subscribeToNewsletter(email, 10);
      debug.steps.push({
        step: 'subscribe',
        duration: Date.now() - startTime,
        result
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.message, debug }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Paso 3: Enviar email (si es requerido)
      if (action === 'full' || action === 'send-email') {
        const emailStartTime = Date.now();
        try {
          const emailResult = await sendNewsletterWelcomeEmail(email, result.discountCode || 'BIENVENIDA10');
          debug.steps.push({
            step: 'send_email',
            duration: Date.now() - emailStartTime,
            result: emailResult
          });
        } catch (emailError: any) {
          debug.steps.push({
            step: 'send_email',
            duration: Date.now() - emailStartTime,
            error: emailError.message
          });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          data: result,
          debug
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Acción no válida',
        debug,
        validActions: ['subscribe', 'send-email', 'full']
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Newsletter test error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
