import { Resend } from 'resend';
import { siteConfig, formatGhs, formatEventDate, formatEventTime, type WeddingEvent } from '@/lib/site-config';
import type { Attendance } from '@/lib/types';
import fs from 'fs';
import path from 'path';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith('re_xxxx')) return null;
  return new Resend(apiKey);
}

function fromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL ||
    `${siteConfig.shortNames} Wedding <onboarding@resend.dev>`
  );
}

export async function sendThankYouEmail({
  toEmail,
  contributorName,
  amountGHS,
  goalTitle,
}: {
  toEmail: string;
  contributorName: string;
  amountGHS: number;
  goalTitle: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log(
      `[Resend Mock] Thank you → ${toEmail} for ${formatGhs(amountGHS)} toward "${goalTitle}"`
    );
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress(),
      to: [toEmail],
      subject: `Thank you for your gift, ${contributorName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 28px; background: #EDEFEE; color: #1a2a32;">
          <h1 style="font-size: 28px; text-align: center; color: #06B3F8; margin: 0 0 8px;">${siteConfig.shortNames}</h1>
          <p style="text-align: center; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #5a6a72;">Wedding registry</p>
          <p style="font-size: 16px; line-height: 1.6;">Dear ${contributorName},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #5a6a72;">
            Thank you for your contribution of <strong style="color:#1a2a32;">${formatGhs(amountGHS)}</strong>
            toward <strong style="color:#1a2a32;">${goalTitle}</strong>.
          </p>
          <p style="margin-top: 28px; font-size: 16px; color: #06B3F8;">With love,<br/><em>${siteConfig.shortNames}</em></p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Email Error]', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Resend Exception]', err);
    return { success: false, error: err };
  }
}

function getActiveEvents(): WeddingEvent[] {
  try {
    const filePath = path.join('/tmp', 'wedding_events_store.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return siteConfig.events;
}

function buildEventDetailsHtml(attendance: Attendance): string {
  if (attendance === 'none') {
    return `<p style="font-size: 16px; color: #5a6a72; line-height: 1.6;">We will miss you — thank you for letting us know!</p>`;
  }

  const events = getActiveEvents();
  const selectedEvents = events.filter((e) => {
    if (attendance === 'both') return true;
    if (attendance === 'traditional') return e.attendanceKey === 'traditional' || e.id.includes('traditional');
    if (attendance === 'white') return e.attendanceKey === 'white' || e.id.includes('white');
    return false;
  });

  return selectedEvents
    .map((e) => {
      const formattedDate = formatEventDate(e.eventDate, 'en');
      const formattedTime = formatEventTime(e.eventTime, 'en');
      const gpsButton = e.gpsUrl
        ? `<div style="margin-top: 14px;">
             <a href="${e.gpsUrl}" target="_blank" style="display: inline-block; background-color: #06B3F8; color: #ffffff; padding: 10px 18px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 4px;">
               📍 Open Location on Google Maps
             </a>
           </div>`
        : '';

      return `
        <div style="background: #ffffff; border: 1px solid #E3D3BC; padding: 20px; margin-top: 16px; border-radius: 4px;">
          <h3 style="margin: 0 0 8px; font-size: 18px; color: #1a2a32;">${e.name}</h3>
          <p style="margin: 0 0 6px; font-size: 14px; color: #5a6a72;">
            📅 <strong>Date:</strong> ${formattedDate} ${formattedTime ? `at ${formattedTime}` : ''}
          </p>
          <p style="margin: 0 0 6px; font-size: 14px; color: #5a6a72;">
            📍 <strong>Location / Venue:</strong> ${e.venueName ? `${e.venueName} — ` : ''}${e.location}
          </p>
          ${e.notes ? `<p style="margin: 6px 0 0; font-size: 13px; color: #5a6a72; font-style: italic;">Note: ${e.notes}</p>` : ''}
          ${gpsButton}
        </div>
      `;
    })
    .join('');
}

export async function sendRsvpConfirmationEmail({
  toEmail,
  guestName,
  attendance,
}: {
  toEmail: string;
  guestName: string;
  attendance: Attendance;
}) {
  const resend = getResend();
  const eventDetailsHtml = buildEventDetailsHtml(attendance);

  if (!resend) {
    console.log(`[Resend Unconfigured] RSVP confirmation for ${guestName} (${toEmail})`);
    return { success: false, mocked: true, reason: 'RESEND_API_KEY not set in environment variables on Vercel' };
  }

  let guestError: unknown = null;
  let guestData: unknown = null;

  // 1. Send confirmation email to guest
  try {
    const response = await resend.emails.send({
      from: fromAddress(),
      to: [toEmail],
      subject: `RSVP Confirmed — ${siteConfig.shortNames}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 28px; background: #EDEFEE; color: #1a2a32; border: 1px solid #E3D3BC;">
          <h1 style="font-size: 28px; text-align: center; color: #06B3F8; margin: 0 0 4px;">${siteConfig.shortNames}</h1>
          <p style="text-align: center; color: #EACA67; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 24px;">RSVP Confirmation</p>
          <p style="font-size: 16px; line-height: 1.6;">Dear ${guestName},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #5a6a72;">
            Thank you for your RSVP! Here are your event details and venue location link(s):
          </p>

          ${eventDetailsHtml}

          <p style="margin-top: 28px; font-size: 16px; color: #06B3F8;">With love,<br/><em>${siteConfig.shortNames}</em></p>
        </div>
      `,
    });

    if (response.error) {
      guestError = response.error;
      console.error('[Resend RSVP Guest Error]', response.error);
    } else {
      guestData = response.data;
    }
  } catch (err) {
    guestError = err;
    console.error('[Resend Guest Email Exception]', err);
  }

  // 2. Send RSVP Alert notification to admin (Elisha - always registered in Resend)
  if (siteConfig.primaryAdminEmail) {
    try {
      await resend.emails.send({
        from: fromAddress(),
        to: [siteConfig.primaryAdminEmail],
        subject: `🎉 New RSVP Received: ${guestName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1a2a32; border: 1px solid #E3D3BC;">
            <h2 style="color: #06B3F8; margin-top: 0;">New RSVP Alert!</h2>
            <p><strong>Guest Name:</strong> ${guestName}</p>
            <p><strong>Guest Email:</strong> ${toEmail}</p>
            <p><strong>Attendance Choice:</strong> ${attendance}</p>
            <hr style="border: none; border-top: 1px solid #E3D3BC; margin: 20px 0;" />
            <h3>Venue & Event Info Sent:</h3>
            ${eventDetailsHtml}
            <p style="margin-top: 20px;">View all responses in your <a href="${siteConfig.siteUrl}/admin/rsvps">Admin Panel</a>.</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn('[Admin RSVP Alert Exception]', e);
    }
  }

  if (guestError) {
    return { success: false, error: guestError };
  }

  return { success: true, data: guestData };
}
