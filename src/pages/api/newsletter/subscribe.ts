import type { APIRoute } from 'astro';
import { subscribeToNewsletter } from '../../../lib/newsletter';
import { sendNewsletterWelcomeEmail } from '../../../lib/email';

// IMPORTANTE: Este endpoint necesita ser renderizado en server-time, no estáticamente
export const prerender = false;

export const POST: APIRoute = async (context) => {
  const request = context.request;
  
  try {
    console.log('🔷 [SUBSCRIBE] Request received');
    console.log('🔷 [SUBSCRIBE] Method:', request.method);
    console.log('🔷 [SUBSCRIBE] Content-Type:', request.headers.get('content-type'));
    console.log('🔷 [SUBSCRIBE] URL:', request.url);

    // Validar que sea POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener el body
    let body;
    try {
      body = await request.json();
      console.log('✅ Body parsed successfully:', body);
    } catch (parseError) {
      console.error('❌ Error parsing body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error al procesar el request',
          details: String(parseError)
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, discount = 10 } = body;
    console.log('📧 Email:', email, 'Discount:', discount);

    // Validar datos
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Email es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Procesar suscripción
    const result = await subscribeToNewsletter(email, discount);

    // Si la suscripción fue exitosa, enviar email de bienvenida (fire-and-forget)
    // Envolver en try-catch para evitar que falle la respuesta
    if (result.success && result.discountCode) {
      try {
        // Ejecutar sin esperar
        Promise.resolve(sendNewsletterWelcomeEmail(email, result.discountCode))
          .catch((emailError) => {
            console.error('Error sending welcome email:', emailError);
          });
      } catch (emailError) {
        console.error('Error in email sending promise:', emailError);
        // No afecta la respuesta
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Asegurar que siempre devolvemos un JSON válido
    const errorResponse = JSON.stringify({ 
      success: false,
      error: 'Internal server error', 
      message: error?.message || 'Unknown error'
    });
    
    return new Response(errorResponse, { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
