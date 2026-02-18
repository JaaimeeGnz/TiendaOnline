/**
 * src/pages/api/account/verify-code.ts
 * API para verificar código y ejecutar acción (cambiar username, email o password)
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { verificationCodes } from './send-code';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, code, userId, newValue } = body;

    if (!action || !code || !userId) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar código
    const key = `${userId}_${action}`;
    const stored = verificationCodes.get(key);

    if (!stored) {
      return new Response(JSON.stringify({ error: 'No se encontró un código de verificación. Solicita uno nuevo.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (stored.used) {
      return new Response(JSON.stringify({ error: 'Este código ya fue utilizado. Solicita uno nuevo.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (stored.expiresAt < Date.now()) {
      verificationCodes.delete(key);
      return new Response(JSON.stringify({ error: 'El código ha expirado. Solicita uno nuevo.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (stored.code !== code) {
      return new Response(JSON.stringify({ error: 'Código incorrecto' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Si solo estamos verificando el código (sin newValue), marcar como verificado y retornar
    if (!newValue) {
      // Marcar código como verificado pero no usado (para el paso siguiente)
      return new Response(JSON.stringify({ success: true, verified: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Marcar como usado
    stored.used = true;

    // Ejecutar la acción
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminClient = createClient(supabaseUrl!, supabaseServiceKey!);

    switch (action) {
      case 'change-username': {
        if (!newValue.trim()) {
          return new Response(JSON.stringify({ error: 'El nombre de usuario no puede estar vacío' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const { error: updateError } = await adminClient
          .from('users')
          .update({ username: newValue.trim() })
          .eq('id', userId);

        if (updateError) {
          return new Response(JSON.stringify({ error: 'Error al actualizar nombre de usuario: ' + updateError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'Nombre de usuario actualizado correctamente' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'change-email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newValue)) {
          return new Response(JSON.stringify({ error: 'El correo electrónico no es válido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Actualizar en auth
        const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
          email: newValue
        });

        if (authError) {
          return new Response(JSON.stringify({ error: 'Error al actualizar correo: ' + authError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Actualizar en tabla users
        await adminClient
          .from('users')
          .update({ email: newValue })
          .eq('id', userId);

        return new Response(JSON.stringify({ success: true, message: 'Correo electrónico actualizado correctamente' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'change-password': {
        if (newValue.length < 6) {
          return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const { error: pwError } = await adminClient.auth.admin.updateUserById(userId, {
          password: newValue
        });

        if (pwError) {
          return new Response(JSON.stringify({ error: 'Error al actualizar contraseña: ' + pwError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'Contraseña actualizada correctamente' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Acción no válida' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error: any) {
    console.error('Error en verify-code:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
