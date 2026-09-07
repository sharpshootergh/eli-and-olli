import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin';
import { sendRsvpConfirmationEmail } from '@/lib/email';
import type { Attendance, Rsvp } from '@/lib/types';

const VALID: Attendance[] = ['traditional', 'white', 'both', 'none'];

export async function GET() {
  const dbConnected = isSupabaseConfigured();
  let rsvps: Rsvp[] = [];

  if (dbConnected) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        rsvps = data as Rsvp[];
      } else if (error) {
        console.error('[RSVP GET] Supabase error:', error.message);
      }
    } catch (err) {
      console.error('[RSVP GET] Supabase catch error:', err);
    }
  }

  return NextResponse.json({
    success: true,
    rsvps,
    supabaseConnected: dbConnected,
  });
}

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

    let savedRecord: Rsvp | null = null;
    let savedToSupabase = false;
    let supabaseError: string | null = null;

    if (isSupabaseConfigured()) {
      try {
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

        if (!error && data) {
          savedRecord = data as Rsvp;
          savedToSupabase = true;
        } else if (error) {
          supabaseError = error.message;
          console.error('[RSVP POST] Supabase insert error:', error.message);
        }
      } catch (dbErr) {
        supabaseError = dbErr instanceof Error ? dbErr.message : String(dbErr);
        console.error('[RSVP POST] Supabase catch error:', dbErr);
      }
    } else {
      supabaseError = 'Supabase environment variables are missing or unconfigured.';
    }

    // Send email confirmation to guest & admin notification
    const emailResult = await sendRsvpConfirmationEmail({
      toEmail: guest_email,
      guestName: guest_name,
      attendance,
    });

    if (!savedToSupabase) {
      return NextResponse.json(
        {
          error: `Failed to save reservation to Supabase: ${supabaseError}`,
          savedToSupabase: false,
          supabaseError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rsvp: savedRecord,
      savedToSupabase: true,
      emailSent: emailResult?.success ?? false,
      emailMocked: emailResult?.mocked ?? false,
    });
  } catch (err) {
    console.error('[RSVP Error]', err);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ error: 'ID or email required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (id && !id.startsWith('rsvp-')) {
      await supabase.from('rsvps').delete().eq('id', id);
    }
    if (email) {
      await supabase.from('rsvps').delete().ilike('guest_email', email);
    }

    const { data } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
    return NextResponse.json({ success: true, rsvps: data || [] });
  } catch (err) {
    console.error('[RSVP Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete RSVP from Supabase' }, { status: 500 });
  }
}
