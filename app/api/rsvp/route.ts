import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendRsvpConfirmationEmail } from '@/lib/email';
import type { Attendance } from '@/lib/types';

const VALID: Attendance[] = ['traditional', 'white', 'both', 'none'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const guest_name = String(body.guest_name || '').trim();
    const guest_email = String(body.guest_email || '').trim().toLowerCase();
    const attendance = body.attendance as Attendance;
    const guest_count = Math.max(1, Number(body.guest_count) || 1);
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!guest_name || !guest_email || !guest_email.includes('@')) {
      return NextResponse.json({ error: 'Name and valid email are required' }, { status: 400 });
    }
    if (!VALID.includes(attendance)) {
      return NextResponse.json({ error: 'Invalid attendance selection' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('rsvps')
      .insert({
        guest_name,
        guest_email,
        attendance,
        guest_count,
        notes,
      })
      .select()
      .single();

    if (error) {
      // Fallback when DB not configured — still send confirmation if possible
      console.warn('[RSVP] insert failed, continuing with email only:', error.message);
    }

    await sendRsvpConfirmationEmail({
      toEmail: guest_email,
      guestName: guest_name,
      attendance,
    });

    return NextResponse.json({ success: true, rsvp: data ?? null });
  } catch (err) {
    console.error('[RSVP]', err);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}
