/**
 * src/pages/api/email/send-order-confirmation.ts
 * Endpoint para enviar email de confirmación de pedido
 */

import type { APIRoute } from "astro";
import { sendOrderConfirmationEmail } from "../../../lib/email";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, orderNumber, items, subtotal, shipping, total } = body;

    if (!email || !orderNumber || !items) {
      return new Response(
        JSON.stringify({ error: "Parámetros faltantes" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("📧 Enviando email de confirmación de pedido a:", email);
    const result = await sendOrderConfirmationEmail(
      email,
      orderNumber,
      items,
      subtotal,
      shipping,
      total
    );
    console.log("📧 Resultado de email de confirmación:", result);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email de confirmación enviado exitosamente",
          messageId: result.messageId,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || "Error enviando email",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("❌ Error en send-order-confirmation:", error);
    return new Response(
      JSON.stringify({ error: "Error procesando la solicitud" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
