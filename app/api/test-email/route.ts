import { NextResponse } from 'next/server';
import { sendRsvpConfirmationEmail } from '@/lib/email';
import { siteConfig } from '@/lib/site-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || siteConfig.primaryAdminEmail;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY is missing from environment variables.',
      advice: 'Please add RESEND_API_KEY=re_your_key in your Vercel project settings or .env.local file.',
      environmentStatus: {
        hasResendKey: false,
        targetEmail: email,
      },
    }, { status: 400 });
  }

  try {
    const result = await sendRsvpConfirmationEmail({
      toEmail: email,
      guestName: 'Elisha (Test Guest)',
      attendance: 'both',
    });

    return NextResponse.json({
      success: result.success,
      result,
      environmentStatus: {
        hasResendKey: true,
        keyPrefix: `${apiKey.slice(0, 6)}...`,
        targetEmail: email,
      },
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
