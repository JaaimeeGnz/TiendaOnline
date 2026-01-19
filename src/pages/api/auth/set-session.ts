/**
 * src/pages/api/auth/set-session.ts
 * Endpoint para establecer las cookies de sesión de Supabase
 * Esto permite que el servidor (SSR) pueda verificar la autenticación
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { accessToken, refreshToken } = body;

        if (!accessToken || !refreshToken) {
            return new Response(JSON.stringify({ error: 'Tokens requeridos' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Establecer cookies de sesión con los tokens de Supabase
        // Estas cookies serán enviadas automáticamente al servidor en cada request
        cookies.set('sb-access-token', accessToken, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        cookies.set('sb-refresh-token', refreshToken, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 días
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al establecer cookies de sesión:', error);
        return new Response(JSON.stringify({ error: 'Error interno' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
