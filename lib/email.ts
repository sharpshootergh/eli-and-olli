import { Resend } from 'resend';
import { siteConfig, formatGhs } from '@/lib/site-config';
import type { Attendance } from '@/lib/types';

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

function rsvpLocationLine(attendance: Attendance): string {
  switch (attendance) {
    case 'traditional':
      return "We can't wait to see you in Abidjan!";
    case 'white':
      return "We can't wait to see you in Cape Coast!";
    case 'both':
      return "We can't wait to see you at both celebrations!";
    case 'none':
      return "We'll miss you — thank you for letting us know.";
  }
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
  const locationLine = rsvpLocationLine(attendance);

  if (!resend) {
    console.log(`[Resend Mock] RSVP confirmation → ${toEmail}: ${locationLine}`);
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress(),
      to: [toEmail],
      subject: `RSVP received — ${siteConfig.shortNames}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 28px; background: #EDEFEE; color: #1a2a32; border: 1px solid #E3D3BC;">
          <h1 style="font-size: 28px; text-align: center; color: #06B3F8; margin: 0 0 4px;">${siteConfig.shortNames}</h1>
          <p style="text-align: center; color: #EACA67; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 24px;">RSVP Confirmation</p>
          <p style="font-size: 16px; line-height: 1.6;">Dear ${guestName},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #5a6a72;">
            Thank you for your RSVP. ${locationLine}
          </p>
          <p style="margin-top: 28px; font-size: 16px; color: #06B3F8;">With love,<br/><em>${siteConfig.shortNames}</em></p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend RSVP Error]', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Resend RSVP Exception]', err);
    return { success: false, error: err };
  }
}
