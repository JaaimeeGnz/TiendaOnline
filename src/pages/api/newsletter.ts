/**
 * src/pages/api/newsletter.ts
 * API endpoint for newsletter subscription and discount code generation
 */

import type { APIRoute } from 'astro';
import { supabaseClient } from '../../lib/supabase';
import { sendDiscountEmail } from '../../lib/brevo';

export const prerender = false;

const DISCOUNT_PERCENT = 10;

function generateDiscountCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SAVE';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const email = body.email?.trim()?.toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(
                JSON.stringify({ error: 'Email inválido' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Use service role client to bypass RLS, fallback to anon client
        const db = supabaseClient;

        // Check if email already has a discount code
        const { data: existing, error: searchError } = await db
            .from('discount_codes')
            .select('code, discount_percentage')
            .eq('created_by', `newsletter_${email}`)
            .limit(1)
            .maybeSingle();

        if (searchError) {
            console.error('❌ Error searching discount_codes:', searchError);
            return new Response(
                JSON.stringify({ error: 'Error interno del servidor' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // If already subscribed, return existing code
        if (existing) {
            return new Response(
                JSON.stringify({
                    alreadySubscribed: true,
                    code: existing.code,
                    discountPercent: existing.discount_percentage,
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate new code
        const code = generateDiscountCode();
        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setFullYear(validUntil.getFullYear() + 1); // Valid for 1 year

        const { error: insertError } = await db
            .from('discount_codes')
            .insert({
                code,
                discount_percentage: DISCOUNT_PERCENT,
                discount_type: 'percentage',
                discount_value: DISCOUNT_PERCENT,
                valid_from: now.toISOString(),
                valid_until: validUntil.toISOString(),
                max_uses: 1,
                times_used: 0,
                is_active: true,
                created_by: `newsletter_${email}`,
            });

        if (insertError) {
            console.error('❌ Error inserting discount code:', insertError);
            return new Response(
                JSON.stringify({ error: 'Error al crear el código de descuento' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Send email (fire and forget - don't fail the request if email fails)
        sendDiscountEmail(email, code, DISCOUNT_PERCENT).catch((err) => {
            console.error('❌ Error sending discount email:', err);
        });

        return new Response(
            JSON.stringify({
                alreadySubscribed: false,
                code,
                discountPercent: DISCOUNT_PERCENT,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('❌ Newsletter API error:', error);
        return new Response(
            JSON.stringify({ error: 'Error interno del servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
