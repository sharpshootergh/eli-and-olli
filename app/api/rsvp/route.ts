import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendRsvpConfirmationEmail } from '@/lib/email';
import type { Attendance, Rsvp } from '@/lib/types';
import fs from 'fs';
import path from 'path';

const VALID: Attendance[] = ['traditional', 'white', 'both', 'none'];
const FALLBACK_FILE = path.join('/tmp', 'wedding_rsvps_store.json');

// In-memory fallback cache
let memoryRsvps: Rsvp[] = [];

function readFallbackRsvps(): Rsvp[] {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const raw = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryRsvps = parsed;
        return memoryRsvps;
      }
    }
  } catch {
    // Ignore read errors
  }
  return memoryRsvps;
}

function writeFallbackRsvps(rsvps: Rsvp[]) {
  memoryRsvps = rsvps;
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(rsvps, null, 2), 'utf-8');
  } catch {
    // Ignore write errors in read-only environments
  }
}

export async function GET() {
  const fallback = readFallbackRsvps();
  let dbRsvps: Rsvp[] = [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      dbRsvps = data as Rsvp[];
    }
  } catch {
    // Supabase DB unconfigured or unreachable
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

  return NextResponse.json({ success: true, rsvps: allRsvps });
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

    // 2. Try saving to Supabase if connected
    let savedRecord = newRsvpRecord;
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
      }
    } catch (dbErr) {
      console.warn('[RSVP] Supabase insert warning (using fallback store):', dbErr);
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
      emailSent: emailResult?.success ?? false,
      emailMocked: emailResult?.mocked ?? false,
    });
  } catch (err) {
    console.error('[RSVP Error]', err);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}
