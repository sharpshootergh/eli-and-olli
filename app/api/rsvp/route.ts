import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin';
import { sendRsvpConfirmationEmail } from '@/lib/email';
import type { Attendance, Rsvp } from '@/lib/types';
import { readJson, writeJson } from '@/lib/storage';

const VALID: Attendance[] = ['traditional', 'white', 'both', 'none'];
const STORAGE_FILE = 'wedding_rsvps_store.json';

function readFallbackRsvps(): Rsvp[] {
  return readJson<Rsvp[]>(STORAGE_FILE, []);
}

function writeFallbackRsvps(rsvps: Rsvp[]) {
  writeJson(STORAGE_FILE, rsvps);
}

export async function GET() {
  const fallback = readFallbackRsvps();
  let dbRsvps: Rsvp[] = [];
  const dbConnected = isSupabaseConfigured();

  if (dbConnected) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbRsvps = data as Rsvp[];
      } else if (error) {
        console.error('[RSVP GET] Supabase error:', error.message);
      }
    } catch (err) {
      console.error('[RSVP GET] Supabase catch error:', err);
    }
  }

  // Merge DB and Fallback RSVPs, removing duplicates by id or guest_email + created_at
  const mergedMap = new Map<string, Rsvp>();

  [...fallback, ...dbRsvps].forEach((r) => {
    const key = r.id || `${r.guest_email}_${r.created_at}`;
    mergedMap.set(key, r);
  });

  const allRsvps = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({
    success: true,
    rsvps: allRsvps,
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

    const created_at = new Date().toISOString();
    const fallbackId = `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newRsvpRecord: Rsvp = {
      id: fallbackId,
      guest_name,
      guest_email,
      attendance,
      guest_count,
      notes,
      created_at,
    };

    // 1. Save to local persistent fallback store
    const currentFallback = readFallbackRsvps();
    currentFallback.unshift(newRsvpRecord);
    writeFallbackRsvps(currentFallback);

    // 2. Try saving to Supabase DB if connected
    let savedRecord = newRsvpRecord;
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

    // 3. Send email confirmation to guest & admin notification
    const emailResult = await sendRsvpConfirmationEmail({
      toEmail: guest_email,
      guestName: guest_name,
      attendance,
    });

    return NextResponse.json({
      success: true,
      rsvp: savedRecord,
      savedToSupabase,
      supabaseError,
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

    const current = readFallbackRsvps();
    const filtered = current.filter(
      (r) => (id && r.id !== id) || (email && r.guest_email.toLowerCase() !== email.toLowerCase())
    );
    writeFallbackRsvps(filtered);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        if (id && !id.startsWith('rsvp-')) {
          await supabase.from('rsvps').delete().eq('id', id);
        }
        if (email) {
          await supabase.from('rsvps').delete().ilike('guest_email', email);
        }
      } catch (dbErr) {
        console.error('[RSVP DELETE] Supabase error:', dbErr);
      }
    }

    return NextResponse.json({ success: true, rsvps: filtered });
  } catch (err) {
    console.error('[RSVP Delete Error]', err);
    return NextResponse.json({ error: 'Failed to delete RSVP' }, { status: 500 });
  }
}
