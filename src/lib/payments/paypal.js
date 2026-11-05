let cachedToken = null;
let tokenExpiresAt = 0;

function getPayPalConfig() {
  const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();
  const mode = (process.env.PAYPAL_MODE || 'live').toLowerCase().trim();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal is not configured. Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET.');
  }

  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  return { clientId, clientSecret, mode, baseUrl };
}

export async function getPayPalAccessToken() {
  const { clientId, clientSecret, baseUrl } = getPayPalConfig();

  // Return cached token if valid for at least 2 more minutes
  if (cachedToken && Date.now() < tokenExpiresAt - 120000) {
    return cachedToken;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('PayPal OAuth error:', res.status, errorText);
    throw new Error(`Failed to authenticate with PayPal: ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;

  return cachedToken;
}

export async function createPayPalOrder({
  orderNumber,
  amount,
  currency = 'USD',
  description = 'Digital Asset License',
  customerEmail = '',
}) {
  const { baseUrl } = getPayPalConfig();
  const accessToken = await getPayPalAccessToken();

  const formattedAmount = Number(amount).toFixed(2);

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: orderNumber,
        description: description.slice(0, 127),
        custom_id: orderNumber,
        amount: {
          currency_code: currency,
          value: formattedAmount,
        },
      },
    ],
    application_context: {
      brand_name: 'DavinciWaleBhaiya',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      landing_page: 'NO_PREFERENCE',
    },
  };

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('PayPal create order error:', res.status, data);
    throw new Error(data.message || data.details?.[0]?.description || 'Failed to create PayPal order');
  }

  return data;
}

export async function capturePayPalOrder(paypalOrderId) {
  const { baseUrl } = getPayPalConfig();
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('PayPal capture order error:', res.status, data);
    throw new Error(data.message || data.details?.[0]?.description || 'Failed to capture PayPal order');
  }

  return data;
}
