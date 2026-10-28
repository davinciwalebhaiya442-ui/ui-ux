export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const headers = request.headers;
    const country =
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      headers.get('x-country-code') ||
      headers.get('x-geo-country') ||
      'IN'; // default to IN if undetermined or local dev

    const isDomestic = country.toUpperCase() === 'IN';
    const currency = isDomestic ? 'INR' : 'USD';
    const symbol = isDomestic ? '₹' : '$';

    return Response.json(
      {
        country: country.toUpperCase(),
        isDomestic,
        currency,
        symbol,
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (err) {
    return Response.json({
      country: 'IN',
      isDomestic: true,
      currency: 'INR',
      symbol: '₹',
    });
  }
}
