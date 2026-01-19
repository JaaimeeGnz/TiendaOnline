/**
 * src/pages/api/email/send-newsletter.ts
 * Endpoint para enviar email de bienvenida al newsletter
 */

import type { APIRoute } from "astro";
import { sendNewsletterWelcomeEmail } from "../../../lib/email";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, discountCode } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("📧 Enviando email de newsletter a:", email);
    const result = await sendNewsletterWelcomeEmail(email, discountCode || "BIENVENIDA10");
    console.log("📧 Resultado de email:", result);
    
    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email enviado exitosamente",
          messageId: result.messageId 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || "Error desconocido" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("❌ Error en endpoint send-newsletter:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Error procesando solicitud"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
