import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas');
}

// Cliente para el frontend (con permisos limitados)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Cliente con rol de servicio (solo para operaciones sensibles del servidor)
export const supabaseServer = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Función auxiliar para obtener la sesión actual del usuario
export async function getSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

// Función para verificar si un usuario es admin
export async function isAdmin() {
  const session = await getSession();
  if (!session) return false;

  // En producción, verificarías esto en la BD o mediante custom claims
  // Por ahora, verificamos si está autenticado
  return !!session.user;
}
