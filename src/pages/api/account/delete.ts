/**
 * src/pages/api/account/delete.ts
 * Endpoint para eliminar la cuenta del usuario
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const POST: APIRoute = async (context) => {
  try {
    // Obtener el token del header
    const authHeader = context.request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No autorizado', message: 'Token no encontrado' }),
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar el usuario con el token
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado', message: 'Token inválido' }),
        { status: 401 }
      );
    }

    // Eliminar datos del usuario de la base de datos
    // Primero eliminar direcciones
    await supabase
      .from('addresses')
      .delete()
      .eq('user_id', user.id);

    // Eliminar pedidos (si tienes tabla de órdenes)
    try {
      await supabase
        .from('orders')
        .delete()
        .eq('user_id', user.id);
    } catch (err) {
      // Ignorar si la tabla no existe
      console.log('Tabla de órdenes no existe, continuando...');
    }

    // Eliminar datos del usuario en la tabla users
    await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    // Eliminar la cuenta de autenticación
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error al eliminar usuario:', deleteError);
      return new Response(
        JSON.stringify({ 
          error: 'Error al eliminar cuenta', 
          message: 'No se pudo eliminar la cuenta. Intenta más tarde.' 
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cuenta eliminada correctamente' 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en endpoint de eliminación:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno', 
        message: 'Ocurrió un error al procesar tu solicitud' 
      }),
      { status: 500 }
    );
  }
};
