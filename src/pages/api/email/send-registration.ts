/**
 * src/pages/api/email/send-registration.ts
 * Endpoint para enviar email de bienvenida al registrarse
 */

import type { APIRoute } from "astro";
import { sendRegistrationEmail } from "../../../lib/email";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, userName } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("📧 Enviando email de registro a:", email);
    const result = await sendRegistrationEmail(email, userName);
    console.log("📧 Resultado de email:", result);
    
    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email de registro enviado exitosamente",
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
    console.error("❌ Error en endpoint send-registration:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Error procesando solicitud"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
