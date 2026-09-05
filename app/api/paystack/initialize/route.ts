import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal_id, contributor_name, contributor_email, contributor_phone, amount, message } = body;

    if (!goal_id || !contributor_name || !contributor_email || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing required contribution details or invalid amount' },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Amount in pesewas (1 GHS = 100 pesewas)
    const amountInPesewas = Math.round(Number(amount) * 100);
    const reference = `ELI_OLLIE_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // If no real Paystack key is set, return simulated initialization response for dev testing
    if (!paystackSecretKey || paystackSecretKey.includes('placeholder')) {
      return NextResponse.json({
        success: true,
        reference,
        authorization_url: `${siteUrl}/registry?mock_success=true&ref=${reference}&amount=${amount}&goal_id=${goal_id}`,
        access_code: 'mock_access_code',
        is_mock: true,
      });
    }

    // Call Paystack Initialize API
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-[#C47963]': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: contributor_email,
        amount: amountInPesewas,
        currency: 'GHS',
        reference,
        callback_url: `${siteUrl}/registry?payment=success&ref=${reference}`,
        metadata: {
          goal_id,
          contributor_name,
          contributor_email,
          contributor_phone: contributor_phone || null,
          message: message || null,
          custom_fields: [
            {
              display_name: 'Contributor Name',
              variable_name: 'contributor_name',
              value: contributor_name,
            },
            {
              display_name: 'Goal ID',
              variable_name: 'goal_id',
              value: goal_id,
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Failed to initialize Paystack transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference,
    });
  } catch (error) {
    console.error('[Paystack Init Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error initializing payment' },
      { status: 500 }
    );
  }
}
