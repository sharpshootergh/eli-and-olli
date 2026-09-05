import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendThankYouEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const paystackSignature = request.headers.get('x-paystack-signature');
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY is not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

    if (hash !== paystackSignature) {
      console.error('[Paystack Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid Paystack signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (event === 'charge.success') {
      const reference = data.reference as string;
      const metadata = data.metadata || {};
      const goal_id = metadata.goal_id as string | undefined;
      const contributor_name =
        (metadata.contributor_name as string) || 'Generous Contributor';
      const contributor_email =
        (data.customer?.email as string) || (metadata.contributor_email as string);
      const contributor_phone = (metadata.contributor_phone as string) || null;
      const message = (metadata.message as string) || null;
      const amountGHS = Number(data.amount) / 100;

      if (!goal_id || !contributor_email) {
        console.error('[Paystack Webhook] Missing goal_id or email');
        return NextResponse.json({ status: 'ignored', reason: 'Missing metadata' });
      }

      const supabaseAdmin = createAdminClient();

      const { error: confirmError } = await supabaseAdmin.rpc('confirm_contribution', {
        p_goal_id: goal_id,
        p_amount: amountGHS,
        p_contributor_name: contributor_name,
        p_contributor_email: contributor_email,
        p_contributor_phone: contributor_phone,
        p_message: message,
        p_paystack_reference: reference,
      });

      if (confirmError) {
        console.error('[Paystack Webhook] confirm_contribution failed', confirmError);
        return NextResponse.json({ error: 'Failed to record contribution' }, { status: 500 });
      }

      const { data: goalData } = await supabaseAdmin
        .from('goals')
        .select('title')
        .eq('id', goal_id)
        .single();

      await sendThankYouEmail({
        toEmail: contributor_email,
        contributorName: contributor_name,
        amountGHS,
        goalTitle: goalData?.title || 'Wedding Goal',
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[Paystack Webhook Exception]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
